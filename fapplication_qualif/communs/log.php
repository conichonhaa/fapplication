<?php
// include_once('communs/menu.php');
// include_once('communs/head.php');

function memoPage() {
	global $fap;
	$page = str_replace($fap->getAppName(),"",$_SERVER['PHP_SELF']);
	$memo = true;
	$memo = ($memo and (strpos($page,"_")!==0));
	if (!isset($_SESSION['fap'][$fap->getAppName()]['memoPageFirst']) and $memo) 
		$_SESSION['fap'][$fap->getAppName()]['memoPageFirst'] = $_SERVER['REQUEST_URI'];
}

if (!$fap->getId()) {
	memoPage();
	$string = $string_head;
	$string .= "<link rel='stylesheet' href='styles/login.css' media='all' type='text/css' />";
	$string .= "<script type='text/javascript' src='scripts/admin.js' ></script>";
	$string .= "</head><body>";
	$string .= $string_menu;
	$string .= "<div class='divEntete' >";
	$string .= "Authentification obligatoire";
	$string .= "</div>";
	$string .= "<script>setTimeout(function(){document.location.replace('".$fap->getAppName()."login.php')},2000)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}