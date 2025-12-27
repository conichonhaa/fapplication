<?php
session_start();

session_destroy();

$xml = "<xml>";
	$xml .= "<data>toutes les données nécessaires</data>";
	$xml .= "<variables>";
		foreach ($_GET as $key => $val) $xml .= "<".$key.">".$val."</".$key.">";
	$xml .= "</variables>";
$xml .= "</xml>";
header('Content-Type: application/xml',false); 	
echo $xml;