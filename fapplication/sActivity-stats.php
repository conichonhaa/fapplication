<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/graph.css' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/graph.js' ></script>";
$string .= "<script type='text/javascript' >var modeGraph='activite';var modeZoom='".$modeZoom."';</script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}



$nbJour = 0;
$zx = 24*3600;
$periode = $cumulHieto;
$usr = '';

$string .= "<div class='cadre'>";
$string .= $string_buttSound;
	
	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'','graph'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> graphiques</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
	$string .= "<img elem='divGraphG' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";

	
	$string .= "<div id='divGraphG' >";
	$string .= "<div style='display:inline-block;margin-left:20px;'>";
		$string .= "<img id='fleche' class='zoomButton' src='images/cursor-default.png' style='background-color:#bbbbbb;' onclick='affiche_fleche()' title='Pointeur' />";
		$string .= "<img id='select' class='zoomButton' src='images/select.png' onclick='affiche_select()' title='Zoom sélection' />";
		$string .= "<img id='main' class='zoomButton' src='images/cursor-hand.png' onclick='affiche_main()' title='Zoom scroll et déplacement' />";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$string .= "<img id='agrandir' class='zoomButton' src='images/agrandir.jpg' onclick='trace()' title='Zoom initial' />";
	$string .= "</div>";

	
	$nb = 0;
	$tbornes = array();
	$points = "";
	
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
	
	$sql = "select * from t_connexion_cnx";
	$sql .= $sqlCond;
	$sql .= " order by cnx_datedeb";
	$min = null;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$deb = makeDate($data['cnx_datedeb'])/$zx;
		$fin = makeDate($data['cnx_datefin'])/$zx;
		$points .= "<cnx date='".$data['cnx_datedeb']."' ind='".$deb."' fin='".$fin."' nb='2' ></cnx>";
		if (!$min) $min = $deb;
	}
	
	$sql = "select * from t_fapcatch_fch";
	$sql .= $sqlCond;
	$sql .= " order by fch_date";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {	
		$d = makeDate($data['fch_date'])/$zx;
		$points .= "<catch date='".$data['fch_date']."' ind='".$d."' nb='2' ></catch>";
		if (!$min) $min = $d;
		else $min = min ($min,$d);
	}
	
	$sql = "select * from t_faplogs_fap";
	$sql .= $sqlCond;
	if ($avecFapAnnule=='0') {
		$sql .= $where." (fap_annule is null or fap_annule<>1)";
		$where = " and";
	}
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {	
		$nb++;
		$catch = "";
		$catched = "";
		$declare = "";
		if ($data['fap_declare']!='') $declare="declare='".(makeDate($data['fap_declare'])/$zx)."'";
		$d = makeDate($data['fap_date'])/$zx;
		$points .= "";
		$sql = "select * from t_fapcatch_fch where fap_id=".$data['fap_id']." ";
		$req2 = mysql_query($sql,$fap->conn);
		while ($data2 = mysql_fetch_array($req2)) {
			$dc = makeDate($data2['fch_date'])/$zx;
			$catch .= "<catch catched='".$dc."' ></catch>";
			$catched = "catched='".$dc."'";
		}
		$points .= "<fap date='".$data['fap_date']."' ind='".$d."' nb='2' ".$catched." ".$declare." >".$catch."</fap>";
		if (!isset($tbornes['xmin'])) $tbornes['xmin'] = $d;
	}
	if ($min and isset($tbornes['xmin'])) $tbornes['xmin'] = min($tbornes['xmin'],$min);
	$tbornes['xmax'] = time()/$zx;
	if (!isset($tbornes['xmin'])) $tbornes['xmin'] = $tbornes['xmax']-1;
	if ($iniPeriode>0 and $tbornes['xmax']-$iniPeriode>$tbornes['xmin']) $tbornes['xmin'] = $tbornes['xmax']-$iniPeriode;
	$tbornes['xmin'] = $tbornes['xmin'] - (intval(($tbornes['xmax']-$tbornes['xmin'])/100)+1);
	$string .= "<div id ='divPoints' style='display:none;' xmin='".$tbornes['xmin']."' xmax='".$tbornes['xmax']."' nb='2' >";
	$string .= $points;
	$string .= "</div>";
	
	if ($nb==0) {
		$string .= "<br><br><b>Aucun Fap, mais pourquoi tu t'es inscrit ?</b>";
	} else {
		$string .= "<div id='divGraph' class='divGraph' ratio='2' ></div>";
		$string .= "<div id='divPos' style='text-align:right;'></div>";
		$string .= "<script type='text/javascript'>trace();</script>";
	}
	$string .= "</div>";
	
	$string .= "<div><br></div>";
	$nb = 0;
	$sql = "select * from t_connexion_cnx ".$sqlCond." order by cnx_datefin desc limit 2";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$nb++;
		$d = makeDate($data['cnx_datefin']);
		$jour = strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d)." à ".strftime("%Hh%M",$d);
		if ($nb==1) $string .= "<div><u>Connecté depuis</u> : ".affDuree(makeDate($data['cnx_datefin'])-makeDate($data['cnx_datedeb']))."</div>";
		if ($nb==2) $string .= "<div><u>Dernière connexion</u> : le ".$jour."</div>";
	}
	
	$duree = 0;
	$max = 0;
	$prem = null;
	$sql = "select * from t_connexion_cnx ".$sqlCond;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$d = makeDate($data['cnx_datefin'])-makeDate($data['cnx_datedeb']);
		if ($d>0) {
			$max = max($max,$d);
			$duree = $duree + $d;
			if ($prem) $prem = min($data['cnx_datedeb'],$prem);
			else $prem = $data['cnx_datedeb'];
		}
	}	
	$string .= "<div><u>Connexion la plus longue</u> : ".affDuree($max)."</div>";
	$string .= "<div><u>Temps total connecté</u> : ".affDuree($duree)."</div>";
	$d = makeDate($prem);
	$jour = strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d);
	$p = round($duree/(time()-$d)*10000)/10;
	$string .= "<div style='font-style:italic;font-size:80%;margin-left:5em;'>
					soit ".$p."‰ du temps depuis le ".$jour."</i></div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;