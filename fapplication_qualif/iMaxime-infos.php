<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/maxime.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/power.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

if (count($_POST)>0) {
	
	if (isset($_POST['suppMaxime']) and $_POST['suppMaxime']!='') {
		$sql = "delete from t_maximes_mxm where mxm_id=".$_POST['suppMaxime'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['modifMaxime'])) {				
		$sql = "select * from t_maximes_mxm where usr_id=".$fap->getId();
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {				
			if (isset($_POST['maxime_'.$data['mxm_id']])) {
				$texte = str_replace("\\","",$_POST['maxime_'.$data['mxm_id']]);
				$texte = str_replace("'","''",$texte);
				$sql = "update t_maximes_mxm set mxm_texte='".$texte."' where mxm_id=".$data['mxm_id'];
				mysql_query($sql,$fap->conn);
			}
		}
	}
	if (isset($_POST['addMaxime']) and isset($_POST['maxime_new']) and $_POST['maxime_new']!='') {
		$texte = str_replace("\\","",$_POST['maxime_new']);
		$texte = str_replace("'","''",$texte);
		$sql = "insert into t_maximes_mxm (usr_id,mxm_texte) values (".$fap->getId().",'".$texte."') ";
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['buy'])) {
		$fap->buyCapacity($_POST['pow'],$_POST['code'],null,$_POST['num']);
	}

	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$nb = 0;
$sql = "select count(*) from t_maximes_mxm where usr_id=".$fap->getId();
$req = mysql_query($sql,$fap->conn);
if ($data = mysql_fetch_array($req)) $nb = $data['count(*)'];

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Les Maximes";
$string .= "</div>";


$maxFree = 5;
$fap->hasCapacity('maxime');
$nbC = $fap->capacityInfo['num'];
$nbmaxime = min($fap->level['niveau'],$maxFree+$nbC);


$s = ($nbmaxime>1?'s':'');
$string .= "<div class='infoSousTitre'><span class='infoSousTitreU'>J'utilise ".$nb."/".$nbmaxime." maxime".$s." disponible".$s."</span> :</div>";
$string .= "<form method='post' ><input name='modifMaxime' style='display:none;' />";
$sql = "select * from t_maximes_mxm where usr_id=".$fap->getId();
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$string .= "<div>";
	$string .= "<span><div mxm='".$data['mxm_id']."' onclick='changeMaxime(this)' title='modifier'
						class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>";	
	$string .= $data['mxm_texte']."</span>";
	$rows = intval(strlen($data['mxm_texte'])/75) + 1;
	$string .= "<textarea id='maxime_".$data['mxm_id']."' name='maxime_".$data['mxm_id']."' rows='".$rows."' cols='80' 
					style='max-width:90%;display:none;vertical-align:top;' disabled >".$data['mxm_texte']."</textarea>";
	$string .= "&nbsp;<div mxm='".$data['mxm_id']."' onclick='deleteMaxime(this)' title='supprimer'
								class='imgDelete' style='display:inline-block;' >&nbsp;</div>";	
	$string .= "</div>";
}
$string .= "<input id='submitModifMaxime' type='submit' value='Enregistrer' style='display:none;' />";
$string .= "</form>";

if ($nb<$nbmaxime) {
	$string .= "<div class='sousTitre'><span class='sousTitreU'>Ajouter une maxime</span> :</div>";
	$string .= "<form method='post' ><input name='addMaxime' style='display:none;' />";
	$string .= "<textarea name='maxime_new' rows='3' cols='80' style='max-width:90%;'></textarea>";
	$string .= "<br><input type='submit' value='Envoyer' />";
	$string .= "</form>";
} else {
	if ($nbmaxime<$maxFree) {
		$mess = "Tu gagneras une nouvelle maxime au prochain niveau, soit assidu et garde l'esprit d'équipe.";
	} else {	
		$mess = "Au delà du niveau ".$maxFree." les maximes sont payantes.<br>";
		if ($nbmaxime==$fap->level['niveau']) {
			$mess .= "Tu pourras en acheter une nouvelle au prochain niveau.";
		} else {
			$pow = 30;
			if ($fap->level['power']<$pow) {
				$op = "opacity:0.5;";
				$dis = "disabled";
			} else {
				$op = "";
				$dis = "";
			}
			$mess .= "<form method='post' onsubmit='return buyCapacity(this)' pow='".$pow."' >";
			$mess .= "<input name='buy' value='' style='display:none;' >";
			$mess .= "<input name='pow' value='".$pow."' style='display:none;' >";
			$mess .= "<input name='code' value='maxime' style='display:none;' >";
			$mess .= "<input name='num' value='".($nbmaxime-$maxFree+1)."' style='display:none;' >";
			$mess .= "Acheter une maxime &nbsp; <input type='submit' value='".$pow."pv' ".$dis." style='".$op."' />";
			$mess .= " &nbsp; (Pouvoir accumulé : ".$fap->level['power']."pv)";
			$mess .= "</form>";
		}	
	}
	$string .= "<div style='font-style:italic;margin-top:1em;'>";
	$string .= $mess;
	$string .= "</div>";
}

$string .= "<div style='margin-top:1em;'>&nbsp;</div>";
$string .= "<div class='infoSousTitre'><span class='infoSousTitreU'>Toutes les maximes</span> :</div>";
$sql = "select * from t_maximes_mxm as mxm
		join t_utilisateurs_usr as usr on mxm.usr_id=usr.usr_id";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$string .= "<div>".$data['mxm_texte'];
	$string .= " <span style='font-style:italic;font-size:90%;'>".$data['usr_nom']."</span></div>";
}


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;