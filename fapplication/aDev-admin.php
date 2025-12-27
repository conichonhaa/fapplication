<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');
include_once('restricted/secure.php');
// include_once('secure.php');
$sec = new secure($fap);

$string = $string_head;
$string .= "<script type='text/javascript' src='scripts/dev.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";

$host = $_SERVER['HTTP_HOST'];
$ip = getHostByName($host);
$string .= "<div class='divMessage divMessMini'>Serveur : ".$host." (".$ip.")</div>";


if ($fap->isAdmin()) {	
	if ($fap->isModeDev()) {
		if (count($_POST)>0) {
			if (isset($_POST['doss']) and isset($_FILES['file'])) {
				$sec->uploadFile($_POST['doss'],$_FILES['file'],$_POST['ndoss']);
			}
			if (isset($_POST['delfichier']) and $_POST['delfichier']!='') {
				$sec->deleteFile($_POST['delfichier']);
			}
			if (isset($_POST['deldoss']) and $_POST['deldoss']!='') {
				$sec->deleteDoss($_POST['deldoss']);
			}
			if (isset($_POST['usurp']) and $_POST['usurp']!='') {
				$fap->usurpUser($_POST['usurp']);
			}
			if (isset($_POST['recup'])) {
				if (isset($_POST['file'])) $sec->downloadFile($_POST['file']);
				if (isset($_POST['doss'])) $sec->downloadDoss($_POST['doss']);
				if (isset($_POST['base'])) $sec->downloadBase($fap->conn);
				if (isset($_POST['images'])) $sec->downloadImages($fap->conn);
			}
			if (isset($_POST['postimages']) and isset($_FILES['images'])) {
				$sec->uploadImages($_FILES['images'],$fap->conn);
			}
			if (isset($_POST['postcertificat']) and isset($_FILES['certificat'])) {
				$sec->uploadCertificat($_FILES['certificat'],$fap);
			}
			if (isset($_POST['delcertificat']) and $_POST['delcertificat']!='') {
				$sec->delCertificat($_POST['delcertificat'],$fap);
			}
			
			if (isset($_POST['mdpdev'])) {
				$fap->setModeDev('pass',$_POST['mdpdev']);
			}
			if (isset($_POST['qualif'])) {
				$sec->FapQual();
			}
			if (isset($_POST['qualifBase'])) {
				$sec->FapQualBase($fap);
			}
			
			$string .= "<script>document.location.replace(document.location.href)</script>";
			$string .= "</body></html>";
			echo $string;
			die();
		}
		
		$string .= "<div>";
		$string .= "<input type='button' value='Sortir du mode développement' onclick='devOff()' />";
		
		if ($fap->isDev()) {
			
			$string .= "&nbsp;&nbsp;&nbsp; Mode <select onchange='devChange(this)' ><option value=''></option>";
				$string .= "<option value='normal'>normal</option>";
				$string .= "<option value='super'>expert</option>";
				$string .= "<option value='superAll'>ts dossiers</option>";
				$string .= "<option value='' disabled ><hr></option>";
				$string .= "<option value='safe'>prude</option>";
				$string .= "<option value='all'>complet</option>";
			$string .= "</select>";
		
			$url = $fap->getServerName().$_SERVER['REQUEST_URI'];
			$value = "bascule : ".$sec->FapQualLeg();
			if ($isApplicationQualif) {
				$string .= "&nbsp;&nbsp;&nbsp;<input type='button' value='".$value."' 
						onclick='document.location.replace(\"".$sec->fapQualChange($url)."\")' />";
			} else {		
				$string .= "&nbsp;&nbsp;&nbsp;<form method='post' style='display:inline-block;' action='".$sec->fapQualChange($url)."'>
						<input name='usr' value='".$fap->getId()."' style='display:none;' />
						<input name='random' value='".$fap->info['random']."' style='display:none;' />				
						<input type='submit' value='".$value."' /></form>";	
			}						
			
		}
		$string .= "</div>";
		
		if ($fap->isDev()) {	
			
			//usurper
			$string .= "<form method='post' style='margin-top:30px;' >";
			$string .= "&nbsp;&nbsp;&nbsp; <select name='usurp'><option value=''></option>";
			foreach ($t_users as $usr => $v) {
				$string .= "<option value='".$usr."'>".$v['nom']."</option>";
			}
			$string .= "</select>";
			$string .= "<input type='submit' value='Usurper' /><br/>";
			$string .= "</form>";
			
			// synchro
			$string .= "<div style='margin-top:30px;'>";
				$string .= "<div onclick='affDiv(this)' div='divSynchro' style='cursor:pointer;' >
					<img id='pm_divSynchro' src='images/moins.png' class='iconePM' /><u>Synchronisation : ".$sec->FapQualLeg()."</u></div>";
				$string .= "<div id='divSynchro' >";		
					//dossiers
					$string .= "<form method='post'  style='display:inline-block;;margin-left:50px;' >";
					$string .= "<input name='qualif' style='display:none;' />";
					$string .= "<input type='submit' value='Dossiers' /><br/>";
					$string .= "</form>";
					//base
					$string .= "<form method='post' style='display:inline-block;margin-left:50px;' onsubmit='return confirm(\"Ecraser la base ?\");' >";
					$string .= "<input name='qualifBase' style='display:none;' />";
					$string .= "<input type='submit' value='Base' /><br/>";
					$string .= "</form>";	

				$string .= "</div>";
			$string .= "</div>";

			//telecharger
			$string .= "<div style='margin-top:30px;'>";
				$string .= "<div onclick='affDiv(this)' div='divBase' style='cursor:pointer;' >
								<img id='pm_divBase' src='images/moins.png' class='iconePM' /><u>Télécharger</u></div>";		
				$string .= "<div id='divBase' style='padding:left:20px;'>";
				// base
				$string .= "<input id='recbase' t='base' style='display:none;' />";	
				$string .= "<input file='recbase' type='button' value='Télécharger la Base' onclick='recupFile(this)' />";
				//images
				$string .= "<div style='display:inline-block;vertical-align:top;margin-left:50px;'>";
				$string .= "Images :<br>";
				$string .= "<input id='recimages' t='images' style='display:none;' />";
				$string .= "<input file='recimages' type='button' value='Télécharger' onclick='recupFile(this)' />";
				$string .= " &nbsp; <form method='post' enctype='multipart/form-data' >";
				$string .= "<input name='postimages' style='display:none;' />";
				$string .= "<input type='file' name='images' ><input type='submit' value='Charger' />";
				$string .= "</form>";
				$string .= "</div>";
				
				$string .= "</div>";
			$string .= "</div>";	
			
			//fichiers
			$string .= "<div style='margin-top:30px;'>";
				$string .= "<div onclick='affDiv(this)' div='divFichiers' style='cursor:pointer;' >
								<img id='pm_divFichiers' src='images/plus.png' class='iconePM' /><u>Fichiers</u></div>";
				$string .= "<div id='divFichiers' style='display:none;'>";
					// add file
					$string .= "<form method='post' enctype='multipart/form-data'>";
					$string .= "<input type='file' name='file' >";
					$string .= "Dossier cible : <select name='doss'>";
					$arbo = $sec->getArbo();
					foreach ($arbo as $d) {
						$string .= "<option value='".$d."' >".$d."</option>";
					}
					$string .= "</select>";
					$string .= "<input value='' name='ndoss' />";
					$string .= "<br/><input type='submit' value='Charger' /><br/>";
					$string .= "</form>";
					// del file - doss
					$string .= "<form method='post' >";
					$string .= "Suppression d'un fichier <select name='delfichier'>";
					$string .= "<option value='' ></option>";
					$arbo = $sec->getFile();
					foreach ($arbo as $d) {
						$string .= "<option value='".$d."' >".$d."</option>";
					}
					$string .= "</select>";
					$string .= "<input type='submit' value='Supprimer' /><br/>";
					$string .= "</form>";
					$string .= "<form method='post' >";
					$string .= "Suppression d'un dossier <select name='deldoss'>";
					$arbo = $sec->getArbo();
					foreach ($arbo as $d) {
						$string .= "<option value='".$d."' >".$d."</option>";
					}
					$string .= "</select>";
					$string .= "<input type='submit' value='Supprimer' /><br/>";
					$string .= "</form>";
					// recup file - doss
					$string .= "<br><div>";
					$string .= "Récupération d'un fichier <select id='recfichier' t='file'>";
					$string .= "<option value='' ></option>";
					$arbo = $sec->getFile();
					foreach ($arbo as $d) {
						$string .= "<option value='".$d."' >".$d."</option>";
					}
					$string .= "</select>";
					$string .= "<input file='recfichier' type='button' value='Télécharger' onclick='recupFile(this)' /><br/>";
					$string .= "</div>";
					$string .= "<div>";
					$string .= "Récupération d'un dossier <select id='recdoss' t='doss'>";
					$arbo = $sec->getArbo();
					foreach ($arbo as $d) {
						$string .= "<option value='".$d."' >".$d."</option>";
					}
					$string .= "</select>";
					$string .= "<input file='recdoss' type='button' value='Télécharger' onclick='recupFile(this)' /><br/>";
					$string .= "</div>";
				$string .= "</div>";
			$string .= "</div>";	

			
		} else {
			$string .= "<form method='post'>";
			$string .= "<br/>Mot de passe :";
			$string .= "<input type='text' style='display:none' ><input type='password' style='display:none' >";
			$string .= "<br/><input type='password' name='mdpdev' autocomplete='off' >";
			$string .= "<br/><input type='submit' value='Envoyer' /><br/>";
			$string .= "</form>";
		}
	} else {	
		$string .= "<input type='button' value='Entrer en mode développement' onclick='devOn()' />";
	}
} else {	
	$string .= "<div id='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= "</div>";

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	