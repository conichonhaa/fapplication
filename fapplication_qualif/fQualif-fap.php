<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

include_once('restricted/secure.php');
$sec = new secure($fap);

$string = $string_head;	
	
$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/fallback.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Bascule pré-production";
$string .= "</div>";

$string .= "<div style='font-style:italic;font-size:90%;'>
				Le site de qualification (repérable par son <span style='background-color:#F2BF88;'>fond orange</span>) 
				est un espace à destiné à l'expérimentation.
				<br>Branché sur une base de données différente vous pouvez y faire des manipulations sans risques... 
				comme appuyer sur le bouton \"j'ai fappé\" alors qu'en fait c'est pas vrai ! (Oh my God!)
				<br>Vous pourrez aussi de temps en temps y trouver des pages en test ou en cours de développement &#9786;.
				<br>NB: les données n'ont aucune valeur pérenne et sont régulièrement remises à jour depuis le site de production.
			</div><br>";
	$url = $fap->getServerName().$_SERVER['REQUEST_URI'];
	if ($isApplicationQualif) {
		$string .= "&nbsp;&nbsp;&nbsp;Bascule <input type='button' value='".$sec->FapQualLeg()."' 
				onclick='document.location.replace(\"".$sec->fapQualChange($url)."\")' />";
	} else {		
		$string .= "&nbsp;&nbsp;&nbsp;Bascule <form method='post' style='display:inline-block;' action='".$sec->fapQualChange($url)."'>
				<input name='usr' value='".$fap->getId()."' style='display:none;' />
				<input name='random' value='".$fap->info['random']."' style='display:none;' />				
				<input type='submit' value='".$sec->FapQualLeg()."' /></form>";	
	}


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;