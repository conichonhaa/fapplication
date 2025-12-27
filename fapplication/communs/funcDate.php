<?php


function makeTabDate($ldate) {
	$temp = explode('T',$ldate);
	if (count($temp)<2) $temp = explode(' ',$ldate);
	$tempD = explode('-',$temp[0]);
	if (count($temp)>1) $tempH = explode(':',$temp[1]);
	else $tempH = array(0,0,0);
	while (count($tempD)<3) $tempD[] = 0;
	while (count($tempH)<3) $tempH[] = 0;
	return array('D'=>$tempD,'H'=>$tempH);
}
function makeDate($ldate) {
	$tab = makeTabDate($ldate);
	$heure = mktime(intval($tab['H'][0]),intval($tab['H'][1]),intval($tab['H'][2]),intval($tab['D'][1]),intval($tab['D'][2]),intval($tab['D'][0]));
	return $heure;
}
function writeDate($date) {
	return strftime("%Y-%m-%dT%H:%M:%S",$date);
}

// Formate une jolie date
function formateJolieDate($ladate) {
	$temp = explode(' ',$ladate);
	$tempD = explode('-',$temp[0]);
	$d = "";
	$annee = $tempD[0];
	if ($annee<1970) $annee = 2000;
	if (count($tempD)>2) {
		$heureTU = mktime(0,0,0,intval($tempD[1]),intval($tempD[2]),intval($annee));
		$d = strftime("%d %b %Y",$heureTU);
		if ($tempD[0]<1970) $d = strftime("%d %b ",$heureTU).$tempD[0];
	} else if (count($tempD)>1) {
		$heureTU = mktime(0,0,0,intval($tempD[1]),1,intval($annee));
		$d = strftime("%B %Y",$heureTU);
		if ($tempD[0]<1970) $d = strftime("%B ",$heureTU).$tempD[0];
	} else {
		$d = intval($tempD[0]);
	}
	return utf8_encode($d);
}

function affDureeItem(&$delai, $d, $a, &$deep) {
	$s = "";
	if ($delai>=$d and $deep>0) {
		$deep--;
		$s = intval($delai/$d).$a." ";
		$delai = $delai - intval($delai/$d)*$d;
	}
	return $s;
}
function affDuree($delai,$deep=6) {
	$aff = "";
	$aff .= affDureeItem($delai, 365*24*3600, "an", $deep);
	$aff .= affDureeItem($delai, 30*24*3600, "mois", $deep);
	$aff .= affDureeItem($delai, 24*3600, "j", $deep);
	$aff .= affDureeItem($delai, 3600, "h", $deep);
	$aff .= affDureeItem($delai, 60, "mn", $deep);
	$aff .= affDureeItem($delai, 1, "s", $deep);
	return trim($aff);
}
function affDelai($ldate) {
	$delai = intval(time() - makeDate($ldate));
	if ($delai<=60) return "en cours";
	if ($ldate!='') return affDuree($delai,2);
	return "jamais";
}


// tri
function cmp($a,$b) {
	if ($a==$b) return 0;
	return ($a>$b)?-1:1;
}
function percent($a,$b,$p=1) {
	$prec = pow(10,$p);
	if ($b>0) return (intval(100*$prec*$a/$b)/$prec);
	else return 0;
}

// users
function getNomUser($usr) {
	global $t_users;
	$nom = "déserteur";
	if (isset($t_users[$usr])) $nom = $t_users[$usr]['nom'];
	return $nom;
}