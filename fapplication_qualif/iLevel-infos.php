<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/power.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


if (count($_POST)>0) {
	if (isset($_POST['buyPower'])) {
		$nb = min($fap->level['niveau']*10-$fap->level['power'],$fap->calcPoints(),intval($_POST['buyPower']));
		$nb = max(0,$nb);
		$fap->buyPower(intval($_POST['buyPower']));
	}
	if (isset($_POST['buy'])) {
		$fap->buyCapacity($_POST['pow'],$_POST['code'],$_POST['delai']);
		// if ($_POST['code']=='mst-chtouille') {
			// setMstInfect($_POST['code']);
		// }
	}
	if (isset($_POST['win'])) {
		$fap->buyCapacity(0,$_POST['code'],$_POST['delai'],$_POST['num']);
		
		if ($_POST['code']=='exhibit' or $_POST['code']=='fapstival') {
			$ex = intval($fap->level['exhib']);
			$sql = "update t_level_lvl set lvl_exhib=".($ex+1)." where usr_id=".$fap->getId();
			mysql_query($sql,$fap->conn);
		}
	}	
	if (isset($_POST['gift']) and $isGiftAble) {
		$d = makeDate($gift['date'])-time() + $gift['duree']*86400;
		$fap->buyCapacity(0,'gift',$d+3600);
		$fap->giftPower($gift['pv']);
		$txt = "";
		if (isset($gift['cap'])) {
			foreach ($gift['cap'] as $code => $val) {
				$n = 'null';
				if (isset($val['num'])) $n = $val['num'];
				$d = null;
				if (isset($val['delai'])) $d = $val['delai'];
				if ($fap->hasCapacity($code)) {
					if (isset($giftCapacity[$code]['inc'])) $n += $fap->capacityInfo['num'];
					else $n = max($fap->capacityInfo['num'],$n);
					if ($fap->capacityInfo['date'] and $d) $d += makeDate($fap->capacityInfo['date'])-time();
				}
				$fap->buyCapacity(0,$code,$d,$n);
				
				if (isset($giftCapacity[$code]['inc'])) $txt .= "<br>&nbsp;- ".$val['num']." ";
				else $txt .= "<br>&nbsp;- 1 ";
				if (isset($giftCapacity[$code]['var'])) $txt .= $giftCapacity[$code]['var'][$val['num']];
				else $txt .= $giftCapacity[$code]['lib'];
				if (isset($val['delai'])) {
					$delai = "";
					foreach ($t_dType as $k => $v) {
						if ($val['delai']>=$k and intval($val['delai']/$k)*$k==$val['delai']) {
							$d = intval($val['delai']/$k);
							$delai = " pour ".$d." ".$v.($d>1?"s":"");
							break;
						}
					}
					$txt .= $delai;
				}
			}
		}
		$txt = "Bravo ! Tu as gagné : 
				<br>&nbsp;- ".$gift['pv']." pv/coins".$txt."
				<br><span style='font-style:italic;font-size:90%;'>fais en bon usage...</span>";
		$_SESSION['fap']['gift'] = $txt;
	}
	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}	

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Le Fap dont tu es le héros";
$string .= "</div>";

$string .= "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$string .= "<span class='glyphicon glyphicon-question-sign'></span>";
$string .= "</div>";
$string .= "<div id='explique' style='text-align:right;display:none;margin-bottom:20px;'>";
$string .= "<div style='display:inline-block;text-align:left;font-style:italic;max-width:100%;'>";
$string .= "<div class='heros herosW' >";
	$string .= "<div class='titreXP herosW' >";
		$string .= "Fappeur";
	$string .= "</div>";
	$string .= "<div class='avatarXP herosW' >";
		$string .= "<img src='images/fap.png' class='herosH imgXP' />";
		$string .= "<div class='lvlXP' >2</div>";
		$string .= "<div class='exhibXP' ><div class='exhibTextXP' >5</div></div>";
		$string .= "<div class='powerXP herosH' >";
			$pc = 60;
			$string .= "<div class='powerXPfill' style='height:".$pc."%;' ></div>";
			$string .= "<div class='powerXPfilltop' style='bottom:".$pc."%;' ></div>";
			$string .= "<div class='powerXPfillnum' style='bottom:".$pc."%;' >4</div>";
		$string .= "</div>";
	$string .= "</div>";
	$string .= "<div class='barreXP herosW' >";
		$pc = 40;
		$string .= "<div class='barreXPfill' style='width:".$pc."%;' >
					<div style='font-size:80%;margin-top:-2px;color:var(--fondWhite-color);' >3</div>
					</div>";
		$string .= "";
	$string .= "</div>";
	$string .= "<div class='numXP ' >";
		$string .= "XP : 1";
	$string .= "</div>";
$string .= "</div>";
$string .= "<br>1 : Expérience totale acquise
			<br>2 : Niveau du fappeur
			<br>3 : Progression avant le niveau suivant
			<br>4 : Pouvoir disponible <i>(max=10*niveau)</i>
			<br>5 : Nb d'exhibition effectuée";
$string .= "</div>";
$string .= "</div>";


if (isset($_SESSION['fap']['gift'])) {
	$string .= "<div class='divGift' >";
		$string .= $_SESSION['fap']['gift'];
	$string .= "</div>";
	unset($_SESSION['fap']['gift']);
}	

if ($isGiftAble) {
	$string .= "<div class='divGift' >";
		$string .= "<form method='post'>";
		$string .= "<div>".$gift['titre']."</div>";
		$string .= "<input name='gift' value='' style='display:none;'  >";
		$string .= "<input type='image' src='images/gift.gif' />";
		$n = intval((makeDate($gift['date'])-time())/(86400)) + $gift['duree'];
		$string .= "<div style='font-style:italic;font-size:90%;'>(plus que ".$n." jour".($n>1?"s":"").")</div>";
		$string .= "</form>";
	$string .= "</div>";
}


$string .= "<div class='heros herosW' >";
	$string .= "<div class='titreXP herosW' >";
		$string .= $fap->info['nom'];
	$string .= "</div>";
	$string .= "<div class='avatarXP herosW' >";
		$string .= "<img src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' class='herosH imgXP' />";
		$string .= "<div class='lvlXP' >".$fap->level['niveau']."</div>";
		if ($fap->level['exhib']>0)
			$string .= "<div class='exhibXP' ><div class='exhibTextXP' >".$fap->level['exhib']."</div></div>";
		$string .= "<div class='powerXP herosH' >";
			$pc = 100*($fap->level['power'])/($fap->level['niveau']*10);
			if ($pc<3) $pc = 3;
			if ($pc>100) $pc = 100;
			$string .= "<div class='powerXPfill' style='height:".$pc."%;' ></div>";
			$string .= "<div class='powerXPfilltop' style='bottom:".$pc."%;' ></div>";
			$string .= "<div class='powerXPfillnum' style='bottom:".$pc."%;' >".$fap->level['power']."</div>";
		$string .= "</div>";
	$string .= "</div>";
	$txt = "".($fap->level['niveau']*100-$fap->level['points'])."pts avant le niveau suivant";
	$string .= "<div class='barreXP herosW' title=\"".$txt."\" >";
		$pc = 100*($fap->level['points'])/($fap->level['niveau']*100);
		$string .= "<div class='barreXPfill' style='width:".$pc."%;' title=\"".$txt."\" ></div>";
	$string .= "</div>";
	$string .= "<div class='numXP ' >";
		$string .= "XP : ".$fap->level['experience'];
	$string .= "</div>";
$string .= "</div>";

$string .= "<div class='buyPower' >";
	$string .= "<form method='post'>";
	$string .= "Acheter du pouvoir<br><span style='font-style:italic;font-size:90%;'>(2pts → 1pv)</span>";
	$nb = min($fap->level['niveau']*10-$fap->level['power'],$fap->calcPoints());
	$nb = max(0,$nb);
	$string .= "<br><input name='buyPower' value='' type='number' min='0' max='".$nb."' >";
		$string .= "<input type='button' value='max' onclick='setMax(this)' />";
	$string .= "<br><input type='submit' value='Acheter' />";
	$string .= "</form>";
	$string .= "<div style='margin-top:20px;'><a href='iCoffre-infos.php'>
				<img src='images/coffre.png' style='height:40px;' /> &nbsp;Coffre-fort <i>(".$fap->level['coffre'].")</i></a></div>";
$string .= "</div>";
	
$string .= "<div style='margin-top:50px;'>";
	$string .= "<div onclick='affDiv(this)' div='evolution' style='cursor:pointer;' >
					<img id='pm_evolution' src='images/moins.png' class='iconePM' /><b>Tu peux suivre ici l'évolution de ton fappeur.</b></div>";		
	$string .= "<div id='evolution'>";
	$string .= "<div>De nombreuses actions à travers ce site te permettront de le faire progresser</u> :</div>
				<div class='emploiItem'>Fapper régulièrement (1pt) et ne pas oublier de voter (1pt)</div>
				<div class='emploiItem2 emploiExplique'>&nbsp;&nbsp;&nbsp;fapper permet également d'acquérir de 1 à 5pv 
					(selon l'ancienneté du dernier fap)</div>
				<div class='emploiItem'>Récolter les voix de son projet fapprouvé (pts = 10*voix)</div>
				<div class='emploiItem'>Remettre en jeu son titre de meilleur gameur (500pts)</div>
				<div class='emploiItem2 emploiExplique'>&nbsp;&nbsp;&nbsp;seulement 100pts si tu ne bats pas ton score précédent</div>
				<div class='emploiItem2 emploiExplique'>&nbsp;&nbsp;&nbsp;gagner une partie en réseau permet également d'acquérir 1pv</div>
				<div class='emploiItem'>Attraper sournoisement un fappeur imprudent (100pts)</div>
				<div class='emploiItem'>Défier un fappeur (pts = 1 à 20 fois la mise)</div>
				<div class='emploiItem2 emploiExplique'>&nbsp;&nbsp;&nbsp;mise identique par chacun des deux joueurs: 
					totalité remportée par le vainqueur</div>
				<div class='emploiItem2 emploiExplique'>&nbsp;&nbsp;&nbsp;→ le surplus ira dans le coffre</div>
				<div class='emploiItem'>Ecouter l'hymne à la branlette (jusqu'à 3pts par jour)</div>
				<div class='emploiItem'>et bien d'autres encore à venir...</div>";
	$string .= "<div style='margin-top:20px;'><u>A contrario, d'autres actions te couteront des points</u> :</div>
				<div class='emploiItem2 emploiExplique'>baisse en niveau mais expérience totale conservée</div>
				<div class='emploiItem'>Renommer son fappeur (1000pts)</div>
				<div class='emploiItem'>Acheter du pouvoir (2pts/pv)</div>
				";	
	$string .= "</div>";
$string .= "</div>";

function makeAchatPouvoir($pow,$code,$delai,$lib,$expl,$duree) {
	global $fap;
	$has = $fap->hasCapacity($code);
	$op = "";
	$dis = "";
	$on = "";
	$fin = $duree;
	if ($has or $fap->level['power']<$pow) {
		$op = "opacity:0.5;";
		$dis = "disabled";
	}
	if ($has) {
		$on = "<img src='images/on.png' style='height:20px;' /> ";
		$fin = " → ".strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date']));
	} else {
		$d = $fap->isLoneCapacity($code);
		if ($d>0) {
			$id = $fap->whoHasLastCapacity($code);
			$has = $fap->hasCapacity($code,$id);
			$reste = makeDate($fap->capacityInfo['date'])-time();
			if ($d<$reste) {
				$op = "opacity:0.5;";
				$dis = "disabled";
				$on = "<img src='images/off.png' style='height:20px;' /> ";
				$fin = "bloquée par ".getNomUser($id)." → ".strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date'])-$d);
			}
		}
	}
	$s = "<form method='post' onsubmit='return buyCapacity(this)' pow='".$pow."'>";
	$s .= "<input name='buy' value='' style='display:none;' >";
	$s .= "<input name='pow' value='".$pow."' style='display:none;' >";
	$s .= "<input name='code' value='".$code."' style='display:none;' >";
	$s .= "<input name='delai' value='".($delai*3600)."' style='display:none;' >";
	$s .= "<input type='submit' value='".$pow."pv' ".$dis." class='buyPowerButton' style='".$op."' />";
	$s .= "&nbsp; ".$on.$lib." : 
			<span style='font-style:italic;font-size:90%;'>".$expl."</span>
			<span style='font-style:italic;font-size:70%;'> (".$fin.")</span>";
	$s .= "</form>";
	return $s;
}	
function makeGainPouvoir($pow,$code,$delai,$num,$lib,$expl,$duree,$mini=1) {
	global $fap;
	$has = $fap->hasCapacity($code);
	$op = "";
	$dis = "";
	$on = "";
	$fin = "";
	if ($has or $fap->level['niveau']<$mini) {
		$op = "opacity:0.5;";
		$dis = "disabled";
	}
	if ($has) {
		$on = "<img src='images/on.png' style='height:20px;' /> ";
		$n = $fap->capacityInfo['num'];
		$fin = "<span style='font-size:70%;'> → ".strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date'])).
				" : ".$n." restant".($n>1?"s":"")."</span>";
	}	
	$s = "<form method='post' onsubmit='return winCapacity(this)' pow='".$pow."'>";
	$s .= "<input name='win' value='' style='display:none;' >";
	$s .= "<input name='pow' value='".$pow."' style='display:none;' >";
	$s .= "<input name='code' value='".$code."' style='display:none;' >";
	$s .= "<input name='delai' value='".($delai*3600)."' style='display:none;' >";
	$s .= "<input name='num' value='".$num."' style='display:none;' >";
	$s .= "<input type='submit' value='+".$pow."pv' ".$dis." class='buyPowerButton' style='".$op."' />";
	$s .= "&nbsp; ".$on.$lib." : 
			<span style='font-style:italic;font-size:90%;'>".$expl."</span>
			<span style='font-style:italic;font-size:90%;'> (".$duree.$fin.")</span>";
	$s .= "<div style='font-style:italic;font-size:90%;margin-left:60px;opacity:0.8;'>
			(accessible seulement si tu es niveau ".$mini." ou plus)</div>";
	$s .= "</form>";
	return $s;
}


$string .= "<div style='margin-top:50px;'>";
	$string .= "<div onclick='affDiv(this)' div='capacite' style='cursor:pointer;' >
					<img id='pm_capacite' src='images/moins.png' class='iconePM' /><b>Acheter des capacités avec tes points de pouvoir (".$fap->level['power']."pv)</b></div>";		
	$string .= "<div id='capacite'>";
	$string .= "<span style='font-style:italic;font-size:80%;'>&nbsp; pour les améliorations des jeux, 
		se rendre à la <a href='gStore-game.php'>boutique</a> du menu correspondant</span>";
	$string .= makeAchatPouvoir(50,'invisible',(24*5),"Cape d'invisibilité","fapper en toute discrétion","5 jours");
	if (!$isApplicationQualif) 
		$string .= makeAchatPouvoir(100,'stats',(12),"Lunettes infrarouges","voir les stats des autres fappeurs","12 heures");
	$string .= makeAchatPouvoir(100,'catch',(24*2),"Wire plug","recevoir une notification dès qu'un fappeur fappe","2 jours");
	$string .= "<div style='font-style:italic;font-size:80%;margin-top:10px;'>&nbsp; <u>Contaminer par MST</u> :</div>";
	$string .= makeAchatPouvoir(30,'mst-mirror',(24),"Fapocoque","contaminer et mettre mon avatar partout","1 jour");
	$string .= makeAchatPouvoir(20,'mst-speak',(2*24),"Chlamyfap","contaminer et afficher seulement mes maximes","2 jours");
	$string .= makeAchatPouvoir(25,'mst-pandemic',(7*24),"Pandémia","contaminer et bloquer les statistiques","1 semaine");
	$string .= makeAchatPouvoir(100,'mst-chtouille',(14*24),"Chtouille","contaminer et empêcher de fapper","2 semaines");
	$string .= "</div>";
$string .= "</div>";

$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='gain' style='cursor:pointer;' >
					<img id='pm_gain' src='images/moins.png' class='iconePM' /><b>Obtenir du pouvoir en offrant son corps</b></div>";		
	$string .= "<div id='gain'>";
	$string .= "<span style='font-style:italic;font-size:80%;'>(rend obsolète toutes les autres capacités de masquage)</span>";
	$string .= makeGainPouvoir(50,'exhibit',(24*30),1,"Exhibition","Ton prochain fap sera notifié à tous les fappeurs","30 jours",3);
	$string .= makeGainPouvoir(200,'fapstival',(24*30),10,"Fapstival","Chacun de tes dix prochains faps sera notifié à quelques fappeurs au hasard pour 20pv","30 jours",10);
	$string .= "</div>";
$string .= "</div>";


$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='owned' style='cursor:pointer;' >
					<img id='pm_owned' src='images/plus.png' class='iconePM' /><b>Toutes mes capacités en cours</b></div>";		
	$string .= "<div id='owned' style='font-size:90%;display:none;' >";
	$sql = "select * from t_capacity_cpt where usr_id=".$fap->getId();
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		$string .= "<div>";
		$string .= "[".$data['cpt_code']."]: ".$data['cpt_num']." → ";
		if ($data['cpt_date']) $string .= strftime("%d/%m %Hh%M",makeDate($data['cpt_date']));
		else $string .= "∞";
		$string .= "</div>";
	}
	$string .= "</div>";
$string .= "</div>";


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;