<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/jeux.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/jeux.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' >var gameJoystick='".$gameJoystick."';</script>";
$string .= "</head><body>";

$string .= $string_menu;
$racineImage = "images/jeux/";

$sql = "select * from t_scores_sco where sco_game='splash' and sco_reset>'".strftime("%Y-%m-%dT%H:%M:%S",time())."' and usr_id=".$fap->getId();
$req = mysql_query($sql,$fap->conn);
if ($data = mysql_fetch_array($req)) {
	$string .= "<div class='divMessage' >";
	$string .= "Tu peux jouer mais ton score ne sera pas enregistré avant ".strftime("%d/%m/%Y %Hh%M",makeDate($data['sco_reset']));
	$string .= "</div>";
}

$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('game'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> de Jeu</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='document.location.reload();' /></div>
				</div>";				
	$string .= "<img elem='divJeux' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";

	
$intro = "<img src='images/jeux/intro-monstronichons.jpg' width='100%' onclick='menage();initSplash();' style='cursor:pointer;' />
<div style='font-size:150%;font-weight:bold;'>Utilise ton pistosplash pour dégommer tous les Monstronichons !
<br>Fais bien attention au grand maître splasheur Tortue Génial, si tu ne le dégommes pas assez vite, il t'engluera pour l'éternité !
<br>&nbsp;&nbsp;&nbsp;<i>Clique sur l'image pour jouer</i></div>";
	
	$string .= "<div style='display:none;'>
					<img src='".$racineImage."cible.png' />
					<img src='".$racineImage."splash.png' />
					<img src='".$racineImage."soldat1.png' />
					<img src='".$racineImage."soldat2.png' />
					<img src='".$racineImage."boss.png' />
					<img src='".$racineImage."bigboss.png' />
					<img src='".$racineImage."monsterkilled.png' />
					</div>";
	$string .= "<div id='overDiv' ><div id='divJeux' >".$intro."</div></div>";
	

$string .= "</div>";

$script = "var t_capacity={};t_click={};";
$t_code = array('life','bomb');
array_push($t_code,'sperm');
foreach ($t_code as $code) {
	if ($fap->hasCapacity($code)) {
		$script .= "t_capacity['".$code."']=".$fap->capacityInfo['num'].";";
	}	
}
$script .= "t_click['bomb']='useBomb();';";	
$string .= "<script type='text/javascript'>".$script."</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;