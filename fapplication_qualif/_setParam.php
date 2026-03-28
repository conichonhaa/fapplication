<?php
include_once('communs/classFAP.php');
$fap = new fap;
include_once('communs/funcDate.php');
include_once('communs/variables.php');


if (isset($_POST['init']) and isset($_POST['lien']) and isset($_POST['mdp']) and isset($_POST['usr'])) {
	if ($_POST['usr']!='') {
		$info = $fap->logGetInfo($_POST['usr']);
		include_once('communs/mail.php');
		$message = "Bonjour ".$info['nom'];
		$message .= "\r\n\r\nTu as validé la réinitialisation de ton compte à la FAPplication.";
		$message .= "\r\n\r\nTon nouveau mot de passe est :\r\n".$_POST['mdp'];
		$nb = $fap->getNbjAlea();
		if ($nb>1) $s="s"; else $s="";
		$message .= "\r\n\r\nIl restera valable pendant ".$nb." jour".$s.".\r\nPense à le changer tout de suite après ta connexion.";
		$message .= "\r\n\r\nOu clique sur le lien ci-dessous (ou copier/coller dans un navigateur) pour te connecter directement";
		$message .= "\r\n".$_POST['lien'];	
		$nb = $fap->getNbjLienActif();
		if ($nb>1) $s="s"; else $s="";
		$message .= "\r\nAttention ce lien restera valable pendant ".$nb." jour".$s.".";						
		sendMail($_POST['usr'],$message,'Ton compte a été réinitialisé',null,true);	
		die();	
	}
}


include_once('communs/log.php');
include_once('communs/funcFap.php');

$xml = "<xml>";

$needReload = false;

if (count($_POST)>0) {

	if (isset($_POST['action'])) $xml .= "<action>".str_replace("\\","",$_POST['action'])."</action>";
	
	if (isset($_POST['aFappe'])) {
		$error = "";
		$d = time();
		$date = strftime("%Y-%m-%dT%H:%M:%S",$d);
		if (isset($_POST['offline'])) {
			if ($_POST['usr']==$fap->getId()) $date = $_POST['offline'];
			else $date = null;
		}	
		if (isset($_POST['latitude'])) $lat = $_POST['latitude']; else $lat='null';
		if (isset($_POST['longitude'])) $lon = $_POST['longitude']; else $lon='null';
		if (isset($_POST['accuracy'])) $acc = round($_POST['accuracy']); else $acc='null';
		if (isset($_POST['declare'])) {
			$dd = makeDate($_POST['declare']);
			if ($_POST['declare']>$date) $error = "Impossible de déclarer un Fap du futur";
			else if ($dd<$d-$fap->getAgeDecFap()*24*3600) $error = "Le Fap est trop ancien (".affDuree($d-$dd).")";
			else if ($fap->getDispoDecFap()<=0) $error = "Tu as suffisamment déclaré de Faps";
			$date = $_POST['declare']; 
		}
		if ($fap->isFapAuth($date) and $error=="") {
			$id = fapInBase($date,$lat,$lon,$acc);
			if ($id and isset($_POST['error'])) {
				$error = $_POST['error'];
				$error = str_replace("\\","",$error);
				$error = str_replace("'","''",$error);
				$sql = "UPDATE t_faplogs_fap set fap_pos_error='".$error."' where fap_id=".$id;
				mysql_query($sql,$fap->conn);
			}
			if (isset($_POST['declare'])) {
				if ($id) {
					$sql = "UPDATE t_faplogs_fap set fap_declare='".strftime("%Y-%m-%dT%H:%M:%S",$d)."' where fap_id=".$id;
					mysql_query($sql,$fap->conn);
				}
			}
			if (isset($_POST['offline'])) {
				$xml .= "<action>getNbFap();actuOfflineFap(1);</action>";
				if ($id) {
					$sql = "UPDATE t_faplogs_fap set fap_offline='".strftime("%Y-%m-%dT%H:%M:%S",$d)."' where fap_id=".$id;
					mysql_query($sql,$fap->conn);
				}
			} else {
				$xml .= "<action>aFappe();</action>";
			}	
		} else {
			if (isset($_POST['offline'])) {
				$xml .= "<action>getNbFap();actuOfflineFap(0);</action>";
			} else {
				$dizzy = 2;
				if ($error=='') {
					if (isset($_POST['declare'])) $error = "Il existe déjà un fap à ce créneau";
					else $error = "Tu es encore groggy de ton dernier fap";
					$dizzy = 1;
				}
				$xml .= "<action>forbidFap(".'"'.$error.'",'.$dizzy.");</action>";
			}	
		}	
	}
	
	if (isset($_POST['checkCapacity'])) {
		$t_list = fapCheckCapacity();
		$action = "";
		$lst = "";
		foreach ($t_list as $k => $v) {
			$action .= "sendMessageCapacity(".$v['to'].",\"".$v['mess']."\",\"".$v['power']."\");";
			if ($lst!="") $lst .= ",";
			$lst .= "\"".getNomUser($v['to'])."\"";
		}
		$lst = "[".$lst."]";
		$action .= "infoFap(".$lst.");";
		$xml .= "<action>".$action."</action>";
	}
	if (isset($_POST['sendMail']) and $_POST['sendMail']!='') {
		include_once('communs/mail.php');
		$message = "Bonjour ".getNomUser($_POST['sendMail']);
		$message .= "\r\n\r\n".$_POST['message'];
		if (isset($_POST['catch'])) $message .= "\r\nConnecte toi vite pour l'attraper !";
		if (isset($_POST['url'])) $message .= "\r\n\r\n".$fap->getServerName().$fap->getAppName();
		$res = sendMail($_POST['sendMail'],$message,$_POST['titre']);
		if ($res) $ok = '';
		else $ok = $_SESSION['fap']['errorMail'];
		if (isset($_POST['sent'])) $xml .= "<action>".$_POST['sent']."(".$_POST['sendMail'].",\"".$ok."\");</action>";
	}
	if (isset($_POST['sendSms']) and $_POST['sendSms']!='') {
		include_once('communs/mail.php');
		$res = sendSms($_POST['sendSms'],$_POST['message']);
		if ($res) $ok = '';
		else $ok = $_SESSION['fap']['errorMail'];
		if (isset($_POST['sent'])) $xml .= "<action>".$_POST['sent']."(".$_POST['sendSms'].",\"".$ok."\");</action>";
	}
	if (isset($_POST['sendIfttt']) and $_POST['sendIfttt']!='') {
		include_once('communs/mail.php');
		$res = sendIfttt($_POST['sendIfttt'],$_POST['message']);
		if ($res) $ok = '';
		else $ok = $_SESSION['fap']['errorMail'];
		if (isset($_POST['sent'])) $xml .= "<action>".$_POST['sent']."(".$_POST['sendIfttt'].",\"".$ok."\");</action>";
	}

	
	// faps
	if (isset($_POST['suppFap']) and $_POST['suppFap']!='') {		
		$act = $_POST['act'];
		if ($act!='null') $act = "'".$act."'";
		$sql = "update t_faplogs_fap set fap_annule=".$_POST['act']." where fap_id=".$_POST['suppFap'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['reposFap']) and $_POST['reposFap']!='') {		
		$sql = "update t_faplogs_fap set fap_pos_latitude=".$_POST['lat'].", fap_pos_longitude=".$_POST['lon'].", 
					fap_pos_accuracy=".$_POST['acc'].", fap_pos_reloc=least(fap_pos_reloc,".intval($_POST['acc']/1000).") 
					where fap_id=".$_POST['reposFap'];
		mysql_query($sql,$fap->conn);
		$xml .= "<action>showOldFap();</action>";
	}	
	if (isset($_POST['incAccFap']) and $_POST['incAccFap']!='') {		
		if ($fap->decPower($_POST['acc'])) {
			$sql = "update t_faplogs_fap set fap_pos_accuracy=fap_pos_accuracy+".($_POST['acc']*1000).", 
						fap_pos_reloc=".($_POST['reloc']+$_POST['acc'])." where fap_id=".$_POST['incAccFap'];
			mysql_query($sql,$fap->conn);
			$xml .= "<action>showOldFap();</action>";
		}
	}	
	if (isset($_POST['initPosFap']) and $_POST['initPosFap']!='') {		
		if ($fap->decPower(10)) {
			$sql = "update t_faplogs_fap set fap_pos_latitude=".$_POST['lat'].", fap_pos_longitude=".$_POST['lon'].", 
						fap_pos_accuracy=".$_POST['acc']." where fap_id=".$_POST['initPosFap'];
			mysql_query($sql,$fap->conn);
			$xml .= "<action>showOldFap();</action>";
		}
	}
	
	
	if (isset($_POST['resetOptions']) and isset($_SESSION['fap']['options'])) {
		unset($_SESSION['fap']['options']);
		$sauvParametres = 0;
		$needReload = true;
	}
	if (isset($_POST['sauvParametres'])) $_SESSION['fap']['options']['sauvParametres'] = $_POST['sauvParametres'];
	if (isset($_POST['bandeauDefile'])) $_SESSION['fap']['options']['bandeauDefile'] = $_POST['bandeauDefile'];
	if (isset($_POST['networkInvitation'])) $_SESSION['fap']['options']['networkInvitation'] = $_POST['networkInvitation'];
	if (isset($_POST['decompteFap'])) $_SESSION['fap']['options']['decompteFap'] = $_POST['decompteFap'];
	
	// global
	if (isset($_POST['statsUtilisateur'])) $_SESSION['fap']['options']['statsUtilisateur'] = $_POST['statsUtilisateur'];
	if (isset($_POST['avecFapAnnule'])) $_SESSION['fap']['options']['avecFapAnnule'] = $_POST['avecFapAnnule'];	
	if (isset($_POST['animationInitiale'])) $_SESSION['fap']['options']['animationInitiale'] = $_POST['animationInitiale']=='0';
	if (isset($_POST['animationInitialeSpeed'])) $_SESSION['fap']['options']['animationInitialeSpeed'] = $_POST['animationInitialeSpeed'];
	if (isset($_POST['animationInitialeMode'])) $_SESSION['fap']['options']['animationInitialeMode'] = $_POST['animationInitialeMode'];
	// filtre
	foreach ($t_filtre as $key => $val) {
		if (isset($_POST['filtre'.$key])) $_SESSION['fap']['options']['filtre'][$key] = $_POST['filtre'.$key];	
	}
	if (isset($_POST['memoFiltre'])) {
		print_r($_POST);
		$_SESSION['fap']['memoAffFiltre'][$_POST['memoFiltre']] = $_POST['affiche'];
	}
	//frequence
	if (isset($_POST['plageFrequence'])) $_SESSION['fap']['options']['plageFrequence'] = $_POST['plageFrequence'];
	if (isset($_POST['precisionFrequence'])) $_SESSION['fap']['options']['precisionFrequence'] = $_POST['precisionFrequence'];
	// graphique
	if (isset($_POST['modeGraph'])) $_SESSION['fap']['options']['modeGraph'] = $_POST['modeGraph'];
	if (isset($_POST['modeZoom'])) $_SESSION['fap']['options']['modeZoom'] = $_POST['modeZoom'];	
	if (isset($_POST['cumulHieto'])) $_SESSION['fap']['options']['cumulHieto'] = $_POST['cumulHieto'];
	if (isset($_POST['iniPeriode'])) $_SESSION['fap']['options']['iniPeriode'] = $_POST['iniPeriode'];
	// escargots
	if (isset($_POST['nbSnail'])) $_SESSION['fap']['options']['nbSnail'] = $_POST['nbSnail'];
	if (isset($_POST['snailBestGuest'])) $_SESSION['fap']['options']['snailBestGuest'] = $_POST['snailBestGuest'];
	if (isset($_POST['snailMeInside'])) $_SESSION['fap']['options']['snailMeInside'] = $_POST['snailMeInside'];
	if (isset($_POST['snailRunPeriode'])) $_SESSION['fap']['options']['snailRunPeriode'] = $_POST['snailRunPeriode'];
	if (isset($_POST['snailRunPeriodeCustom'])) {
		if ($_POST['snailRunPeriodeCustom']=='custom' 
			and isset($_SESSION['fap']['options']['snailRunPeriodeCustom']) 
			and $_SESSION['fap']['options']['snailRunPeriodeCustom']!='custom') 
				$_SESSION['fap']['options']['snailRunPeriode'] = $_SESSION['fap']['options']['snailRunPeriodeCustom'];
		$_SESSION['fap']['options']['snailRunPeriodeCustom'] = $_POST['snailRunPeriodeCustom'];
	}
	// geolocalisation
	if (isset($_POST['modeMap'])) $_SESSION['fap']['options']['modeMap'] = $_POST['modeMap'];
	if (isset($_POST['mapShowAccuracy'])) $_SESSION['fap']['options']['mapShowAccuracy'] = $_POST['mapShowAccuracy'];
	if (isset($_POST['mapInitCenter'])) $_SESSION['fap']['options']['mapInitCenter'] = $_POST['mapInitCenter'];
	if (isset($_POST['mapLocalRelay'])) $_SESSION['fap']['options']['mapLocalRelay'] = $_POST['mapLocalRelay'];
	// sonorisation
	if (isset($_POST['sonActiveCB'])) $_SESSION['fap']['options']['sonActive'] = $_POST['sonActiveCB'];
	if (isset($_POST['sonActiveImg'])) $_SESSION['fap']['options']['sonActive'] = $_POST['sonActiveImg'];
	if (isset($_POST['sonVolume'])) $_SESSION['fap']['options']['sonVolume'] = $_POST['sonVolume'];
	foreach ($t_sons as $son => $v) {
		if (isset($_POST['son_'.$son])) {
			$_SESSION['fap']['options']['son'][$son] = $_POST['son_'.$son];
		}
	}
	// jeu
	if (isset($_POST['gameJoystick'])) $_SESSION['fap']['options']['gameJoystick'] = $_POST['gameJoystick'];	
	if (isset($_POST['gamePlayerMultiple'])) $_SESSION['fap']['options']['gamePlayerMultiple'] = $_POST['gamePlayerMultiple'];	
	if (isset($_POST['scoreGame'])) {
		$sql = "select * from t_scores_sco where sco_game='".$_POST['game']."' and usr_id=".$fap->getId()." limit 1";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			if (intval($_POST['score'])>$data['sco_score'] and $data['sco_reset']<strftime("%Y-%m-%dT%H:%M:%S",time())) {
				$sql = "update t_scores_sco set sco_score=".$_POST['score']." where sco_id=".$data['sco_id'];
				mysql_query($sql,$fap->conn);
			}
		} else {
			$sql = "insert into t_scores_sco (sco_game,usr_id,sco_score) values ('".$_POST['game']."',".$fap->getId().",".$_POST['score'].")";
			mysql_query($sql,$fap->conn);
		}
	}
	if (isset($_POST['resetScoreGame'])) {
		$sql = "select * from t_scores_sco where sco_game='".$_POST['game']."' and usr_id=".$fap->getId()." limit 1";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			if ($data['sco_score']>$data['sco_memo']) $fap->incPoints(500);
			else $fap->incPoints(100);
			$sql = "update t_scores_sco set sco_memo=greatest(sco_score,coalesce(sco_memo,0)), sco_score=null, 
					sco_reset='".strftime("%Y-%m-%dT%H:%M:%S",time()+86400*7)."' where sco_id=".$data['sco_id'];
			mysql_query($sql,$fap->conn);
		}
	}
	if (isset($_POST['networkCall'])) {
		$t = time();
		$lst = [];
		$in = false;
		$sql = "select * from t_parametrage_par where par_code='network_call'";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$tt2 = array();
			if ($data['par_valeur']!='') {
				$tt = json_decode($data['par_valeur'],true);
				foreach ($tt as $code => $v) { 
					if ($v['time']>$t-300) {
						$tt2[$code] = $v;
						if ($code==$_POST['networkCall']) $lst = $v['from'];
					}
				}
				for ($l=0; $l<count($lst); $l++) if ($lst[$l]==$fap->getId()) $in = true;
			}
			if (!$in) array_push($lst,$fap->getId());
			$tt2[$_POST['networkCall']] = array('time'=>$t,'from'=>$lst,'type'=>$_POST['type']);
			$json = json_encode($tt2);
			$sql = "update t_parametrage_par set par_valeur='".$json."' where par_code='network_call'";
			mysql_query($sql,$fap->conn);
		}
	}
	if (isset($_POST['incPower'])) {
		$fap->incPower($_POST['incPower']);
	}
	
	if (isset($_POST['useCapacity'])) {
		$fap->useCapacity($_POST['code'],$_POST['num']);
	}
	//chat
	if (isset($_POST['chatDelaiRecup'])) $_SESSION['fap']['options']['chatDelaiRecup'] = $_POST['chatDelaiRecup'];
	if (isset($_POST['chatInteractif'])) $_SESSION['fap']['options']['chatInteractif'] = $_POST['chatInteractif'];
	if (isset($_POST['chatMessage'])) {
		$t = time();
		$_SESSION['fap']['chat']['see'] = $t;
		$sql = "update t_parametrage_par set par_valeur='".$t."' where par_code='network_chatpost'";
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['chatSee'])) $_SESSION['fap']['chat']['see'] = time();

	
	// admin
	if (isset($_POST['email']) and isset($_POST['usr']) and $_POST['email']!='' and $_POST['usr']!='') {
		$lien = $fap->setConfEmail($_POST['email'],$_POST['usr']);
		if ($lien) {
			include_once('communs/mail.php');
			$info = $fap->logGetInfo($_POST['usr']);
			$message = "Bonjour ".$info['nom'];
			$message .= "\r\n\r\nPour exploiter pleinement les possibilités de la FAPplication, tu as besoin d'avoir une adresse mail valide.";
			$message .= "\r\n\r\nClique sur le lien ci-dessous (ou copier/coller dans un navigateur) pour la confirmer :";
			$message .= "\r\n".$lien;	
			$nb = $fap->getNbjLienActif();
			if ($nb>1) $s="s"; else $s="";
			$message .= "\r\nAttention ce lien restera valable pendant ".$nb." jour".$s.".";
			if (sendMail($_POST['usr'],$message,'Confirme ton adresse',$_POST['email'])) {
				$xml .= "<sent usr='".$_POST['usr']."'></sent>";
			} else {
				$xml .= "<error>".$_SESSION['fap']['errorMail']."</error>";
			}
		}
	}
	if (isset($_POST['aleamdp']) and $_POST['aleamdp']!="") {
		$mdp = $fap->setAleaMdp($_POST['aleamdp']);
		if ($mdp) {
			include_once('communs/mail.php');
			$info = $fap->logGetInfo($_POST['aleamdp']);
			$message = "Bonjour ".$info['nom'];
			$message .= "\r\n\r\nUn nouveau mot de passe a été généré pour ta connexion à la FAPplication :\r\n".$mdp;
			$nb = $fap->getNbjAlea();
			if ($nb>1) $s="s"; else $s="";
			$message .= "\r\n\r\nIl restera valable pendant ".$nb." jour".$s.".\r\nPensez à le changer tout de suite après ta connexion.";
			$lien = $fap->setLienAutologin($_POST['aleamdp']);
			if ($lien) {
				$message .= "\r\n\r\nOu clique sur le lien ci-dessous (ou copier/coller dans un navigateur) pour te connecter directement";
				$message .= "\r\n".$lien;	
				$nb = $fap->getNbjLienActif();
				if ($nb>1) $s="s"; else $s="";
				$message .= "\r\nAttention ce lien restera valable pendant ".$nb." jour".$s.".";
			}
			$message .= "\r\n\r\nSi cette action n'a pas été effectuée à ta demande, fappe toi immédiatement, trois fois d'affilée.";							
			if (sendMail($_POST['aleamdp'],$message,'Ton mot de passe FAPplication',null,true)) {		
				$xml .= "<sent usr='".$_POST['aleamdp']."'></sent>";
			} else {
				$xml .= "<error>".$_SESSION['fap']['errorMail']."</error>";
			}
		}
	}
	$lst_param = array('sms_mail','mail_server');
	foreach ($lst_param as $v) {
		if (isset($_POST[$v])) {
			// Delete existing and insert new
			$sql = "DELETE FROM t_parametrage_par WHERE par_code='".$v."'";
			mysql_query($sql, $fap->conn);
			$sql = "INSERT INTO t_parametrage_par (par_code, par_valeur, par_description, tpa_id) VALUES ('".$v."', '".$_POST[$v]."', '', 1)";
			mysql_query($sql, $fap->conn);
		}
	}
	
	
	// profil
	if (isset($_POST['profilCookie'])) {
		$fap->modifInfo(array('cookie'=>$_POST['profilCookie']));
	}
	if (isset($_POST['profilLogin'])) {
		if (isset($_POST['valide'])) {
			$fap->modifInfo(array('login'=>$_POST['profilLogin']));
			$action = "setLogin(\"".$fap->info['nom']."\",".$fap->calcPoints().");";
		} else {
			$fap->isUserDispo($_POST['profilLogin']);
			$action = "confLogin();";
		}	
		if ($fap->errNew) $xml .= "<action>resetLogin(\"".$fap->errNew."\")</action>";
		else $xml .= "<action>".$action."</action>";
		
	}
	if (isset($_POST['profilSexe'])) {
		$fap->modifInfo(array('sexe'=>$_POST['profilSexe']));
	}
	if (isset($_FILES['profilPhoto'])) {
		include_once('communs/classImg.php');
		$img = new img($_FILES['profilPhoto']['tmp_name'],$_FILES['profilPhoto']['name']);
		$img->setRatioMax(1.5);
		$img->tailleMax(50000);
		$cont = $img->sendImage(true);
		$fap->modifInfo(array('image'=>$cont));
		$xml .= "<action>loadPhoto(".$fap->info['img_id'].");</action>";
	}
	if (isset($_POST['profilConfGeoloc'])) {
		$fap->modifInfo(array('confGeoloc'=>$_POST['profilConfGeoloc']));
	}
	if (isset($_POST['profilWarTerritory'])) {
		$fap->modifInfo(array('warTerritory'=>$_POST['profilWarTerritory']));
	}	
	if (isset($_POST['profilNoMatelas'])) {
		$fap->modifInfo(array('NoMatelas'=>$_POST['profilNoMatelas']));
	}
	if (isset($_POST['profilTel'])) {
		$fap->modifInfo(array('tel'=>$_POST['profilTel']));
	}	
	if (isset($_POST['profilNotifMail'])) {
		$fap->modifInfo(array('notifMail'=>$_POST['profilNotifMail']));
	}
	if (isset($_POST['profilNotifSms'])) {
		$fap->modifInfo(array('notifSms'=>$_POST['profilNotifSms']));
	}
	if (isset($_POST['profilNotifIfttt'])) {
		$fap->modifInfo(array('notifIfttt'=>$_POST['profilNotifIfttt']));
	}
	if (isset($_POST['profilTestNotif'])) {
		include_once('communs/mail.php');
		$message = "Bonjour ".$fap->info['nom'];
		$message .= "\r\n\r\nTest de notification réussi.";
		sendMail($fap->getId(),$message,'Test notification');
		sendSms($fap->getId(),"Test de notification réussi");
		sendIfttt($fap->getId(), "Test de notification réussi");
	}	
	if (isset($_POST['profilPassword'])) {
		$fap->modifInfo(array('mdp'=>$_POST['profilPassword']));
		$xml .= "<action>resetPassword();</action>";
	}
	// user_key
	if (isset($_POST['uskUserKey'])) {
		$key = $fap->modifUserKey($_POST['uskUserKey'],$_POST['uskAppKey']);
		$xml .= "<action>getForeignKey('".$key."');</action>";
	}
	if (isset($_POST['uskRandom'])) {
		$key = $fap->modifRandomKey($_POST['uskRandom']);
		$xml .= "<action>getForeignKey('".$key."');</action>";
	}
	if (isset($_POST['uskActif'])) {
		$a = ($_POST['toggle']=='on'?1:0);
		$fap->modifActifKey($_POST['uskActif'],$a);
	}
	
	// defi
	if (isset($_POST['defiFap'])) {
		if (isset($_POST['defi']))$defi = 1;
		else $defi = 'null';
		$sql = "update t_faplogs_fap set fap_defi=".$defi." where fap_id=".$_POST['fap'];
		mysql_query($sql,$fap->conn);
	}
	
	// gain XP
	if (isset($_POST['gainXP'])) {
		$num = 1;
		if (isset($_POST['max'])) $num = intval($_POST['max']);
		$code = $_POST['gainXP'];
		$has = $fap->hasCapacity($code);
		$cont = false;
		if (!$has) {
			$cont = true;
			$n = 1;
			$d = 86400;
		} elseif ($fap->capacityInfo['num']<$num) {
			$cont = true;
			$n = $fap->capacityInfo['num']+1;
			$d = makeDate($fap->capacityInfo['date'])-time();
		}
		if ($cont) {
			$fap->buyCapacity(0,$code,$d,$n);
			$fap->incPoints(1);
			$xml .= "<action>gainXP();</action>";
		}
	}

	// book
	if (isset($_POST['likeBook']) and $_POST['likeBook']!='') {
		$sql = "update t_fapbook_fbk set fbk_like=".$_POST['nb']." where fap_id=".$_POST['likeBook'];
		mysql_query($sql,$fap->conn);
	}	

	// MST
	if (isset($_POST['checkMST'])) {
		if (getMstInfect('mst-chtouille')==$fap->getId()) {
			$xml .= "<action>alertChtouille();</action>";
		}
	}	
	
	
}

// cookie
$ageCookie = 100*24*3600;
if (isset($_SESSION['fap']['options']['sauvParametres'])) $sauvParametres = $_SESSION['fap']['options']['sauvParametres'];
if ($sauvParametres) {
	if (isset($_SESSION['fap']['options'])) setcookie('fapParametres', json_encode($_SESSION['fap']['options']), time()+$ageCookie, '/');
} else {
	setcookie('fapParametres', "", time()-1, '/');
}
//

if ($needReload) $xml .= "<reload />";

$xml .= "</xml>";
header("Content-type: text/xml");
echo $xml;