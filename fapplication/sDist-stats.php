<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "<link rel='stylesheet' href='styles/graph.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/graph.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' >var modeZoom='".$modeZoom."';</script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> graphiques</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
	$string .= "<img elem='divGraphG' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";

	$conv_dist = array();
	$conv_dist[] = array('d'=>(900), 'c'=>(60*5), 'aff'=>1);
	$conv_dist[] = array('d'=>(3600), 'c'=>(60*15), 'aff'=>1);
	$conv_dist[] = array('d'=>(3*3600), 'c'=>(3600), 'aff'=>0);
	$conv_dist[] = array('d'=>(12*3600), 'c'=>(3600*3), 'aff'=>0);
	$conv_dist[] = array('d'=>(24*3600), 'c'=>(3600*12), 'aff'=>1);
	$conv_dist[] = array('d'=>(24*3600*5), 'c'=>(24*3600), 'aff'=>0);
	$conv_dist[] = array('d'=>(24*3600*30), 'c'=>(24*3600*5), 'aff'=>1);
	$conv_dist[] = array('d'=>(24*3600*30*3), 'c'=>(24*3600*30), 'aff'=>0);
	$conv_dist[] = array('d'=>(24*3600*365), 'c'=>(24*3600*30*3), 'aff'=>1);
	$conv_dist[] = array('d'=>(24*3600*365*5), 'c'=>(24*3600*365), 'aff'=>1);
	
	function getDist($d) {
		global $conv_dist;
		$c = 0;
		foreach ($conv_dist as $k => $v) {
			if ($d<$v['d']) $c += $d/$v['c'];
			else $c += ($v['d']-$v['c'])/$v['c'];
		}	
		return intval($c);
	}
	$t_dist = array();
	$memo = null;
	
	$sql = "select * from t_faplogs_fap";
	$where = " where";
	if ($usrDebug!='') {
		$sql .= $where." usr_id=".$usrDebug."";
		$where = " and";
	}
	else if ($statsUtilisateur=='me') {
		$sql .= $where." usr_id=".$fap->getId()."";
		$where = " and";
	}
	if ($avecFapAnnule=='0') {
		$sql .= $where." (fap_annule is null or fap_annule=0)";
		$where = " and";
	}
	$memodist = null;
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	$nb = mysql_num_rows($req);
	while ($data = mysql_fetch_array($req)) {						
		$d = makeDate($data['fap_date']);
		if ($memo) $t_dist[] = getDist($d-$memo);
		$memo = $d;
	}
	if (count($t_dist)>0) $memodist = $t_dist[count($t_dist)-1];	
	
	$script = "var t_dist={}; t_distleg={}; ";
	$c = 0;
	foreach ($conv_dist as $k => $v) {
		$b = 0;
		$bb = ($k>0?$conv_dist[$k-1]['d']:0);
		while ($b+$bb<$v['d']) {
			$script .= "t_distleg[".intval($c+$b/$v['c'])."]='".affDuree($b+$bb)."';";
			$b = $b + $v['c'];
		}
		$deb = ($c>0?$v['c']:0);
		$c += ($v['d']-$deb)/$v['c'];
		if ($v['aff']) $script .= "t_dist[".$c."]='".affDuree($v['d'])."';";
	}
	$script .= "t_distleg[0]='<5mn';";
	$string .= "<script type='text/javascript'>".$script."</script>";
	
	$t_retour = array();
	$kc = 0;
	sort($t_dist);
	$nbd = 0;
	
	$v = 0;
	foreach($t_dist as $k => $v) {	
		$nbd++;
		if (!isset($t_retour[$v])) $t_retour[$v] = 0;
		$t_retour[$v]++;
	}
	$pmax = $v;	

	$c = 0;
	$tracelast = "";
	$precisionDistance = 1;
	$pmax = $pmax + $precisionDistance;
	$xml = "<div id='divPoints' xmax='".$pmax."' prec='".$precisionDistance."' xmin='0'  >";
	for ($p=0; $p<$pmax; $p++) {
		if (isset($t_retour[$p])) $c = $c + $t_retour[$p];
		if ($p==$memodist) $tracelast = "last";
		if ($p%$precisionDistance==0) {
			$xml .= "<div ind='".($p)."' nb='".percent($c,$nbd)."' ".$tracelast." ></div>";
			$c = 0;
			if ($tracelast) $tracelast = "";
		}	
	}	
	$xml .= "</div>";
	
	$string .= "<div id='divGraphG' >";
	$string .= "<div style='display:inline-block;margin-left:20px;'>";
		$string .= "<img id='fleche' class='zoomButton' src='images/cursor-default.png' style='background-color:#bbbbbb;' onclick='affiche_fleche()' title='Pointeur' />";
		$string .= "<img id='select' class='zoomButton' src='images/select.png' onclick='affiche_select()' title='Zoom sélection' />";
		$string .= "<img id='main' class='zoomButton' src='images/cursor-hand.png' onclick='affiche_main()' title='Zoom scroll et déplacement' />";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$string .= "<img id='agrandir' class='zoomButton' src='images/agrandir.jpg' onclick='trace()' title='Zoom initial' />";
	$string .= "</div>";
	if ($nb>0) {
		$string .= $xml;
		$string .= "<div id='divGraph' class='divGraph' ratio='2'></div>";
		$string .= "<div id='divPos' style='text-align:right;'></div>";
		$string .= "<script type='text/javascript'>traceDistance();</script>";
		$string .= "<div style='font-style:italic;font-size:80%;text-align:right;margin:10px;'>NB : Le point rouge situe ton dernier fap</i></div>";
	}
	$string .= "</div>";

	
	$string .= "<div style='margin-top:50px;'>";
		$string .= "A l'instar des statistiques sur les catastrophes naturelles majeures, la période de retour calcule l'intervalle entre deux faps consécutifs.
					<br>Le diagramme représente donc la décomposition spectrale, sur une échelle pseudo-logarithmique, de la régularité de vos faps.
					<br><i>Tous ensemble, cela matérialise ni plus ni moins que notre puissance de fap collective !</i>";
	$string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;