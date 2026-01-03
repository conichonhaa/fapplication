<?php
include_once('communs/classFAP.php');
if (!$fap) $fap = new fap;
include_once($_SERVER['DOCUMENT_ROOT'].$fap->getAppName().'PHPMailer-master/PHPMailerAutoload.php');

// parametre de connexion
$serverMail = 'Gmail';
if (isset($t_param['mail_server']) and $t_param['mail_server']!='') $serverMail = $t_param['mail_server'];

$param = array();
if ($serverMail=='Gmail') {
	$param['prot'] = "tls";          
	$param['host'] = "smtp.gmail.com";      
	$param['port'] = 587; 
	$param['email'] = 'genealogie57570@gmail.com';
	$param['password'] = 'nwzticgxuldfyoya';
	$param['setfrom'] = 'genealogie57570@gmail.com';
	$param['ssl'] = false;
}
if ($serverMail=='Galou') {
	$param['prot'] = 'tls';          
	$param['host'] = 'mail.brenat-production.fr';      
	$param['port'] = 587; 
	$param['email'] = 'fap@brenat-production.fr';
	$param['password'] = 'cryptozooshow';
	$param['setfrom'] = 'fap@brenat-production.fr';
	$param['ssl'] = true;
}


function sendMail($usr,$message='',$sujet='Fap info',$adresse=null,$force=false,$attach=true) {	
	global $fap, $param, $noMessage;
	if (!$force)
		$message .= "\r\n\r\nSi tu ne veux plus recevoir de mails de la fapplication tu peux désactiver l'option dans ton profil\r\nFap is life !";
	$nom = "";
	if ($usr) {
		$info = $fap->logGetInfo($usr);
		if (!$adresse and $info['notif_mail']) $adresse = $info['email'];
		$nom = $info['nom'];
		if (!$adresse and $force) $adresse = $info['email'];
	} 
	if ($noMessage) $_SESSION['fap']['errorMail'] = "Pas de message local";
	if ($adresse=='') $_SESSION['fap']['errorMail'] = "Pas d'adresse";
	if ($usr and $info['email']!='' and !$info['notif_mail']) $_SESSION['fap']['errorMail'] = "Notification désactivée";
	if ($adresse and $adresse!='' and !$noMessage) {
		$mail = new PHPMailer();
		$mail->IsSMTP();                       
		$mail->SMTPDebug = 0;  
		$mail->Debugoutput = 'html';
		$mail->SMTPAuth = true;              
		$mail->SMTPSecure = $param['prot'];          
		$mail->Host = $param['host'];      
		$mail->Port = $param['port'];                    
		$mail->Username = $param['email'];  
		$mail->Password = $param['password'];   
		if ($param['ssl']) {
			$mail->SMTPOptions = array(
							'ssl' => array(
								'verify_peer' => false,
								'verify_peer_name' => false,
								'allow_self_signed' => true
							)
						);
		}		
		$mail->CharSet = 'utf-8';
		$mail->AddReplyTo('genealogie57570@gmail.com', 'Fappeur Fou');
		$mail->SetFrom ($param['setfrom'], 'Fappeur Fou');
		$mail->Subject = $sujet;
		$mail->ContentType = 'text/plain'; 
		$mail->IsHTML(false);
		$mail->Body = $message; 
		if ($attach) $mail->addAttachment($_SERVER['DOCUMENT_ROOT'].$fap->getAppName().'images/funky-bite.gif');
		$mail->AddAddress ($adresse, $nom);
		$res = $mail->Send();
		if(!$res) $_SESSION['fap']['errorMail'] = $mail->ErrorInfo;
		else if (isset($_SESSION['fap']['errorMail'])) unset($_SESSION['fap']['errorMail']);
		return $res;
	}
}

function sendSms($usr, $message='', $tel='') {	
	global $fap, $param, $t_param, $noMessage;
	if ($usr) {
		$info = $fap->logGetInfo($usr);
		if (!$tel and $info['notif_sms']) $tel = $info['tel'];
	} 
	if ($noMessage) $_SESSION['fap']['errorMail'] = "Pas de message local";
	if ($tel=='') $_SESSION['fap']['errorMail'] = "Pas de numéro";
	if ($usr and $info['tel']!='' and !$info['notif_sms']) $_SESSION['fap']['errorMail'] = "Notification désactivée";
	if ($tel and $tel!='' and !$noMessage) {
		
	//	$url = "http://192.168.1.80:9090/sendsms?phone=".$tel."&text=".$message."&password=bite";
	//	$url = "http://192.168.1.28/RaspiSMS/smsAPI/?email=fap@brenat-production.fr&password=sodomie&numbers=".$tel."&text=".urlencode($message);
		$url = "http://192.168.1.28/raspisms/api/scheduled/";
		
		$var = ltrim($tel, '0');
		$tell ='%2B33'.$var;
		
		define('POSTVARS', 'text='.urlencode($message).'&numbers='.$tell);
	

		$ch=curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, POSTVARS);
		
		$headers = array();
		$headers[] = 'X-Api-Key: 115b962b173cd4d1d21d10b53741e40a';
		$headers[] = 'Content-Type: application/x-www-form-urlencoded';
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		$res = curl_exec($ch);
		$info = curl_getinfo($ch);
		curl_close ($ch);
		return $res;
	}	
}
function sendSms_2($usr, $message='', $tel='') {	
	global $fap, $param, $t_param, $noMessage;
	if ($usr) {
		$info = $fap->logGetInfo($usr);
		if (!$tel and $info['notif_sms']) $tel = $info['tel'];
	} 
	if ($noMessage) $_SESSION['fap']['errorMail'] = "Pas de message local";
	if ($tel=='') $_SESSION['fap']['errorMail'] = "Pas de numéro";
	if ($usr and $info['tel']!='' and !$info['notif_sms']) $_SESSION['fap']['errorMail'] = "Notification désactivée";
	if ($tel and $tel!='' and !$noMessage) {
		$mail = new PHPMailer();
		$mail->IsSMTP();                       
		$mail->SMTPDebug = 3;  
		$mail->Debugoutput = 'html';
		$mail->SMTPAuth = true;              
		$mail->SMTPSecure = $param['prot'];          
		$mail->Host = $param['host'];      
		$mail->Port = $param['port'];                    
		$mail->Username = $param['email'];  
		$mail->Password = $param['password'];  
		if ($param['ssl']) {
			$mail->SMTPOptions = array(
							'ssl' => array(
								'verify_peer' => false,
								'verify_peer_name' => false,
								'allow_self_signed' => true
							)
						);
		}		
		$mail->CharSet = 'utf-8';
		$mail->AddReplyTo('noreply@brenat-production.fr', 'Fappeur Fou');
		$mail->SetFrom ($param['setfrom'], 'Fappeur Fou');
		$mail->Subject = $t_param['sms_ets'].":".$tel;
		$mail->ContentType = 'text/plain'; 
		$mail->IsHTML(false);
		$mail->Body = $message; 
		$mail->AddAddress ($t_param['sms_mail']);
		$res = $mail->Send();
		if(!$res) $_SESSION['fap']['errorMail'] = $mail->ErrorInfo;
		else if (isset($_SESSION['fap']['errorMail'])) unset($_SESSION['fap']['errorMail']);
		return $res;
	}
}

function sendIfttt($usr, $message='', $key='', $force=false) {	
	global $fap, $t_param, $noMessage;
	if ($usr) {
		$appkey = "";
		$userkey = "";
		$info = $fap->logGetInfo($usr);
		if (isset($t_param['newrelic_ifttt'])) $appkey = $t_param['newrelic_ifttt'];
		if ($appkey!="") $userkey = $fap->getUserKey($appkey,$usr);
		if ($key=='' and $info['notif_ifttt'] or $force) $key = $userkey;
	} 
	if (!$force and $noMessage) $_SESSION['fap']['errorMail'] = "Pas de message local";
	if ($key=='') $_SESSION['fap']['errorMail'] = "Pas de clef IFTTT";
	if ($usr and $userkey!='' and !$info['notif_ifttt']) $_SESSION['fap']['errorMail'] = "Notification désactivée";
	if ($key and $key!='' and !$noMessage) {
		$event = "fapnotif";
		$url = "https://maker.ifttt.com/trigger/".$event."/with/key/".$key;
		$datas = 'value1="'.$message.'"';
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);                                                                 
		curl_setopt($ch, CURLOPT_POSTFIELDS, $datas);                                                                   
		$res = curl_exec($ch);
		if ($res and isset($_SESSION['fap']['errorMail'])) unset($_SESSION['fap']['errorMail']);
		return $res;
	}
}





