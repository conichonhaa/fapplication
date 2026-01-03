<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/map.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/map.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='openlayers/OpenLayers.js' ></script>";
$string .= "<script type='text/javascript' src='openlayers/proj4js-combined.js' ></script>";
$string .= "<script type='text/javascript' >var modeMap='".$modeMap."';var mapShowAccuracy=".$mapShowAccuracy.";var mapLocalRelay=".$mapLocalRelay.";</script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


if (count($_POST)>0) {
	if (isset($_POST['resetError'])) {
		$sql = "update t_faplogs_fap set fap_pos_error=null  where usr_id=".$fap->getId();
		mysql_query($sql,$fap->conn);
	}
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$nbJour = 0;
$zx = 24*3600;


$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'','map'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> de la Carte</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span>
				</div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
	$string .= "<img elem='divMap' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";

	
	$nb = 0;
	$tbornes = array();
	$points = "";
	$xx = null;
	$b = null;
	$c = 0;
	$memo_date = '';
	
	$sqlCond = "";
	$where = " where";
	if ($usrDebug!='') {
		$sqlCond .= $where." usr_id=".$usrDebug."";
		$where = " and";
	}
	else if ($statsUtilisateur=='me') {
		$sqlCond .= $where." usr_id=".$fap->getId()."";
		$where = " and";
	} 
	else if ($modeMap=='flag') {
		$lst = "";
		$sql = "select * from t_utilisateurs_usr where usr_territoire=0 or usr_territoire is null";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			if ($lst!="") $lst .= ",";
			$lst .= $data['usr_id'];
		}
		if ($lst!="") {
			$sqlCond .= $where." usr_id not in (".$lst.")";
			$where = " and";
		}
	}
	
	$sql = "select * from t_faplogs_fap";
	$sql .= $sqlCond;
	if ($avecFapAnnule=='0') {
		$sql .= $where." (fap_annule is null or fap_annule<>1)";
		$where = " and";
	}
	$sql .= $where." (fap_pos_latitude is not null and fap_pos_latitude<>0)";
	if ($modeMap=='path') $sql .= " order by fap_date";
	else if ($modeMap=='flag') $sql .= " order by fap_date desc";
	else $sql .= " order by fap_pos_longitude,fap_pos_latitude";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {	
		$nb++;
		$x = $data['fap_pos_longitude'];
		$y = $data['fap_pos_latitude'];
		$acc = $data['fap_pos_accuracy'];
		$isme = "";
		if ($data['usr_id']==$fap->getId()) $isme = "fap='".$data['fap_id']."'";
		$d = makeDate($data['fap_date'])/1;
		$points .= "<fap x='".$x."' y='".$y."' acc='".$acc."' ".$isme."' date='".$data['fap_date']."' ind='".$d."' usr='".$data['usr_id']."' ></fap>";
		if ($mapInitCenter=='all' || ($mapInitCenter=='recent' and $data['fap_date']>strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600*$mapAgeFapRecent))) {
			if (!$b) $b = array('xmin'=>$x, 'xmax'=>$x, 'ymin'=>$y, 'ymax'=>$y);
			$b = array('xmin'=>min($x,$b['xmin']), 'xmax'=>max($x,$b['xmax']), 'ymin'=>min($y,$b['ymin']), 'ymax'=>max($y,$b['ymax']));
		}
		if ($mapInitCenter=='lastOne' and $data['fap_date']>$memo_date) {
			$xx = $x;
			$yy = $y;
			$zoom = 16;
			$memo_date = $data['fap_date'];
		}
		
	}
	if ($mapInitCenter=='france') {
		$b = array('xmin'=>'-5.5', 'xmax'=>'9.5', 'ymin'=>'42', 'ymax'=>'51.2');
	}
	$center = "";
	if ($xx) $center = "x='".$xx."' y='".$yy."' zoom='".$zoom."'";
	if ($b) $center = "xmin='".$b['xmin']."' xmax='".$b['xmax']."' ymin='".$b['ymin']."' ymax='".$b['ymax']."'";
	if ($statsUtilisateur=='all') $center .= " maxZoom='12'";
	$string .= "<div id ='divPoints' style='display:none;' ".$center." >";
	$string .= $points;
	$string .= "</div>";
	
	$string .= "<div id='overDiv' ><div id='divMap' ratio='1.8' ></div></div>";
	$string .= "<div style='display:block;'>";	
		$string .= "<div id='divPos' style='float:right;font-size:80%;display:inline-block;'></div>";
		$info = "";
		$vInfo = "<span id='infoMapFap'>?</span>";
		if ($modeMap=='path') $info = "Longueur du chemin = ".$vInfo." km";
		if ($modeMap=='area') $info = "Surface de l'enveloppe = ".$vInfo." km²";
		$string .= "<div style='float:left;font-size:80%;display:inline-block;'>".$info."</div>";
	$string .= "</div>";
	
	$detail = "";
	$usr_id = $fap->getId();
	if ($fap->isDev() and $usrDebug!='') $usr_id = $usrDebug;
	$sql = "select fap_pos_error from t_faplogs_fap  where usr_id=".$usr_id." group by fap_pos_error order by fap_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		if ($data['fap_pos_error']!="") $detail .= "<div> - ".$data['fap_pos_error']."</div>";
	}
	$string .= "<div style='display:block;margin-top:20px;'>";	
	if ($detail!='') {
		$string .= "<div>&nbsp;</div>";
		$string .= "<div><u>Mes erreurs de géolocalisation</u> : ";
		if ($fap->getId()==$usr_id) $string .= "<form method='post' style='display:inline;' onsubmit='return confirm(\"Effacer les erreurs ?\")'>
												<input name='resetError' style='display:none;' /><input type='submit' value='Reset' /></form>";
		$string .= "</div>";
		$string .= $detail;
	}
	$string .= "</div>";

$string .= "</div>";
$string .= "<script type='text/javascript'>t_users={};";
foreach ($t_users as $usr => $v) $string .= "t_users[".$usr."]='".getNomUser($usr)."';";
$string .= "</script>";
$string .= "<script type='text/javascript'>chargeMap();</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;