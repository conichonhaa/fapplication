<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "La charte du Fappeur";
$string .= "</div>";

$k = 0;
$f = file_get_contents('files/charte.txt');
$l = explode("\n",$f);
foreach($l as $r) {
	$k++;
	$string .= "<div class='divRegleTitre' >Règle n°".$k."</div>";
	$string .= "<div class='divRegle' >";
	$string .= $r;
	$string .= "</div>";
}

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;