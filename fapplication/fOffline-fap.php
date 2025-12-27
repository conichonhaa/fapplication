<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
	
$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/fallback.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Les Faps hors ligne";
if ($fap->hasCapacity('invisible')) $string .= " <img src='images/masque.png' class='imgIcone' />";
$string .= "</div>";

$string .= "<div  class='divMessage' id='offlineButton' >";
$string .= "<input type='button' value='Synchroniser' onclick='sendFapLocal()' class='inputAlert' />";
$string .= "&nbsp;&nbsp;&nbsp;<input type='button' value='Supprimer' onclick='delFapLocal()' class='inputAlert' />";
$string .= "</div>";

$string .= "<div id='offline' ></div>";

$string .= "<div id='offlineResult' style='margin-top:20px;font-style:italic;' ></div>";
$string .= "<div id='offlineVote' style='font-style:italic;display:none;' >
			N'oublie pas d'aller voter dans <a href='sIncub-stats.php'>l'incubateur</a></div>";

$string .= "</div>";
$string .= "<script>var usrLocal=".$fap->getId().";getFapLocal();</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;