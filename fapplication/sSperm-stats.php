<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


$vous = "Tu as fappé";
if ($statsUtilisateur=='all') $vous = "Tous ensemble nous avons fappé";

$vfap = 4;
if (isset($t_param['voleq_sperm'])) $vfap = floatval($t_param['voleq_sperm']);

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
				
	$usrExp = $fap->getId();
	if ($usrDebug!='') $usrExp = $usrDebug;
	$tt = array('me'=>getNomUser($usrExp),'all'=>'Tous les fappeurs');			
	$string .= "<div>Volume pour <i><b>".$tt[$statsUtilisateur]."</b></i></div>";
	
	$conv = array(array('c'=>1,'u'=>'ml'),
				array('c'=>10,'u'=>'cl'),
				array('c'=>1000,'u'=>'l'),
				array('c'=>1000000,'u'=>'m³'),
				array('c'=>1000000000000,'u'=>'Mm³'),
				array('c'=>1000000000000000,'u'=>'km³'),
				array('c'=>1000000000000000000000,'u'=>'Mkm³'),);
								
	$corresp = array(array('c'=>1,'u'=>"d'un dé à coudre"),
					array('c'=>10,'u'=>"d'un test urinaire"),
					array('c'=>100,'u'=>"d'une bonne bouteille"),
					array('c'=>1000,'u'=>"d'une grosse cuite"),
					array('c'=>10000,'u'=>"d'un fût périmé"),
					array('c'=>100000,'u'=>"d'un aquarium exotique"),
					array('c'=>1000000,'u'=>"d'un estomac de baleine à bosse"),
					array('c'=>10000000,'u'=>"des fondations d'une villa provenciale"),
					array('c'=>100000000,'u'=>"de caca annuel des bataves"),
					array('c'=>1000000000,'u'=>"d'un pétrolier naufragé"),
					array('c'=>10000000000,'u'=>"d'une crue sur un petit cours d'eau"),
					array('c'=>100000000000,'u'=>"d'une crue sur un gros cours d'eau"),
					array('c'=>1000000000000,'u'=>"du lac d'Annecy"),
					array('c'=>10000000000000,'u'=>"de la bêtise humaine"),
					array('c'=>100000000000000,'u'=>"des glaces du Groenland"),
					array('c'=>1000000000000000,'u'=>"de ... en fait c'est juste énorme"));
				
				
	$last = null;
	$lt_usr = array();
	$vol = 0;
	$nb= 0;
	for ($k=0; $k<7; $k++) $t_fsem[$k] = 0;
	for ($k=0; $k<4; $k++) $t_fjour[$k] = 0;
	$sql = "select * from t_faplogs_fap";
	$where = " where";
	if ($usrDebug!='') {
		$sql .= $where." usr_id=".$usrDebug."";
		$where = " and";
	}
	else if ($statsUtilisateur=='me') {
		$sql .= $where." usr_id=".$fap->getId()."";
		$where = " and";
	}
	if ($avecFapAnnule=='0') {
		$sql .= $where." (fap_annule is null or fap_annule<>1)";
		$where = " and";
	}
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$d = makeDate($data['fap_date']);
		$coeff = 1;
		if (isset($lt_usr[$data['usr_id']])) {
			$intusr = $d - $lt_usr[$data['usr_id']];
			$coeff = min(1.5,($intusr)/(24*3600));
		}
		$vol += $coeff*$vfap;
		$nb++;
		$last = $d;
		$lt_usr[$data['usr_id']] = $d;
	}
	foreach($conv as $cu) {
		if ($vol>$cu['c']) {
			$p = 1;
			if ($cu['c']>1 and $vol<10*$cu['c']) {
				$p = 100;
			} elseif ($cu['c']>1 and $vol<100*$cu['c']) {
				$p = 10;
			}
			$affVol = intval($vol/($cu['c']/$p))/$p . $cu['u'];
		}
	}
	foreach($corresp as $cu) {
		if ($vol>$cu['c']) {
			$contenu = $cu['u'];
		}
	}
	
	$string .= "<div style='margin-top:2em;'>";
	if ($nb==0) {
		$string .= "<b>Aucun Fap, mais pourquoi tu t'es inscrit ?</b>";
	} else {
		$string .= $vous." l'équivalent de <b>".$affVol."</b> de liquide séminal !";
		$string .= "<br>Cela représente environ le contenu ".$contenu."";
	}
	$string .= "</div>";
	
	$string .= "<div style='margin-top:2em;font-size:80%;margin-bottom:2em;'>";
	$string .= "Selon l'Organisation Mondiale de la Santé, qui a regardé le volume de sperme à travers du monde, 
				le domaine du volume de sperme disponible dans les testicules varie entre 0,8ml et 7,6ml et la moyenne se situe entre 3 et 5 ml.
				<br>Le calcul ci-dessus est le fruit de l'étude comparative de nombreux travaux de recherche effectués en 
				Angleterre, Suède, Allemagne, France, Canada et Etats-Unis.
				<br>Les principaux paramètres pris en compte sont à la fois liés aux mensurations du fappeur 
				(poids, taille, âge, pilosité, teint, etc) 
				mais aussi à son état physique et émotionnel détecté à travers des paramètres indirects tels que 
				la fréquence de ses faps, la pression d'appui sur le FAPbouton ou encore la durée de connexion à la fapplication.
				Enfin, d'autres informations contextuelles récupérées depuis votre ordinateur, tablette ou smartphone 
				(micro, caméra, hitorique web, position GPS, contacts, etc)
				permettent d'affiner le résultat en orientant l'algorithme sur la branche décisionnelle la plus adaptée.
				<br>La formule consite à approximer, dans un premier temps, la relation linéaire homogène qui définit la projection
				de l'espace vectoriel des paramètres d'entrées sur l'hyperplan du contexte le plus proche.
				Puis il suffit de minimiser la fonction coût associée en la dérivant partiellement le long des n-1 dimensions restantes
				pour obtenir le point de pivot de la branche de l'algorithme. Le calcul du volume de chaque Fap est alors directement donné
				par permutation de l'orbite stable (un peu comme les manipulations invariantes sur les rubik's cubes, pour ceux qui connaissent)
				jusqu'à ce que le voisinage de la limite de la série extraite soit suffisament convergente, 
				ce qui est inéluctable puisque l'espace initial est de Banach &#9786;.
				<br>Vous voyez, c'est pas si compliqué !
				";
	$string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;