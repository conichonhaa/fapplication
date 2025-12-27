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
			
			$string .= "<div class='cadre' >";
			$string .= "<div class='divEntete' >";
			$string .= "Envoi du message";
			$string .= "</div>";			
			
			$titre = "Message de la Fapplication";
			if ($_POST['titre']!='') $titre = $_POST['titre'];
			if ($_POST['message']!='') {
				$string .= "<div style='display:none;' >";
					$string .= "<div id='titre'>".$titre."</div>";
					$string .= "<div id='message' >".$_POST['message']."</div>";				
				$string .= "</div>";
				$string .= "<input type='button' value='Revenir' onclick='document.location.replace(document.location.href)' />";
				foreach ($fap->getListUsers() as $usr => $u) {
					if ($_POST['choix']=='all' || isset($_POST['pick'.$usr])) {
						$info = $fap->logGetInfo($usr);
						if ($info['email']=='' or !$info['notif_mail']) continue;
						$string .= "<div>".getNomUser($usr)." : 
							<span id='sent_".$usr."' style='font-style:italic;font-size:80%;vertical-align:middle;'>
							<img src='images/roue.gif' style='width:20px;vertical-align:text-bottom;'>
							</span></div>";
						$string .= "<script>sendMessageMail(".$usr.");</script>";
					}
				}
				$string .= "<div style='font-style:italic;font-size:80%;margin-top:50px;' >";
					$string .= "<div>".$titre."</div>";
					$string .= "<div>".$_POST['message']."</div>";				
				$string .= "</div>";	
			} else {
				$string .= "<div class='divMessage' >";
				$string .= "Aucun message posté";
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
	
	$string .= "<form method='post' onsubmit='return confMessage();' ><input name='sendMessage' style='display:none;' />";
	$string .= "<br>Titre : <input name='titre' value='Message de la Fapplication' style='width:600px;max-width:90%;' />";
	$string .= "<br><br>Bonjour {Nom du fappeur}";
	$string .= "<br><textarea name='message' rows='7' cols='100' style='max-width:90%;'></textarea>";
	
	$nb = 0;
	$string_users = "";
	$sansmail = "";
	$verbe = " n'a pas de mail";
	foreach ($t_users as $usr => $v) {
		$info = $fap->logGetInfo($usr);
		if ($info['email']!='') {
			$check = ($info['notif_mail']?'checked':'disabled');
			$string_users .= "<div><input type='checkBox' id='pick".$usr."' name='pick".$usr."' ".$check." style='margin-left:1em;' onchange='selAllUsers(this)' />
						<label for='pick".$usr."' style='display:inline;' > &nbsp; ".$v['nom']."</label></div>";
			if ($info['notif_mail']) $nb++;
		} else {
			if ($sansmail!='') {
				$sansmail .= ", ";
				$verbe = " n'ont pas de mails";
			}
			$sansmail .= $v['nom'];
		}
	}
	
	$string .= "<br><input type='submit' value='Envoyer' />";
	$string .= " &nbsp; (<span id='nbSend' all='".count($t_users)."' pick='".$nb."' >".count($t_users)."</span>)";
	
	$string .= "<br><br>Envoyer à ";
	$string .= "<div class='eltBtnRadio' ><input type='radio' id='choix0' name='choix' checked value='all' onchange='pickAllUsers(this)' />
					<label for='choix0'> &nbsp; Tous</label></div>";
	$string .= "<div class='eltBtnRadio' ><input type='radio' id='choix1' name='choix' value='pick' onchange='pickAllUsers(this)' />
					<label for='choix1'> &nbsp; Choisir</label></div>";
					
	$string .= "<div id='listUsers' style='display:none;'>";
	$string .= "<div ><input type='checkBox' id='pickAll' checked style='margin-left:1em;' onchange='selAllUsers(this)' />
						<label for='pickAll' style='display:inline;font-style:italic;font-weight:bold;border-bottom:1px solid #000000;' > &nbsp; Tous</label></div>";
	
	$string .= $string_users; 
	if ($sansmail!="") $string .= "<div style='font-style:italic;'>".$sansmail.$verbe."</div>";
	$string .= "</div>";
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