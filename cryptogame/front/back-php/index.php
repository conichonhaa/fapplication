<?php
session_start();
if (!isset($_SESSION['cryptoGame'])) $_SESSION['cryptoGame'] = Array();
$user = false;
if (isset($_SESSION['cryptoGame']['user'])) $user = $_SESSION['cryptoGame']['user'];
if (!$user and isset($_COOKIE['cryptoUser'])) $user = $_COOKIE['cryptoUser'];

$username = false;
if (isset($_SESSION['cryptoGame']['username'])) $username = $_SESSION['cryptoGame']['username'];
if (!$username and isset($_COOKIE['cryptoUserName'])) $username = $_COOKIE['cryptoUserName'];

session_destroy();

// print_r($_SESSION);
// print_r($_COOKIE);
// die();

$xml = "<xml>";
	$xml .= "<moteur>PHP</moteur>";
	//$xml .= "<wsPort>1664</wsPort>";
	//if (strpos($_SERVER['HTTP_HOST'],'cryptogame.brenat-production.fr')!==false)
	//$xml .= "<wsServer>fap.brenat-production.fr</wsServer>";

	// Configuration spécifique pour cryptogame
	if (strpos($_SERVER['HTTP_HOST'],'php.cryptogame.brenat-production.fr')!==false) {
    	$xml .= "<wsPort>6969</wsPort>";
    	$xml .= "<wsServer>php.cryptogame.brenat-production.fr</wsServer>";
	} else {
	$xml .= "<wsPort>1664</wsPort>";
	$xml .= "<wsServer>fap.brenat-production.fr</wsServer>";
}

	if ($user)
		$xml .= "<user>".$user."</user>";
	if ($username)
		$xml .= "<username>".$username."</username>";
	$xml .= "<actions name='getData'>back-php/getData.php</actions>";
	$xml .= "<actions name='setData'>back-php/setData.php</actions>";
$xml .= "</xml>";
header('Content-Type: application/xml',false); 	
echo $xml;
