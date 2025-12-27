<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/jeux.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/jeux.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$fap->cleanCapacity();

if (count($_POST)>0) {
	if (isset($_POST['buy'])) {
		$fap->buyCapacity($_POST['pow'],$_POST['code'],$_POST['delai'],$_POST['num']);
	}
	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}	

$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
$string .= "<div class='divEntete' >";
$string .= "Boutique";
$string .= "</div>";


$string .= "<span style='font-weight:bold;'>Pouvoir accumulé : ".$fap->level['power']."pv</span>";
$string .= "<br>Tu peux en <a href='iLevel-infos.php'>acheter</a> 
			ou en sortir de ton <a href='iCoffre-infos.php'>coffre</a>";

function makeAchatPouvoir($pow,$code,$delai,$num,$lib,$expl,$duree) {
	global $fap;
	$has = $fap->hasCapacity($code);
	$op = "";
	$dis = "";
	$on = "";
	$fin = $duree;
	if (($has and $fap->capacityInfo['date']!=null) or $fap->level['power']<$pow) {
		$op = "opacity:0.5;";
		$dis = "disabled";
	}
	$ison = ($fap->capacityInfo['date']!=null and $fap->capacityInfo['num']==$num);
	if ($has and $ison) {
		$on = "<img src='images/on.png' style='height:20px;' /> ";
		$fin = " → ".strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date']));
	}	
	$s = "<form method='post' onsubmit='return buyCapacity(this)' pow='".$pow."' >";
	$s .= "<input name='buy' value='' style='display:none;' >";
	$s .= "<input name='pow' value='".$pow."' style='display:none;' >";
	$s .= "<input name='code' value='".$code."' style='display:none;' >";
	$s .= "<input name='delai' value='".($delai*3600)."' style='display:none;' >";
	$s .= "<input name='num' value='".$num."' style='display:none;' >";
	$s .= "<input type='submit' value='".$pow."pv' ".$dis." class='buyPowerButton' style='".$op."' />";
	$s .= "<div class='buyPowerImgDiv'><img src='images/jeux/".$code.".png' class='buyPowerImg' /></div>";
	$s .= "&nbsp; ".$on.$lib." : 
			<span style='font-style:italic;font-size:90%;'>".$expl."</span>
			<span style='font-style:italic;font-size:70%;'> (".$fin.")</span>";
	$s .= "</form>";
	return $s;
}	

$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='capacite_all' style='cursor:pointer;' >
					<img id='pm_capacite_all' src='images/moins.png' class='iconePM' /><b>Capacités tous jeux</b></div>";		
	$string .= "<div id='capacite_all'>";	
	$string .= makeAchatPouvoir(30,'life',(24*7),1,"Extra ball","Donne 1 vie supplémentaire","1 semaine");
	$string .= makeAchatPouvoir(50,'life',(24*14),3,"Hot trique","Grâce au coup du chapeau tu obtiens 3 vies","2 semaines");
	$string .= makeAchatPouvoir(100,'life',(24*21),7,"Cat's spirit","Tel un chat, par 7 fois tu survivras","3 semaines");
	
	$string .= "<div style='margin-top:30px;'>";
		$string .= "<div onclick='affDiv(this)' div='capacite_allshot' style='cursor:pointer;' >
						<img id='pm_capacite_allshot' src='images/moins.png' class='iconePM' />
						<u>Capacité \"one shot\" accumulable sans limite de durée, utilisable en cliquant sur l'image ou via touche raccourci</u>
						</div>";		
		$string .= "<div id='capacite_allshot'>";
		$fap->hasCapacity('bomb');
		$n = $fap->capacityInfo['num'];	
		$string .= makeAchatPouvoir(5,'bomb',0,($n+1),"Bombe x1","\"b\" pour dégommer tous les ennemis visibles","stock: ".$n."");	
		$string .= makeAchatPouvoir(20,'bomb',0,($n+5),"Bombe x5","lot de 5 pour les friands des explosions","stock: ".$n."");	
		$string .= makeAchatPouvoir(30,'bomb',0,($n+10),"Bombe x10","fagot de 10 pour les psycho-sociopathes incendiaires","stock: ".$n."");	
		$string .= "</div>";
	$string .= "</div>";

	$string .= "</div>";
$string .= "</div>";
		
$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='capacite_fusee' style='cursor:pointer;' >
					<img id='pm_capacite_fusee' src='images/moins.png' class='iconePM' /><b>Capacités pour \"".$t_games['fusee']."\"</b></div>";		
	$string .= "<div id='capacite_fusee'>";	
	$string .= makeAchatPouvoir(20,'mini',(24*7),2,"Petit zob","Plus facile de se faufiler quand on est plus petit","1 semaine");
	$string .= makeAchatPouvoir(40,'mini',(24*14),4,"Rikiki","Encore plus petit, l'univers est si grand","2 semaines");
	$string .= "</div>";
$string .= "</div>";

$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='capacite_splash' style='cursor:pointer;' >
					<img id='pm_capacite_splash' src='images/moins.png' class='iconePM' /><b>Capacités pour \"".$t_games['splash']."\"</b></div>";		
	$string .= "<div id='capacite_splash'>";	
	$string .= makeAchatPouvoir(20,'sperm',(24*7),2,"Double dong","Doté de deux canons, chaque tir peut dégommer 2 monstronichons","1 semaine");
	$string .= makeAchatPouvoir(40,'sperm',(24*14),5,"Spermicide","Tir en rafale et sperme corosif pour en dégommer jusqu'à 5 d'un coup","2 semaines");
	$string .= "</div>";
$string .= "</div>";

$string .= "</div>";
$string .= "<script type='text/javascript'></script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;