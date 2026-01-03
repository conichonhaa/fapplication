<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}

if (count($_POST)>0) {
	include_once('communs/mail.php');
	if (isset($_POST['supprime']) and $_POST['supprime']!='') {
		$sql = "select * from t_incubateur_icb WHERE icb_id=".$_POST['supprime'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$mess = "Bonjour ".$t_users[$data['usr_id']]['nom']."\r\n\r\n";
			$mess .= $fap->info['nom']." a supprimé ton projet : ".$data['icb_titre']."\r\n\r\n";
			$mess .= "Désolé !";
			sendMail($data['usr_id'],$mess,"Ton projet a été supprimé");
			sendSms($data['usr_id'],"Ton projet a été supprimé");
			sendIfttt($data['usr_id'],"Ton projet a été supprimé");
			if ($data['img_id']!='') {
				$sql = "DELETE FROM t_images_img WHERE img_id=".$data['img_id'];
				mysql_query($sql,$fap->conn);
			}
		}	
		$sql = "delete from t_incubateur_icb WHERE icb_id=".$_POST['supprime'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['modif'])) {
		$sql = "select * from t_incubateur_icb";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {				
			if (isset($_POST['titre_'.$data['icb_id']]) and $_POST['titre_'.$data['icb_id']]) {
				if (isset($_POST['valide_'.$data['icb_id']]))  $valide='1'; else $valide='null';
				$cible = max($data['icb_vote'],$_POST['cible_'.$data['icb_id']]);
				$sql = "UPDATE t_incubateur_icb SET icb_titre='".esc($_POST['titre_'.$data['icb_id']])."'
												 ,icb_projet='".esc($_POST['projet_'.$data['icb_id']])."'
												 ,icb_valide=".$valide."
												 ,icb_cible=".$cible."
							WHERE icb_id=".$data['icb_id'];
				mysql_query($sql,$fap->conn);
			}
			if (isset($_FILES['image_'.$data['icb_id']]) and $_FILES['image_'.$data['icb_id']]['tmp_name']!='') {
				$blob = file_get_contents($_FILES['image_'.$data['icb_id']]['tmp_name']);
				
				include_once('communs/classImg.php');
				$img = new img($_FILES['image_'.$data['icb_id']]['tmp_name']);
				$img->tailleMax(1000000);
				$blob = $img->sendImage(true);
				
				$sql = "INSERT INTO t_images_img (img_contenu) VALUES ('".addslashes($blob)."')";
				$req2 = mysql_query($sql,$fap->conn);
				if ($req2) {
					$id = mysql_insert_id();
					if ($data['img_id']!='') {
						$sql = "DELETE FROM t_images_img WHERE img_id=".$data['img_id'];
						mysql_query($sql,$fap->conn);
					}
					$sql = "UPDATE t_incubateur_icb SET img_id=".$id." WHERE icb_id=".$data['icb_id'];
					mysql_query($sql,$fap->conn);
				}
			}
			
			if (isset($_POST['valide_'.$data['icb_id']]) and !$data['icb_valide']) {
				$mess = "Bonjour ".$t_users[$data['usr_id']]['nom']."\r\n\r\n";
				$mess .= $fap->info['nom']." a validé ton projet : \r\n\r\n".str_replace("\\","",$_POST['titre_'.$data['icb_id']])."\r\n";
				$mess .= str_replace("\\","",$_POST['projet_'.$data['icb_id']])."\r\n\r\n";
				$mess .= "Félicitations !\r\n";
				$mess .= "Il te faut maintenant obtenir ".$_POST['cible_'.$data['icb_id']]." faps pour qu'il soit fapprouvés, bon courage.";
				$mess .= "\r\n".$fap->getServerName().$fap->getAppName();
				sendMail($data['usr_id'],$mess,"Ton projet a été validé");
				sendSms($data['usr_id'],"Ton projet a été validé");
				sendIfttt($data['usr_id'],"Ton projet a été validé");
			}	
		}
		if (isset($_POST['voteDefaut'])) {
			$sql = "UPDATE t_parametrage_par SET par_valeur='".$_POST['voteDefaut']."' WHERE par_code='incub_defaut'";
			mysql_query($sql,$fap->conn);
		}
	}

	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;




if ($fap->isAdmin('incub')) {
	$string .= "<div class='divEntete' >";
	$string .= "Administration des projets";
	$string .= "</div>";

	$valide = false;
	$string .= "<form method='post' enctype='multipart/form-data' ><input name='modif' style='display:none;' />";
	$string .= "<input type='submit' value='Tout enregistrer' />";
	
	$def = '';
	if (isset($t_param['incub_defaut'])) $def = $t_param['incub_defaut'];
	$string .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Vote défaut : <select name='voteDefaut'>";
		$string .= "<option value='' ></option>";
		$sql = "select * from t_incubateur_icb where icb_vote<icb_cible and icb_valide=1 order by (icb_vote/icb_cible) " ;
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			$selected = ($data['icb_id']==$def?"selected":"");
			$string .= "<option value='".$data['icb_id']."' ".$selected." >".$data['icb_titre']."</option>";
		}
	$string .= "</select>";
	
	$sql = "select * from t_incubateur_icb where icb_vote<icb_cible order by icb_valide, (icb_vote/icb_cible) " ;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		if ($data['icb_valide'] and !$valide) {
			$valide = true;
			$string .= "<div style='margin-top:20px;font-style:italic;text-decoration:underline;font-weight:bold;'>";
			$string .= "Ils sont déjà mis aux voix...";
			$string .= "</div>";
		}
		$string .= "<div class='eltBlocFond' >";
		$string .= "<i>".getNomUser($data['usr_id'])." propose </i>";
		$string .= " &nbsp; <img data-src='_getImg.php?img=".$data['img_id'].$vGetImg."' src='_getImg.php?img=".$data['img_id'].$vGetImg."' style='width:40px;cursor:pointer;'  
								onclick='chargeImage(this)' id='visu_image_".$data['icb_id']."' file='image_".$data['icb_id']."' />
								<input type='file' id='image_".$data['icb_id']."' name='image_".$data['icb_id']."' style='display:none;' >";
		$string .= "<br><input name='titre_".$data['icb_id']."' value=\"".$data['icb_titre']."\" required />";
		if ($data['icb_vote']>0) $vote = "Voix : ".$data['icb_vote']."/"; else $vote = "Cible : ";
		$min = max(10,$data['icb_vote']);
		$string .= " &nbsp; ".$vote."<input name='cible_".$data['icb_id']."' type='number' min='".$min."' step='1' value='".$data['icb_cible']."' style='width:80px;' />";
		if ($data['icb_valide']) $checked="checked style='display:none;'"; else $checked="id='valide_".$data['icb_id']."'";
		$string .= " &nbsp; <input type='checkbox' id='valide_".$data['icb_id']."' name='valide_".$data['icb_id']."' ".$checked." />";
		$string .= "<label for='valide_".$data['icb_id']."' > &nbsp; Validé</label>";
		$string .= "<br><textarea name='projet_".$data['icb_id']."' rows='3' cols='80' style='max-width:90%;'>".$data['icb_projet']."</textarea>";
		if ($data['icb_vote']==0)
			$string .= "<br> &nbsp; <input type='button' value='supprimer' onclick='supprimeIncub(this)' 
						icb='".$data['icb_id']."' titre=\"".$data['icb_titre']."\" />";
		$string .= "</div>";
		$string .= "<script>changeImageLoad('image_".$data['icb_id']."');</script>";
	}	
	
	$string .= "</form>";
	$string .= "</div>";
} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}
	


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;