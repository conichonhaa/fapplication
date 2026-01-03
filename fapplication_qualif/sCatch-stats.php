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


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$nb = 0;
	$s = "";
	$sql = "select count(*) from t_fapcatch_fch";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {						
		$nb = $data['count(*)'];
	}
	if($nb>1) $s = "s";
	$string .= "Il y a eu <b>".$nb." action".$s."</b> de <i>\"pris sur le fait\"</i><br>";
	
	
	$usr_id = $fap->getId();
	if ($usrDebug!='') $usr_id = $usrDebug;

	$t_catch = array();	
	$detail = "";
	$nb = 0;
	$sql = "select fap.*,fch.fch_date from t_fapcatch_fch as fch
			join t_faplogs_fap as fap on fap.fap_id=fch.fap_id
			where fch.usr_id=".$usr_id."
			order by fch.fch_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$date = $data['fap_date'];
		if ($data['fap_annule']=='1') $annule="*"; else $annule = "";
		$fappe = "fappé".$annule;
		if ($data['fap_declare']!='') {
			$date = $data['fap_declare'];
			$fappe = "déclaré son Fap <i>(du ".strftime("%d/%m %Hh%M",makeDate($data['fap_date'])).$annule.")</i>";
		}	
		if ($data['fap_offline']!='') {
			$date = $data['fap_offline'];
			$fappe = "synchronisé son Fap <i>(du ".strftime("%d/%m %Hh%M",makeDate($data['fap_date'])).$annule.")</i>";
		}		
		$d = makeDate($data['fch_date']);
		$detail .= " - <i>".strftime("%d/%m/%Y %Hh%M",$d)."</i> : <b>".getNomUser($data['usr_id'])."</b> 
					avait ".$fappe." ".affDuree($d-makeDate($date))." plus tôt<br>";
		if (!isset($t_catch[$data['usr_id']])) $t_catch[$data['usr_id']] = 0;
		$t_catch[$data['usr_id']]++;
		$nb++;
	}
	$string .= "<br><div><span style='text-decoration:underline' >Qui as-tu attrapé ?</span> <i>(".$nb.")</i></div>";
	uasort($t_catch,'cmp');
	$string .= "<div>";
	$memo = "";
	foreach ($t_catch as $usr => $nb) {
		if ($memo!="") {
			if ($nb!=$memo) $string .= " : ".$memo." fois</div><div>";
			else $string .= ", ";
		}
		$string .= "<b>".getNomUser($usr)."</b>";
		$memo = $nb;
	}
	if ($memo!="") {
		$string .= " : ".$memo." fois</div>";
		$string .= "<div><input type='button' div='mecatch' onclick='affDiv(this)' style='cursor:pointer;' value='Détail' ></div>";
		$string .= "<div id='mecatch' style='display:none;margin-top:0px;'>".$detail."</div>";
	} else $string .= "</div>";
	
	
	$detail = "";
	$t_catch = array();
	$nb = 0;
	$sql = "select fch.*,fap.fap_date,fap.fap_annule,fap.fap_declare,fap.fap_offline from t_fapcatch_fch as fch
			join t_faplogs_fap as fap on fap.fap_id=fch.fap_id
			where fap.usr_id=".$usr_id."
			order by fch.fch_date desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$date = $data['fap_date'];
		if ($data['fap_annule']=='1') $annule="*"; else $annule = "";
		$fappe = "plus tard".$annule;
		if ($data['fap_declare']!='') {
			$date = $data['fap_declare'];
			$fappe = " après la déclaration de ton Fap <i>(du ".strftime("%d/%m %Hh%M",makeDate($data['fap_date'])).$annule.")</i>";
		}
		if ($data['fap_offline']!='') {
			$date = $data['fap_offline'];
			$fappe = " après la synchronisation de ton Fap <i>(du ".strftime("%d/%m %Hh%M",makeDate($data['fap_date'])).$annule.")</i>";
		}
		$d = makeDate($date);
		$detail .= " - <i>".strftime("%d/%m/%Y %Hh%M",makeDate($data['fch_date']))."</i> : <b>".getNomUser($data['usr_id'])."</b> 
					t'a gaulé ".affDuree(makeDate($data['fch_date'])-$d)." ".$fappe."<br>";
		if (!isset($t_catch[$data['usr_id']])) $t_catch[$data['usr_id']] = 0;
		$t_catch[$data['usr_id']]++;
		$nb++;
	}
	$string .= "<br><div><span style='text-decoration:underline' >Par qui t'es-tu fait attrapé ?</span> <i>(".$nb.")</i></div>";
	uasort($t_catch,'cmp');
	$string .= "<div>";
	$memo = "";
	foreach ($t_catch as $usr => $nb) {
		if ($memo!="") {
			if ($nb!=$memo) $string .= " : ".$memo." fois</div><div>";
			else $string .= ", ";
		}
		$string .= "<b>".getNomUser($usr)."</b>";
		$memo = $nb;
	}
	if ($memo!="") {
		$string .= " : ".$memo." fois</div>";
		$string .= "<div><input type='button' div='catchme' onclick='affDiv(this)' style='cursor:pointer;' value='Détail' ></div>";
		$string .= "<div id='catchme' style='display:none;margin-top:0px;'>".$detail."</div>";
	} else $string .= "</div>";
	
	
	$string .= "<br>&nbsp;&nbsp;&nbsp;<i>Nb: une * indique que le fap a été annulé</i>";
	
	$string .= "<br>";	
	$t_palm = array();
	$string .= "<br><div style='text-decoration:underline' >Palmarès :</div>";
	$sql = "select * from t_fapcatch_fch";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		if (!isset($t_palm[$data['usr_id']])) $t_palm[$data['usr_id']] = 0;
		$t_palm[$data['usr_id']]++;
	}
	uasort($t_palm,'cmp');
	foreach ($t_palm as $usr => $nb) {
		$string .= " - <b>".getNomUser($usr)."</b> a choppé ".$nb." fois<br>";
	}
	$string .= "<br>";



$string .= "<br><i>";
if ($fap->isCatchAuth()) {
	$string .= "Ton délai pour attraper un fappeur est actuellement de ".($fap->getCatchAuth()/60)."mn.";
} else {
	$string .= "Tu n'es pas en capacité d'attraper les autres fappeurs.";
}
$string .= "</i>";

	

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;
