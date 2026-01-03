<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
	
$string .= "<script type='text/javascript' src='scripts/jauge.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";


$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete'>";
$string .= "Fap Jauge";
$string .= "</div>";

$string .= "<div class='maxWidth' >";
	$string .= "<div class='divMessage'>";
	$string .= "<span id='nbMyFaps' style='float:left;'><img src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' class='imgIcone2' />
				&nbsp;".getNomUser($fap->getId())."</span>";
	$string .= "<span id='nbUsrFaps' style='float:right;'><img src='images/roue.gif' class='imgIcone2' /></span>";
	$string .= "</div>";

	$string .= "<div id='divGraph' class='divGraph' ratio='2' ></div>";
$string .= "</div>";

$string .= "<div class='divMessage' id='defiCommentaire' ></div>";

if ($bestMonth==$fap->getId()) {
	$string .= "<div id='listeDefi' style='display:none;'>";
		$string .= "<select onchange='rejouer(this.value)'><option value=''></option>";
		foreach ($t_users as $usr => $v) {
			if ($usr!=$fap->getId()) $string .= "<option value='".$usr."'>".$v['nom']."</option>";
		}
		$string .= "</select>";
	$string .= "</div>";	
}

$string .= "</div>";
	
$string .= $string_banner;
$string .= "<script>actualiseDefi();</script>";
$string .= "</body></html>";
echo $string;