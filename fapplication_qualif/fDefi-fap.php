<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
	
$string .= "<script type='text/javascript' src='scripts/defi.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";


$string .= $string_menu;
	
$nbMaxVoteFreq = 2;
if (isset($t_param['defi_freqask']) and intval($t_param['defi_freqask'])>0) $nbMaxVoteFreq = intval($t_param['defi_freqask']);

function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}
function getMise($dfi) {
	global $fap;
	$sql = "select * from t_defi_dfi where dfi_id=".$dfi;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		return $data['dfi_mise'];
	}	
}
function getOwn($dfi) {
	global $fap;
	$sql = "select * from t_defi_dfi where dfi_id=".$dfi;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		return $data['usr_id'];
	}	
}
function incXp($dfi,$c=1) {
	global $fap;
	$m = getMise($dfi);
	$fap->incPoints($m*$c);
}
function affCoord($v) {
	$aff = "?";
	if ($v!='') $aff = round($v*100)/100;
	return $aff;
}
if (count($_POST)>0) {
	if (isset($_POST['mise'])) {				
		if ($fap->decPower($_POST['mise'])) {
			$sql = "insert into t_defi_dfi (dfi_description,dfi_mise,usr_id,usr_id_defie,dfi_date,
							dfi_delai_accept,dfi_delai_fin) values 
					('".esc($_POST['description'])."',".$_POST['mise'].",".$fap->getId().",".$_POST['defie'].",
					'".strftime("%Y-%m-%dT%H:%M:%S",time())."',".intval($_POST['mise']/10+3).",".$_POST['delai'].")";
			mysql_query($sql,$fap->conn);
			$fap->incPoints($_POST['mise']);
			include_once('communs/mail.php');	
			$mess = "Bonjour ".getNomUser($_POST['defie'])."\r\n\r\n";
			$mess .= $fap->info['nom']." t'a lancé un nouveau défi.\r\n\r\n";
			$mess .= $_POST['description'];
			$mess .= "\r\n\r\nVa vite l'accepter puis tout faire pour le remporter !";
			$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."fDefi-fap.php";
			sendMail($_POST['defie'],$mess,"Nouveau défi");
			sendSms($_POST['defie'],$fap->info['nom']." t'a lancé un nouveau défi");
			sendIfttt($_POST['defie'],$fap->info['nom']." t'a lancé un nouveau défi");
		} else {
			
		}
	}
	if (isset($_POST['accept']) and $_POST['accept']!='') {				
		$m = getMise($_POST['accept']);
		if ($fap->decPower($m)) {
			$sql = "update t_defi_dfi set dfi_date_accept='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where dfi_id=".$_POST['accept'];
			mysql_query($sql,$fap->conn);
			$fap->incPoints($m);
			$usr = getOwn($_POST['accept']);
			include_once('communs/mail.php');	
			$mess = "Bonjour ".getNomUser($usr)."\r\n\r\n";
			$mess .= $fap->info['nom']." a accepté ton défi.\r\n\r\n";
			sendMail($usr,$mess,"Défi accepté");
			sendSms($usr,$fap->info['nom']." a accepté ton défi");
			sendIfttt($usr,$fap->info['nom']." a accepté ton défi");
		}
	}
	if (isset($_POST['refuse']) and $_POST['refuse']!='') {				
		$sql = "update t_defi_dfi set dfi_date_fin='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where dfi_id=".$_POST['refuse'];
		mysql_query($sql,$fap->conn);
		$usr = getOwn($_POST['refuse']);
		include_once('communs/mail.php');	
		$mess = "Bonjour ".getNomUser($usr)."\r\n\r\n";
		$mess .= $fap->info['nom']." a refusé ton défi.\r\n\r\n";
		sendMail($usr,$mess,"Défi rejeté");
		sendSms($usr,$fap->info['nom']." a refusé ton défi");
		sendIfttt($usr,$fap->info['nom']." a refusé ton défi");
	}
	if (isset($_POST['arbitre'])) {				
		include_once('communs/mail.php');
		$mess = $fap->info['nom']." requiert un arbitrage sur la réussite de son défi.";
		$mess .= "\r\n\r\nVa vite donner ton avis pour savoir qui a gagné !";
		$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."fDefi-fap.php";
		function arbitreMe($usr,$mess) {	
			global $fap;
			$mess = "Bonjour ".getNomUser($usr)."\r\n\r\n".$mess;
			sendMail($usr,$mess,"Arbitrage défi");
			sendSms($usr,$fap->info['nom']." attend ton vote");
			sendIfttt($usr,$fap->info['nom']." attend ton vote");
		}	
		if ($_POST['arbitre']!='') {
			arbitreMe($_POST['arbitre'],$mess);
		} else {	
			foreach ($fap->whoIsAdmin('defi') as $usr) {
				arbitreMe($usr,$mess);
			}
		}
		$champ = "";
		$sql = "select * from t_defi_dfi where dfi_id=".$_POST['dfi'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			if ($data['usr_id']==$fap->getId()) $champ = "dfi_request_own";
			if ($data['usr_id_defie']==$fap->getId()) $champ = "dfi_request_guest";
		}
		if ($champ!="") {
			$sql = "update t_defi_dfi set ".$champ."='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where dfi_id=".$_POST['dfi'];
			mysql_query($sql,$fap->conn);
		}	
	}
	
	// vote
	if (isset($_POST['ok_defie']) and $_POST['ok_defie']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_guest=1 where dfi_id=".$_POST['ok_defie'];
		mysql_query($sql,$fap->conn);
		$sql = "select * from t_defi_dfi where dfi_id=".$_POST['ok_defie'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			if (!$data['dfi_date_fin'] or $data['dfi_date_fin']=="") {
				$sql = "update t_defi_dfi set dfi_date_fin='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where dfi_id=".$_POST['ok_defie'];
				mysql_query($sql,$fap->conn);
			}
		}
		$m = getMise($_POST['ok_defie']);
		$fap->incPoints($m*10);
	}
	if (isset($_POST['ok']) and $_POST['ok']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_own=1 where dfi_id=".$_POST['ok'];
		mysql_query($sql,$fap->conn);
		$m = getMise($_POST['ok']);
		$fap->incPoints($m*10);
	}
	if (isset($_POST['no_defie']) and $_POST['no_defie']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_guest=0 where dfi_id=".$_POST['no_defie'];
		mysql_query($sql,$fap->conn);
		$m = getMise($_POST['no_defie']);
		$fap->incPoints($m*5);
	}
	if (isset($_POST['no']) and $_POST['no']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_own=0 where dfi_id=".$_POST['no'];
		mysql_query($sql,$fap->conn);
		$m = getMise($_POST['no']);
		$fap->incPoints($m*5);
	}	
	if (isset($_POST['ok_refer']) and $_POST['ok_refer']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_refer=1, usr_id_refer=".$fap->getId()." where dfi_id=".$_POST['ok_refer'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['no_refer']) and $_POST['no_refer']!='') {				
		$sql = "update t_defi_dfi set dfi_vote_refer=0, usr_id_refer=".$fap->getId()." where dfi_id=".$_POST['no_refer'];
		mysql_query($sql,$fap->conn);
	}
	// recolte
	if (isset($_POST['recolte']) and $_POST['recolte']!='') {
		$sql = "update t_defi_dfi set dfi_recolte=1 where dfi_id=".$_POST['recolte'];
		mysql_query($sql,$fap->conn);
		$m = getMise($_POST['recolte']);	
		$fap->incPoints($m*10);
		$fap->incPower($m*2);
	}
	if (isset($_POST['recup']) and $_POST['recup']!='') {
		$sql = "update t_defi_dfi set dfi_recolte=1 where dfi_id=".$_POST['recup'];
		mysql_query($sql,$fap->conn);
		$m = getMise($_POST['recolte']);	
		$fap->incPower($m);
	}
	
	//debats
	if (isset($_POST['argue']) and $_POST['argue']!='') {
		include_once('communs/mail.php');
		$sql = "insert into t_defi_debats_ddb (dfi_id,ddb_texte,ddb_date,usr_id) values
				(".$_POST['argue'].",'".esc($_POST['txtargue'])."','".strftime("%Y-%m-%dT%H:%M:%S",time())."',".$fap->getId().") ";
		mysql_query($sql,$fap->conn);
		$sql = "select * from t_defi_dfi where dfi_id=".$_POST['argue'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$lst_usr = array();
			if ($data['usr_id']!=$fap->getId()) $lst_usr[] = $data['usr_id'];
			if ($data['usr_id_defie']!=$fap->getId()) $lst_usr[] = $data['usr_id_defie'];
			if ($data['dfi_vote_own']!=$data['dfi_vote_guest'] and $data['dfi_vote_own']!==null and $data['dfi_vote_guest']!==null) {
				foreach ($fap->whoIsAdmin('defi') as $usr) $lst_usr[] = $usr;
			}
			foreach ($lst_usr as $usr) {
				$mess = "Bonjour ".getNomUser($usr)."\r\n\r\n".$fap->info['nom']." a argumenté sa réussite au défi :"."\r\n\r\n";
				$mess .= $_POST['txtargue'];
				$mess .= "\r\n\r\n".$fap->getServerName().$fap->getAppName()."fDefi-fap.php";
				sendMail($usr,$mess,"Plaidoyer défi");
				sendSms($usr,$fap->info['nom']." argumente son défi");
				sendIfttt($usr,$fap->info['nom']." argumente son défi");
			}
		}
	}
	
	$string .= "<script>document.location.replace(document.location.href.split('#')[0])</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}


//mise a jour defi depassés
$sql = "select * from t_defi_dfi where dfi_date_accept is null or dfi_date_accept=''";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {	
	$d = makeDate($data['dfi_date'])+$data['dfi_delai_accept']*86400;
	if ($d<time()) {
		$sql = "update t_defi_dfi set dfi_date_fin='".strftime("%Y-%m-%dT%H:%M:%S",$d)."' where dfi_id=".$data['dfi_id'];
		mysql_query($sql,$fap->conn);
	}	
}
$sql = "select * from t_defi_dfi where (dfi_date_fin is null or dfi_date_fin='') 
			and (dfi_date_accept is not null and dfi_date_accept!='')";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {	
	$d = makeDate($data['dfi_date_accept'])+$data['dfi_delai_fin']*86400;
	if ($d<time()) {
		$sql = "update t_defi_dfi set dfi_date_fin='".strftime("%Y-%m-%dT%H:%M:%S",$d)."' where dfi_id=".$data['dfi_id'];
		mysql_query($sql,$fap->conn);
	}	
}

	

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete'>";
$string .= "Fap Défi";
$string .= "</div>";

$string .= "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$string .= "<span class='glyphicon glyphicon-question-sign'></span>";
$string .= "</div>";
$string .= "<div id='explique' style='text-align:right;display:none;margin-bottom:20px;'>";
$string .= "<div style='display:inline-block;text-align:left;font-style:italic;'>";
$string .= "Pour lancer un défi on mise entre 10 et 50pv.
			<br>C'est la mise qui conditionne les gains futurs :
			<br> - on ne peut défier qu'un fappeur qui a au moins la mise en pv
			<br> - au lancement du défi le défieur gagne la mise en pts <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (et perd la mise en pv)
			<br> - à l'acceptation du défi le défié gagne la mise en pts <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (et perd la mise en pv)
			<br> - pendant la durée du défi, défieur et défié choisissent<br> &nbsp;&nbsp;&nbsp;quels faps pertinents sont rendus visibles
			<br> - aux votes, défieur et défié gagnent 5 fois la mise en pts <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (*2 si le défi est réussi)
			<br> - après arbitrage éventuel d'un admin si désaccord,
			<br> &nbsp; le vainqueur du défi rafle les deux mises en pv
			<br> &nbsp; et un bonus de 10 fois la mise en pts
			<br>Si le défi est refusé, le défieur récupère sa mise";
$string .= "</div>";
$string .= "</div>";

$string .= "<div id='listeFappeurs' style='display:none;'>";
foreach ($t_users as $usr => $v) {
	if ($usr!=$fap->getId()) {
		$info = $fap->logGetInfo($usr);
		$lvl = $fap->logGetLevel($usr);
		$string .= "<div id='fappeur_".$usr."' usr='".$usr."' nom=\"".$info['nom']."\" 
						power='".$lvl['power']."' niveau='".$lvl['niveau']."' ></div>";
	}	
}
$string .= "</div>";


function votePlease($dfi, $avote=true, $usr="") {
	global $fap;
	$s = "";
	if ($usr!=$fap->getId() and $avote) {
		$s .= " &nbsp; <form method='post' style='display:inline-block;' >";
		$s .= "<input name='arbitre' value='".$usr."' style='display:none;' />";
		$s .= "<input name='dfi' value='".$dfi."' style='display:none;' />";
		$s .= "<input type='submit' value=\"Demander le vote\" />";
		$s .= "</form>";
	}
	return $s;
}

$sql = "select * from t_defi_dfi where dfi_date_fin is null and usr_id=".$fap->getId();
$req = mysql_query($sql,$fap->conn);
$nb = mysql_num_rows($req);
if ($nb<5) {		
	if ($fap->level['power']>=10) {			
		$max = intval($fap->level['power']/10)*10;
		$string .= "<div class='eltBlocFond' >";
		$string .= "<div div='defi_new' onclick='affDiv(this)' style='cursor:pointer;' >";
			$string .= "<b>Lancer un Défi</b> &nbsp; <i>(tu as ".$fap->level['power']."pv)</i>";
		$string .= "</div >";
		$string .= "<div id='defi_new' style='display:none;' >";
			$string .= "<form method='post' onsubmit='return confirm(\"Lancer le défi ?\");'>";
			$string .= "<div style='display:inline-block;'>";
				$string .= "<div class='powerXP herosH xpInline' style='height:25px;vertical-align:middle;margin-right:10px;' >";
					$string .= "<div class='powerXPfill' style='height:100%;' ></div>";
					$string .= "<div class='powerXPfilltop' style='bottom:100%;' ></div>";
				$string .= "</div>";
				$string .= "<input name='mise' id='mise' type='number' min='10' max='".$max."' step='10' value='10' 
								onchange='actuListeDefie();lanceDefi();' style='width:60px;' /> pv";
			$string .= "</div >";
			$string .= "<div style='display:inline-block;'>&nbsp; Défier ";		
			$string .= "<select name='defie' id='defie' onchange='lanceDefi();' ></select></div>";
			$string .= "<div style='display:inline-block;'>&nbsp; Délai: ";
			$string .= "<input name='delai' type='number' min='10' max='30' step='1' value='10' style='width:50px;' /> j</div>";
			$string .= "<br><span style='font-style:italic;font-size:80%'>Décris ici ton défi, sois clair afin qu'il n'y ait pas d'ambiguité</span>";
			$string .= "<br><textarea name='description' id='description' cols='80' style='max-width:90%;' oninput='lanceDefi();' ></textarea>";
			$string .= "<br><input id='submit' type='submit' value='Défier' disabled />";
			$string .= "</form>";
		$string .= "</div >";	
		$string .= "</div>";
	} else {		
		$string .= "<div class='divMessage'>";
		$string .= "Tu n'as pas assez de pouvoir, vas vite en <a href='iLevel-infos.php'>acheter</a> 
					ou en sortir de ton <a href='iCoffre-infos.php'>coffre</a>";
		$string .= "</div>";		
	}
} else {
	$string .= "<div class='divMessage'>";
	$string .= "Tu as atteint la limite de défis simultanés";
	$string .= "</div>";
}

$lances = "";
$encours = "";
$approbs = "";
$termines = "";
$abandons = "";
$recTermines = false;
$recAbandons = false;
$sql = "select * from t_defi_dfi ";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$s = "<div class='eltBlocFond' >";
	
	$e = 'lance';
	if ($data['dfi_date_accept']=='') {
		$delai = $data['dfi_delai_accept']*86400-(time()-makeDate($data['dfi_date']));
		if ($delai<0 or $data['dfi_date_fin']!='') $e = 'abandon';
	} else if ($data['dfi_date_fin']=='') {
		$delai = $data['dfi_delai_fin']*86400-(time()-makeDate($data['dfi_date_accept']));
		$e = 'cours';
		if ($delai<0) $e = 'fin';
	} else {
		$delai = makeDate($data['dfi_date_fin'])-makeDate($data['dfi_date_accept']);
		$e = 'fin';
		if ($data['dfi_vote_own']===null or $data['dfi_vote_guest']===null 
				or ($data['dfi_vote_refer']===null and $data['dfi_vote_own']!=$data['dfi_vote_guest']))
			$e = 'approb';
	}
	
	$s .= "<div div='defi_".$data['dfi_id']."' onclick='affDiv(this)' style='cursor:pointer;font-weight:bold;' >";
		$s .= "".getNomUser($data['usr_id'])." → ".getNomUser($data['usr_id_defie']);
		$s .= " &nbsp; en ".$data['dfi_delai_fin']."j";
		$s .= " &nbsp; <i>(".(2*intval($data['dfi_mise']))."pv)</i>";
		if (!$data['dfi_recolte'] and ($e=='fin' or $e=='abandon')) 
			$s .= "<img src='images/sous.png' style='float:right;height:30px;' >";
	$s .= "</div >";
	
	$st = "style='display:none;'";
	$affdirect = false;
	if (($data['usr_id_defie']==$fap->getId() or $data['usr_id']==$fap->getId()) 
		and ($e=='lance' or $e=='cours' or $e=='approb')) {
			$st = "";
			if ($e=='cours' or $e=='approb') $affdirect = true;
	}
	$s .= "<div id='defi_".$data['dfi_id']."' ".$st." >";
	$des = str_replace("\n","<br>",$data['dfi_description']);	
	$lim = 150;
	$st = "";
	if (strlen($data['dfi_description'])>$lim and $affdirect) {
		$desdeb = substr($data['dfi_description'],0,$lim);
		$st = "style='display:none;'";
		$s .= "<div >".str_replace("\n","<br>",$desdeb).
				"<input div='defides_".$data['dfi_id']."' onclick='affDivComp(this)' value='...' type='button' />
				</div >";
	}
	$s .= "<div id='defides_".$data['dfi_id']."' ".$st." >".str_replace("\n","<br>",$data['dfi_description'])."</div >";
	
	if ($data['usr_id_defie']==$fap->getId()) {
		if ($e=='lance') {
			$dis = "";
			$inf = "";
			if ($fap->level['power']<$data['dfi_mise']) {
				$dis = "disabled";
				$inf = "<br><i>Mais tu n'as pas assez de pouvoir, vas vite en <a href='iLevel-infos.php'>acheter</a> 
							ou en sortir de ton <a href='iCoffre-infos.php'>coffre</a></i>";
			}
			$s .= "<br> &nbsp; <form method='post' style='display:inline-block;' >";
			$s .= "<input name='accept' value='".$data['dfi_id']."' style='display:none;' />";
			$s .= "<input type='submit' value='Accepter pour ".$data['dfi_mise']."pv' ".$dis." />";
			$s .= "</form>";
			$s .= " &nbsp; <form method='post' style='display:inline-block;' >";
			$s .= "<input name='refuse' value='".$data['dfi_id']."' style='display:none;' />";
			$s .= "<input type='submit' value='Refuser' />";
			$s .= "</form>";
			$s .= "<br><i> → Il te reste ".affDuree($delai)." pour accepter</i>";
			$s .= $inf;
		}
		if ($e=='cours') {
			$s .= "<br><i> → Il te reste ".affDuree($delai)." pour le réussir</i>";
		}
		if ($data['dfi_vote_guest']===null) {
			if ($e=='cours' or $e=='approb') {	
				$s .= "<br> &nbsp; <form method='post' style='display:inline-block;' >";
				$s .= "<input name='ok_defie' value='".$data['dfi_id']."' style='display:none;' />";
				$s .= "<input type='submit' value=\"J'ai réussi\" />";
				$s .= "</form>";
			}
			if ($e=='approb') {	
				$s .= " &nbsp; <form method='post' style='display:inline-block;' >";
				$s .= "<input name='no_defie' value='".$data['dfi_id']."' style='display:none;' />";
				$s .= "<input type='submit' value=\"J'ai raté\" />";
				$s .= "</form>";
			}	
		}
	}
	if ($data['usr_id']==$fap->getId()) {
		if ($e=='lance') {
			$s .= "<br><i> → Il reste ".affDuree($delai)." pour accepter</i>";
		}
		if ($e=='cours') {
			$s .= "<br><i> → Il reste ".affDuree($delai)." pour réussir</i>";
		}
		if ($data['dfi_vote_own']===null) {
			if ($e=='approb') {	
				$s .= "<br> &nbsp; <form method='post' style='display:inline-block;' >";
				$s .= "<input name='ok' value='".$data['dfi_id']."' style='display:none;' />";
				$s .= "<input type='submit' value=\"C'est réussi\" />";
				$s .= "</form>";
				$s .= " &nbsp; <form method='post' style='display:inline-block;' >";
				$s .= "<input name='no' value='".$data['dfi_id']."' style='display:none;' />";
				$s .= "<input type='submit' value=\"C'est raté\" />";
				$s .= "</form>";
			}	
		}	
	}
	
	if ($e=='approb') {	
		$s .= "<br><i> → Défi terminé en ".affDuree($delai)."</i>";
	}	
	$sum = $data['dfi_vote_own'] + $data['dfi_vote_guest'] + $data['dfi_vote_refer'];
	if ($e=='fin') {
		if ($sum<=1) $ok = "manqué";
		if ($sum>=2) $ok = "réussi";
		$s .= "<br><i> → Défi ".$ok." en ".affDuree($delai)."</i>";
	}
	if ($e=='abandon') {
		$s .= "<br><i> → Défi abandonné</i>";
	}	
		
	if (!$data['dfi_recolte'] and ($data['dfi_vote_own']==$data['dfi_vote_guest'] or $data['dfi_vote_refer']!==null)
		and $data['dfi_vote_own']!==null and $data['dfi_vote_guest']!==null 	
		and (($data['usr_id']==$fap->getId() and $sum<=1) or ($data['usr_id_defie']==$fap->getId()) and $sum>=2)) {
		$s .= "<div ><form method='post' ><input name='recolte' value='".$data['dfi_id']."' style='display:none;' />";
		$s .= "<input type='submit' value='Récolter' onclick='gainXP(this);' />";
		$s .= "</form></div >";
		$recTermines = true;			
	}

	if (!$data['dfi_recolte'] and $data['dfi_date_accept']===null and $data['dfi_date_fin']!==null and $data['usr_id']==$fap->getId()) {
		$s .= "<div ><form method='post' ><input name='recup' value='".$data['dfi_id']."' style='display:none;' />";
		$s .= "<input type='submit' value='Récupérer ma mise' />";
		$s .= "</form></div >";
		$recAbandons = true;
	}	
	
	$refer = ($fap->isAdmin('defi') and $fap->getId()!=$data['usr_id'] and $fap->getId()!=$data['usr_id_defie']
				and $data['dfi_vote_own']!==null and $data['dfi_vote_guest']!==null 
				and $data['dfi_vote_own']!=$data['dfi_vote_guest']);
	

	if ($data['dfi_date_accept']!='') {		

		if (!$data['dfi_recolte']) {
			$st = "";
			$pm = "moins";
		} else {
			$st = "display:none;";
			$pm = "plus";
		}
		// votes
		$s .= "<div style='margin-top:10px;font-size:80%;cursor:pointer;' onclick='affDiv(this)' div='vote".$data['dfi_id']."' >
					<img id='pm_vote".$data['dfi_id']."' src='images/".$pm.".png' class='iconePM iconePM80' /> <u>Votes</u></div>";
		$s .= "<div id='vote".$data['dfi_id']."' style='font-size:80%;".$st."'>";
			$avote = ($data['dfi_vote_guest']!==null and 
				($data['dfi_request_guest']===null or makeDate($data['dfi_request_guest'])<time()-3600*$nbMaxVoteFreq));
			$ok = ($data['dfi_vote_own']===null?"?".votePlease($data['dfi_id'],$avote,$data['usr_id']):($data['dfi_vote_own']?"réussi":"raté"));
			$s .= "<div> ".getNomUser($data['usr_id'])." : ".$ok."</div>";
			$avote = ($data['dfi_vote_own']!==null and 
				($data['dfi_request_own']===null or makeDate($data['dfi_request_own'])<time()-3600*$nbMaxVoteFreq));
			$ok = ($data['dfi_vote_guest']===null?"?".votePlease($data['dfi_id'],$avote,$data['usr_id_defie']):($data['dfi_vote_guest']?"réussi":"raté"));
			$s .= "<div> ".getNomUser($data['usr_id_defie'])." : ".$ok."</div>";
			if ($data['dfi_vote_own']!==null and $data['dfi_vote_guest']!==null and $data['dfi_vote_own']!=$data['dfi_vote_guest']) {
				$avote = (($data['usr_id']==$fap->getId() and 
						($data['dfi_request_own']===null or makeDate($data['dfi_request_own'])<time()-3600*$nbMaxVoteFreq))
					or ($data['usr_id_defie']==$fap->getId() and 
						($data['dfi_request_guest']===null or makeDate($data['dfi_request_guest'])<time()-3600*$nbMaxVoteFreq)));
				$ok = ($data['dfi_vote_refer']===null?"?".votePlease($data['dfi_id'],$avote):($data['dfi_vote_refer']?"réussi":"raté"));
				$s .= "<div> Arbitrage".($data['usr_id_refer']?" (".getNomUser($data['usr_id_refer']).")":"")." : ".$ok."</div>";
				if ($data['dfi_vote_refer']===null and $refer) {
					$s .= "<div> &nbsp; <form method='post' style='display:inline-block;' >";
					$s .= "<input name='ok_refer' value='".$data['dfi_id']."' style='display:none;' />";
					$s .= "<input type='submit' value=\"C'est réussi\" />";
					$s .= "</form>";
					$s .= " &nbsp; <form method='post' style='display:inline-block;' >";
					$s .= "<input name='no_refer' value='".$data['dfi_id']."' style='display:none;' />";
					$s .= "<input type='submit' value=\"C'est raté\" />";
					$s .= "</form></div>";
				}	
			}
		$s .= "</div>";	
		
		// debats
		$deb = false;
		$sdeb = "<div style='margin-top:10px;font-size:80%;cursor:pointer;' onclick='affDiv(this)' div='argue".$data['dfi_id']."' >
				<img id='pm_argue".$data['dfi_id']."' src='images/plus.png' class='iconePM iconePM80' /> <u>Débats</u></div>
				<div id='argue".$data['dfi_id']."' style='display:none;font-size:80%;'>";
		$sql = "select * from t_defi_debats_ddb where dfi_id=".$data['dfi_id']." order by ddb_date";
		$req2 = mysql_query($sql,$fap->conn);
		if (mysql_num_rows($req2)>0) {
			$s .= $sdeb;
			$deb = true;
			while ($data2 = mysql_fetch_array($req2)) {
				$s .= "<div><b> ".getNomUser($data2['usr_id'])."</b> : (".strftime("%d/%m %H:%M",makeDate($data2['ddb_date'])).")</div>";
				$s .= "<div style='margin-left:1em;font-style:italic;'>".str_replace("\n","<br>",$data2['ddb_texte'])."</div>";
			}
		}		
		if (($data['dfi_vote_refer']===null 
			and (
				$data['dfi_vote_own']!=$data['dfi_vote_guest'] or $data['dfi_vote_own']===null or $data['dfi_vote_guest']===null)
				)
			and (
				$data['usr_id']==$fap->getId() or $data['usr_id_defie']==$fap->getId()or 
				($refer and $data['dfi_vote_own']!=$data['dfi_vote_guest'] and $data['dfi_vote_own']!==null and $data['dfi_vote_guest']!==null)
				)) {
			if (!$deb) {
				$s .= $sdeb;
				$deb = true;
			}				
			$s .= "<form method='post' ><input name='argue' value='".$data['dfi_id']."' style='display:none;' />";
			$s .= "<b>Nouveau :</b><br><textarea name='txtargue' cols='80' style='max-width:90%;' ></textarea>";
			$s .= "<br><input type='submit' value='Argumenter' />";
			$s .= "</form>";
		}
		if ($deb) $s .= "</div>";
	
		// faps
		if ($data['usr_id']==$fap->getId() or $data['usr_id_defie']==$fap->getId() or $refer) {
			$s .= "<div style='margin-top:10px;font-size:80%;cursor:pointer;' onclick='affDiv(this)' div='fap".$data['dfi_id']."' >
					<img id='pm_fap".$data['dfi_id']."' src='images/plus.png' class='iconePM iconePM80' /> <u>Détails des faps</u></div>";
			$s .= "<div id='fap".$data['dfi_id']."' style='display:none;font-size:80%;'>";
			
				$s .= "<div id='seek".$data['dfi_id']."' style='display:none;'>
					<iframe src='' width='400' height='300' id='seek".$data['dfi_id']."Frame' style='max-width:90%;'></iframe>
					</div >";
			
				if ($data['dfi_date_fin']!='') $fin = $data['dfi_date_fin'];
				else $fin = strftime("%Y-%m-%dT%H:%M:%S",makeDate($data['dfi_date_accept'])+$data['dfi_delai_fin']*86400);
				$sql = "select * from t_faplogs_fap where usr_id in (".$data['usr_id'].",".$data['usr_id_defie'].")
						and (fap_date between '".$data['dfi_date_accept']."' and '".$fin."')
						order by (usr_id=".$data['usr_id']."), fap_date";
				$req2 = mysql_query($sql,$fap->conn);
				$ss = "";
				while ($data2 = mysql_fetch_array($req2)) {	
					if ($data2['usr_id']==$fap->getId() or $data2['fap_defi']) {
						$ss .= "<br>";
						if ($data2['usr_id']==$fap->getId()) {
							$ss .= "<input type='checkbox' onchange='changeFapDefi(this)' id='fap_defi_".$data2['fap_id']."'
								fap='".$data2['fap_id']."' ".($data2['fap_defi']?"checked":"")." />";
							$ss .= "<label for='fap_defi_".$data2['fap_id']."'>";
						}
						$ss .= " ".getNomUser($data2['usr_id'])." : ".strftime("%d/%m %Hh%M",makeDate($data2['fap_date']));
						$ss .= " <i>(lat:".affCoord($data2['fap_pos_latitude']).", lon:".affCoord($data2['fap_pos_longitude']).")</i>";
						if ($data2['usr_id']==$fap->getId()) {
							$ss .= "</label>";
						}
						if ($data2['fap_pos_latitude']) 
							$ss .= "&nbsp;<div fap='".$data2['fap_id']."' dfi='".$data['dfi_id']."' onclick='affPosFap(this)' 
										title='Voir ce Fap' class='imgDelete imgVoir' style='display:inline-block;' >&nbsp;</div>";
					}
				}
				if (mysql_num_rows($req2)==0) $s .= "<div style='margin-left:1em;font-style:italic;'>Pas de faps...</div>";
				else if ($ss=="") $s .= "<div style='margin-left:1em;font-style:italic;'>Aucun fap visible...</div>";
				else $s .= $ss;
			$s .= "</div>";
		}	
	}
		
	$s .= "</div >";
	$s .= "</div>";
	if ($e=='lance') $lances .= $s;
	if ($e=='cours') $encours .= $s;
	if ($e=='approb') $approbs .= $s;
	if ($e=='fin') $termines .= $s;
	if ($e=='abandon') $abandons .= $s;
}


$string .= "<div style='display:none;'>
			<img src='images/moins.png' class='iconePM' />
			<img src='images/plus.png' class='iconePM' />
			</div>";
			

if ($lances!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='defislances' style='cursor:pointer;' >
					<img id='pm_defislances' src='images/moins.png' class='iconePM' /><u>Défis lancés</u></div>";	
	$string .= "<div id='defislances'>".$lances."</div>";
	$string .= "</div>";
}
if ($encours!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='defisencours' style='cursor:pointer;' >
					<img id='pm_defisencours' src='images/moins.png' class='iconePM' /><u>Défis en cours</u></div>";	
	$string .= "<div id='defisencours'>".$encours."</div>";
	$string .= "</div>";
}
if ($approbs!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='defisapprobs' style='cursor:pointer;' >
					<img id='pm_defisapprobs' src='images/moins.png' class='iconePM' /><u>Défis en approbation</u></div>";		
	$string .= "<div id='defisapprobs'>".$approbs."</div>";
	$string .= "</div>";
}
$dis = ($recTermines?"":"display:none;");
$pm = ($recTermines?"moins":"plus");
if ($termines!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='defistermines' style='cursor:pointer;' >
					<img id='pm_defistermines' src='images/".$pm.".png' class='iconePM' /><u>Défis terminés</u></div>";		
	$string .= "<div id='defistermines' style='".$dis."'>".$termines."</div>";
	$string .= "</div>";
}
$dis = ($recAbandons?"":"display:none;");
$pm = ($recAbandons?"moins":"plus");
if ($abandons!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='defisabandons' style='cursor:pointer;' >
					<img id='pm_defisabandons' src='images/".$pm.".png' class='iconePM' /><u>Défis abandonnés</u></div>";		
	$string .= "<div id='defisabandons' style='".$dis."'>".$abandons."</div>";
	$string .= "</div>";
}

$string .= "</div>";
	
$string .= $string_banner;
$string .= "<script>actuListeDefie();</script>";
$string .= "</body></html>";
echo $string;