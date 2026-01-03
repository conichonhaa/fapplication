<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/graph.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/graph.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' >var modeGraph='".$modeGraph."';var modeZoom='".$modeZoom."';</script>";
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
		$string .= "<img id='modeGraph' class='zoomButton' src='images/".$t_conv[$modeGraph].".png' onclick='switchGraph(this)' title='Bascule courbe/histogramme' value='".$modeGraph."' />";
	$string .= "</div>";

	
	$nb = 0;
	$tbornes = array();
	$t_histo = array();
	$points = "";
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
		$sql .= $where." (fap_annule is null or fap_annule<>1)";
		$where = " and";
	}
	if ($nbJour>0) $sql .= " ".$where." fap_date>'".strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600*$nbJour)."'";
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$nb++;
		$d = makeDate($data['fap_date'])/$zx;
		$points .= "<fap date='".$data['fap_date']."' ind='".$d."' nb='".$nb."' ></fap>";
		if (!isset($tbornes['xmin'])) $tbornes['xmin'] = $d;
		$p = intval($d/$periode)*$periode;
		if (!isset($t_histo[$p])) $t_histo[$p] = 0;
		$t_histo[$p]++;
	}
	$tbornes['xmax'] = time()/$zx;
	if (!isset($tbornes['xmin'])) $tbornes['xmin'] = $tbornes['xmax']-1;
	if ($iniPeriode>0 and $tbornes['xmax']-$iniPeriode>$tbornes['xmin']) $tbornes['xmin'] = $tbornes['xmax']-$iniPeriode;
	$tbornes['xmin'] = $tbornes['xmin'] - (intval(($tbornes['xmax']-$tbornes['xmin'])/100)+1);
	$string .= "<div id ='divPoints' style='display:none;' xmin='".$tbornes['xmin']."' xmax='".$tbornes['xmax']."' nb='".$nb."' >";
	$string .= $points;
	$string .= "</div>";
	
	$points = "";
	$max = 0;
	foreach ($t_histo as $ind => $n) {						
		$points .= "<fap ind='".$ind."' nb='".$n."' l='".$periode."' ></fap>";
		$max = max($max,$n);
	}
	$string .= "<div id ='divHistos' style='display:none;' xmin='".$tbornes['xmin']."' xmax='".$tbornes['xmax']."' nb='".$max."' >";
	$string .= $points;
	$string .= "</div>";
	
	if ($nb==0) {
		$string .= "<br><br><b>Aucun Fap, mais pourquoi tu t'es inscrit ?</b>";
	} else {
		$string .= "<div id='divGraph' class='divGraph' ratio='2'></div>";
		$string .= "<div id='divPos' style='text-align:right;'></div>";
		$string .= "<script type='text/javascript'>trace();</script>";
	}
	$string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;