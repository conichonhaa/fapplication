<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/hymne.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/hymne.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete'>";
$string .= "Hymne à la Branlette";
$string .= "</div>";

$string .= "<div style=text-align:center;'>";
$string .= "<audio src='sons/Hymne_Branlette.mp3' controls preload style='width:800px;max-width:90%;' id='audioHymne' ></audio>";
$string .= "<video src='sons/logo.mp4' controls style='width:800px;max-width:90%;display:none;' id='videoHymne' ></video>";
$string .= "<div onclick='switchMedia(this)' media='audio' title='Voir le clip'
				class='imgDelete imgSwitch' style='display:inline-block;vertical-align:top;' >&nbsp;</div>";
$string .= "</div>";

$string .= "<script>initMedia();</script>";

$string .= "<div style='margin-top:1em;text-decoration:underline;font-size:120%;cursor:pointer;'
				onclick='affDiv(this)' div='karaoke' >
				<img id='pm_karaoke' src='images/moins.png' class='iconePM' />Karaoke :</div>";		
$string .= "<div id='karaoke'>";
	$string .= "<div deb='0' fin='0' style='display:none;' ><div aff='0' >&nbsp;</div></div>";
	$string .= "<div deb='0' fin='2' style='display:none;' ><div aff='0' >&nbsp;</div></div>";
	$hymne = file_get_contents('files/hymne.txt');
	$tb = explode("$$",$hymne);
	foreach ($tb as $b) {
		$min = null;
		$max = null;
		$s = "";
		$tl = explode("\r",$b);
		foreach ($tl as $l) {
			$t = explode(":",$l);
			if (count($t)>1 and $t[1]!="") {
				$aff = floatval($t[1]);
				if (!$min) $min = $aff;
				$max = $aff;
				$s .= "<div aff='".$aff."' >".str_replace(" ","&nbsp;",$t[0])."</div>";
			}
		}
		if ($min) {
			$string .= "<div deb='".$min."' fin='".$max."' style='display:none;' >";
				$string .= $s;
			$string .= "</div>";
		}
	}
	$string .= "<div deb='200' fin='220' style='display:none;' ><div aff='200' >&nbsp;</div></div>";
$string .= "</div>";

$string .= "<div style='margin-top:1em;text-decoration:underline;font-size:120%;cursor:pointer;'
				onclick='affDiv(this)' div='paroles' >
				<img id='pm_paroles' src='images/moins.png' class='iconePM' />Paroles :</div>";		
$string .= "<div id='paroles'>";
$string .= "Laissez moi vous parler s'il vous plait
		<br/>d'un p'tit travers de l'humanité
		<br/>Cette vilaine manie de se masturber tout le temps
		<br/>de rester toute sa vie un adolescent
		<br/>
		<br/><i>Si comme nous les hormones ont grillé ta cervelle
		<br/>N'aies  pas peur de chanter cette ritournelle</i>
		<br/>
		<br/><b>Quand c'est branlette c'est jour de fête
		<br/>Astique ton sexe pour ton bien être 
		<br/>Libère la pression de tes p'tits roustons
		<br/>
		<br/>Car y'a pas de mal à se faire du bien
		<br/>du moment que tu te casses pas le frein
		<br/>et que tu cliques sur la fapplication</b>
		<br/>
		<br/>Pénis, Phallus, Baton de joie, Petit Zob   
		<br/>c'est toujours amusant de se secouer la chose
		<br/>toutes ces filles qui se trémoussent toutes ces formes qui m'affolent
		<br/>tous nos vices se finissent dans un feu d'artifice
		<br/>
		<br/><i>Les hormones ont grillé ta cervelle
		<br/>Rejoins moi pour chanter cette ritournelle</i>
		<br/>
		<br/><b>REFRAIN</b>
		<br/>
		<br/>Pas vu pas pris j'te fais ça inconnu
		<br/>c'est un cirque érotique sous mon chapiteau 
		<br/>Si jamais tu te fais prendre à le faire en solo
		<br/>pas de panique accuse donc - la génétique 
		<br/>
		<br/><i>Si comme nous les hormones ont grillé ta cervelle
		<br/>N'aies  pas peur de chanter cette ritournelle</i>
		<br/>
		<br/><b>REFRAIN</b>";
$string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;