<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;	

$fap->cleanCapacity();

if (count($_POST)>0) {
	if (isset($_POST['gift'])) {
		$gift = array();
		$gift['titre'] = $_POST['titre'];
		$gift['date'] = $_POST['date'];
		$gift['duree'] = $_POST['duree'];
		$gift['pv'] = $_POST['pv'];
		foreach ($giftCapacity as $code => $val) {
			if (isset($_POST['cap_'.$code])) {
				$gift['cap'][$code] = array();
				if (isset($_POST['cap_'.$code.'_num'])) 
					$gift['cap'][$code]['num'] = $_POST['cap_'.$code.'_num'];
				if (isset($_POST['cap_'.$code.'_dNum'])) 
					$gift['cap'][$code]['delai'] = $_POST['cap_'.$code.'_dNum']*$_POST['cap_'.$code.'_dType'];
			}
		}
		$json = json_encode($gift, JSON_UNESCAPED_UNICODE);
		$sql = "update t_parametrage_par set par_valeur='".$json."' where par_code='gift_param'";
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['nogift'])) {
		$sql = "update t_parametrage_par set par_valeur='' where par_code='gift_param'";
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['offrir'])) {
		if ($_POST['usr']!='') {
			$fap->giftPower($_POST['pv'],$_POST['usr']);
		}
	}
	if (isset($_POST['increase'])) {
		if ($_POST['usr']!='') {
			$fap->incPoints($_POST['pts'],$_POST['usr']);
		}
	}

	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;




if ($fap->isAdmin('gift')) {
	$string .= "<div class='divEntete' >";
	$string .= "Administration des cadeaux";
	$string .= "</div>";
	
	$display = '';
	$disabled = '';
	if ($isGiftTime) {
	  $display = 'display:none;';
	  $disabled = 'disabled';
	}
	
	$string .= "<form method='POST' style='margin-top:20px;".$display."' >";
	$string .= "<input name='gift' style='display:none;' />";
	$string .= "Titre <input name='titre' value='".(isset($gift['titre'])?$gift['titre']:"")."' style='width:400px;max-width:90%;' />";
	$string .= " &nbsp; Date <input name='date' type='date' value='".(isset($gift['date'])?$gift['date']:"")."' />";
	$string .= " &nbsp; Durée <input name='duree' type='number' value='".(isset($gift['duree'])?$gift['duree']:"")."' 
					min='0' step='1' style='width:60px;' />j";
	$string .= "<br> &nbsp; - Pouvoir : <input name='pv' type='number' value='".(isset($gift['pv'])?$gift['pv']:"0")."' 
					min='0' step='10' style='width:60px;' />pv";
	foreach ($giftCapacity as $code => $val) {
		$string .= "<br> &nbsp; <input id='cap_".$code."' name='cap_".$code."' type='checkbox' ".(isset($gift['cap'][$code])?"checked":"")." />";
		$string .= "<label for='cap_".$code."' > &nbsp; <i>(".$code.")</i></label>";
		$delai = null;
		$num = null;
		if (isset($gift['cap'][$code])) {
			if (isset($gift['cap'][$code]['delai'])) $delai = $gift['cap'][$code]['delai'];
			if (isset($gift['cap'][$code]['num'])) $num = $gift['cap'][$code]['num'];
		} else {
			if (isset($val['delai'])) $delai = $val['delai'];
			if (isset($val['num'])) $num = $val['num'];
		}
		if (isset($val['var'])) {
			$string .= " &nbsp; <select name='cap_".$code."_num'>";
			foreach ($val['var'] as $k => $v) {
				$sel = ($k==$num?"selected":"");
				$string .= "<option value='".$k."' ".$sel.">".$v."</option>";
			}
			$string .= "</select>";
		} else {
			$string .= " &nbsp; <label for='cap_".$code."' >".$val['lib']." : </label>";
			if ($num and $num!='null') 
				$string .= " <input  type='number' name='cap_".$code."_num' value='".$num."' 
								min='0' step='1' max='50' style='width:40px;font-size:80%;' />";
		}
		if ($delai and $delai!='null') {
			$d = 0;
			$opts = "";
			foreach ($t_dType as $k => $v) {
				$sel = "";
				if (!$d and $delai>=$k and intval($delai/$k)*$k==$delai) {
					$sel = "selected";
					$d = intval($delai/$k);
				}
				$opts .= "<option value='".$k."' ".$sel.">".$v."</option>";
			}
			$string .= " &nbsp;&nbsp;&nbsp; pour <input name='cap_".$code."_dNum' type='number' 
						 value='".$d."' min='0' step='1' max='30' style='width:40px;font-size:80%;' />";
			$string .= "<select name='cap_".$code."_dType' style='font-size:90%;'>".$opts."</select>";
		}
	}
	$string .= "<br><input type='submit' value='Enregistrer' >";
	$string .= "</form>";

	if (isset($gift['date'])) {
		$comp = " du ".$gift['date']." pendant ".$gift['duree']."j";
		$comp .= " &nbsp; <form method='POST' style='display:inline-block;' onsubmit='return confirm(\"Effacer le cadeau ?\");'>
					<input name='nogift' style='display:none;' />
					<input type='submit' value='Effacer' style='".$display."' >
					</form>";
		$string .= "<div style='font-style:italic;font-size:90%;margin-top:50px;'>";
		$string .= "<div onclick='affDiv(this)' div='adminGift' style='cursor:pointer;' >
					<img id='pm_adminGift' src='images/moins.png' class='iconePM' />".$gift['titre'].$comp."</div>";		
		$string .= "<div id='adminGift' >";
			$txt = "";
			if (isset($gift['cap'])) {
				foreach ($gift['cap'] as $code => $val) {
					if (isset($giftCapacity[$code]['inc'])) $txt .= "<br>&nbsp;- ".$val['num']." ";
					else $txt .= "<br>&nbsp;- 1 ";
					if (isset($giftCapacity[$code]['var'])) $txt .= $giftCapacity[$code]['var'][$val['num']];
					else $txt .= $giftCapacity[$code]['lib'];
					if (isset($val['delai']) and $val['delai']!=$giftCapacity[$code]['delai']) {
						$delai = "";
						foreach ($t_dType as $k => $v) {
							if ($val['delai']>=$k and intval($val['delai']/$k)*$k==$val['delai']) {
								$d = intval($val['delai']/$k);
								$delai = " pour ".$d." ".$v.($d>1?"s":"");
								break;
							}
						}
						$txt .= $delai;
					}
				}
			}
			$string .= "&nbsp;- ".$gift['pv']." pv/coins".$txt."";
			$string .= "<div style='margin-top:20px;' >";	
			if ($isGiftTime) {
				$string .= "<u>Evènement commencé, plus que ".affDuree(makeDate($gift['date'])-time()+$gift['duree']*86400)."</u>";
					if ($fap->isDev()) {
						$string .= " &nbsp; <form method='POST' style='display:inline-block;' onsubmit='return confirm(\"Arrêter le cadeau en cours ? Cela n est pas très fair play avec ceux qui n ont pas eu le temps de le récupérer.\");'>
										<input name='nogift' style='display:none;' />
										<input type='submit' value='Arrêter le cadeau en cours' >
										</form>";
					}
				$sql = "select * from t_capacity_cpt where cpt_code='gift'";
				$req = mysql_query($sql,$fap->conn);
				while ($data = mysql_fetch_array($req)) {
					$string .= "<br> &nbsp; - ".getNomUser($data['usr_id']);
					//$string .= " (".affDuree(makeDate($data['cpt_date'])-time()).")";
				}
			} else {
				if (time()<makeDate($gift['date'])) $string .= "Evènement dans ".intval((makeDate($gift['date'])-time())/86400)."j";
				if (time()>makeDate($gift['date'])+$gift['duree']*86400) $string .= "Evènement terminé";
			}
			$string .= "</div>";
		$string .= "</div>";
		$string .= "</div>";
	}
	
	
	if ($fap->isDev()) {	
	
		$string .= "<div style='display:none;'>";
			foreach ($t_users as $usr => $v) {
				$lvl = $fap->logGetLevel($usr);
				$string .= "<div id='usr_".$usr."' pow='".$lvl['power']."' lvl='".$lvl['niveau']."' cof='".$lvl['coffre']."' xp='".$lvl['experience']."' ></div>";
			}
		$string .= "</div>";

		$string .= "<form method='POST' style='margin-top:20px;'>";
		$string .= "<input name='offrir' style='display:none;' />";
		$string .= "Offrir du pouvoir à <select name='usr' onchange='affGiftIco(this)' ><option value=''></option>";
		foreach ($t_users as $usr => $v) {
			$string .= "<option value='".$usr."'>".$v['nom']."</option>";
		}
		$string .= "</select>";
		$string .= "<input name='pv' type='number' min='0' step='10' style='width:60px;' />pv &nbsp; ";
		$string .= "<input type='submit' value='Donner' >";
		$string .= "</form>";
		$string .= "<div >";
			$string .= " &nbsp;&nbsp;&nbsp; <img src='images/level.png' class='imgIcone' />";
			$string .= " <span id='icolvl' >?</span>";
			$string .= " &nbsp;&nbsp;&nbsp; <img src='images/pouvoir.png' class='imgIcone' />";
			$string .= " <span id='icopow' >?</span>";
			$string .= " &nbsp;&nbsp;&nbsp; <img src='images/coffre.png' class='imgIcone' />";
			$string .= " <span id='icocof' >?</span>";
			$string .= " &nbsp;&nbsp;&nbsp; <img src='images/xp.png' class='imgIcone' />";
			$string .= " <span id='icoxp' >?</span>";
		$string .= "</div>";	
		
		$string .= "<form method='POST' style='margin-top:20px;'>";
		$string .= "<input name='increase' style='display:none;' />";
		$string .= "Augmenter l'expérience de <select name='usr' onchange='affGiftIco(this)' ><option value=''></option>";
		foreach ($t_users as $usr => $v) {
			$string .= "<option value='".$usr."'>".$v['nom']."</option>";
		}
		$string .= "</select>";
		$string .= "<input name='pts' type='number' min='0' step='10' style='width:60px;' />pts &nbsp; ";
		$string .= "<input type='submit' value='Donner' >";
		$string .= "</form>";
	}
	
} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}
	


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;
