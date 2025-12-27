<?php

$t_users = $fap->getListUsers();
$t_param = $fap->getParam();
$t_sonsParam = $fap->getSon();
$t_conv = array();

$versionTime = "";
$versionTime = "?v=".intval(time()/86400);
$versionTime = "?v=".time();
if (isset($t_param['file_version_timeout'])) {
	$vt = intval($t_param['file_version_timeout']);
	if ($vt>0) $versionTime = "?v=".intval(time()/$vt);
	else $versionTime = "";
}

$isHttps = false;
if (isset($_SERVER['HTTPS']) and $_SERVER['HTTPS']=='on') $isHttps = true;
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) and $_SERVER['HTTP_X_FORWARDED_PROTO']=='https') $isHttps = true;
if (isset($_SERVER['HTTP_X_FORWARDED_SSL']) and $_SERVER['HTTP_X_FORWARDED_SSL']=='on') $isHttps = true;


if (isset($_COOKIE['fapParametres']) and $_COOKIE['fapParametres']!='' and !isset($_SESSION['fap']['options'])) {
	$cook = str_replace("\\","",$_COOKIE['fapParametres']);
	$_SESSION['fap']['options'] = json_decode($cook, true);
}

// debug dev
$usrDebug="";
if ($fap->isSuperDev() or ($fap->hasCapacity('stats') and !$isApplicationQualif)) {
	if (isset($_GET['usr'])) $_SESSION['fap']['usrDebug'] = $_GET['usr'];
	if (isset($_SESSION['fap']['usrDebug'])) $usrDebug = $_SESSION['fap']['usrDebug'];
}

$noMessage = false;
if ($isApplicationLocal) $noMessage = true;

// global
$statsUtilisateur = 'me';
if (isset($_SESSION['fap']['options']['statsUtilisateur'])) $statsUtilisateur = $_SESSION['fap']['options']['statsUtilisateur'];
$accesStatsAll = 1;
if (isset($t_param['nbj_stats_all']) and makeDate($fap->getLastFap())<time()-intval($t_param['nbj_stats_all'])*24*3600) {
	$statsUtilisateur = 'me';
	$accesStatsAll = 0;
}
$avecFapAnnule = '0';
if (isset($_SESSION['fap']['options']['avecFapAnnule'])) $avecFapAnnule = $_SESSION['fap']['options']['avecFapAnnule'];

$nbMaximeDefile = 5;
if (isset($t_param['nb_maxime'])) $nbMaximeDefile = intval($t_param['nb_maxime']);
$wsPort = '1664';
if (isset($t_param['socket_port'])) $wsPort = $t_param['socket_port'];

$animationInitiale = 0;
if (isset($_SESSION['fap']['options']['animationInitiale'])) $animationInitiale = 100*$_SESSION['fap']['options']['animationInitiale'];
$animationInitialeSpeed = 3;
if (isset($_SESSION['fap']['options']['animationInitialeSpeed'])) $animationInitialeSpeed = $_SESSION['fap']['options']['animationInitialeSpeed'];
$animationInitialeMode = 'max';
if (isset($_SESSION['fap']['options']['animationInitialeMode'])) $animationInitialeMode = $_SESSION['fap']['options']['animationInitialeMode'];


// filtre
$t_filtre = array();
$t_filtre['Jour'] = array('on'=>0, 'str'=>'%d/%m/%Y');
$t_filtre['Semaine'] = array('on'=>0, 'str'=>'s%U %Y');
$t_filtre['Mois'] = array('on'=>1, 'str'=>'%m/%Y');
$t_filtre['Année'] = array('on'=>1, 'str'=>'%Y');
$t_filtre['Décade'] = array('on'=>0, 'str'=>'%Y','group'=>10);
$t_filtre['Siècle'] = array('on'=>0, 'str'=>'%Y','group'=>100);
foreach ($t_filtre as $key => $val) {
	if (isset($_SESSION['fap']['options']['filtre'][$key])) $t_filtre[$key]['on'] = $_SESSION['fap']['options']['filtre'][$key];
}

//frequence
$plageFrequence = 'semaine';
if (isset($_SESSION['fap']['options']['plageFrequence'])) $plageFrequence = $_SESSION['fap']['options']['plageFrequence'];
$precisionFrequence = 2;
if (isset($_SESSION['fap']['options']['precisionFrequence'])) $precisionFrequence = $_SESSION['fap']['options']['precisionFrequence'];

// graphique
$modeGraph = 'courbe';
if (isset($_SESSION['fap']['options']['modeGraph'])) $modeGraph = $_SESSION['fap']['options']['modeGraph'];
$t_conv['courbe'] = 'histo';
$t_conv['histo'] = 'courbe';
$modeZoom = 'x';
if (isset($_SESSION['fap']['options']['modeZoom'])) $modeZoom = $_SESSION['fap']['options']['modeZoom'];
$cumulHieto = 7;
if (isset($_SESSION['fap']['options']['cumulHieto'])) $cumulHieto = $_SESSION['fap']['options']['cumulHieto'];
$iniPeriode = 0;
if (isset($_SESSION['fap']['options']['iniPeriode'])) $iniPeriode = $_SESSION['fap']['options']['iniPeriode'];

// escargots
$nbSnail = 3;
if (isset($_SESSION['fap']['options']['nbSnail'])) $nbSnail = $_SESSION['fap']['options']['nbSnail'];
$snailBestGuest = 0;
if (isset($_SESSION['fap']['options']['snailBestGuest'])) $snailBestGuest = $_SESSION['fap']['options']['snailBestGuest'];
$snailMeInside = 1;
if (isset($_SESSION['fap']['options']['snailMeInside'])) $snailMeInside = $_SESSION['fap']['options']['snailMeInside'];
$snailRunPeriodeCustom = 7;
if (isset($_SESSION['fap']['options']['snailRunPeriodeCustom'])) $snailRunPeriodeCustom = $_SESSION['fap']['options']['snailRunPeriodeCustom'];
if ($snailRunPeriodeCustom=='custom') {
	$snailRunPeriode = 7; 
	if (isset($_SESSION['fap']['options']['snailRunPeriode'])) $snailRunPeriode = $_SESSION['fap']['options']['snailRunPeriode'];
} else $snailRunPeriode = intval($snailRunPeriodeCustom);

// geolocalisation
$mapAgeFapRecent = 15;
if (isset($t_param['map_nbj_recent'])) $mapAgeFapRecent = intval($t_param['map_nbj_recent']);
$modeMap = 'dot';
if (isset($_SESSION['fap']['options']['modeMap'])) $modeMap = $_SESSION['fap']['options']['modeMap'];
$mapShowAccuracy = 1;
if (isset($_SESSION['fap']['options']['mapShowAccuracy'])) $mapShowAccuracy = $_SESSION['fap']['options']['mapShowAccuracy'];
$mapInitCenter = 'recent';
if (isset($_SESSION['fap']['options']['mapInitCenter'])) $mapInitCenter = $_SESSION['fap']['options']['mapInitCenter'];
$mapLocalRelay = 1;
if (isset($_SESSION['fap']['options']['mapLocalRelay'])) $mapLocalRelay = $_SESSION['fap']['options']['mapLocalRelay'];
$mapMaxPosCorrect = 10000;
if (isset($t_param['map_pos_correct'])) $mapMaxPosCorrect = intval($t_param['map_pos_correct'])*1000;

// sonorisation
$sonActive = 0;
if (isset($_SESSION['fap']['options']['sonActive'])) $sonActive = $_SESSION['fap']['options']['sonActive'];
$sonVolume = 50;
if (isset($t_param['son_volume'])) $sonVolume = intval($t_param['son_volume']);
if ($sonVolume<0) $sonVolume = 0;
if ($sonVolume>100) $sonVolume = 100;
if (isset($_SESSION['fap']['options']['sonVolume'])) $sonVolume = $_SESSION['fap']['options']['sonVolume'];
$sonPageCoeff = 0.5;
if (isset($t_param['son_pageCoeff'])) $sonPageCoeff = floatval($t_param['son_pageCoeff']);
$sonRacine = "sons/";
if (isset($t_param['son_racine'])) $sonRacine = $t_param['son_racine'];
$t_sons = array();
$t_sons['page'] = array('actif'=>1, 'label'=>'Musique d\'ambiance');
$t_sons['phallus'] = array('actif'=>1, 'label'=>'Clone phallus');
$t_sons['snail'] = array('actif'=>1, 'label'=>'Course des escargots');
$t_sons['fap'] = array('actif'=>1, 'label'=>'J\'ai fappé');
$t_sons['game'] = array('actif'=>1, 'label'=>'Jeux');
$t_sons['chat'] = array('actif'=>1, 'label'=>'Activité du chat');
foreach ($t_sons as $son => $v) {
	if (isset($_SESSION['fap']['options']['son'][$son])) $t_sons[$son]['actif'] = $_SESSION['fap']['options']['son'][$son];
}

// jeu
$gameJoystick = 'mouse';
if (isset($_SESSION['fap']['options']['gameJoystick'])) $gameJoystick = $_SESSION['fap']['options']['gameJoystick'];
$gamePlayerMultiple = 0;
if (isset($_SESSION['fap']['options']['gamePlayerMultiple'])) $gamePlayerMultiple = $_SESSION['fap']['options']['gamePlayerMultiple'];
$t_games = array();
$t_games['fusee'] = "Mise en orbite";
$t_games['splash'] = "Prends tout";
$t_games['worm'] = "Panzer Fap";
$t_games['arena'] = "Sperm Arena";


// chat
$chatDelaiRecup = 5;
if (isset($_SESSION['fap']['options']['chatDelaiRecup'])) $chatDelaiRecup = $_SESSION['fap']['options']['chatDelaiRecup'];
$chatInteractif = 0;
if (isset($_SESSION['fap']['options']['chatInteractif'])) $chatInteractif = $_SESSION['fap']['options']['chatInteractif'];


// memorisation
$sauvParametres = 0;
if (isset($_SESSION['fap']['options']['sauvParametres'])) $sauvParametres = $_SESSION['fap']['options']['sauvParametres'];
$bandeauDefile = 1;
if (isset($_SESSION['fap']['options']['bandeauDefile'])) $bandeauDefile = $_SESSION['fap']['options']['bandeauDefile'];
$networkInvitation = 1;
if (isset($_SESSION['fap']['options']['networkInvitation'])) $networkInvitation = $_SESSION['fap']['options']['networkInvitation'];
$decompteFap = 0;
if (isset($_SESSION['fap']['options']['decompteFap'])) $decompteFap = $_SESSION['fap']['options']['decompteFap'];



// GIFT
$gift = array();
if (isset($t_param['gift_param']) and $t_param['gift_param']!='') $gift = json_decode($t_param['gift_param'],true);
$isGiftTime = (isset($gift['date']) and time()>=makeDate($gift['date']) and time()<=makeDate($gift['date'])+$gift['duree']*86400);
$isGiftAble = (!$fap->hasCapacity('gift') and $isGiftTime);

$t_dType = array(604800=>'Semaine', 86400=>'Jour', 3600=>'Heure');
$giftCapacity = array();
$giftCapacity['bomb'] = array('num'=>10,'lib'=>"Bombes",'inc'=>true);
$giftCapacity['sperm'] = array('delai'=>24*7*3600);
	$giftCapacity['sperm']['var'] = array(2=>"Double dong",5=>"Spermicide");
$giftCapacity['mini'] = array('delai'=>24*7*3600);
	$giftCapacity['mini']['var'] = array(2=>"Petit Zob",4=>"Rikiki");
$giftCapacity['life'] = array('delai'=>24*7*3600);
	$giftCapacity['life']['var'] = array(1=>"Extra ball",3=>"Hot trique",7=>"Cat's spirit");
$giftCapacity['invisible'] = array('delai'=>5*24*3600,'lib'=>"Cape d'invisibilité");	
$giftCapacity['stats'] = array('delai'=>12*3600,'lib'=>"Lunettes infrarouges");	
$giftCapacity['catch'] = array('delai'=>2*24*3600,'lib'=>"Wire plug");





		
