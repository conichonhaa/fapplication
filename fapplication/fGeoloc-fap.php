<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/map.css".$versionTime."' media='all' type='text/css' />";
$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/map.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='openlayers/OpenLayers.js' ></script>";
$string .= "<script type='text/javascript' src='openlayers/proj4js-combined.js' ></script>";
$string .= "<script type='text/javascript' >var modeMap='loc';var mapShowAccuracy=1;
			var mapLocalRelay=".$mapLocalRelay.";
			var mapMaxPosCorrect=".$mapMaxPosCorrect.";
			var fapInvisible=".($fap->hasCapacity('invisible')?"1":"0").";
			</script>";
$string .= "</head><body>";

$string .= $string_menu;

if (count($_POST)>0) {
	if (isset($_POST['resetError'])) {
		
	}
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$nbJour = 0;
$zx = 24*3600;
$mapAgeFapRecent = 15;

$string .= "<div id='mstAlert' class='divMessage'></div>";

$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
	$string .= "<img elem='divMap' class='buttOption buttParam' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";
	//$string .= "<img elem='divMap' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";


	$getFap = array();
	$res = "";
	$t_old = array();
	$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." and fap_pos_accuracy>0 order by fap_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		$detail = "<div style='margin-left:1em;'>";
		$detail .= strftime("%d/%m/%Y %Hh%M",makeDate($data['fap_date']));
		$lat = affCoord($data['fap_pos_latitude']);
		$lon = affCoord($data['fap_pos_longitude']);
		$detail .= "&nbsp; <span style='font-style:italic;font-size:80%;'>(lat:".$lat.",lon:".$lon.",acc:".$data['fap_pos_accuracy']."m)</span>";
		$detail .= "&nbsp;<div fap='".$data['fap_id']."' onclick='reposFap(this);affDiv(this);' div='divFiltreFap'
						lat='".$data['fap_pos_latitude']."' lon='".$data['fap_pos_longitude']."' 
						acc='".$data['fap_pos_accuracy']."' reloc='".intval($data['fap_pos_reloc'])."'
						title='Positionner ce Fap' class='imgDelete imgPos' style='display:inline-block;' >&nbsp;</div>";
		$detail .= "</div>";
		$keyVal = null;
		foreach ($t_filtre as $key => $val) {
			if ($val['on']) {
				$kk = strftime($val['str'],makeDate($data['fap_date']));
				if (isset($val['group'])) {
					$k = (intval($kk/$val['group'])*$val['group']);
					$kk = $k."-".($k+$val['group']-1);
				}
				if (isset($_GET['fap']) and $_GET['fap']==$data['fap_id']) $getFap[$kk] = 1;
				if ($keyVal) $keyVal = array($kk => $keyVal);
				else $keyVal = $kk;
			}
		}
		if ($keyVal) affTab($keyVal, $detail, $t_old);
		else $res .= $detail;
	}
	$res2 = "";
	$t_old2 = array();
	$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." and fap_pos_accuracy is null order by fap_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		$detail = "<div style='margin-left:1em;'>";
		$detail .= strftime("%d/%m/%Y %Hh%M",makeDate($data['fap_date']));
		$lat = affCoord($data['fap_pos_latitude']);
		$lon = affCoord($data['fap_pos_longitude']);
		$detail .= "&nbsp; <span style='font-style:italic;font-size:80%;'>(lat:".$lat.", lon:".$lon.", acc:".$data['fap_pos_accuracy']."m)</span>";
		$detail .= "&nbsp;<div fap='".$data['fap_id']."' onclick='initPosFap(this);affDiv(this);' div='divFiltreFap'
						title='Positionner ce Fap' class='imgDelete imgPos' style='display:inline-block;' >&nbsp;</div>";
		$detail .= "</div>";
		$keyVal = null;
		foreach ($t_filtre as $key => $val) {
			if ($val['on']) {
				$kk = strftime($val['str'],makeDate($data['fap_date']));
				if (isset($val['group'])) {
					$k = (intval($kk/$val['group'])*$val['group']);
					$kk = $k."-".($k+$val['group']-1);
				}
				if (isset($_GET['fap']) and $_GET['fap']==$data['fap_id']) $getFap[$kk] = 1;
				if ($keyVal) $keyVal = array($kk => $keyVal);
				else $keyVal = $kk;
			}
		}
		if ($keyVal) affTab($keyVal, $detail, $t_old2);
		else $res2 .= $detail;
	}
	$defautLoc = array();
	$sql = "select round(fap_pos_latitude,1) as lat, round(fap_pos_longitude,1) as lon, count(*) as nb from t_faplogs_fap
			where fap_pos_accuracy>0 and usr_id=".$fap->getId()." group by lat, lon order by nb desc";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$defautLoc['lat'] = $data['lat'];
		$defautLoc['lon'] = $data['lon'];
		$defautLoc['nb'] = $data['nb'];
	}
	
	
	function affCoord($v) {
		$aff = "?";
		if ($v!='') $aff = round($v*100)/100;
		return $aff;
	}	
	function affTab($keyVal, $cont, &$tt) {
		if (is_array($keyVal)) {
			foreach ($keyVal as $key => $val) {
				affTab($val, $cont, $tt[$key]);
			}
		} else {
			if (!isset($tt[$keyVal])) $tt[$keyVal] = "";
			$tt[$keyVal] .= $cont;			
		}
	}
	function makeButton($tt,$l) {
		global $getFap;
		$s = "";
		foreach ($tt as $key => $val) {
			if (is_array($val)) $det = makeButton($val,$l);
			else $det = $val;
			if ((isset($_SESSION['fap']['memoAffFiltre']['filtre'.$key]) and $_SESSION['fap']['memoAffFiltre']['filtre'.$key]=='true') 
				or isset($getFap[$key]))
				$display=""; else $display="display:none;";
			$s .= "<input type='button' div='filtre".$key.$l."' onclick='affDiv(this);memoFiltre(this);' style='cursor:pointer;' value='".$key."' >";
			$s .= "<div id='filtre".$key.$l."' style='".$display."margin-top:0px;'>".$det."</div>";
		}
		return $s;
	}
	$string .= "<div class='buttOld'>";
	$string .= "<input type='button' value='Anciens' onclick='affDiv(this);setToOldFap();' div='divFiltreFap'
					class='inputAlert' />";
	$string .= "</div>";
	$string .= "<div id='divFiltreFap' style='display:none;margin-bottom:30px;'  >";
		
		$string .= "<div style=''>";
			$string .= "<div onclick='affDiv(this)' div='incAccuracy' style='cursor:pointer;' >
							<img id='pm_incAccuracy' src='images/moins.png' class='iconePM' /><u>Augmenter l'imprécision</u></div>";		
			$string .= "<div id='incAccuracy'>";
				$string .= "<div>Sur le fap <span id='fapActif' fap=''></span> 
							&nbsp;+km:<input id='addAccuracy' type='number' min='0' pow='".$fap->level['power']."' niv='".$fap->level['niveau']."' 
							max='0' /><input type='button' value='max' onclick='setMax(this)' />
							&nbsp;&nbsp;&nbsp;<input type='button' value='Acheter' onclick='buyAccuracy();' />
							</div>";
			$string .= "</div>";
		$string .= "</div>";
		
		$string .= "<div style='margin-top:20px;'>";
			$string .= "<div onclick='affDiv(this)' div='seekOld' style='cursor:pointer;' >
							<img id='pm_seekOld' src='images/moins.png' class='iconePM' /><u>Rechercher un fap</u></div>";		
			$string .= "<div id='seekOld'>";	
				$string .= makeButton($t_old,"_loc");
				$string .= $res;
			$string .= "</div>";
		$string .= "</div>";
		
		$string .= "<div style='margin-top:20px;'>";
			$string .= "<div onclick='affDiv(this)' div='seekOldNo' style='cursor:pointer;' >
							<img id='pm_seekOldNo' src='images/moins.png' class='iconePM' /><u>Localiser un fap</u></div>";		
			$string .= "<div id='seekOldNo'>";	
				if (count($defautLoc)>0) {
					$string .= "<div id='defautLocFap' style='display:none;' pow='".$fap->level['power']."'
								lat='".$defautLoc['lat']."' lon='".$defautLoc['lon']."' nb='".$defautLoc['nb']."' ></div>";
					$string .= "<div><i>Localisation préférentielle détectée Lat:".$defautLoc['lat'].", Lon:".$defautLoc['lon']."</i></div>";
					if ($defautLoc['nb']<100) {
						$string .= "<div><i>Mais tu as seulement ".$defautLoc['nb']." fap".($defautLoc['nb']>1?"s":"")." au même endroit, 
							il t'en faut au moins 100 pour activer la localisation différée</i></div>";
					}
					$string .= makeButton($t_old2,"_no");
					$string .= $res2;
				} else {
					$string .= "<div><i>Aucun fap déjà localisé</i></div>";
				}
			$string .= "</div>";
		$string .= "</div>";
		
	$string .= "</div>";

	$string .= "<div id ='divPoints' style='display:none;'  >";
	$string .= "</div>";
	
	$string .= "<div id='overDiv' ><div id='divMap' ratio='1.8' ></div></div>";
	$string .= "<div id='divPos' style='text-align:right;'></div>";
	$string .= "<div class='divMessage' id='divErrFap'></div>";
	
$string .= "</div>";
$string .= "<script type='text/javascript'>var getFap=0;</script>";
if (isset($_GET['fap']) and $_GET['fap']!='') {
	$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." and fap_id=".$_GET['fap']." and fap_pos_accuracy>0";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$string .= "<div fap='".$data['fap_id']."' onclick='reposFap(this);affDiv(this);' id='divGetOldFap' style='display:none;'
					lat='".$data['fap_pos_latitude']."' lon='".$data['fap_pos_longitude']."' 
					acc='".$data['fap_pos_accuracy']."' reloc='".intval($data['fap_pos_reloc'])."'></div>";
		$string .= "<script type='text/javascript'>getFap=1;</script>";
	} else {
		$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." and fap_id=".$_GET['fap']." and fap_pos_accuracy is null";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$string .= "<div fap='".$_GET['fap']."' id='divSetOldFap' style='display:none;'></div>";
			$string .= "<script type='text/javascript'>getFap=1;</script>";
		}
	}
}
$string .= "<script type='text/javascript'>initPosition();</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;