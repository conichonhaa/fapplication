<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "<link rel='stylesheet' href='styles/graph.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/stats.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/animation.js".$versionTime."' ></script>";
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
				<span class='cadreOptionEnteteCompl'> généraux</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";

function getDist($date) {
	$d = time()-makeDate($date);
	if ($d<24*3600) $d = $d/(3600*2);
	else if ($d<24*3600*30) $d = 12 + $d/(24*3600);
	else if ($d<24*3600*365) $d = 12 + 30 + intval($d/(24*3600*30.4))*2;
	else if ($d<24*3600*365*5) $d = 12 + 30 + 25 + $d/(24*3600*365)*2;
	else $d = 12 + 30 + 25 + 11;
	return $d;
}

$t = time();
$delayFapAll = 0;
$last = $fap->getLastFap(null,true);
if ($last) $delayFapAll = $t-makeDate($last);
$delayFapMe = 0;
$usr_id = ($usrDebug!=""?$usrDebug:$fap->getId());
$last = $fap->getLastFap($usr_id);
if ($last) $delayFapMe = $t-makeDate($last);	
	
	$string .= "<div class='divEntete' >";
	$string .= "Derniers Faps";
	$string .= "<div style='font-size:80%;'>";
		$string .= "Tous› <span id='chronoTimerAll' delay='".$delayFapAll."' ></span>";
		$string .= " &nbsp;&nbsp;&nbsp; Moi› ";
		if ($last) $string .= "<span id='chronoTimerMe' delay='".$delayFapMe."' ></span>";
		else $string .= "jamais";
	$string .= "</div>";
	$string .= "</div>";

	$pts = "<div id='divData1' >";
	$t_last = array();
	foreach ($t_users as $usr => $u) {				 
		$t_last[$usr] = $fap->getLastFap($usr);
	}
	uasort($t_last,'cmp');
	foreach ($t_last as $usr => $date) {
		$info = $fap->logGetInfo($usr);
		$d = getDist($date);
		$now = affDelai($date);
		$pts .= "<div nom=\"".getNomUser($usr)."\" lib=\"".getNomUser($usr)." : ".$now."\" d='".$d."' img='".$info['img_id']."' ></div>";
		
	}
	
	$pts .= "</div>";
	$string .= $pts;
	$string .= "<div id='divGraph1' class='divGraph' ></div>";

	
	$string .= "<div class='divEntete' >";
	$string .= "Dernières Connexions";
	$string .= "</div>";
	
	$pts2 = "<div id='divData2' >";
	$t_last = array();
	foreach ($t_users as $usr => $u) {				 
		$t_last[$usr] = $fap->getLastConn($usr)[1];
	}
	uasort($t_last,'cmp');
	foreach ($t_last as $usr => $date) {
		$info = $fap->logGetInfo($usr);
		$d = getDist($date);
		$now = affDelai($date);
		$cc = $fap->getLastConn($usr);
		$now .= " (".affDuree(makeDate($cc[1])-makeDate($cc[0]),1).")";
		$pts2 .= "<div nom=\"".getNomUser($usr)."\" lib=\"".getNomUser($usr)." : ".$now."\" d='".$d."' img='".$info['img_id']."' ></div>";
	}
	$pts2 .= "</div>";
	$string .= $pts2;
	$string .= "<div id='divGraph2' class='divGraph' ></div>";
	
	
	$string .= "<div style='visibility:hidden'><img id='imgRef' src='_getImg.php?img=0".$vGetImg."' class='imgIcone2' /></div>";
	$string .= "<script type='text/javascript'>traceLast(1);</script>";
	$string .= "<script type='text/javascript'>traceLast(2);</script>";
	if (!$decompteFap) $string .= "<script type='text/javascript'>initChronoTimer();</script>";
	
$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;