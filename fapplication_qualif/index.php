<?php
require_once('communs/mysql_compat.php');
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;	
$string .= "</head><body>";


$string .= "<div class='divMessage' >";
$string .= "Loading...";
$string .= "</div>";


if ($fap->getId()) {
	$string .= "<script>document.location.replace('fFap-fap.php')</script>";
	$string .= "</body></html>";
	echo $string;
	die();
} else {
	$string .= "<script>document.location.replace('login.php')</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}

$string .= "</body></html>";
echo $string;
