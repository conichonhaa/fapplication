<?php
include_once('communs/menu.php');
include_once('communs/log.php');
include_once('communs/mail.php');

$xml = "<xml>";

if (isset($_GET['nbfap'])) {	
	$usr = "all";
	$where = " where";
	$sql = "select count(*) as c from t_faplogs_fap";
	if (isset($_GET['justme'])) {
		$sql .= " where usr_id=".$fap->getId()."";
		$usr = $fap->getId();
		$where = " and";
	}
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$xml .= "<nbfap usr='".$usr."' date='".strftime("%Y-%m-%dT%H:%M:%S",time())."' >".$data['c']."</nbfap>";
	}
	$date = null;
	if (isset($_GET['date'])) $date=$_GET['date']; else $date=$fap->catchRecupDate();
	if ($usr=="all" and $date) {
		$tnoms = array();
		$sql = "select * from t_faplogs_fap as fap 
				where (fap_date>'".$date."' or fap_declare>'".$date."' or fap_offline>'".$date."') 
				and fap.usr_id<>".$fap->getId()." order by fap_date";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			$force = ($fap->hasCapacity('catch') or $fap->isCatchForce($data['fap_id']));
			$possible = true;
			$sql2 = "select * from t_fapcatch_fch where fap_id=".$data['fap_id']." and usr_id=".$fap->getId();
			$req2 = mysql_query($sql2,$fap->conn);
			if ($data2 = mysql_fetch_array($req2)) {
				$possible = false;
			}			
			$sql2 = "select fch.* from t_fapcatch_fch as fch
					join t_faplogs_fap as fap on fch.fap_id=fap.fap_id
					where fch_date>'".$date."' and fch.usr_id=".$data['usr_id']." and fap.usr_id=".$fap->getId()." 
					order by fch_date";
			$req2 = mysql_query($sql2,$fap->conn);
			if ($data2 = mysql_fetch_array($req2)) {
				$possible = false;
			}	
			if ($fap->hasCapacity('invisible',$data['usr_id']) and !$force) {
				$possible = false;
			}
			if (!$fap->isCatchAuth() and !$force) {
				$possible = false;
			}	
			//inscription
			if ($possible) {
				$tnoms[$data['usr_id']] = array('nom'=>$t_users[$data['usr_id']]['nom'],'fap'=>$data['fap_id']);
			}			
		}
		foreach ($tnoms as $id => $t) {
			$xml .= "<noms usr='".$id."' fap='".$t['fap']."'>".$t['nom']."</noms>";
		}
	}
	if (isset($_GET['date'])) $date=$_GET['date']; else $date=$fap->catchedRecupDate();
	if ($usr=="all" and $date) {
		$tnoms = array();
		$sql = "select fch.* from t_fapcatch_fch as fch
				join t_faplogs_fap as fap on fch.fap_id=fap.fap_id
				where fch_date>'".$date."' and fap.usr_id=".$fap->getId()." order by fch_date";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			$tnoms[$data['usr_id']] = array('nom'=>$t_users[$data['usr_id']]['nom'],'date'=>$data['fch_date']);
		}
		foreach ($tnoms as $id => $t) {
			$xml .= "<catchs date='".$t['date']."'>".$t['nom']."</catchs>";
		}
	}
	$class = "fondCompteur";
	if ($fap->isCatchable() and !$fap->hasCapacity('invisible')) {
		$class .= " fondCompteurCatchable";
		$xml .= "<catchlimit>".makeDate($fap->getDateCatchable())."</catchlimit>";
		$xml .= "<catchdelai>".$fap->getDelaiCatchable()."</catchdelai>";
	}
	$xml .= "<class >".$class."</class>";
}

if (isset($_GET['catchfap']) and isset($_GET['fap'])) {	
	$usr = $_GET['catchfap'];
	$fapid = $_GET['fap'];
	$info = $fap->logGetInfo($usr);
	if ($date = $fap->catchFap($fapid)) {
		$d = makeDate($date);
		$jour = strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d)." à ".strftime("%Hh%M",$d);
		$message = "Bonjour ".$info['nom'];
		$message .= "\r\n\r\nLe ".$jour.", tu as été attrapé en train de fapper par ".$fap->info['nom'].".";
		$message .= "\r\nIl ne te reste plus qu'à faire la poignée de main secrète la prochaine fois que tu le verras.";							   
		sendMail($usr,$message,'Tu as Fappé !');
		sendSms($usr,$fap->info['nom']." t'a attrapé");
		sendIfttt($usr,$fap->info['nom']." t'a attrapé");
		$xml .= "<catchfap usr='".$usr."' >".$info['nom']."</catchfap>";
	} else {
		$xml .= "<catcherr>".$fap->errCatch."</catcherr>";
	}
}

if (isset($_GET['defifap'])) {	
	if ($_GET['defifap']!='') {
		$usr = $_GET['defifap'];
	} else {		
		foreach ($t_users as $usr => $v) {				
			if ($usr!=$fap->getId()) $tpart[] = $usr;
		}
		$k = rand(0,count($tpart)-1);
		$usr = $tpart[$k];
	}	
	$sql = "select count(*) as c, usr_id from t_faplogs_fap where usr_id in (".$fap->getId().",".$usr.") group by usr_id ";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		if ($data['usr_id']==$fap->getId()) $me = $data['c'];
		else $you = $data['c'];
	}
	$nb = 180*($me/($me+$you));
	if ($you<$me) {
		if ($you<$me*0.7) $txt = "Ca gagne";
		else $txt = "Ca gagne, mais attention à ne pas s'endormir";
	} else if ($you==$me) {
		$txt = "Attention, c'est sur la limite";
	} else {
		if ($you*0.7>$me) $txt = "Oh la la, c'est la cata";
		else $txt = "Allez encore en petit effort";
	}
	//$info = $fap->logGetInfo($usr);
	//$xml .= "<defifap usr='".$usr."' nom=\"".getNomUser($usr)."\" img='".$info['img_id']."' nb='".$nb."' >".$txt."</defifap>";
	$info = $fap->logGetInfo($usr);
        $img = $info['img_id'] ?? '';
        $xml .= "<defifap usr='".$usr."' nom=\"".getNomUser($usr)."\" img='".$img."' nb='".$nb."' >".$txt."</defifap>";
}

if (isset($_GET['connexion'])) {
	$t_last = array();
	foreach ($t_users as $usr => $u) {				 
		//$date = $fap->getLastConn($usr)[1];
		$last = $fap->getLastConn($usr);
                if (!is_array($last) || !isset($last[1])) {
                        continue;
                }

                $date = $last[1];
		$now = affDelai($date);
		if ($now=='en cours' and $usr!=$fap->getId()) {
			//$cc = $fap->getLastConn($usr);
			//$duree = "".affDuree(makeDate($cc[1])-makeDate($cc[0]),1)."";
			$duree = affDuree(makeDate($last[1]) - makeDate($last[0]), 1);
                        $info = $fap->logGetInfo($usr);
                        if (!is_array($info)) $info = [];

                        $img = $info['img_id'] ?? '';
			//$info = $fap->logGetInfo($usr);
			//$xml .= "<connexion usr='".$usr."' nom=\"".getNomUser($usr)."\" img='".$info['img_id']."' duree='".$duree."' >".$now."</connexion>";
			$xml .= "<connexion usr='".$usr."' nom=\"".getNomUser($usr)."\" img='".$img."' duree='".$duree."' >".$now."</connexion>";
		}
	}
}	

if (isset($_GET['chat'])) {
	if ($chatInteractif) {
		$t = time();
		$see = (isset($_SESSION['fap']['chat']['see'])?$_SESSION['fap']['chat']['see']:"");
		$chat = "";
		$sql = "select * from t_parametrage_par where par_code='network_chatpost'";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$v = intval($data['par_valeur']);
			if ($t-$v<3600) $chat = $v;
		}
		$xml .= "<chat message='".$chat."' see='".$see."' />";
		$_SESSION['fap']['chat']['see'] = $t;
	}
}

if (isset($_GET['network'])) {
	$t = time();
	$sql = "select * from t_parametrage_par where par_code='network_call'";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$tt2 = array();
		if ($data['par_valeur']!='') {
			$tt = json_decode($data['par_valeur'],true);
			foreach ($tt as $code => $v) {
				if ($v['time']>$t-300) {
					$tt2[$code] = $v;
					$txt = "";
					for ($l=0; $l<count($v['from']); $l++) {
						if ($txt!="") $txt .= ", ";
						$txt .= getNomUser($v['from'][$l]);
					}
					if ($v['type']=='game') {
						$txt .= " invite".(count($v['from'])>1?"nt":"")." à jouer à ";
						$txt .= "<a href='g".ucfirst($code)."-game.php' >".$t_games[$code]."</a>";
					}
					if ($v['type']=='chat') {
						$txt .= " invite".(count($v['from'])>1?"nt":"")." à ";
						$txt .= "<a href='fChat-fap.php' >chatter</a>";
					}
					if ($networkInvitation) $xml .= "<network code='".$code."' >".$txt."</network>";
				}
			}
		}
		$json = json_encode($tt2);
		$sql = "update t_parametrage_par set par_valeur='".$json."' where par_code='network_call'";
		mysql_query($sql,$fap->conn);
	}
}	

if (isset($_GET['chrono'])) {
	$t = time();
	$last = $fap->getLastFap(null,true);
	if ($last) {					
		$d = $t-makeDate($last);
		$xml .= "<chrono code='Page' delay='".$d."' ></chrono>";
		$xml .= "<chrono code='All' delay='".$d."' ></chrono>";
	}
	$usr_id = ($usrDebug!=""?$usrDebug:$fap->getId());
	$last = $fap->getLastFap($usr_id);
	if ($last) $xml .= "<chrono code='Me' delay='".($t-makeDate($last))."' ></chrono>";
}

if (isset($_GET['fallback'])) {
	$date = $fap->getLastFap();
	$xml .= "<info usr='".$fap->getId()."' nom=\"".getNomUser($fap->getId())."\" img='".$fap->info['img_id']."' last='".$date."'
				d='".makeDate($date)."' groggy='".$fap->getFapGroggy()."' confGeoloc='".$fap->info['confirm_geoloc']."'
				></info>";
}	



$xml .= "</xml>";
header("Content-type: text/xml");
echo $xml;
