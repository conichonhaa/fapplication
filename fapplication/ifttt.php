<?php
include_once('communs/menu.php');
include_once('communs/funcFap.php');
include_once('communs/mail.php');


if (isset($_GET['usr']) and $_GET['usr']!='') {
	if (isset($_SERVER['HTTP_X_NEWRELIC_ID']) and isset($_GET['key'])) {	
		$sql = 'select * from t_utilisateurs_usr as usr
				left join t_user_key_usk as usk on usk.usr_id=usr.usr_id
				where usr.usr_id='.$_GET['usr'];
		$req = mysql_query($sql,$fap->conn);
		if ($data_usr = mysql_fetch_array($req)) {
			$deviceKnown = false;
			$date = strftime("%Y-%m-%dT%H:%M:%S",time());
			$lat = 'null';
			$lon = 'null';
			$acc = 'null';
			if (count($_POST)>1) {
				foreach ($_POST as $key => $val) {
					if ($key=='z') $acc = $val;
					else {
						$tt = explode(',',$val);
						if (count($tt)>1) {
							$lat = $tt[0];
							$lon = $tt[1];
						}
					}
				}	
			}	
			if ($lat=='null') $acc = 'null';
			
			if ($fap->logFromForeignKey($_GET['usr'],$_SERVER['HTTP_X_NEWRELIC_ID'],$_GET['key'])) {
				if ($data_usr['usk_actif']) {
					if ($fap->isFapAuth($date)) {
						$id = fapInBase($date,$lat,$lon,$acc);
						sendIfttt($_GET['usr'],"Fap enregistré",'',true);
						$t_users = $fap->getListUsers();
						if ($id) {
							$sql = "UPDATE t_faplogs_fap set fap_ifttt=1 where fap_id=".$id;
							mysql_query($sql,$fap->conn);
							$sql = "select * from t_parametrage_par as par
									join t_incubateur_icb as icb on icb.icb_id=par.par_valeur
									where icb_vote<icb_cible and icb_valide=1 and par_code='incub_defaut'";
							$req = mysql_query($sql,$fap->conn);
							if ($data_vote = mysql_fetch_array($req)) {
								$icb = $data_vote['icb_id'];
								$sql = "update t_faplogs_fap set icb_id=".$icb." where fap_id=".$id;
								mysql_query($sql,$fap->conn);
								$sql = "update t_incubateur_icb set icb_vote=(select count(*) as c from t_faplogs_fap where icb_id=".$icb.") where icb_id=".$icb;
								mysql_query($sql,$fap->conn);	
								$sql = "update t_incubateur_icb set icb_date='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where icb_id=".$icb;
								mysql_query($sql,$fap->conn);		
								$fap->incPoints(1);
								$sql = "select * from t_incubateur_icb where icb_vote=icb_cible and icb_id=".$icb;
								$req = mysql_query($sql,$fap->conn);	
								if ($data = mysql_fetch_array($req)) {
									$mess = "Bonjour ".getNomUser($data['usr_id'])."\r\n\r\n";
									$mess .= "Félicitations, ton projet ".$data['icb_titre']." a été fapprouvé !!!";
									$mess .= "\r\n\r\nTu peux aller récolter les voix obtenues !";
									$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."sIncub-stats.php";
									sendMail($data['usr_id'],$mess,"Ton projet a été fapprouvé");
									sendSms($data['usr_id'],"Ton projet a été fapprouvé");
									sendIfttt($data['usr_id'],"Ton projet a été fapprouvé");
								}	
							}
						}
						$t_list = fapCheckCapacity();
						foreach ($t_list as $k => $v) {
							$message = "Bonjour ".getNomUser($v['to']);
							$message .= "\r\n\r\n".$v['mess'];
							$message .= "\r\nConnecte toi vite pour l'attraper !";
							$message .= "\r\n\r\n".$fap->getServerName().$fap->getAppName();
							sendMail($v['to'],$message,$v['power']);
							sendSms($v['to'],$v['mess']);
							sendIfttt($v['to'],$v['mess']);
						}
					} else {
						sendIfttt($_GET['usr'],"Tu es encore groggy de ton dernier fap",'',true);
					}
				} else {
					sendIfttt($_GET['usr'],"Fap par IFTTT désactivé",'',true);
				}
			} else {
				sendIfttt(null,"Fap alert: ".$fap->errForeign,$data_usr['usk_userkey'],true);
			}
		}
	}
}

if (isset($_GET['test'])) {
	echo sendIfttt(null,"Fap test",$_GET['test']);
}




