<?php
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;
$string .= "</head><body>";

$string .= $string_menu;
	
$fap->logout();
$string .= "<div class='divMessage' >";
$string .= "Déconnexion en cours ...";
$string .= "</div>";

$string .= "<script>document.location.replace('.')</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;

