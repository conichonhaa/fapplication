<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> graphiques</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";

$string .= "<div class='divEntete'>";
$string .= "Le Fappeur du mois";
$string .= "</div>";

$string .= "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$string .= "<span class='glyphicon glyphicon-question-sign'></span>";
$string .= "</div>";
$string .= "<div id='explique' style='text-align:right;display:none;margin-bottom:20px;'>";
$string .= "<div style='display:inline-block;text-align:left;font-style:italic;max-width:100%;'>";
$string .= "Tu ne peux voir le résultat que si tu es sur le podium (3 premiers).
			<br>Si tu es le meilleur fappeur du mois en cours, alors tu vois tout.";
$string .= "</div>";
$string .= "</div>";

$deb = null;
$sql = "select * from t_faplogs_fap order by fap_date limit 1";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	$deb = $data['fap_date'];
}

function up2($v) {
	if (strlen($v)<2) $v = "0".$v;
	return $v;
}

$myUsr = $fap->getId();
if ($usrDebug!='') $myUsr = $usrDebug;

if ($deb) {
	$end = substr($deb,0,7);
	$year = intval(strftime("%Y",time()));
	$month = intval(strftime("%m",time()));
	$memoY = null;
	$tmf = array();
	$s = "";
	while ($year."-".up2($month)>=$end) {
		if ($memoY!=$year) {
			if ($memoY) $s .= "</div>";
			if ($year==strftime("%Y",time())) {
				$pm = "moins";
				$dis = "";
			} else {
				$pm = "plus";
				$dis = "display:none;";
			}
			$s .= "<div style='font-weight:bold;cursor:pointer;' onclick='affDiv(this)' div='year".$year."' >
					<img id='pm_year".$year."' src='images/".$pm.".png' class='iconePM' />";
			$usr = $fap->getBestFappeurDate(0,1,null,$year."%");
			$s .= $year." : ";
			if ($statsUtilisateur=='me') {
				$usr2 = $fap->getBestFappeurDate(0,2,null,$year."%");
				$usr3 = $fap->getBestFappeurDate(0,3,null,$year."%");
				if ($usr==$myUsr or $usr2==$myUsr or $usr3==$myUsr or $bestMonth==$myUsr) 
					$s .= getNomUser($usr);
				else $s .= "???";
				if ($usr==$myUsr or $usr2==$myUsr or $usr3==$myUsr) {
					$r1 = $fap->getBestFappeurDate(0,1,true,$year."%");
					$r2 = $fap->getBestFappeurDate(0,2,true,$year."%");
					$r3 = $fap->getBestFappeurDate(0,3,true,$year."%");
					if ($usr==$myUsr) {
						$s .= " (".$r1." <span style='font-size:50%;'>+".($r1-$r2)."</span>)";
					}
					if ($usr2==$myUsr) {
						$s .= "<span style='font-size:80%;'> (tu es 2<span class='exp'>è</span>";
						if ($r1-$r2<20) $s .= " <span style='font-size:60%;'>-".($r1-$r2)."</span>";
						$s .= ")</span>";	
					}
					if ($usr3==$myUsr) {
						$s .= "<span style='font-size:80%;'> (tu es 3<span class='exp'>è</span>";
						if ($r1-$r3<20) $s .= " <span style='font-size:60%;'>-".($r1-$r3)."</span>";
						$s .= ")</span>";	
					}
				}
			} else {
				$n = $fap->getMyFapDate(0,true,$year."%");
				$s .= $n." fap".($n>1?"s":"");
			}
			$s .= "</div>";
			$tmf[$usr] = 1;
			$s .= "<div id='year".$year."' style='".$dis."'>";	
		}
		$usr = $fap->getBestFappeurDate(0,1,null,$year."-".up2($month)."%");
		$s .= "<div style='margin-left:30px;display:list-item;list-style-type:circle;'>";
		$s .= "<i>".$fap->miniMois(up2($month))."</i> : ";
		if ($statsUtilisateur=='me') {
			$usr2 = $fap->getBestFappeurDate(0,2,null,$year."-".up2($month)."%");
			$usr3 = $fap->getBestFappeurDate(0,3,null,$year."-".up2($month)."%");
			if ($usr==$myUsr or $usr2==$myUsr or $usr3==$myUsr or $bestMonth==$myUsr) 
				$s .= getNomUser($usr);
			else $s .= "???";
			if ($usr==$myUsr or $usr2==$myUsr or $usr3==$myUsr) {
				$r1 = $fap->getBestFappeurDate(0,1,true,$year."-".up2($month)."%");
				$r2 = $fap->getBestFappeurDate(0,2,true,$year."-".up2($month)."%");
				$r3 = $fap->getBestFappeurDate(0,3,true,$year."-".up2($month)."%");
				if ($usr==$myUsr) {
					$s .= " (".$r1." <span style='font-size:50%;'>+".($r1-$r2)."</span>)";
				}
				if ($usr2==$myUsr) {
					$s .= "<span style='font-size:80%;'> (tu es 2<span class='exp'>è</span>";
					if ($r1-$r2<4) $s .= " <span style='font-size:60%;'>-".($r1-$r2)."</span>";
					$s .= ")</span>";	
				}
				if ($usr3==$myUsr) {
					$s .= "<span style='font-size:80%;'> (tu es 3<span class='exp'>è</span>";
					if ($r1-$r3<4) $s .= " <span style='font-size:60%;'>-".($r1-$r3)."</span>";
					$s .= ")</span>";	
				}
			}
		} else {
			$n = $fap->getMyFapDate(0,true,$year."-".up2($month)."%");
			$s .= $n." fap".($n>1?"s":"");
		}
		$s .= "</div>";
		$tmf[$usr] = 1;
		$memoY = $year;
		$month--;
		if ($month<1) {
			$month = 12;
			$year--;
		}
	}
	if ($memoY) $s .= "</div>";
	if (key_exists($myUsr,$tmf)) {
		$string .= $s;
	} else {
		$string .= "<div class='divMessage'>";
		$string .= "Désolé, il faut avoir été au moins une fois le fappeur du mois pour avoir accès à cette statistique";
		$string .= "</div>";
	}
}	

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;