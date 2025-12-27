<?php
//header( 'Cache-Control: max-age=84600, must-revalidate' );
header( 'Cache-Control: max-age=300, must-revalidate' );
$string_head = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD XHTML 1.1 plus SVG 1.1//EN'>";
$string_head .= "<html>";
$string_head .= "<head>";
	$string_head .= "<title>FAPplication</title>";
	$string_head .= '<meta name="description" content="La Fapplication est le site du fap des joyeux lurons de Brenat Production">';
	$string_head .= '<meta name="keywords" content="fapplication,brenat-production.fr,brenat-production,brenatproduction,fap,brenat,production">';
	$string_head .= "<meta http-equiv='Content-Type' content='text/html;charset=utf-8' />";
	$string_head .= "<meta http-equiv='content-language' content='fr-FR' />";
	$string_head .= "<meta http-equiv='X-UA-Compatible' content='IE=9'/>";
	$string_head .= '<meta name="viewport" content="width=device-width, initial-scale=1">';
	$string_head .= "<link rel='shortcut icon' type='image/x-icon' href='images/fap.ico' >";
	$string_head .= "<link rel='icon' type='image/png' href='images/fap.png' />";
	
	$string_head .= "<script type='text/javascript' src='scripts/compteur.js".$versionTime."' ></script>";
	$string_head .= "<script type='text/javascript' src='scripts/global.js".$versionTime."' ></script>";
	
	//bootstrap
	$string_head .= "<script type='text/javascript' src='scripts/jquery-2.2.4.min.js' ></script>";
	$string_head .= "<link rel='stylesheet' href='bootstrap/css/bootstrap.min.css' media='all' type='text/css' />";
	$string_head .= "<link rel='stylesheet' href='bootstrap/css/bootstrap-theme.min.css' media='all' type='text/css' />";
	$string_head .= "<script type='text/javascript' src='bootstrap/js/bootstrap.min.js' ></script>";
	
	$string_head .= "<link rel='stylesheet' href='bootstrap/font-awesome-4.7.0/css/font-awesome.min.css' media='all' type='text/css' />";
	
	$string_head .= "<link rel='stylesheet' href='styles/global.css".$versionTime."' media='all' type='text/css' />";
	if ($isApplicationQualif) $string_head .= "<link rel='stylesheet' href='styles/qualif.css".$versionTime."' media='all' type='text/css' />";

	