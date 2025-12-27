<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
	

$string .= "</head><body>";


if (count($_POST)>0) {
	if (isset($_POST['email']) and $_POST['email']!='') {
		if ($fap->info['email']!='') {
			$fap->newEmail = $_POST['email'];
			$lien = $fap->setLienAutologin('null');
			if ($lien) {
				include_once('communs/mail.php');
				$message = "Bonjour Nouveau Fappeur";
				$message .= "\r\n\r\nTu as été parrainé par ".$fap->info['nom'].".";
				$message .= "\r\n\r\nClique sur le lien ci-dessous (ou copier/coller dans un navigateur) pour t'inscrire :";
				$message .= "\r\n".$lien;	
				$nb = $fap->getNbjLienActif();
				if ($nb>1) $s="s"; else $s="";
				$message .= "\r\nAttention ce lien restera valable pendant ".$nb." jour".$s.".";			
				if (sendMail(null,$message,"Inscription à la Fapplication",$_POST['email'])) {
					$_SESSION['fap']['parrainage'] = "Parrainage effectué pour <a href='mailto:".$_POST['email']."'>".$_POST['email']."</a>";
				}
			}
		} else $_SESSION['fap']['parrainage'] = "Tu dois avoir une adresse mail valide pour parrainer un amis";
	}
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}


$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Parrainer un nouveau fappeur";
$string .= "</div>";

if (isset($_SESSION['fap']['parrainage'])) {
	$string .= "<div class='divMessage' >";
	$string .= $_SESSION['fap']['parrainage'];
	$string .= "</div>";
	unset($_SESSION['fap']['parrainage']);
}

$string .= "<form method='post'>";
$string .= "Email : &nbsp;</label><input type='email' id='email' name='email' />";
$string .= "<input type='submit' value='Parrainer' /><br/>";
$string .= "</form>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;