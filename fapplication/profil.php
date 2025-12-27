<?php
include_once('communs/menu.php');
include_once('communs/head.php');

$string = $string_head;
$string .= "<script type='text/javascript' src='scripts/profil.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/profil.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";

if ($fap->getId()) {

	$string .= $string_buttSound;

	$mdp = '';
	if (count($_POST)>0) {
		if (isset($_POST['supprime'])) {
			$fap->deleteMe();
			$string .= "<script>document.location.replace('.')</script>";
			$string .= "</body></html>";
			echo $string;	
			die();
		}
		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;
		die();
	}
	
	// menage des confirmations mail en attente
	$fap->delOldLien();
	
	$string .= "<div class='divEntete' >";
	$string .= "Mes informations de Fappeur";
	$string .= "</div>";
	$string .= "<div class='divMessage' >";
	$string .= $mdp;
	$string .= "<input type='button' value='Supprimer mon compte' onclick='supprimeMe()' />";
	$string .= "</div>";
	
	
	if ($fap->getResterConnecte()) $checked='checked'; else $checked='';
	$string .= "<div class='sousTitre'><span class='sousTitreU'>Qui suis-je ?</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<input type='checkBox' id='profilCookie' ".$checked." onchange='glbSendPost(this);' />
				<label for='profilCookie'  style='font-style:italic;' >&nbsp;rester connecté</label></div>";
	$string .= "<div class='contenu'>";
	
	if ($fap->calcPoints()>=1000) $img = "<div id='profilLoginMod' input='profilLogin' onclick='affInput(this)' title='Modifier'
											class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>"; 
							else $img = "";
	$string .= "<div class='eltProfil' >Login : &nbsp;<span ><b>".$fap->info['nom']."</b> ".$img."</span><span style='width:150px;display:none;' ><input id='profilLogin' 
				value=\"".$fap->info['nom']."\" pts='".$fap->calcPoints()."' oninput='testLogin(this);' disabled /><input type='button' value='Tester' 
				onclick='sendLogin()' /> <span id='profilLoginErr' style='font-style:italic;' ></span></span>
				</div>";
				
	//$string .= "Pseudo : <input id='pseudo' name='pseudo' value='".$fap->info['pseudo']."' size='40'  style='max-width:90%;' />";
	$string .= "<div class='eltProfil' >Sexe : ";
	$tt = array('M'=>'Mâle','F'=>'Femelle','E'=>'Enorme');
	foreach($tt as $key => $val) {
		if ($fap->info['sexe']==$key) $checked='checked'; else $checked='';
		$string .= "<div class='eltBtnRadio' ><input type='radio' id='profilSexe".$key."' name='profilSexe' ".$checked." value='".$key."' onclick='glbSendPost(this);' />
					<label for='profilSexe".$key."'> &nbsp;".$val."</label></div>";
	}
	$string .= "</div>";
	
	$string .= "<div class='eltProfil' >Avatar : <img data-src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' 
					src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' 
					id='visu_profilPhoto' style='width:40px;cursor:pointer;' onclick='chargeImage(this)' file='profilPhoto'  />
					<input type='button' id='send_profilPhoto' value='Garder' onclick='sendPhoto(this)' style='display:none;' />
					<input type='file' id='profilPhoto' style='display:none;' >";
	$string .= "</div>";
	
	if ($fap->info['email']!='') {
		$disabled='disabled'; 
		$func = 'changeEmail(this)';
		$val = 'Modifier';
		$mess = "validé";
		$imgClass = "imgPen";
	} else {
		$disabled='';
		$func = 'confirmEmail(this)';
		$val = 'Confirmer';
		$mess = "";
		$imgClass = "imgCheck";
	}
	$string .= "<div class='eltProfil' >Email : <input type='email' usr='".$fap->getId()."' id='email' name='email' 
					value='".$fap->info['email']."' size='40'  style='max-width:90%;' ".$disabled." />";
	$string .= "<div mail='email' lab='labEmail' onclick='".$func."' title='".$val."'
					class='imgDelete ".$imgClass."' style='display:inline-block;' >&nbsp;</div>";
	$string .= "<span id='labEmail' style='font-style:italic;padding-left:5px;'>".$mess."</span>";
	if ($fap->info['email']=='') $string .= "<br/><i>(Tu dois avoir un mail pour profiter pleinement de la Fapplication)</i>";	
	$string .= "</div>";
	
	if ($fap->info['tel']!='') {
		$disabled='disabled'; 
		$func = 'changeTel(this)';
		$val = 'Modifier';
		$imgClass = "imgPen";
	} else {
		$disabled='';
		$func = 'confirmTel(this)';
		$val = 'Valider';
		$imgClass = "imgCheck";
	}
	$string .= "<div class='eltProfil' >Tel : <input type='tel' id='profilTel' value='".$fap->info['tel']."' style='max-width:90%;' ".$disabled." />";
	$string .= "<div onclick='".$func."' title='".$val."' class='imgDelete ".$imgClass."' style='display:inline-block;' >&nbsp;</div>";
	if ($fap->info['tel']=='') $string .= "<br/><i>(Tu dois avoir un téléphone pour profiter pleinement de la Fapplication)</i>";	
	$string .= "</div>";
	
	$string .= "<div class='eltProfil' >Notifications : ";
	if ($fap->info['notif_mail']) $checked='checked'; else $checked='';
	$string .= " &nbsp; <input type='checkBox' id='profilNotifMail' ".$checked." onchange='glbSendPost(this);retestNotif();' />
				<label for='profilNotifMail'  style='font-style:italic;' >&nbsp;mail</label>";
	if ($fap->info['notif_sms']) $checked='checked'; else $checked='';
	$string .= " &nbsp; <input type='checkBox' id='profilNotifSms' ".$checked." onchange='glbSendPost(this);retestNotif();' />
				<label for='profilNotifSms'  style='font-style:italic;' >&nbsp;sms</label>";
	if ($fap->info['notif_ifttt']) $checked='checked'; else $checked='';
	$string .= " &nbsp; <input type='checkBox' id='profilNotifIfttt' ".$checked." onchange='glbSendPost(this);retestNotif();' />
				<label for='profilNotifIfttt'  style='font-style:italic;' >&nbsp;ifttt</label>";					
	$string .= " &nbsp; <input type='button' id='profilTestNotif' onclick='testNotif(this);' value='Test Notification' />";			
	$string .= "</div>";				
	$string .= "<div style='font-size:80%;font-style:italic;margin-left:3em;'>
				(NB: voir <a href='fIfttt-fap.php'>Fap par IFTTT</a> pour plus d'explications sur le parametrage ifttt)</div>";
				
	$string .= "<div class='eltProfil' >Demander confirmation avant d'enregistrer un Fap non géolocalisé ? ";
	$tt = array('1'=>'Oui','0'=>'Non');
	foreach($tt as $key => $val) {
		if ($fap->info['confirm_geoloc']==$key) $checked='checked'; else $checked='';
		$string .= "<div class='eltBtnRadio' ><input type='radio' id='profilConfGeoloc".$key."' name='profilConfGeoloc' ".$checked." 
							value='".$key."' onclick='glbSendPost(this);' /> <label for='profilConfGeoloc".$key."'> &nbsp;".$val."</label></div>";
	}
	$string .= "</div>";

	$string .= "<div class='eltProfil' >Jouer à la guerre des territoires ? ";
	$tt = array('1'=>'Oui','0'=>'Non');
	foreach($tt as $key => $val) {
		if ($fap->info['territoire']==$key) $checked='checked'; else $checked='';
		$string .= "<div class='eltBtnRadio' ><input type='radio' id='profilWarTerritory".$key."' name='profilWarTerritory' ".$checked." 
							value='".$key."' onclick='glbSendPost(this);' /> <label for='profilWarTerritory".$key."'> &nbsp;".$val."</label></div>";
	}
	$string .= "</div>";
	
	$string .= "<div class='eltProfil' >Désactiver le matelas automatique du pouvoir ? ";
	$tt = array('1'=>'Oui','0'=>'Non');
	foreach($tt as $key => $val) {
		if ($fap->info['nomatelas']==$key) $checked='checked'; else $checked='';
		$string .= "<div class='eltBtnRadio' ><input type='radio' id='profilNoMatelas".$key."' name='profilNoMatelas' ".$checked." 
							value='".$key."' onclick='glbSendPost(this);' /> <label for='profilNoMatelas".$key."'> &nbsp;".$val."</label></div>";
	}
	$string .= "</div>";
	
	
	$string .= "</div>";
	

	$string .= "<div class='sousTitre'><span class='sousTitreU'>Changer mon mot de passe</span> :</div>";
	$string .= "<div class='contenu'>";
	$string .= "<label for='profilPassword' class='labelPass'>Password : &nbsp;</label><input type='password' id='profilPassword' oninput='verifPassword()' /><br/>";
	$string .= "<label for='profilConfPassword' class='labelPass'>Confirme : &nbsp;</label><input type='password' id='profilConfPassword' oninput='verifPassword()' />";
	$string .= " <input id='profilConfPasswordOk' type='button' value='Modifier' onclick='setPassword()' style='display:none;' />";
	$string .= "<span id='profilConfPasswordMess' ></span>";
	$string .= "</div>";
	
	
} else {
	if ($fap->isGodson()) {
		$mdp = "";
		$nom = "";
		$pass = "";
		$cpass = "";
		if (count($_POST)>0) {
			if (isset($_POST['login']) and isset($_POST['password']) and isset($_POST['cpassword'])) {
				$nom = str_replace("\\","",$_POST['login']);
				$pass = str_replace("\\","",$_POST['password']);
				$cpass = str_replace("\\","",$_POST['cpassword']);
				$fap->isUserDispo($_POST['login']);
				if ($pass==$cpass and $pass!='') {
					$fap->newUser($nom,$pass);
					if (!$fap->errNew) {
						$fap->endGodson();
						echo "<script>document.location.replace(document.location.href)</script>";
						die();
					}
				} else {
					if ($pass=='') $mdp = "Le mot de passe ne peut pas être vide";
					else $mdp = "Mauvaise confirmation du mot de passe";
				}
			}
		}
		
		$string .= "<div class='divEntete' >";
		$string .= "Nouveau Fappeur ? Inscris-toi vite pour pouvoir Fapper avec tes amis";
		$string .= "</div>";
		
		$string .= "<div class='divMessage' >";
		$string .= "<a href='login.php'>J'ai déjà un compte</a>";
		$string .= "</div>";
		
		$string .= "<div class='divMessage' ><br/>";
		if ($fap->errNew) $string .= $fap->errNew."<br>";
		$string .= $mdp;
		$string .= "</div>";

		$string .= "<form method='post'>";
		$string .= "<label for='login'>Login : &nbsp;</label><input id='login' name='login' value=\"".$nom."\" /><br/>";
		$string .= "<label for='password'>Password : &nbsp;</label><input type='password' id='password' name='password' value=\"".$pass."\" /><br/>";
		$string .= "<label for='password'>Confirme : &nbsp;</label><input type='password' id='cpassword' name='cpassword' value=\"".$cpass."\" /><br/>";
		$string .= "<label > &nbsp;</label><input type='submit' value='Créer mon compte' /><br/>";
		$string .= "</form>";

	} else {
		$string .= "<div class='divEntete' >";
		$string .= "Nouveau Fappeur ? Inscris-toi vite pour pouvoir Fapper avec tes amis";
		$string .= "</div>";
		
		$string .= "<div>";
		$string .= "Mais tu dois d'abord être intronisé par la communauté. Envoi ton adresse mail à un autre fappeur qui pourra alors te parrainer.
					<br>Tu recevras par mail un lien qui te permettra de t'inscrire.";
		$string .= "</div>";
	}
}
$string .= "</div>";


$string .= $string_banner;
$string .= "</body></html>";
echo $string;