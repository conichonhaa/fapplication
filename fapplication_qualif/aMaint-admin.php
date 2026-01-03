<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');
include_once('restricted/secure.php');
// include_once('secure.php');
$sec = new secure($fap);

$string = $string_head;
$string .= "<script type='text/javascript' src='scripts/dev.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script>var myUsr=".$fap->getId().";</script>";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";



if ($fap->isAdmin('maint')) {	
	if (count($_POST)>0) {
		if (isset($_POST['recup'])) {
			if (isset($_POST['base'])) $sec->downloadBase($fap->conn);
			if (isset($_POST['images'])) $sec->downloadImages($fap->conn);
		}
		if (isset($_POST['postimages']) and isset($_FILES['images'])) {
			$sec->uploadImages($_FILES['images'],$fap->conn);
		}
		if (isset($_POST['maintenance'])) {
			$sql = "update t_parametrage_par set par_valeur='".$_POST['maintenance']."' where par_code='mode_maintenance'";
			mysql_query($sql,$fap->conn);
		}		

		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;
		die();
	}
		
		
	
$string .= "<div style=''>";
	$v = 1;
	if (isset($t_param['mode_maintenance'])) $v = ($t_param['mode_maintenance']=='1'?0:1);
	if ($v==1) $lib = 'Activer le mode maintenance';
	else $lib = 'Désactiver le mode maintenance';
	$string .= "<form method='post' style='display:inline-block;margin-left:20px;margin-right:30px;' >";
	$string .= "<input name='maintenance' style='display:none;' value='".$v."' />";
	$string .= "<input type='submit' value='".$lib."' />";
	$string .= "</form>";	
	$string .= "<input type='button' value='Fapper hors ligne' onclick='window.open(\"fallback/fallbackFap.php\")' />";	
$string .= "</div>";

$string .= "<div style='margin-top:30px;'>";
	$tt = array('Galou'=>'fap@brenat-production.fr','Gmail'=>'fap.brenatproduction@gmail.com');
	$a = "";
	$string .= "Serveur de mail : <select id='mail_server' onchange='changeServerMail(this)' >";	
	foreach ($tt as $k => $v) {
		if ($k==$t_param['mail_server']) {
			$sel = "selected";
			$a = $v;
		} else $sel = "";
		$string .= "<option value='".$k."' ".$sel." add='".$v."' >".$k."</option>";	
	}
	$string .= "</select>";	
	$string .= " &nbsp; <span id='adresseMail' style='font-style:italic;font-size:80%' >".$a."</span>";	
$string .= "</div>";
$string .= "<div style=''>";
	$tt = array('sms@brenat-production.fr','sms.brenatproduction@gmail.com');
	$a = "";
	$string .= "Adresse pour envoi texto : <select id='sms_mail' onchange='glbSendPost(this)' >";	
	foreach ($tt as $k) {
		if ($k==$t_param['sms_mail']) {
			$sel = "selected";
		} else $sel = "";
		$string .= "<option value='".$k."' ".$sel." >".$k."</option>";	
	}
	$string .= "</select>";		
$string .= "</div>";

$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='divBase' style='cursor:pointer;' >
					<img id='pm_divBase' src='images/plus.png' class='iconePM' /><u>Télécharger</u></div>";		
	$string .= "<div id='divBase' style='padding:left:20px;display:none;'>";
		$string .= "<input id='recbase' t='base' style='display:none;' />";	
		$string .= "<input file='recbase' type='button' value='Télécharger la Base' onclick='recupFile(this)' />";
		
		$string .= "<div style='display:inline-block;vertical-align:top;margin-left:30px;'>";
			$string .= "Images :<br>";
			$string .= "<input id='recimages' t='images' style='display:none;' />";
			$string .= "<input file='recimages' type='button' value='Télécharger' onclick='recupFile(this)' />";
			$string .= " &nbsp; <form method='post' enctype='multipart/form-data' >";
			$string .= "<input name='postimages' style='display:none;' />";
			$string .= "<input type='file' name='images' ><input type='submit' value='Charger' />";
			$string .= "</form>";
		$string .= "</div>";
	$string .= "</div>";
$string .= "</div>";

$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='divNode' style='cursor:pointer;' >
					<img id='pm_divNode' src='images/moins.png' class='iconePM' /><u>Websockets</u></div>";		
	$string .= "<div id='divNode' style='padding:left:20px;font-size:90%;'>";
		$string .= "<div> &nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='getNodeDebug();' style='cursor:pointer;' ></span>
					&nbsp;&nbsp;&nbsp; <input type='checkbox' id='actuAutoNodeCB' onchange='setActuAutoNode(this)' />
					<label for='actuAutoNodeCB'> Actualisation automatique</label></div>";
		$string .= "<div id='nodeInfo' style='font-style:italic;font-size:90%;'></div>";
		$string .= "<div id='nodeConnections' ></div>";
		if ($fap->isDev()) $string .= "<div id='nodeVars' style='font-size:90%;margin-top:10px;' ></div>";
	$string .= "</div>";	
$string .= "</div>";

$string .= "<div id='usrList' style='display:none;' >";
foreach ($t_users as $usr => $v) {
	$string .= "<div id='usrNom_".$usr."'  >".getNomUser($usr)."</div>";
}
$string .= "</div>";

			
} else {	
	$string .= "<div id='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= "</div>";
$string .= "<script>initNodeDebug();</script>";

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	