<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";


$fapmin = 60;
if (isset($t_param['fapdelai_min'])) $fapmin = intval($t_param['fapdelai_min']);


if (count($_POST)>0) {
	if (isset($_POST['suppFap']) and $_POST['suppFap']!='') {		
		$act = $_POST['act'];
		if ($act!='null') $act = "'".$act."'";
		$sql = "update t_faplogs_fap set fap_annule=".$_POST['act']." where fap_id=".$_POST['suppFap'];
		mysql_query($sql,$fap->conn);
	}
	$string .= "<script>document.location.replace(document.location.href.split('#')[0])</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('filtre'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> des filtres</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";

$string .= "<div class='divEntete' >";
$string .= "Supprimer un Fap";
$string .= "</div>";

$string .= "<div class='divMessage' >";
$string .= "Aucun Fap ne peut être repris ni échangé... 
			<br>mais vous pouvez en tagguer certains avec une astérisque pour qu'ils ne participent plus aux statistiques";
$string .= "</div>";

	$string .= "<div style='display:none;'>
					<img src='images/remove.png' />
					<img src='images/remove-o.png' />
					<img src='images/flecheD.png' />
					<img src='images/flecheD-o.png' />
				</div>";

function affCoord($v) {
	$aff = "?";
	if ($v!='') $aff = round($v*100)/100;
	return $aff;
}				
				
$nbAnnule = 0;
$getFap = array();
$memo = null;
$res = "";
$t_old = array();
$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." order by fap_date desc";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	$color = "#000000";
	if ($data['fap_annule']) $color = "#888888";
	if (isset($_GET['fap']) and $_GET['fap']==$data['fap_id']) $color .= ";background-color:#EDADED";
	$detail = "<div style='margin-left:1em;color:".$color.";'>";
	if ($data['fap_annule']) $dis = ""; else $dis = "display:none;";
	$detail .= "<span style='".$dis."'>*</span>";
	$detail .= strftime("%d/%m/%Y %Hh%M",makeDate($data['fap_date']));
	if ($data['fap_declare']!='') $detail .= " <i>(déclaré le ".strftime("%d/%m %Hh%M",makeDate($data['fap_declare'])).")</i>";
	
	$lat = affCoord($data['fap_pos_latitude']);
	$lon = affCoord($data['fap_pos_longitude']);
	$detail .= "&nbsp; <span style='font-style:italic;font-size:80%;'>(lat:".$lat.", lon:".$lon.")</span>";
	if ($data['fap_pos_latitude']) 
		$detail .= "&nbsp;<div fap='".$data['fap_id']."' onclick='affPosSeek(this)' voir='seekOld' title='Voir ce Fap'
								class='imgDelete imgVoir' style='display:inline-block;' >&nbsp;</div>";
	
	$detail .= "&nbsp;<a href='fGeoloc-fap.php?fap=".$data['fap_id']."'><div title='Positionner ce Fap'
								class='imgDelete imgPos' style='display:inline-block' >&nbsp;</div></a>";
								
	if ($data['fap_annule']) $detail .= "&nbsp;<div fap='".$data['fap_id']."' act='null' title='Ré-activer ce Fap' onclick='suppFap(this)' 
										class='imgDelete imgInsert' style='display:inline-block;' >&nbsp;</div>";
	else $detail .= "&nbsp;<div fap='".$data['fap_id']."' act='1' title='Annuler ce Fap' onclick='suppFap(this)' 
					class='imgDelete' style='display:inline-block;' >&nbsp;</div>";
					
	$lib = "";
	if ($memo) {
		$int = makeDate($memo['fap_date'])-makeDate($data['fap_date']);
		if ($int<$fapmin) $lib = "douteux (+".affDuree($int).")";
	}
	if (!$data['fap_annule']) $detail .= "<span><supp lib='".$lib."' fap='".$data['fap_id']."' date='".$data['fap_date']."' /></span>";
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
	if ($keyVal) {
		affTab($keyVal, $detail, $t_old);
	} else {
		$res .= $detail;
	}
	if (!$data['fap_annule']) $memo = $data;
	else $nbAnnule++;
}

$string .= "<div class='divMessage' >";
$string .= "<b>Tu as annulé <span nb='".$nbAnnule."' id='nbAnnule'>".$nbAnnule." fap".(($nbAnnule>1)?"s":"")."</span></b>";
$string .= "</div>";

	$string .= "<div id='seekOld' style='display:none;'>
				<iframe src='' width='400' height='300' id='seekOldFrame' style='max-width:90%;'></iframe>
				<input type='button' onclick='hideSeekOld(this)' value= '&nbsp;' />
				</div >";

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
function makeButton($tt) {
	global $getFap;
	$s = "";
	foreach ($tt as $key => $val) {
		if (is_array($val)) $det = makeButton($val);
		else $det = $val;
		if ((isset($_SESSION['fap']['memoAffFiltre']['filtre'.$key]) and $_SESSION['fap']['memoAffFiltre']['filtre'.$key]=='true') 
			or isset($getFap[$key]))
			$display=""; else $display="display:none;";
		$s .= "<input type='button' div='filtre".$key."' onclick='affDiv(this);memoFiltre(this);' style='cursor:pointer;' value='".$key."' >";
		$s .= "<div id='filtre".$key."' style='".$display."margin-top:0px;'>".$det."</div>";
	}
	return $s;
}
$string .= makeButton($t_old);
$string .= $res;

$string .= "</div>";
$string .= "<script>seekKill();</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;