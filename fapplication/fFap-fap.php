<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

include_once('_manifest.php');

$string = $string_head;
	
$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/animation.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/fallback.js".$versionTime."' ></script>";
$string .= "</head><body>";


$string .= $string_menu;

$string .= "<div id='offAlert' class='divMessage'></div>";
$string .= "<div id='mstAlert' class='divMessage'></div>";


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

// $last = $fap->getLastFap();
// if (!$last or $last<'2018-06-15') {
	// $string .= "<div class='divEntete'>";
	// $string .= "<a href='iNews-infos.php'>Il y a du nouveau dans la fapplication</a>";
	// $string .= "</div>";
// }

$news = array();
if (isset($t_param['news_info']) and $t_param['news_info']!='') $news = json_decode($t_param['news_info'],true);
$newsActif = false;
if (isset($t_param['news_actif'])) $newsActif = intval($t_param['news_actif']);
if ($newsActif) {
	if (!in_array($fap->getId(),$news)) {
		$string .= "<div class='divEntete'>";
		$string .= "<a href='iNews-infos.php'>Information de la plus haute importance : clique ici</a>";
		$string .= "</div>";
	}
}


$string .= "<div style='display:none;' >";
$string .= "<img src='images/urne.gif' />";
$string .= "<img src='images/dizzy-face.png' />";
$string .= "</div>";

$mess = "";
if (!$fap->isDevSafe()) $mess = "Parce que la masturbation est un droit inaliénable...";
if ($fap->hasCapacity('invisible')) $mess = "<img src='images/masque.png' class='imgIcone' />
											Tu peux fapper en toute discrétion
											<img src='images/masque.png' class='imgIcone' />";
if ($fap->level['power']>$fap->level['niveau']*9) {
	$mess = "<img src='images/achtung.gif' class='imgIcone' /> Tu as ".($fap->level['power']<$fap->level['niveau']*10?"presque":"")
				." atteint ta limite de pouvoir, vas vite en mettre dans ton <a href='iCoffre-infos.php'>coffre</a>";
}				

if (getMstInfect('mst-chtouille')==$fap->getId()) {
	$id = $fap->whoHasLastCapacity('mst-chtouille');
	$fap->hasCapacity('mst-chtouille',$id);
	$string .= "<div class='divMessage' >";
	$string .= "Tu as la attrapé la chtouille et tu ne peux plus fapper !
				<br>Le seul moyen de te faire délivrer c'est qu'un autre fappeur imprudent vienne te la prendre... en fappant &#9786;
				<br>Désolé, mais c'est parfois risqué de fapper.
				<br><br>Tu peux remercier ".getNomUser($id)." qui a lancé cette épidémie qui durera jusqu'au "
				.strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date']))
				."<br><a href='iMst-infos.php' >Voir la liste des contaminés</a>";
	$string .= "</div>";
} else {
	$string .= "<div id='divFap'>";
		if (!$fap->isDevSafe()) $string .= "<div style='margin-bottom:20px;'><i>".$mess."</i></div>";
		if (!$fap->isDevSafe()) $string .= "<div class='blocDisplay' ><img id='funkybite' src='images/funky-bite.gif' onclick='funkyBite(this);' /></div>";
		$string .= "<div class='blocDisplay' ><div id='aFappe' class='buttFap' onclick='aFappeWait(this);' >J'ai Fappé</div></div>";
		if (!$fap->isDevSafe()) $string .= "<div class='blocDisplay' ><img id='funkybite2' src='images/funky-bite.gif' onclick='funkyBite(this);' /></div>";
	$string .= "</div>";

	$string .= "<div class='divMessage' id='divErrFap'>";
	$string .= "<br><span style='font-size:80%;'><a href='fGeoloc-fap.php'>Tester d'abord ma position</a></span>";
		$mf = $fap->getBestFappeurDate(7);
		$nb1 = $fap->getBestFappeurDate(7,1,true);
		if ($mf==$fap->getId()) {
			$nb = $nb1-$fap->getBestFappeurDate(7,2,true);
			if ($nb>1) $s="s"; else $s="";
			$string .= "<br>Félicitations, tu es le fappeur du mois";
			$deuz = $fap->getBestFappeurDate(7,2);
			if ($deuz!=$fap->getId()) $deuz = $nb." fap".$s." d'avance sur ".getNomUser($deuz);
			else $deuz = "... et le seul pour l'instant !";
			$string .= "<br><span style='font-size:80%;'>".$deuz."</span>";
		}
		else {
			$nb2 = $fap->getMyFapDate(7);
			$nb = $nb1-$nb2;
			if ($nb2>0 and $nb<4) {
				if ($nb>1) $s="s"; else $s="";
				$string .= "<br>Encore un petit effort<br><span style='font-size:80%;'>
							".getNomUser($mf)." a ".$nb." fap".$s." d'avance sur toi</span>";	
			}	
		}
	$string .= "</div>";
}

$string .= "</div>";
	
$string .= $string_banner;
$string .= "<script>initFunkyBite(60);var usrLocal=".$fap->getId().";getFapLocal();getInfoFap();</script>";

$string .= "<iframe src='fallback/fallback.php?usr=".$fap->getId()."' style='display:none;'></iframe>";

$string .= "</body></html>";
echo $string;