<?php
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/login.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";



if ($fap->getId()) {	
	$page = ".";
	$page = "fFap-fap.php";
	if (isset($_SESSION['fap'][$fap->getAppName()]['memoPageFirst'])) {
		$page = $_SESSION['fap'][$fap->getAppName()]['memoPageFirst'];
		unset($_SESSION['fap'][$fap->getAppName()]['memoPageFirst']);
	}
	$string .= "<div class='divMessage' >";
	$string .= "Connexion authentifiée";
	$string .= "</div>";
	$string .= "<script>document.location.replace('".$page."')</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

if (count($_POST)>0) {
	if (isset($_POST['login'])) {
		if (isset($_POST['cookie'])) $cookie = true; else $cookie = false;
		$fap->login($_POST['login'],$_POST['password'],$cookie);
	}
	$string .= "<div class='divMessage' >";
	$string .= "Vérification...";
	$string .= "</div>";	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= $string_menu;

$string .= "<div class='divEntete' >";
$string .= "Si tu me dis qui tu es, je te dirai qui a Fappé !";
$string .= "</div>";
$string .= "<div class='divMessage' >";
$string .= "<a href='profil.php'>Pas encore inscris ?</a> &nbsp; ou &nbsp; <a href='loginForget.php'>mot de passe oublié ?</a>";
$string .= "</div>";

if (isset($_SESSION['fap']['alea'])) {
	$string .= "<div class='divMessage' >";
	$string .= $_SESSION['fap']['alea'];
	$string .= "</div>";
	unset($_SESSION['fap']['alea']);
}

$string .= "<div id='divConnexion' class='connexion' >";
$string .= "<form method='post'>";
$string .= "<label for='login' class='labelPass'>Login : &nbsp;</label><input id='login' name='login' class='inputPass'  /><br/>";
$string .= "<label for='password' class='labelPass'>Password : &nbsp;</label><input type='password' id='password' name='password' class='inputPass' /><br/>";
if ($fap->getResterConnecte()) $checked='checked'; else $checked='';
$string .= "<label > &nbsp;</label><input type='checkbox' id='cookie' name='cookie' ".$checked." /><label for='cookie'>&nbsp;rester connecté</label><br/>";
$string .= "<label > &nbsp;</label><input type='submit' value='Se connecter' /><br/>";
$string .= "</form>";
$string .= "</div>";


$string .= $string_banner;
$string .= "</body></html>";
echo $string;