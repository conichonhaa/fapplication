<?php
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;
$string .= "<script type='text/javascript' src='scripts/dev.js' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$fap->delOldLien();

if (isset($_GET['lan']) and $_GET['lan']!='' and isset($_GET['tag']) ) {
	$fap->logout();
	$string .= "<div class='divMessage' >";
	$string .= $fap->valideLien($_GET['lan'],$_GET['tag']);
	$string .= "</div>";
} else {
	$string .= "<script>document.location.replace('.')</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}



$string .= $string_banner;
$string .= "</body></html>";
echo $string;	