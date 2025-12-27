<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/power.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$fap->cleanCapacity();

if (count($_POST)>0) {

	if (isset($_POST['depot'])) {
		$nb =  min($fap->level['experience']-$fap->level['coffre'],$fap->level['power']-$fap->getEquivPower(),intval($_POST['depot']));
		$nb = max(0,$nb);
		$sql = "update t_level_lvl set lvl_power=lvl_power-".$nb.", lvl_coffre=lvl_coffre+".$nb." where usr_id=".$fap->getId();
		mysql_query($sql,$fap->conn);		
	}
	if (isset($_POST['retrait'])) {
		$nb = min($fap->level['niveau']*10-$fap->level['power'],$fap->level['coffre'],intval($_POST['retrait']));
		$nb = max(0,$nb);
		$sql = "update t_level_lvl set lvl_power=lvl_power+".$nb.", lvl_coffre=lvl_coffre-".$nb." where usr_id=".$fap->getId();
		mysql_query($sql,$fap->conn);
	}

	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}	

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Mon coffre-fort";
$string .= "</div>";

$string .= "<div class='divMessage' >";
$string .= "<a href='iLevel-infos.php'>Revenir à mon expérience</a>";
$string .= "</div>";

$string .= "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$string .= "<span class='glyphicon glyphicon-question-sign'></span>";
$string .= "</div>";
	$string .= "<div id='explique' class='divMessage' style='display:none;' >";
	$string .= "Si ton pouvoir est trop près de la limite, tu peux en mettre un peu de côté pour pouvoir continuer d'en gagner.
				<br>Tu pourras récupérer ce pouvoir à tout moment.
				<br><b>Ton coffre est limité par ton expérience totale !</b>
				<div style='margin-top:20px;font-size:80%;' >NB : Un matelas de réapprovisionnement peut être géré automatiquement
				<br>(si le contenu du coffre le permet)
				<br>→ 10pv à partir du niveau 5
				<br>→ 30pv à partir du niveau 10
				<br>→ 50pv à partir du niveau 20
				<br>→ 100pv à partir du niveau 30</div>";
	$string .= "</div>";
	

$string .= "<div style='margin-top:50px;' >";
	$string .= "<div class='blocCoffre' >";
		$string .= "<img src='images/pouvoir.png' class='imgCoffre' />";
		$string .= "<div class='infoCoffre' >".$fap->level['power']."<span style='font-size:70%;' >/".($fap->level['niveau']*10)."</span></div>";
	$string .= "</div>";
	
	$string .= "<div class='blocCoffre' >";
		$string .= "<form method='post'>";
		$string .= "Pv → Coins";
		$nb =  min($fap->level['experience']-$fap->level['coffre'],$fap->level['power']-$fap->getEquivPower());
		$nb = max(0,$nb);
		$string .= "<br><input name='depot' value='' type='number' min='0' max='".$nb."' >";
		$string .= "<input type='button' value='max' onclick='setMax(this)' />";
		$string .= "<br><input type='submit' value='Déposer' />";
		$string .= "</form>";
	$string .= "</div>";
	
	$string .= "<div class='blocCoffre' >";
		$string .= "<img src='images/coffre.png' class='imgCoffre' />";
		$string .= "<div class='infoCoffre' >".$fap->level['coffre']."<span style='font-size:70%;' >/".$fap->level['experience']."</span></div>";
	$string .= "</div>";
$string .= "</div>";

$string .= "<div style='margin-top:50px;' >";
	$string .= "<div class='blocCoffre' >";
		$string .= "<img src='images/coffre.png' class='imgCoffre' />";
		$string .= "<div class='infoCoffre' >".$fap->level['coffre']."<span style='font-size:70%;' >/".$fap->level['experience']."</span></div>";
	$string .= "</div>";

	$string .= "<div class='blocCoffre' >";
		$string .= "<form method='post'>";
		$string .= "Coins → Pv";
		$nb = min($fap->level['niveau']*10-$fap->level['power'],$fap->level['coffre']);
		$nb = max(0,$nb);
		$string .= "<br><input name='retrait' value='' type='number' min='0' max='".$nb."' >";
		$string .= "<input type='button' value='max' onclick='setMax(this)' />";
		$string .= "<br><input type='submit' value='Retirer' />";
		$string .= "</form>";
	$string .= "</div>";
	
	$string .= "<div class='blocCoffre' >";
		$string .= "<img src='images/pouvoir.png' class='imgCoffre' />";
		$string .= "<div class='infoCoffre' >".$fap->level['power']."<span style='font-size:70%;' >/".($fap->level['niveau']*10)."</span></div>";
	$string .= "</div>";
$string .= "</div>";


$string .= "<div style='margin-top:30px;' >";
$string .= "<div class='eltProfil' >Désactiver le matelas automatique du pouvoir ? ";
	$tt = array('1'=>'Oui','0'=>'Non');
	foreach($tt as $key => $val) {
		if ($fap->info['nomatelas']==$key) $checked='checked'; else $checked='';
		$string .= "<div class='eltBtnRadio' ><input type='radio' id='profilNoMatelas".$key."' name='profilNoMatelas' ".$checked." 
							value='".$key."' onclick='glbSendPost(this,1);' /> <label for='profilNoMatelas".$key."'> &nbsp;".$val."</label></div>";
	}
	$string .= "</div>";
$string .= "</div>";


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;