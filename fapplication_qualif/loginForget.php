<?php
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;
$string .= "<script type='text/javascript' src='scripts/login.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

if ($fap->getId()) {	
	$string .= "<script>document.location.replace('.')</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

if (count($_POST)>0) {
	if (isset($_POST['entry'])) {
		$entry = str_replace("\\","",$_POST['entry']);
		$inf = $fap->askInitUser($entry);
		if (isset($inf['lien'])) {
			include_once('communs/mail.php');
			$info = $inf['info'];
			$message = "Bonjour ".$info['nom'];
			$message .= "\r\n\r\nTu as demandé la réinitialisation de ton compte à la FAPplication.";
			$message .= "\r\n\r\nSi cette action est bien de ton fait, clique sur le lien ci-dessous (ou copier/coller dans un navigateur) pour confirmer";
			$message .= "\r\n".$inf['lien'];	
			$nb = $fap->getNbjLienActif();
			if ($nb>1) $s="s"; else $s="";
			$message .= "\r\nAttention ce lien restera valable pendant ".$nb." jour".$s.".";
			$message .= "\r\n\r\nDans le cas contraire ne fais rien.";			
			sendMail($inf['usr'],$message,'Demande de réinitialisation de ton compte ?',null,true);
			$_SESSION['fap']['forget'] = "Un message a été envoyé";
		} else if (isset($inf['error'])) {
			$titre = "Plusieurs comptes correspondent";
			if (isset($inf['like'])) $titre = "Compte".(count($inf['error'])>1?"s":"")." ressemblant à la recherche";
			if (isset($inf['few'])) $titre = "3 caractères minimum";
			$_SESSION['fap']['forget'] = "<div style='display:inline-block;vertical-align:top;'>".$titre." :";
			foreach ($inf['error'] as $l) {
				$_SESSION['fap']['forget'] .= "<div style='cursor:pointer;' onclick='setEntry(this)'>".$l."</div>";
			}
			$_SESSION['fap']['forget'] .= "</div>";
		}	
		else $_SESSION['fap']['forget'] = "Pas de compte trouvé ou adresse mail non connue";
		$_SESSION['fap']['forgetentry'] = $entry;
	}
	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre' >";

$string .= "<div class='divEntete' >";
$string .= "Mot de passe oublié";
$string .= "</div>";
$string .= "<div class='divMessage' >";
$string .= "Entre ton login de connexion ou ton adresse mail et tu recevras un message avec un lien de confirmation";
$string .= "</div>";


$value = "";
if (isset($_SESSION['fap']['forgetentry'])) {
	$value = $_SESSION['fap']['forgetentry'];
	unset($_SESSION['fap']['forgetentry']);
}
$string .= "<br><br><form method='post'>";
$string .= "Login ou mail : <input id='entry' name='entry' value=\"".$value."\" />";
$string .= "<input type='submit' value='Réinitialiser mon compte' />";
if (isset($_SESSION['fap']['forget'])) {
	$string .= " &nbsp; <i>".$_SESSION['fap']['forget']."</i>";
	unset($_SESSION['fap']['forget']);
}
$string .= "</form>";

$string .= "</div>";


$string .= $string_banner;
$string .= "</body></html>";
echo $string;