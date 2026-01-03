<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/ifttt.js".$versionTime."' ></script>";

$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$url = $fap->getServerName().$fap->getAppName()."ifttt.php?usr=".$fap->getId()."&key=";
$usk = "";
$userkey = "";
$disabled = "";
$valUserkey = "valider";
$imgClass = "imgCheck";
$funcUserkey = "confirmUserKey(this)";
$foreignkey = "";
$opacity = "";
$toggle = "off";
$appkey = "";
if (isset($t_param['newrelic_ifttt'])) $appkey = $t_param['newrelic_ifttt'];
if ($appkey!='') {
	$sql = "select * from t_user_key_usk where usr_id=".$fap->getId()." and usk_appkey='".$appkey."'";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$userkey = $data['usk_userkey'];
		$foreignkey = $data['usk_foreignkey'];
		$usk = $data['usk_id'];
		if ($data['usk_actif']) $toggle = "on";
		else $opacity = "opacity:0.5";
	}
} else {
	$string .= "<div class='divMessage' >";
	$string .= "Error : Key IFFT indisponible !";
	$string .= "</div>";
	$disabled = "disabled";
}
if ($userkey!="") {
	$disabled = "disabled";
	$valUserkey = "modifier";
	$imgClass = "imgPen";
	$funcUserkey = "changeUserKey(this)";
}

$string .= "<div style='display:none;'>";
	$string .= "<img src='images/toggleon.png' />";
	$string .= "<img src='images/toggleoff.png' />";
$string .= "</div>";


$string .= "<div class='divEntete' >";
$string .= "<img src='images/ifttt.png' style='height:1em;' />&nbsp;";
$string .= "Fapper par IFTTT";
$string .= "&nbsp;&nbsp;&nbsp;<img src='images/toggle".$toggle.".png' style='height:1em;cursor:pointer;' usk='".$usk."'
			id='uskToggle' val='".$toggle."' onclick='toggleActiveKey(this)' on='images/toggleon.png' off='images/toggleoff.png' />";
$string .= "</div>";

$string .= "<div class='divMessage' style='font-size:90%;'>";
$string .= "Fapper sans les mains... oui c'est possible !<br> Grace à IFTTT = If <b>This</b> Then <b>That</b>";
$string .= "</div>";

$def_incub = "";
mysql_query($sql,$fap->conn);
$sql = "select * from t_parametrage_par as par
		join t_incubateur_icb as icb on icb.icb_id=par.par_valeur
		where icb_vote<icb_cible and icb_valide=1 and par_code='incub_defaut'";
$req = mysql_query($sql,$fap->conn);
if ($data = mysql_fetch_array($req)) {
	$def_incub = "<div style='font-size:80%;font-style:italic;margin-left:2em;'>Vote par défaut : <b>".$data['icb_titre']."</b></div>";
}

$string .= "<div style='".$opacity."' id='uskBlocGeneral'>";
	$string .= "<div style='margin-top:0.8em;' >Pour utiliser cette fonctionnalité, tu dois t'enregistrer sur 
				<a target='_blank' href='https://ifttt.com/'>https://ifttt.com/</a> ou via les applis mobiles 
				<a target='_blank' href='https://play.google.com/store/apps/details?id=com.ifttt.ifttt&hl=fr'>android</a>
				ou <a target='_blank' href='https://itunes.apple.com/fr/app/ifttt/id660944635?mt=8'>ios</a></div>";
	$string .= "<div style='margin-top:0.8em;' >Récupère le code d'identification de 
					<a target='_blank' href='https://ifttt.com/services/maker_webhooks/settings'>webhooks</a> : <span style='font-size:80%;font-style:italic;'>Account info : URL = https://maker.ifttt.com/use/<b><a target='_blank' 
					href='https://ifttt.com/services/maker_webhooks/settings'>[...]</a></b></span>
				<br> &nbsp; https://maker.ifttt.com/use/<input id='uskUserKey' value='".$userkey."' ".$disabled." app='".$appkey."'
					style='max-width:90%;' /><div onclick='".$funcUserkey."' title='".$valUserkey."' 
					class='imgDelete ".$imgClass."' style='display:inline-block;' >&nbsp;</div>
				</div>";
	$string .= "<div onclick='affDiv(this)' div='fapFTTT' style='cursor:pointer;margin-top:0.8em;' >
					<img id='pm_fapIFTTT' src='images/moins.png' class='iconePM' /><b>Pour fapper, programme une applet</b></div>";		
	$string .= "<div id='fapFTTT'>
				".$def_incub."
				<div> - <b>This</b> : l'action de ton choix</div>
				<div> &nbsp;&nbsp;&nbsp; \"Button widget\" = <i>appuyer sur un bouton</i></div>
				<div> &nbsp;&nbsp;&nbsp; \"Google Assistant\" ou \"Assistant vocal\" = <i>dire une phrase</i></div>
				<div> &nbsp;&nbsp;&nbsp; etc</div>
				<div> - <b>That</b> : \"webhooks\" avec</div>
				<div> &nbsp;&nbsp;&nbsp; <u>Url</u> = <span id='uskUrlWebhook' url='".$url."' >".($foreignkey!=""?$url.$foreignkey:"???")."</span>
					<div cible='uskUrlWebhook' onclick='copyUrl(this)' title='Copier dans le presse papier' id='uskUrlWebhookImg'
						class='imgDelete imgCopy' style='display:".($foreignkey!=""?"inline-block":"none").";' >&nbsp;</div>
					<div id='uskUrlWebhookInfo' style='margin-left:5em;font-size:80%;font-style:italic;".($foreignkey!=""?"":"display:none;")."' >
						cette url est strictement personnelle et confidentielle, générer une nouvelle clef
						<img src='images/des.png' style='height:0.8em;cursor:pointer;' onclick='randomForeignKey(this)' id='uskRandom' val='".$usk."' />
					</div>
				</div>
				<div> &nbsp;&nbsp;&nbsp; <u>Method</u> = POST</div>
				<div> &nbsp;&nbsp;&nbsp; <u>Content-type</u> = application/x-www-form-urlencoded</div>
				<div> &nbsp;&nbsp;&nbsp; <u>Body</u> = \"Add Ingredient\" => LocationMapURL (indisponible avec Google Assistant)</div>
				</div>";
	$inf=""; 
	if ($userkey!='') 
		$inf=" <div style='font-size:80%;font-style:italic;margin-left:2em;'>
				le retour des faps par ifttt est systématique et indépendant des options de notification du <a href='profil.php'>profil</a>
				&nbsp;&nbsp;&nbsp;<input type='button' value='test envoi ifttt' onclick='window.open(\"ifttt.php?test=".$userkey."\")' />
				</div>";
				
	$string .= "<div onclick='affDiv(this)' div='notifIFTTT' style='cursor:pointer;margin-top:0.8em;' >
					<img id='pm_notifIFTTT' src='images/moins.png' class='iconePM' /><b>Pour être notifié, programme une applet</b></div>";		
	$string .= "<div id='notifIFTTT'>
				<div> - <b>This</b> : \"webhooks\" avec <u>Event</u> = fapnotif</div>
				<div> - <b>That</b> : \"Notification\" avec <u>Notification</u> = \"Add Ingredient\" => value1</div>
				".$inf."
				</div>";
	$string .= "<div style='margin-top:0.8em;' >Enjoy !
				</div>";				
$string .= "</div>";

function affCoord($v) {
	$aff = "?";
	if ($v!='') $aff = round($v*100)/100;
	return $aff;
}
$string .= "<div onclick='affDiv(this)' div='listeIFTTT' style='cursor:pointer;margin-top:0.8em;' >
					<img id='pm_listeIFTTT' src='images/plus.png' class='iconePM' /><b>Liste des faps via IFTTT</b></div>";		
$string .= "<div id='listeIFTTT' style='display:none;'>";
	$c = 0;
	$getFap = array();
	$res = "";
	$t_old = array();
	$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." and fap_ifttt=1 order by fap_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		$c++;
		$detail = "<div style='margin-left:1em;'>";
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
	}
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
	$tot = "";
	$sql = "select count(*) as c from t_faplogs_fap where fap_ifttt=1";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {$tot = "(nb total=".$data['c'].")";}
	$string .= "<div style='font-size:80%;font-style:italic;margin-left:1em;'>
				Tu as ".$c." fap".($c>1?"s":"")." par IFTTT ".$tot."
				</div>";
	$string .= makeButton($t_old);
	$string .= $res;
$string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;