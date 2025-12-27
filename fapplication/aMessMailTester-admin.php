<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

if ($fap->isAdmin('diff')) {	
	
	if (count($_POST)>0) {
		if (isset($_POST['sendMessage'])) {
			include_once('communs/mail.php');
			$string .= "<div class='cadre' >";
			$string .= "<div class='divEntete' >";
			$string .= "Envoi du message";
			$string .= "</div>";			
			$string .= "<input type='button' value='Revenir' onclick='document.location.replace(document.location.href)' />";
			$titre = "Message de la Fapplication";
			if ($_POST['titre']!='') $titre = $_POST['titre'];
			if ($_POST['exp']!='') {
				sendMail(null,$_POST['message'],$titre,$_POST['exp'],false,false);
				$string .= "<div>Message envoyé à ".$_POST['exp']."</div>";
				$string .= "<div style='font-style:italic;font-size:80%;margin-top:50px;' >";
					$string .= "<div>".$titre."</div>";
					$string .= "<div>".$_POST['message']."</div>";				
				$string .= "</div>";	
			} else {
				$string .= "<div class='divMessage' >";
				$string .= "Pas d'expéditeur";
				$string .= "</div>";
				$string .= "<script>document.location.replace(document.location.href)</script>";
			}	
			$string .= "</div>";
			$string .= "</body></html>";
			echo $string;
		}
		die();
	}
	
	$string .= "<div class='cadre' >";
	$string .= "<div class='divEntete' >";
	$string .= "Envoyer un message";
	$string .= "</div>";
	$string .= "<div class='divMessage' >";
	$string .= "<a href='https://www.mail-tester.com/' target='_blank' >https://www.mail-tester.com/</a>";
	$string .= "</div>";
	
	$string .= "<form method='post' onsubmit='return confMessage();' ><input name='sendMessage' style='display:none;' />";
	$string .= "<br>Titre : <input name='titre' value='Message de la Fapplication' style='width:600px;max-width:90%;' />";
	$string .= "<br><br>Bonjour {Nom du fappeur}";
	$string .= "<br><textarea name='message' rows='7' cols='100' style='max-width:90%;'></textarea>";
	$string .= "<br><input type='submit' value='Envoyer' />";
	
	$string .= "<br><br>Envoyer à ";
	$string .= "<input name='exp' value='' style='width:600px;max-width:90%;' />";
	$string .= "</form>";
	
	$string .= "</div>";

} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	