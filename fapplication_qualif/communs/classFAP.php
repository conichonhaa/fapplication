<?php
require_once('communs/mysql_compat.php');
if (!session_id()) session_start();
date_default_timezone_set('Europe/Paris');
setlocale(LC_TIME, 'fra', 'fr_FR', 'fr_FR.ISO-8859-1');

// adaptation qualif
$isApplicationQualif = false; 
if (strpos($_SERVER['PHP_SELF'],"_qualif")>0 or strpos($_SERVER['HTTP_HOST'],"qualif.fap.brenat-production.fr")!==false) {
	$isApplicationQualif = true;
}

// adaptation local
$isApplicationLocal = false; 
if (strpos($_SERVER['HTTP_HOST'],"127.0.0.1")!==false) {
	$isApplicationLocal = true;
}
if (strpos($_SERVER['HTTP_HOST'],"192.168")!==false) {
	$isApplicationLocal = true;
}
	

class fap {

	private $id = null;
	public $errNew = null;
	public $errCatch = null;
	public $errPower = null;
	public $errForeign = null;
	public $capacityInfo = array();
	private $nbjAlea = 8;
	private $ageDecFap = 8;
	private $nbDecFap = 2;
	private $catchRecup = 4800;
	private $catchedRecup = 120;
	private $catchGroggy = 60;
	private $fapGroggy = 60;
	private $nbjLienActif = 1;
	private $tparam = null;
	private $passwordAlea = null;
	private $isInit = null;
	private $adminD = array();
	public $newEmail = null;
	private $connDuree = 120;
	private $resterConnecte = null;
	private $modeDev = null;
	private $voteDelai = 300;

	
	public function __construct() {
		$this->connect();
		$this->recupSession();
		if (!$this->id) $this->getCookieConnexion();
		$this->recupQualifTicket();
		$this->getParamBD();
		$this->logGetInfo();
		$this->logGetDroits();
		$this->logGetLevel();
		$this->traceConnexion();
		//var_dump($this);
		//if (isset($_GET['debugDev'])) $this->modeDev = 2;
	}
	public function getAppName() {
		$name = "";
		$tmp = explode("/",$_SERVER['PHP_SELF']);
		for ($k=0;$k<count($tmp)-1;$k++) $name .= $tmp[$k]."/";
		return $name;
	}
	public function getServerName() {
		$name = ((isset($_SERVER['HTTPS']) and $_SERVER['HTTPS'])?"https://":"http://").$_SERVER['HTTP_HOST'];
		$name = ((isset($_SERVER['HTTPS']))?"https://":"http://").$_SERVER['HTTP_HOST'];
		return $name;
	}
	protected function connect() {
		global $isApplicationQualif;
		$this->conn = null;
		if( @include_once($_SERVER['DOCUMENT_ROOT'].$this->getAppName().'restricted/_connBD.php')) {
			$this->conn = $linkFAP;
			// double base
			$this->db = $db;
		}	
	}
	protected function bdClose() {
		if ($this->conn) {
			@mysql_close($this->conn);
			$this->conn = false;
		}
	}
	protected function traceConnexion() {
		if ($this->conn and $this->id) {
			$cnx = null;
			$deb = time();
			$datedeb = strftime("%Y-%m-%dT%H:%M:%S",$deb);
			$datefin = strftime("%Y-%m-%dT%H:%M:%S",$deb+5);
			$sql = "SELECT * FROM t_connexion_cnx WHERE usr_id=".$this->id." order by cnx_datedeb desc limit 1";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {
				if ($data['cnx_datefin']>=strftime("%Y-%m-%dT%H:%M:%S",$deb-$this->connDuree)) $cnx = $data['cnx_id'];
			}
			if ($cnx) {
				$sql = "UPDATE t_connexion_cnx SET cnx_datefin='".$datefin."' WHERE cnx_id=".$cnx;
				mysql_query($sql,$this->conn);
			} else {
				$sql = "INSERT INTO t_connexion_cnx (usr_id,cnx_datedeb,cnx_datefin) VALUES (".$this->id.",'".$datedeb."','".$datefin."')";
				mysql_query($sql,$this->conn);
			}
		}
	}
	protected function getSessKey($id,$key=null) {
		if ($this->conn) {
			$sql = "SELECT * FROM t_utilisateurs_usr WHERE usr_id=".$id;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {
				$toCrypt = $data['usr_nom'].session_id();
				if ($key) {
                                $this->sessKey = crypt($toCrypt, $key);
                                } else {
                                $this->sessKey = crypt($toCrypt, 'fap_legacy_salt');
                                }
				//if ($key) $this->sessKey = crypt($toCrypt,$key);
				//else $this->sessKey = crypt($toCrypt);
			}
		}
	}
	protected function recupSession() {
		if (isset($_SESSION['fap']['usr']) and isset($_SESSION['fap']['sessKey'])) {
			if ($this->conn) {
				$this->getSessKey($_SESSION['fap']['usr'],$_SESSION['fap']['sessKey']);
				if ($this->sessKey and $this->sessKey==$_SESSION['fap']['sessKey']) {
					$this->id = $_SESSION['fap']['usr'];
				}
			}
		}
	}
	protected function setIdSession() {
		if ($this->id) {
			$_SESSION['fap']['usr'] = $this->id;
			$this->getSessKey($this->id);
			$_SESSION['fap']['sessKey'] = $this->sessKey;
		}
	}
	protected function recupQualifTicket() {
		global $isApplicationQualif;
		if ($isApplicationQualif and isset($_POST['usr']) and $_POST['usr']!='' and isset($_POST['random'])) {
			if ($this->conn) {
				$sql = 'SELECT * FROM t_utilisateurs_usr WHERE usr_id='.$_POST['usr'];
				$req = mysql_query($sql,$this->conn);
				if ($data = mysql_fetch_array($req)) {					
					if ($data['usr_random']==$_POST['random']) {
						$this->id = $_POST['usr'];
						$this->setIdSession();
						$this->recupSession();
					}	
				}
			}
		}
	}
	protected function getParamBD() {
		$t_param = array();
		if ($this->conn) {
			$sql = "select * from t_parametrage_par ";
			$req = mysql_query($sql,$this->conn);
			while ($data = mysql_fetch_array($req)) {
				$t_param[$data['par_code']] = $data['par_valeur'];
			}
			if (isset($t_param['nbj_mdpalea'])) $this->nbjAlea = intval($t_param['nbj_mdpalea']);
			if (isset($t_param['decfap_age'])) $this->ageDecFap = intval($t_param['decfap_age']);
			if (isset($t_param['decfap_nb'])) $this->nbDecFap = intval($t_param['decfap_nb']);
			if (isset($t_param['catch_groggy'])) $this->catchGroggy = intval($t_param['catch_groggy']);
			if (isset($t_param['fap_groggy'])) $this->fapGroggy = intval($t_param['fap_groggy']);
			if (isset($t_param['nbj_lienactif'])) $this->nbjLienActif = intval($t_param['nbj_lienactif']);
			if (isset($t_param['vote_delai'])) $this->voteDelai = intval($t_param['vote_delai'])*60;
		}	
		$this->tparam = $t_param;
	}
	public function getParam() {
		return $this->tparam;
	}
	public function getSon() {
		$tt = array();
		if ($this->conn) {
			$sql = "select * from t_sons_son ";
			$req = mysql_query($sql,$this->conn);
			while ($data = mysql_fetch_array($req)) {
				$tt[$data['son_type']][$data['son_type_value']] = $data['son_lien'];
			}
		}
		return $tt;
	}
	public function logGetInfo($id=null) {
		$idr = $id;
		if (!$idr) $idr = $this->id;
		$info = array();
		if ($this->conn and $idr) {		
			$sql = 'SELECT * FROM t_utilisateurs_usr WHERE usr_id='.$idr;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				$info['nom'] = $data['usr_nom'];
				$info['id'] = $data['usr_id'];
				$info['random'] = $data['usr_random'];
				$info['img_id'] = $data['img_id'];				
				$info['sexe'] = $data['usr_sexe'];
				$info['autoLoginCookie'] = $data['usr_cookie'];
				$info['email'] = $data['usr_email'];
				$info['tel'] = $data['usr_tel'];
				$info['confirm_geoloc'] = $data['usr_confirm_geoloc'];
				$info['territoire'] = $data['usr_territoire'];
				$info['nomatelas'] = $data['usr_nomatelas'];
				$info['notif_mail'] = $data['usr_notif_mail'];
				$info['notif_sms'] = $data['usr_notif_sms'];
				$info['notif_ifttt'] = $data['usr_notif_ifttt'];
				if (!$id) {
					$this->passwordAlea = $data['usr_password_alea'];
					$this->info = $info;
				}
				// cookie
				$this->getAllCookies();
			}	
		}
		return $info;
	}
	public function logGetLevel($id=null) {
		$level = array();
		$idr = $id;
		if (!$idr) $idr = $this->id;
		if ($this->conn and $idr) {		
			$sql = "SELECT * FROM t_level_lvl where usr_id=".$idr;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				$level['niveau'] = intval($data['lvl_niveau']);
				$level['points'] = intval($data['lvl_points']);
				$level['experience'] = intval($data['lvl_experience']);
				$level['up'] = $data['lvl_up'];
				$level['power'] = intval($data['lvl_power']);
				$level['power_date'] = $data['lvl_power_date'];
				$level['exhib'] = intval($data['lvl_exhib']);
				$level['coffre'] = intval($data['lvl_coffre']);
				if (!$id) {
					$this->level = $level;
				}
			}
		}
		return $level;
	}
	public function logGetDroits() {
		if ($this->conn and $this->id) {		
			$sql = 'SELECT * FROM t_droits_utilisateurs_dru as dru 
					JOIN t_nom_droits_ndr as ndr ON ndr.ndr_id=dru.ndr_id
					WHERE usr_id='.$this->id.'';
			$req = mysql_query($sql,$this->conn);
			while ($data = mysql_fetch_array($req)) {					
				$this->adminD[$data['ndr_code']] = 1;
			}	
		}
	}
	public function whoIsAdmin($code=null) {
		$tdu = array();
		if ($this->conn and $this->id) {		
			if ($code and $code!='') {
				$sql = "SELECT * FROM t_droits_utilisateurs_dru as dru 
						JOIN t_nom_droits_ndr as ndr ON ndr.ndr_id=dru.ndr_id
						WHERE ndr_code='".$code."'";
				$req = mysql_query($sql,$this->conn);
				while ($data = mysql_fetch_array($req)) {					
					$tdu[] = $data['usr_id'];
				}	
			} else {
				$sql = "SELECT * FROM t_utilisateurs_usr WHERE usr_admin=1";
				$req = mysql_query($sql,$this->conn);
				while ($data = mysql_fetch_array($req)) {					
					$tdu[] = $data['usr_id'];
				}
			}	
		}
		return $tdu;
	}
	
	public function getLastFapAction($id=null) {
		if (!$id) $id = $this->id;
		if ($this->conn and $this->id) {		
			$sql = 'SELECT * FROM t_faplogs_fap WHERE usr_id='.$id.' order by fap_id desc limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				$date = $data['fap_date'];
				if ($data['fap_declare']!='' and $data['fap_declare']>$date) $date = $data['fap_declare'];
				if ($data['fap_offline']!='' and $data['fap_offline']>$date) $date = $data['fap_offline'];
				return $date;
			}	
		}
	}
	public function getLastFap($id=null,$all=false) {
		global $avecFapAnnule;
		$annule = "";
		if ($avecFapAnnule=='0') $annule = " and (fap_annule is null or fap_annule<>1)";
		if (!$id) $id = $this->id;
		if ($all) $where = '';
		else $where = ' WHERE usr_id='.$id.$annule;
		if ($this->conn and $this->id) {		
			$sql = 'SELECT * FROM t_faplogs_fap '.$where.' order by fap_date desc limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				return $data['fap_date'];
			}	
		}
	}
	public function getLastConn($id=null) {
		if (!$id) $id = $this->id;
		if ($this->conn and $this->id) {		
			$sql = 'SELECT * FROM t_connexion_cnx WHERE usr_id='.$id.' order by cnx_datedeb desc limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				return array($data['cnx_datedeb'],$data['cnx_datefin']);
			}	
		}
	}
	public function getFirstActivity($id=null) {
		if (!$id) $id = $this->id;
		if ($this->conn and $this->id) {		
			$date = null;
			$sql = 'SELECT * FROM t_connexion_cnx WHERE usr_id='.$id.' order by cnx_datedeb limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				$date = $data['cnx_datedeb'];
			}	
			$sql = 'SELECT * FROM t_faplogs_fap WHERE usr_id='.$id.' order by fap_date limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				if ($date) $date = min($date,$data['fap_date']);
				else $date = $data['fap_date'];
			}
			return $date;
		}
	}
	public function getLastActivity($id=null) {
		if (!$id) $id = $this->id;
		if ($this->conn and $this->id) {		
			$date = $this->getLastFapAction($id);
			$sql = 'SELECT * FROM t_connexion_cnx WHERE usr_id='.$id.' order by cnx_datedeb desc limit 1';
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				if ($date) $date = min($date,$data['cnx_datedeb']);
				else $date = $data['cnx_datefin'];
			}
			return $date;
		}
	}
	public function getNbjAlea() {
		return $this->nbjAlea;
	}
	public function getAgeDecFap() {
		return $this->ageDecFap;
	}
	public function getNbDecFap() {
		return $this->nbDecFap;
	}
	public function getFapGroggy() {
		return $this->fapGroggy;
	}
	public function getDispoDecFap() {
		$dispo = 0;
		if ($this->conn and $this->id) {		
			$sql = "select count(*) from t_faplogs_fap where usr_id=".$this->id." 
						and fap_declare>'".strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600)."'";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) $dispo = $this->nbDecFap-$data['count(*)'];
		}
		return $dispo;
	}
	public function getNbjLienActif() {
		return $this->nbjLienActif;
	}
	public function isAdmin($code=null) {
		$auth = false;	
		if ($this->id and isset($this->adminD['admin'])) $auth = true;
		else if ($code and $code!='' and $this->id and isset($this->adminD[$code])) $auth = true;
		return $auth;
	}
	public function hasAdmin() {
		$auth = false;	
		if ($this->isAdmin()) $auth = true;
		else if ($this->id and count($this->adminD)>0) $auth = true;
		return $auth;
	}
	public function setModeDev($mode,$pass=null) {
		if ($this->isAdmin()) {
			if ($mode=='off') {
				$this->modeDev = null;
				setcookie('fapdev', '', time()-1, '/');
			}
			if ($mode=='pass' and $pass) {				
				$sql = "select * from t_parametrage_par where par_code='mdpdev'";
				$req = mysql_query($sql,$this->conn);
				if ($data = mysql_fetch_array($req)) {
					if (crypt($pass,$data['par_valeur'])==$data['par_valeur']) {
						$this->modeDev = 2;
					}
				}			
			}
			if ($mode=='on' and !$this->isModeDev()) $this->modeDev = 1;
			if ($this->isDev()) {
				if ($mode=='superAll') $this->modeDev = 4;
				if ($mode=='super') $this->modeDev = 3;
				if ($mode=='normal') $this->modeDev = 2;
				if ($mode=='safe') $_SESSION['fap']['modedevSafe'] = 1;
				if ($mode=='all' and isset($_SESSION['fap']['modedevSafe'])) unset($_SESSION['fap']['modedevSafe']);
			}
			if ($this->isModeDev()) setcookie('fapdev', $this->cryptCookieDev($this->modeDev), time()+(100*24*3600), '/');	
		}
	}
	public function isModeDev() {
		$auth = false;	
		if ($this->isAdmin() and $this->modeDev) $auth = true;
		return $auth;
	}
	public function isDev() {
		$auth = false;	
		if ($this->isModeDev() and $this->modeDev>1) $auth = true;
		return $auth;
	}
	public function isSuperDev() {
		$auth = false;	
		if ($this->isModeDev() and $this->modeDev>2) $auth = true;
		return $auth;
	}
	public function isSuperDevAll() {
		$auth = false;	
		if ($this->isModeDev() and $this->modeDev>3) $auth = true;
		return $auth;
	}
	public function isDevSafe() {
		$auth = false;	
		if (isset($_SESSION['fap']['modedevSafe'])) $auth = true;
		return $auth;
	}
	public function isGodson() {
		return isset($_SESSION['fap']['godson']);
	}
	public function endGodson() {
		unset($_SESSION['fap']['godson']);
		unset($_SESSION['fap']['godsonEmail']);
	}
	
	
	public function isFapAuth($date) {
		$auth = false;	
		$d = makeDate($date);
		$d1 = strftime("%Y-%m-%dT%H:%M:%S",$d-$this->fapGroggy);
		$d2 = strftime("%Y-%m-%dT%H:%M:%S",$d+$this->fapGroggy);
		if ($this->conn and $this->id) {		
			$sql = "select count(*) from t_faplogs_fap where usr_id=".$this->id." and fap_date>'".$d1."' and fap_date<'".$d2."' ";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) $auth = ($data['count(*)']==0);
		}		
		return $auth;
	}
	public function setCatchForce($fapid) {
		$tt = array('exhibit','fapstival');
		foreach ($tt as $code) {
			if ($this->hasCapacity($code) and $this->capacityInfo['num']>0) {
				$sql = "update t_faplogs_fap set fap_exhib=1 where fap_id=".$fapid;
				mysql_query($sql,$this->conn);
			}
		}
	}	
	public function isCatchForce($fapid) {
		$auth = false;	
		$sql = "select * from t_faplogs_fap where fap_id=".$fapid;
		$req = mysql_query($sql,$this->conn);
		if ($data = mysql_fetch_array($req)) $auth = ($data['fap_exhib']==1);
		return $auth;
	}	
	public function getCatchAuth($id=null) {
		if (!$id) $id = $this->id;	
		// y = -002x + 40    (x0=20000mn(~14j)  et  y0=40mn)
		$x = time()-makeDate($this->getLastFapAction($id));
		$y = max(0,round(-0.002*$x/60 + 40))*60;
		return $y;
	}
	public function isCatchAuth($id=null) {
		if (!$id) $id = $this->id;
		$auth = false;	
		if ($this->getCatchAuth($id)>0) $auth = true;
		if ($this->getLastFapAction($id)>strftime("%Y-%m-%dT%H:%M:%S",time()-$this->catchGroggy)) $auth = false;
		return $auth;
	}
	public function isCatchable() {
		$auth = false;	
		if (makeDate($this->getLastFapAction())+$this->getDelaiCatchable()>time()) $auth = true;
		return $auth;
	}
	public function getDelaiCatchable() {
		$tt = $this->getListUsers();
		$mn = 0;
		foreach ($tt as $usr => $v) $mn = max($mn,$this->getCatchAuth($usr));
		return $mn;
	}
	public function getDateCatchable() {
		return strftime('%Y-%m-%dT%H:%M:%S',makeDate($this->getLastFapAction())+$this->getDelaiCatchable());
	}
	public function getFapVotable() {
		if ($this->conn and $this->id) {		
			$date = strftime("%Y-%m-%dT%H:%M:%S",time()-$this->voteDelai);
			$sql = "SELECT * FROM t_faplogs_fap WHERE usr_id=".$this->id." and icb_id is null 
						and (fap_date>'".$date."' or fap_declare>'".$date."' or fap_offline>'".$date."') 
						order by fap_id limit 1";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {					
				return $data['fap_id'];
			}	
		}
	}
	private function CarAleatoire($taille) {
		$cars="azertyiopqsdfghjklmwxcvbn0123456789*.!:;,.AZERTYUIOPQSDFGHJKLMWXCVBN$+-0123456789azertyiopqsdfghjklmwxcvbn"; //Listes des caractères possibles
		$mdp='';
		$long=strlen($cars);
		srand((double)microtime()*1000000); //Initialise le générateur de nombres aléatoires
		for($i=0;$i<$taille;$i++) $mdp = $mdp.substr($cars,rand(0,$long-1),1);
		return $mdp;
	}
	private function getTag($id) {
		$tag = "FAP".crypt($this->CarAleatoire(30).$id.strftime("%Y%m%d%H%M%S",time()))."GO";
		return $tag;
	}
	public function askInitUser($entry) {
		$id = null;
		$entry = $this->transformLogin($entry);
		$info = array();
		$info['entry'] = $entry;
		if ($this->conn and $entry!='') {				
			$sql = "SELECT * FROM t_utilisateurs_usr WHERE LOWER(usr_nom)='".$entry."' or LOWER(usr_email)='".$entry."'";
			$req = mysql_query($sql,$this->conn);
			if (mysql_num_rows($req)==1 and $data = mysql_fetch_array($req)) {					
				$id = $data['usr_id'];
			}
			if (mysql_num_rows($req)>1) {
				$info['error'] = array();
				while ($data = mysql_fetch_array($req)) {					
					$info['error'][] = $data['usr_nom'];
				}	
			}
			if (mysql_num_rows($req)==0) {
				$info['error'] = array();
				if (strlen($entry)>2) {
					$info['like'] = true;
					$sql = "SELECT * FROM t_utilisateurs_usr WHERE LOWER(usr_nom) like '%".$entry."%' or LOWER(usr_email) like '%".$entry."%'";
					$req = mysql_query($sql,$this->conn);
					while ($data = mysql_fetch_array($req)) {					
						$info['error'][] = $data['usr_nom'];
					}	
				} else {
					$info['few'] = true;
				}
			}				
		}		
		if ($this->isValideId($id)) {
			$info['info'] = $this->logGetInfo($id);
			$info['usr'] = $id;
			if ($info['info']['email']!='') {
				$this->isInit = 1;
				$info['lien'] = $this->setLienAutologin($id,1);
				$this->isInit = null;
			}
		}
		return $info;
	}
	public function setLienAutologin($id,$init=null) {
		if ($this->getId()==$id or $this->isAdmin() and $this->isValideId($id) or $this->isInit and $this->isValideId($id) or $id=='null') {
			$date = strftime("%Y-%m-%dT%H:%M:%S",time());
			$tag = $this->getTag($id);
			$sql = "INSERT INTO t_lien_autologin_lan (usr_id,lan_date,lan_tag) VALUES (".$id.",'".$date."','".$tag."')";
			$req = mysql_query($sql,$this->conn);
			if ($req) {
				$lan = mysql_insert_id();
				if ($init) {
					$sql = "UPDATE t_lien_autologin_lan SET lan_init=1 WHERE lan_id=".$lan;
					$req = mysql_query($sql,$this->conn);
				}
				if ($this->newEmail) {
					$sql = "UPDATE t_lien_autologin_lan SET lan_email='".$this->newEmail."' WHERE lan_id=".$lan;
					$req = mysql_query($sql,$this->conn);
					$this->newEmail = null;
				}
				return $this->getServerName().$this->getAppName()."confirm.php?lan=".$lan."&tag=".$tag;
			}
		}
		return false;
	}
	public function valideLien($lan,$tag) {
		$page = ".";
		$mess = "";
		$sec = 1;
		$sql = "select * from t_lien_autologin_lan where lan_id=".$lan;
		$req = mysql_query($sql,$this->conn);
		if ($data = mysql_fetch_array($req)) {		
			if ($tag==$data['lan_tag']) {
				$date = $data['lan_date'];
				if ($date>strftime("%Y-%m-%dT%H:%M:%S",time()-$this->nbjLienActif*24*3600)) {
					$usr = $data['usr_id'];
					if ($usr) {
						if ($data['lan_init']) {
							$sec = 5;
							$this->isInit = 1;
							$lien = $this->setLienAutologin($usr);
							$mdp = $this->setAleaMdp($usr);
							$this->isInit = null;
							$mess .= "réinitialisation du compte effectuée<br>Un nouveau mail va être envoyer pour la reconnexion";
							$this->logout();							
							$url = $this->getServerName().$this->getAppName()."_setParam.php";
							$fields = array('init'=> '','lien'=> urlencode($lien),'mdp'=> urlencode($mdp),'usr'=>$usr);
							$fields_string = "";
							foreach($fields as $key => $value) $fields_string .= $key.'='.$value.'&';
							rtrim($fields_string,'&');
							$ch = curl_init();
							curl_setopt($ch,CURLOPT_URL, $url);
							curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
							curl_setopt($ch,CURLOPT_POST, count($fields));
							curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
							$res = curl_exec($ch);
							curl_close($ch);							
						} else {						
							$sec = 3;
							if ($data['lan_email']!='') $mess .= $this->valideEmail($usr,$data['lan_email']);
							if (!$this->getId()) {
								$this->id = $usr;
								$this->setIdSession();
								if ($mess!='') $mess .= "<br>";
								else $sec = 1;
								$mess .= "connexion en cours...";
							}
						}
					} else {
						$mess .= "Lien valide, redirection en cours...";
						$_SESSION['fap']['godson'] = 1;
						$_SESSION['fap']['godsonEmail'] = $data['lan_email'];
						$page = "profil.php";
					}
				}  else $mess .= "ce lien est trop ancien";
				$sql = "DELETE FROM t_lien_autologin_lan where lan_id=".$lan;
				mysql_query($sql,$this->conn);
			} else {
				$mess .= "oups, nous avons rencontré un petit problème...";
				$mess .= $tag." : ".$data['lan_tag'];
			}	
		} else $mess .= "ce lien est mort";
		$mess .= "<script>setTimeout(function(){document.location.replace('".$page."')},".($sec*1000).")</script>";
		return $mess;
	}
	public function delOldLien() {
		$sql = "delete from t_lien_autologin_lan where lan_date<='".strftime("%Y-%m-%dT%H:%M:%S",time()-$this->nbjLienActif*86400)."'";
		mysql_query($sql,$this->conn);
	}
	public function menageUserAttente($usr){
		$this->delOldLien($usr);
	}
	public function setAleaMdp($id) {
		if ($this->isAdmin() and $this->isValideId($id) or $this->isInit and $this->isValideId($id)) {
			$mdp = $this->CarAleatoire(13);
			$date = strftime("%Y-%m-%dT%H:%M:%S",time());
			$sql = "UPDATE t_utilisateurs_usr SET usr_password='".crypt($mdp)."', usr_password_alea='".$date."' WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			return $mdp;
		}
		return false;
	}
	public function setConfEmail($email,$id) {
		if ($this->getId()==$id or $this->isAdmin() and $this->isValideId($id)) {
			$this->newEmail = $email;
			return $this->setLienAutologin($id);
		}
	}
	public function valideEmail($usr,$email) {
		$sql = "select * from t_utilisateurs_usr where usr_id=".$usr;
		$req = mysql_query($sql,$this->conn);
		if ($data = mysql_fetch_array($req)) {		
			$sql = "UPDATE t_utilisateurs_usr SET usr_email='".$email."'  WHERE usr_id=".$usr;
			mysql_query($sql,$this->conn);
			return "Merci ".$data['usr_nom'].", ton email ".$email." est maintenant validé.";
		}
	}

	
	
	// LEVEL UP
	public function calcPoints($id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$pts = ($lvl['niveau']-1)*$lvl['niveau']*50 + $lvl['points'];
			return $pts;	
		}	
	}
	public function incPoints($nb,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$sql = 'update t_level_lvl set lvl_experience=lvl_experience+'.$nb.', lvl_points=lvl_points+'.$nb.' where usr_id='.$id;
			mysql_query($sql,$this->conn);
			$this->incLevel($id);
		}	
	}
	private function incLevel($id) {
		if ($this->conn) {
			$lvl = $this->logGetLevel($id);
			if ($lvl['niveau']*100<$lvl['points']) {
				$sql = "update t_level_lvl set lvl_niveau=lvl_niveau+1, 
						lvl_points=lvl_points-".($lvl['niveau']*100).", 
						lvl_up='".strftime("%Y-%m-%dT%H:%M:%S",time())."'
						where usr_id=".$id;
				mysql_query($sql,$this->conn);
				$this->incLevel($id);
			}			
		}	
	}
	public function decPoints($nb,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$pts = $this->calcPoints($id);
			if ($nb<$pts) {
				$sql = 'update t_level_lvl set lvl_points=lvl_points-'.$nb.' where usr_id='.$id;
				mysql_query($sql,$this->conn);
				$this->decLevel($id);
				return true;
			}	
		}	
	}
	private function decLevel($id) {
		if ($this->conn) {
			$lvl = $this->logGetLevel($id);
			if ($lvl['points']<0) {
				$sql = 'update t_level_lvl set lvl_niveau=lvl_niveau-1, 
						lvl_points=lvl_points+'.(($lvl['niveau']-1)*100).' 
						where usr_id='.$id;
				mysql_query($sql,$this->conn);
				$this->decLevel($id);
			}			
		}	
	}
	public function incPowerReguled($nb=1,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$p = min($nb,$lvl['niveau']*10-$lvl['power']);
			if ($p>0 and $lvl['power_date']<strftime('%Y-%m-%dT%H:%M:%S',time()-86400)) {
				$sql = "update t_level_lvl set lvl_power=lvl_power+".$p.", 
						lvl_power_date='".strftime('%Y-%m-%dT%H:%M:%S',time())."' where usr_id=".$id;
				mysql_query($sql,$this->conn);
			}	
		}	
	}
	public function incPower($nb=1,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$p = min($nb,$lvl['niveau']*10-$lvl['power']);
			if ($p>0) {
				$sql = "update t_level_lvl set lvl_power=lvl_power+".$p." where usr_id=".$id;
				mysql_query($sql,$this->conn);
			}	
		}	
	}
	public function giftPower($nb,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$p = min($nb,$lvl['niveau']*10-$lvl['power']);
			$o = min($lvl['experience'],$lvl['coffre']+$nb-$p);
			$sql = "update t_level_lvl set lvl_power=lvl_power+".$p.", lvl_coffre=".$o." where usr_id=".$id;
			mysql_query($sql,$this->conn);
		}	
	}
	public function getEquivPower($id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$info = $this->logGetInfo($id);
			$equiv = 0;
			if (!$info['nomatelas']) {
				if ($lvl['niveau']>=5) $equiv = 10;
				if ($lvl['niveau']>=10) $equiv = 30;
				if ($lvl['niveau']>=20) $equiv = 50;
				if ($lvl['niveau']>=30) $equiv = 100;
			}
			return $equiv;	
		}	
	}
	public function equivPower($id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$equiv = $this->getEquivPower($id);
			if ($equiv>0 and $lvl['power']<$equiv) {
				$e = min($lvl['coffre'],$equiv-$lvl['power']);
				$sql = "update t_level_lvl set lvl_power=lvl_power+".$e.", lvl_coffre=lvl_coffre-".$e." where usr_id=".$id;
				mysql_query($sql,$this->conn);
			}	
		}	
	}
	public function buyPower($nb,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			$p = min($nb,$lvl['niveau']*10-$lvl['power']);
			if ($p>0 and $this->decPoints($p*2,$id)) {
				$sql = "update t_level_lvl set lvl_power=lvl_power+".$p." where usr_id=".$id;
				mysql_query($sql,$this->conn);
			}	
		}	
	}	
	public function decPower($nb,$id=null) {
		if (!$id) $id=$this->id;
		if ($this->isAdmin() or $this->id==$id) {
			$lvl = $this->logGetLevel($id);
			if ($nb<=$lvl['power']) {
				$sql = "update t_level_lvl set lvl_power=lvl_power-".$nb." where usr_id=".$id;
				mysql_query($sql,$this->conn);
				$this->equivPower();
				return true;
			}	
		}	
	}
	public function buyCapacity($pow,$code,$delai,$num='null') {
		if ($this->decPower($pow)) {
			if ($delai>0) $date = "'".strftime("%Y-%m-%dT%H:%M:%S",time()+$delai)."'";
			else $date = 'null';
			if ($this->hasCapacity($code)) {
				$sql = "update t_capacity_cpt set cpt_date=".$date.", cpt_num=".$num." where cpt_id=".$this->capacityInfo['cpt'];
			} else {	
				$sql = "insert into t_capacity_cpt (usr_id,cpt_code,cpt_date,cpt_num) values 
						(".$this->id.",'".$code."',".$date.",".$num.")";
			}	
			mysql_query($sql,$this->conn);
			return true;
		}	
	}
	public function useCapacity($code,$num) {
		if ($this->id) {
			if ($this->hasCapacity($code)) {
				$sql = "update t_capacity_cpt set cpt_num=".$num." where cpt_id=".$this->capacityInfo['cpt'];
			} 	
			mysql_query($sql,$this->conn);
		}	
	}
	public function hasCapacity($code,$id=null) {
		$this->capacityInfo['code'] = $code;
		$this->capacityInfo['date'] = null;
		$this->capacityInfo['num'] = 0;
		if (!$id) $id=$this->id;
		if ($this->id) {
			$sql = "select * from t_capacity_cpt where usr_id=".$id." and cpt_code='".$code."'
					and (cpt_date>'".strftime("%Y-%m-%dT%H:%M:%S",time())."' or cpt_date is null)";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {
				$this->capacityInfo['cpt'] = $data['cpt_id'];
				$this->capacityInfo['date'] = $data['cpt_date'];
				$this->capacityInfo['num'] = $data['cpt_num'];
				$this->capacityInfo['info'] = $data['cpt_info'];
				return true;
			}	
		}	
	}
	public function isLoneCapacity($code) {
		$is = 0;
		if ($code=='mst-mirror') $is = 43200;
		if ($code=='mst-speak') $is = 86400;
		if ($code=='mst-pandemic') $is = 172800;
		if ($code=='mst-chtouille') $is = 172800;
		return $is;
	}
	public function whoHasLastCapacity($code) {
		if ($this->id) {
			$sql = "select * from t_capacity_cpt where cpt_code='".$code."'
					and (cpt_date>'".strftime("%Y-%m-%dT%H:%M:%S",time())."' or cpt_date is null)
					order by cpt_date desc";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {
				return $data['usr_id'];
			}	
		}	
	}
	public function cleanCapacity() {
		if ($this->conn) {
			$sql = "delete from t_capacity_cpt where cpt_date<'".strftime("%Y-%m-%dT%H:%M:%S",time())."' and cpt_date is not null";
			mysql_query($sql,$this->conn);
		}	
	}	
	
	
	// CATCH
	public function catchedRecupDate() {
		return strftime("%Y-%m-%dT%H:%M:%S",time()-$this->catchedRecup);	
	}
	public function catchRecupDate() {
		return strftime("%Y-%m-%dT%H:%M:%S",time()-$this->catchRecup);	
	}
	public function catchFap($fapid) {
		$sql2 = "select * from t_fapcatch_fch where fap_id=".$fapid." and usr_id=".$this->getId();
		$req2 = mysql_query($sql2,$this->conn);
		if ($data2 = mysql_fetch_array($req2)) {
			$this->errCatch = "Tu as déjà attrapé ce fap !";
		} else {	
			$sql = "select * from t_faplogs_fap where fap_id=".$fapid;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {		
				$info = $this->logGetInfo($data['usr_id']);
				if ($this->info['email']!='') {
					$date = $data['fap_date'];
					if ($data['fap_declare']!='') $date = $data['fap_declare'];
					if ($data['fap_offline']!='') $date = $data['fap_offline'];
					if (time()-makeDate($date)<$this->getCatchAuth()) {
						$date = strftime("%Y-%m-%dT%H:%M:%S",time());
						$sql = "INSERT INTO t_fapcatch_fch (fap_id,usr_id,fch_date) VALUES (".$fapid.",".$this->getId().",'".$date."')";
						mysql_query($sql,$this->conn);
						$this->incPoints(100);
						return $date;
					} else $this->errCatch = "Le Fap est trop ancien, ".$info['nom']." a eu le temps de se refroquer !";
				} else $this->errCatch = "Tu dois avoir une adresse mail pour attraper tes amis";
			}	
		}	
	}
	public function parrainer($email,$message="") {
		$lien = $this->setLienAutologin('null');
	}
	
	public function getBestFappeurDate($nb=0, $rang=1, $sum=null, $masque=null) {
		global $avecFapAnnule;
		$ret = null;
		if ($this->conn and $this->id) {
			if (!$masque) $masque = substr(strftime("%Y-%m-%dT%H:%M:%S",time()),0,$nb)."%";
			$sql = "select usr_id, count(*) as sum from t_faplogs_fap where fap_date like '".$masque."' 
						".($avecFapAnnule?"":"and (fap_annule is null or fap_annule<>1)")."
						group by usr_id order by sum desc, max(fap_date) limit ".$rang;
			$req = mysql_query($sql,$this->conn);
			while ($data = mysql_fetch_array($req)) {		
				$ret = $data['usr_id'];
				if ($sum) $ret = $data['sum'];
			}
		}
		return $ret;
	}	
	public function getMyFapDate($nb=0, $all=null, $masque=null) {
		global $avecFapAnnule;
		if ($this->conn and $this->id) {
			if (!$masque) $masque = substr(strftime("%Y-%m-%dT%H:%M:%S",time()),0,$nb)."%";
			$sql = "select count(*) as sum from t_faplogs_fap where fap_date like '".$masque."' 
						".($avecFapAnnule?"":"and (fap_annule is null or fap_annule<>1)")."
						".($all?"":"and usr_id=".$this->id)." order by sum desc limit 1"; 
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {		
				return $data['sum'];
			}	
		}
	}	
	
	public function getId() {
		return $this->id;
	}
	public function getListUsers() {
		$tt = array();
		if ($this->conn) {
			$sql = "SELECT * FROM t_utilisateurs_usr order by usr_nom";
			$req = mysql_query($sql,$this->conn);
			while ($data = mysql_fetch_array($req)) {				
				$tt[$data['usr_id']] = array('nom'=>$data['usr_nom']);
			}
		}
		return $tt;
	}


	// LOGIN
	public function logout() {
		$this->id = null;
		unset($_SESSION['fap']);
		$this->setCookieConnexion();
	}
	private function transformLogin($nom) {
		$nom = str_replace("\\","",str_replace("'","''",strtolower($nom)));
		return $nom;
	}
	public function isMdpTemp() {
		if ($this->getId()) {
			if ($this->passwordAlea!='') return true;
		}	
		return false;
	}
	public function login($nom,$mdp,$cookie) {
		if ($this->conn) {
			if ($nom!='') {
				$nom = $this->transformLogin($nom);
				$sql = "SELECT * FROM t_utilisateurs_usr WHERE LOWER(usr_nom)='".$nom."'";
				$req = mysql_query($sql,$this->conn);
				if ($data = mysql_fetch_array($req)) {									
					if (crypt($mdp,$data['usr_password'])==$data['usr_password']) {
						$tempo = true;
						if ($data['usr_password_alea']!='') {
							if ($data['usr_password_alea']<strftime("%Y-%m-%dT%H:%M:%S",time()-$this->nbjAlea*84400)) {
								$_SESSION['fap']['alea'] = "Mot de passe généré trop ancien. Veuillez renouveler votre demande.";
								$tempo = false;
							} else {
								// $_SESSION['fap']['alea'] = "Pensez à changer votre mot de passe temporaire !";
							}
						} 
						if ($tempo) {
							$this->id = $data['usr_id'];
							$this->setIdSession();
							$this->setResterConnecte($cookie);
							$this->setCookieConnexion();
						}
					}
				}
			}
		}
	}
	public function isUserDispo($nom) {
		if ($this->conn) {
			if ($nom!='') {
				$nom = $this->transformLogin($nom);
				$sql = "SELECT * FROM t_utilisateurs_usr WHERE LOWER(usr_nom)='".$nom."'";
				$req = mysql_query($sql,$this->conn);
				if ($data = mysql_fetch_array($req)) {
					$this->errNew = "Ce nom existe déjà. Choisis-en un autre.";
				} else return true;
			} else $this->errNew = "Le nom ne peut pas être vide.";
		}
	}
	public function newUser($nom,$mdp) {
		if ($this->isUserDispo($nom)) {		
			$sql = "INSERT INTO t_utilisateurs_usr (usr_nom,usr_password) 
					VALUES ('".str_replace("'","''",$nom)."','".crypt($mdp)."');";
			$req = mysql_query($sql,$this->conn);
			if ($req) {				
				$id = mysql_insert_id();
				$this->id = $id;
				$this->setIdSession();
				$sql = "INSERT INTO t_level_lvl (usr_id,lvl_niveau,lvl_points,lvl_experience,lvl_power,lvl_coffre) VALUES (".$id.",1,0,0,0,0);";
				mysql_query($sql,$this->conn);
				if (isset($_SESSION['fap']['godsonEmail'])) {
					$sql = "UPDATE t_utilisateurs_usr SET usr_email='".$_SESSION['fap']['godsonEmail']."' WHERE usr_id=".$id;
					mysql_query($sql,$this->conn);
				}
				$sql = "UPDATE t_utilisateurs_usr SET usr_random=".rand()." WHERE usr_id=".$id;
				mysql_query($sql,$this->conn);
			}
		}
	}
	
	public function usurpUser($id) {
		if ($this->isAdmin() and $this->isValideId($id) and $this->isDev()) {
			$this->id = $id;
			$this->setIdSession();
			$this->logGetInfo();
		}
	}
	public function deleteUser($id) {
		if ($this->conn and $this->isAdmin() and $this->id!=$id) {
			$info = $this->logGetInfo($id);
			$sql = "DELETE FROM t_images_img WHERE img_id=".$info['img_id'];
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_utilisateurs_usr WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_droits_utilisateurs_dru WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_connexion_cnx WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_maximes_mxm WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_level_lvl WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_user_key_usk WHERE usr_id=".$id;
			mysql_query($sql,$this->conn);
		}
	}
	public function deleteMe() {
		if ($this->conn and $this->id) {
			$sql = "DELETE FROM t_images_img WHERE img_id=".$this->info['img_id'];
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_utilisateurs_usr WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_droits_utilisateurs_dru WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_connexion_cnx WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_maximes_mxm WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_level_lvl WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$sql = "DELETE FROM t_user_key_usk WHERE usr_id=".$this->id;
			mysql_query($sql,$this->conn);
			$this->logout();		
		}
	}
	public function modifInfo($data) {
		if ($this->conn and $this->id) {
			if (isset($data['login'])) {
				if ($this->isUserDispo($data['login']) and $this->calcPoints()>=1000) {	
					$sql = "UPDATE t_utilisateurs_usr SET usr_nom='".str_replace("'","''",$data['login'])."' WHERE usr_id=".$this->id;
					mysql_query($sql,$this->conn);
					$this->setIdSession();	
					$this->decPoints(1000);
				}		
			}
			if (isset($data['pseudo'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_pseudo='".str_replace("'","''",$data['pseudo'])."' WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}
			if (isset($data['sexe'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_sexe='".$data['sexe']."' WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}
			if (isset($data['confGeoloc'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_confirm_geoloc=".$data['confGeoloc']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}
			if (isset($data['warTerritory'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_territoire=".$data['warTerritory']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}	 
			if (isset($data['NoMatelas'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_nomatelas=".$data['NoMatelas']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}			
			if (isset($data['tel'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_tel='".$data['tel']."' WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);		
			}			
			if (isset($data['notifMail'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_notif_mail=".$data['notifMail']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}
			if (isset($data['notifSms'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_notif_sms=".$data['notifSms']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}
			if (isset($data['notifIfttt'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_notif_ifttt=".$data['notifIfttt']." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);				
			}			
			if (isset($data['image'])) {
				$this->setImgUser($data['image']);
			}
			if (isset($data['mdp'])) {
				$sql = "UPDATE t_utilisateurs_usr SET usr_password='".crypt($data['mdp'])."', usr_password_alea=null WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);
			}
			if (isset($data['cookie'])) $this->setResterConnecte($data['cookie']);	
			$this->logGetInfo();
		}
	}
	protected function setImgUser($contenu) {
		if ($this->conn and $contenu) {
			$sql = "INSERT INTO t_images_img (img_contenu) VALUES ('".addslashes($contenu)."')";
			$req = mysql_query($sql,$this->conn);
			if ($req) {
				$id = mysql_insert_id();
				if ($this->info['img_id']!='') {
					$sql = "DELETE FROM t_images_img WHERE img_id=".$this->info['img_id'];
					mysql_query($sql,$this->conn);
				}
				$sql = "UPDATE t_utilisateurs_usr SET img_id=". $id." WHERE usr_id=".$this->id;
				mysql_query($sql,$this->conn);
			}
		}	
	}
	public function getImg($img,$force=false) {
		$id = $this->whoHasLastCapacity('mst-mirror');
		if ($id and !$force and !getMstHealth('mst-mirror')) {
			$info = $this->logGetInfo($id);
			if ($info['img_id']) $img = $info['img_id'];
		}
		if ($this->conn and $img and $img!='') {
			$sql = "SELECT * FROM t_images_img WHERE img_id=".$img;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				if ($data['usr_id']===null or $this->id==$data['usr_id'] or $this->isDev()) 
					return $data['img_contenu'];
			}
		}
	}
	protected function isValideId($id) {
		if ($this->conn and $id) {
			$sql = 'SELECT * FROM t_utilisateurs_usr WHERE usr_id='.$id;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				return true;
			}
		}
		return false;
	}
	
	// user_key
	protected function setForeignKey($usk) {
		if ($this->conn) {
			$sql = "select * from t_user_key_usk where usk_id=".$usk;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				$foreign = $data['usk_appkey'].$data['usk_userkey'].$data['usk_id'].$data['usk_random'];
				$foreign = crypt($foreign);
				$sql = "update t_user_key_usk set usk_foreignkey='".$foreign."' where usk_id=".$usk;
				mysql_query($sql,$this->conn);
				return $foreign;
			}
		}
		return false;
	}
	public function modifUserKey($key,$app) {
		if ($this->conn and $this->id) {
			$usk = null;
			$sql = "select * from t_user_key_usk where usr_id=".$this->id." and usk_appkey='".$app."'";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				$usk = $data['usk_id'];
				$sql = "update t_user_key_usk set usk_userkey='".$key."' where usk_id=".$usk;
				mysql_query($sql,$this->conn);
			} else {
				$sql = "insert into t_user_key_usk (usr_id,usk_appkey,usk_userkey,usk_random,usk_actif) 
							values (".$this->id.",'".$app."','".$key."',".rand().",1);";
				$req = mysql_query($sql,$this->conn);
				if ($req) $usk = mysql_insert_id();
			}
			if ($usk) return $this->setForeignKey($usk);
		}
	}
	public function modifActifKey($usk,$a) {
		if ($this->conn) {
			$sql = "update t_user_key_usk set usk_actif=".$a." where usk_id=".$usk;
			mysql_query($sql,$this->conn);
		}
	}
	public function modifRandomKey($usk) {
		if ($this->conn) {
			$sql = "update t_user_key_usk set usk_random=".rand()." where usk_id=".$usk;
			mysql_query($sql,$this->conn);
			return $this->setForeignKey($usk);
		}
	}
	public function logFromForeignKey($usr,$app,$foreign) {
		if ($this->conn) {
			$sql = "select * from t_user_key_usk where usr_id=".$usr." and usk_appkey='".$app."'";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				if ($data['usk_foreignkey']==$foreign) {
					$this->id = $usr;
					$this->logGetInfo();
					$this->logGetDroits();
					$this->logGetLevel();
					return true;
				} else {
					$this->errForeign = "La clef ne correspond pas à l'utilisateur";
				}
			} else {
				$this->errForeign = "Aucune entrée pour l'utilisateur demandé";
			}
		}
		return false;
	}
	public function getUserKey($app,$id) {
		if (!$id) $id = $this->id;
		if ($this->conn) {
			$sql = "select * from t_user_key_usk where usr_id=".$id." and usk_appkey='".$app."'";
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				return $data['usk_userkey'];
			}
		}
	}
	
	
	
	
	// COOKIE gestion cookie autologin
	private function isAcceptAutologin($id) {
		$accept = false;
		if ($this->conn and $id) {
			$sql = 'SELECT * FROM t_utilisateurs_usr WHERE usr_id='.$id;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				if ($data['usr_cookie']=='1') $accept = true;
			}
		}
		return $accept;
	}
	private function getLoginFromId($id) {
		$login = "";
		if ($this->conn and $id) {
			$sql = 'SELECT * FROM t_utilisateurs_usr WHERE usr_id='.$id;
			$req = mysql_query($sql,$this->conn);
			if ($data = mysql_fetch_array($req)) {				
				$login = $data['usr_nom'].$data['usr_random'];
			}
		}
		return $login;
	}
	private function makeCookieLogin($id) {
		$cookie = "";
		$cookie .= $this->getLoginFromId($id).$id.$_SERVER['HTTP_USER_AGENT'];	
		return $cookie;
	}
	private function cryptCookieLogin($id=null,$clef=null) {
		if ($id) {
			$cookie = $this->makeCookieLogin($id)."mZyu+GF:d87UC!ù7vg2*u";
			if ($clef) $key = crypt($cookie,$clef);
			else  $key = crypt($cookie,'fA');
			$key = $id."||".$key;
		} else {
			$key = "";
		}
		return $key;
	}
	private function cryptCookieDev($dev=null,$clef=null) {
		//if ($dev) {
			//$cookie = $this->id.$dev."hT6èHOus2fg1jH:65*ùT(+";
			//if ($clef) $key = crypt($cookie,$clef);
			//else  $key = crypt($cookie);
			//$key = $dev."||".$key;
		//} else {
			//$key = "";
		//}
		if ($dev) {
        $cookie = $this->id . $dev . "hT6èHOus2fg1jH:65*ùT(+";
        
        if ($clef) {
            // Utilise le salt fourni
            $key = crypt($cookie, $clef);
        } else {
            // Génère un salt fixe basé sur le cookie pour avoir toujours le même hash
            $salt = '$6$' . substr(md5($cookie), 0, 16) . '$';
            $key = crypt($cookie, $salt);
        }
        
        $key = $dev . "||" . $key;
    } else {
        $key = "";
    }
		return $key;
	}

	private function setCookieConnexion() {
		$id = null;
		$this->getAllCookies();
		if ($this->id and $this->resterConnecte) $id = $this->id;			
		$key = $this->cryptCookieLogin($id);
		$delai = 100 * 24 * 3600;
		setcookie('fap_autologin', $key, time()+$delai, '/');
	}
	private function getCookieConnexion() {
		$verif = false;
		$this->getAllCookies();
		if (isset($_COOKIE['fap_autologin']) and $_COOKIE['fap_autologin']!='') {
			list($id,$clef) = explode("||",$_COOKIE['fap_autologin']);		
			$key = $this->cryptCookieLogin($id,$clef);
			if ($_COOKIE['fap_autologin']==$key) {
				$verif = true;
				if ($this->resterConnecte) {
					$this->id = $id;
					$this->setIdSession();
					$this->recupSession();
				}
			}
		}
		return $verif;
	}
	private function getAllCookies() {
		if (isset($_COOKIE['fapResterConnecter']) and $_COOKIE['fapResterConnecter']=='1') $this->resterConnecte = true;
		if (isset($_COOKIE['fapdev']) and $_COOKIE['fapdev']!='') {
			list($dev,$clef) = explode("||",$_COOKIE['fapdev']);
			$key = $this->cryptCookieDev($dev,$clef);
			if ($_COOKIE['fapdev']==$key) $this->modeDev = $dev;
		}
	}
	private function setResterConnecte($cookie) {
		if ($this->id and $this->conn) {
			if ($cookie) setcookie('fapResterConnecter', '1', time()+(100*24*3600), '/');
			else setcookie('fapResterConnecter', '', time()-1, '/');
			$this->resterConnecte = $cookie;
			$this->setCookieConnexion();
		}
	}
	public function getResterConnecte() {
		return $this->resterConnecte;
	}
	
	
	
	// conversion mois pour la date en francais
	// fuck qui n'a pas installé le pack français
	public function convMoisFrancais($m) {
		$t_mois = array();
		$t_mois['January'] = 'janvier';
		$t_mois['February'] = 'février';
		$t_mois['March'] = 'mars';
		$t_mois['April'] = 'avril';
		$t_mois['May'] = 'mai';
		$t_mois['June'] = 'juin';
		$t_mois['July'] = 'juillet';
		$t_mois['August'] = 'août';
		$t_mois['September'] = 'septembre';
		$t_mois['October'] = 'octobre';
		$t_mois['November'] = 'novembre';
		$t_mois['December'] = 'décembre';
		if (isset($t_mois[$m])) return $t_mois[$m];
		else return utf8_encode($m);
	}
	public function miniMois($m) {
		$t_mois = array();
		$t_mois['01'] = 'jan';
		$t_mois['02'] = 'fév';
		$t_mois['03'] = 'mars';
		$t_mois['04'] = 'avr';
		$t_mois['05'] = 'mai';
		$t_mois['06'] = 'juin';
		$t_mois['07'] = 'juil';
		$t_mois['08'] = 'août';
		$t_mois['09'] = 'sept';
		$t_mois['10'] = 'oct';
		$t_mois['11'] = 'nov';
		$t_mois['12'] = 'déc';
		if (isset($t_mois[$m])) return $t_mois[$m];
		else return utf8_encode($m);
	}

}
