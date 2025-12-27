<?php
session_start();

$delai = 1000 * 24 * 3600;

if (isset($_POST['username'])) {
	$_SESSION['cryptoGame']['username'] = $_POST['username'];
	setcookie('cryptoUserName', $_POST['username'], time()+$delai);
}
if (isset($_POST['user'])) {
	$_SESSION['cryptoGame']['user'] = $_POST['user'];
	setcookie('cryptoUser', $_POST['user'], time()+$delai);
}

session_destroy();

$xml = "<xml>";

$xml .= "</xml>";
header('Content-Type: application/xml',false); 	
echo $xml;