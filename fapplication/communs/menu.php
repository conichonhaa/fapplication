<?php
include_once('communs/classFAP.php');
$fap = new fap;
include_once('communs/funcDate.php');
include_once('communs/funcFap.php');
include_once('communs/variables.php');

// acces au mode developpement
if (isset($_GET['modedev'])) {
	$fap->setModeDev($_GET['modedev']);
	$string = "<script>document.location.replace(document.location.href.split('?')[0])</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}	
// fin de bloc


// redirection vers fap.brenat-production.fr
if (isset($_GET['debug']) or isset($_COOKIE['fapServerDebug'])) $_SESSION['fap']['fapServerDebug'] = 1;
if (isset($_SESSION['fap']['fapServerDebug'])) setcookie('fapServerDebug', '1', time()+(100*24*3600), '/');
if (strpos($fap->getServerName(),"fap.brenat-production.fr")===false and !isset($_SESSION['fap']['fapServerDebug']) and !$isApplicationLocal) {
	include_once('communs/head.php');
	$string = $string_head;	
	$string .= "<meta http-equiv='refresh' content='10;url=https://fap.brenat-production.fr'> ";
	$string .= "</head><body>";
	$string .= "<div style='text-align:center;margin-top:2em;font-size:300%;'>
					la FAPplication est en perpétuelle migration... mais elle restera accessible continuellement
					<br>Veuillez dorénavent mémoriser <a target='_parent' href='http://fap.brenat-production.fr'>fap.brenat-production.fr</a> dans vos favoris
					</div>";
	$string .= "</body></html>";
	echo $string;
	die();
}
if (!$isHttps and !isset($_SESSION['fap']['fapServerDebug']) and !$isApplicationLocal) {
	echo "<script>document.location.replace('".str_replace("http://","https://",$fap->getServerName()).$_SERVER['REQUEST_URI']."')</script>";
	die();
}
// fin redirection


// redirection vers mode hors ligne
if ($fap->getId() and isset($t_param['mode_maintenance']) and $t_param['mode_maintenance']=='1' 
		and (!SelMenu("admin.php") or !$fap->isAdmin('maint') )) {
	
	$page = "fallback/fallbackFap.php";
	if ($fap->isAdmin('maint')) $page = "aMaint-admin.php";

	include_once('communs/head.php');
	$string = $string_head;	
	$string .= "<meta http-equiv='refresh' content='0;url=https://fap.brenat-production.fr'> ";
	$string .= "</head><body>";
	$string .= "<script>document.location.replace('".$page."')</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}
// fin redirection


$allo = "Bienvenue ";


$string_menu = '';


$fap->cleanCapacity();

if ($fap->getId()) {
	
	$vGetImg = "";
	$id = $fap->whoHasLastCapacity('mst-mirror');
	if ($id and !getMstHealth('mst-mirror')) $vGetImg = "&v=".$id."+".intval(time()/3600);
	
	// angry style
	$avatarAngry = "";
	$nbj = intval((time()-makeDate($fap->getLastFap()))/86400)-3;
	if ($nbj>30) $nbj = 30;
	if ($nbj>2) {
		$startColor = "FFD0FF";
		$endColor = "F702F7";
		if ($isApplicationQualif or strpos($_SERVER['HTTP_HOST'],":")!==false) {
			$startColor = "F2BF88";
			$endColor = "F75E00";
		}	
		$sColor = str_split($startColor,2);
		$eColor = str_split($endColor,2);
		for($i=0 ;$i<3 ;$i++) $diff[$i] = (hexdec($sColor[$i])-hexdec($eColor[$i]))/30;
		$colorAngry = sprintf('%02X',max(0,min(255,(hexdec($sColor[0])-$diff[0]*($nbj-1))))).
					sprintf('%02X',max(0,min(255,(hexdec($sColor[1])-$diff[1]*($nbj-1))))).
					sprintf('%02X',max(0,min(255,(hexdec($sColor[2])-$diff[2]*($nbj-1)))));
		$string_menu .= "<style>.cadre, .buttOption {box-shadow: -5px 2px 40px 10px #".$colorAngry.";}
								.cadre {background-color: #".$colorAngry.";}</style>";
		$a = "";
		for($i=3 ;$i<$nbj ;$i++) $a .= "a";
		if ($nbj>3) $string_menu .= "<style>.cadre::before {content:'Need to FA".$a."AP !';font-size:80%;font-style:italic;font-weight:bold;
												display:block;text-align:center;margin-top:-10px;color:#".$startColor.";}</style>";						
		$avatarAngry = "box-shadow: -5px 2px 40px 10px #".$colorAngry;
	}	
	// fin angry style
	
	if ($isApplicationQualif) $allo = "";
	$bonjour = "<img id='menuAvatar' src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' height='100%' align='center' 
							style='float:left;margin-right:10px;border-radius:3px;".$avatarAngry."' />";
		$bonjour .= $allo."<span id='menuLogin' >".$t_users[$fap->getId()]['nom']."</span>";
		if ($isApplicationQualif) $bonjour .= " (BASE TEST)";
	$infolog = '<li class="'.SelMenu("profil.php").'"><a href="profil.php"><span class="glyphicon glyphicon-user"></span> Mon profil</a></li>
			<li class="'.SelMenu("logout.php").'"><a href="logout.php"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>';
} else {	
	$bonjour = "<img src='images/fap.png' height='100%' align='center' style='float:left;margin-right:10px;' />"
				."Fapplication";
	$infolog = '<li class="'.SelMenu("profil.php").'"><a href="profil.php"><span class="glyphicon glyphicon-user"></span> S\'inscrire</a></li>
				<li class="'.SelMenu("login.php").'"><a href="login.php"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>';
}

function SelMenu($page){
	if (strpos($_SERVER['PHP_SELF'],$page)>0) return 'active';
	else return "";
}

$string_menu .= '
<nav class="navbar navbar-default navbar-pink2" >
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>                        
      </button>
      <a class="navbar-brand" href="fFap-fap.php" >'.$bonjour.'</a>
    </div>
    <div class="collapse navbar-collapse" id="myNavbar">
      <ul class="nav navbar-nav">';
	  
if ($fap->getId()) {
	// debut-menu
	$string_menu .= '	  
        <li class="'.SelMenu("fap.php").'">
		  <a class="dropdown-toggle" data-toggle="dropdown" href="fap.php">
			<span class="glyphicon glyphicon-screenshot"></span> Fap<span class="caret"></span></a>
		  <ul class="dropdown-menu">
            <li class="'.SelMenu("fFap-fap.php").'"><a href="fFap-fap.php">Fapper</a></li>
			<li class="'.SelMenu("fDeclare-fap.php").'"><a href="fDeclare-fap.php">Déclarer</a></li>           
			<li class="'.SelMenu("fGeoloc-fap.php").'"><a href="fGeoloc-fap.php">Positionner</a></li>
			<li class="'.SelMenu("fOffline-fap.php").'"><a href="fOffline-fap.php">Récupérer</a></li>
			<li class="'.SelMenu("fSupp-fap.php").'"><a href="fSupp-fap.php">Annuler</a></li>
			<li class="'.SelMenu("fIfttt-fap.php").'"><a href="fIfttt-fap.php">Fap par IFTTT</a></li>	
			<li class="divider"></li>
			<li class="'.SelMenu("fDefi-fap.php").'"><a href="fDefi-fap.php">Défier</a></li>
			<li class="'.SelMenu("fJauge-fap.php").'"><a href="fJauge-fap.php">Jauger</a></li>
			<li class="'.SelMenu("fNew-fap.php").'"><a href="fNew-fap.php">Parrainer</a></li>
			<li class="'.SelMenu("fQualif-fap.php").'"><a href="fQualif-fap.php">Qualification</a></li>
			<li class="divider"></li>
			<li class="'.SelMenu("fChat-fap.php").'"><a href="fChat-fap.php">FapChat</a></li>
			<li class="'.SelMenu("fBook-fap.php").'"><a href="fBook-fap.php">FapBook</a></li>
          </ul>
		</li> 
		<li class="'.SelMenu("hymne.php").'"><a href="hymne.php">
			<span class="glyphicon glyphicon-music"></span> Hymne</a></li>
        <li class="'.SelMenu("stats.php").'">
		  <a class="dropdown-toggle" data-toggle="dropdown" href="stats.php">
			<span class="glyphicon glyphicon-stats"></span> Stats<span class="caret"></span></a>
		  <ul class="dropdown-menu">
			<li class="'.SelMenu("sLast-stats.php").'"><a href="sLast-stats.php">Dernier Fap connu</a></li>
            <li class="'.SelMenu("sSnail-stats.php").'"><a href="sSnail-stats.php">Les Escargots</a></li>
			<li class="'.SelMenu("sFreq-stats.php").'"><a href="sFreq-stats.php">Qui suis-je ?</a></li>
			<li class="'.SelMenu("sDist-stats.php").'"><a href="sDist-stats.php">Période de retour</a></li>
			<li class="'.SelMenu("sSpecial-stats.php").'"><a href="sSpecial-stats.php">Identité remarquable</a></li>
			<li class="'.SelMenu("sHisto-stats.php").'"><a href="sHisto-stats.php">Historique</a></li>
			<li class="'.SelMenu("sGeoloc-stats.php").'"><a href="sGeoloc-stats.php">Fap Positioning System</a></li>	
			<li class="'.SelMenu("sSperm-stats.php").'"><a href="sSperm-stats.php">Equivalent sperme</a></li>
            <li class="'.SelMenu("sCatch-stats.php").'"><a href="sCatch-stats.php">Fap \'n GO !</a></li>
			<li class="'.SelMenu("Month-stats.php").'"><a href="sMonth-stats.php">Fappeur du mois</a></li>
			<li class="'.SelMenu("sActivity-stats.php").'"><a href="sActivity-stats.php">Activité</a></li>
			<li class="'.SelMenu("sIncub-stats.php").'"><a href="sIncub-stats.php">L\'Incubateur</a></li>
			<li class="'.SelMenu("sExport-stats.php").'"><a href="sExport-stats.php">Export CSV</a></li>
          </ul>
		</li>
		<li class="'.SelMenu("infos.php").'">
		  <a class="dropdown-toggle" data-toggle="dropdown" href="infos.php">
			<span class="fa fa-info"></span>&nbsp; Infos<span class="caret"></span></a>
		  <ul class="dropdown-menu">
            <li class="'.SelMenu("iNews-infos.php").'"><a href="iNews-infos.php">Les news</a></li>
            <li class="'.SelMenu("iCharte-infos.php").'"><a href="iCharte-infos.php">La charte</a></li>
            <li class="'.SelMenu("iSerment-infos.php").'"><a href="iSerment-infos.php">Le serment</a></li>
			<li class="'.SelMenu("iFappeur-infos.php").'"><a href="iFappeur-infos.php">Les Fappeurs</a></li>
			<li class="'.SelMenu("iMaxime-infos.php").'"><a href="iMaxime-infos.php">Les Maximes</a></li>
			<li class="'.SelMenu("iLevel-infos.php").'"><a href="iLevel-infos.php">Mon expérience</a></li>
			<li class="'.SelMenu("iCoffre-infos.php").'"><a href="iCoffre-infos.php">Mon Coffre</a></li>
			<li class="'.SelMenu("iNotice-infos.php").'"><a href="iNotice-infos.php">Le mode d\'emploi</a></li>
			';	
			if (isMstInfect('mst-chtouille')) {
				$string_menu .= '
				<li class="divider"></li>
				<li class="'.SelMenu("iMst-infos.php").'"><a href="iMst-infos.php">Chtouille</a></li>';
			}
			$string_menu .= '
          </ul>
		</li>   
		<li class="'.SelMenu("options.php").'"><a href="options.php">
			<span class="glyphicon glyphicon-cog"></span> Options</a></li>
		<li class="'.SelMenu("game.php").'">
		  <a class="dropdown-toggle" data-toggle="dropdown" href="game.php">
			<span class="fa fa-gamepad"></span> Jeux<span class="caret"></span></a>
		  <ul class="dropdown-menu">
			<li class="'.SelMenu("gScores-game.php").'"><a href="gScores-game.php">Palmarès</a></li>
			<li class="'.SelMenu("gStore-game.php").'"><a href="gStore-game.php">Boutique</a></li>
			<li class="divider"></li>
			<li class="dropdown-header"><i>Solo</i></li>
			<li class="'.SelMenu("gFusee-game.php").'"><a href="gFusee-game.php">Mise en orbite</a></li>
            <li class="'.SelMenu("gSplash-game.php").'"><a href="gSplash-game.php">Prends tout</a></li>
			<li class="divider"></li>
			<li class="dropdown-header"><i>Réseaux</i></li>		
			<li class="'.SelMenu("gWorm-game.php").'"><a href="gWorm-game.php">Panzer Fap</a></li>
			<li class="'.SelMenu("gArena-game.php").'"><a href="gArena-game.php">Sperm Arena</a></li>
			';	
			// <li class="divider"></li>
			// <li class="dropdown-header"><i>En construction</i></li>
			$string_menu .= '
          </ul>
		</li>
	';
	
	if ($fap->hasAdmin()) {
		$string_menu .= '
		<li class="'.SelMenu("admin.php").'">
		  <a class="dropdown-toggle" data-toggle="dropdown" href="admin.php">
			<span class="fa fa-unlock-alt"></span>&nbsp; Admin<span class="caret"></span></a>
		  <ul class="dropdown-menu">';
			if ($fap->isAdmin('diff')) $string_menu .= '<li class="'.SelMenu("aMessMail-admin.php").'"><a href="aMessMail-admin.php">Diffusion Mail</a></li>
												  <li class="'.SelMenu("aMessSms-admin.php").'"><a href="aMessSms-admin.php">Diffusion Sms</a></li>
												  <li class="'.SelMenu("aMessIfttt-admin.php").'"><a href="aMessIfttt-admin.php">Diffusion IFTTT</a></li>
												<li class="divider"></li>';
			if ($fap->isAdmin()) $string_menu .= '<li class="'.SelMenu("aFappeur-admin.php").'"><a href="aFappeur-admin.php">Les Fappeurs</a></li>';
			if ($fap->isAdmin()) $string_menu .= '<li class="'.SelMenu("aDroits-admin.php").'"><a href="aDroits-admin.php">Les Droits</a></li>';
            if ($fap->isAdmin('son')) $string_menu .= '<li class="'.SelMenu("aSon-admin.php").'"><a href="aSon-admin.php">Les Sons</a></li>';
			if ($fap->isAdmin('special')) $string_menu .= '<li class="'.SelMenu("aIdent-admin.php").'"><a href="aIdent-admin.php">Les Identités</a></li>';
			if ($fap->isAdmin('incub')) $string_menu .= '<li class="'.SelMenu("aIncub-admin.php").'"><a href="aIncub-admin.php">L\'Incubateur</a></li>';
			if ($fap->isAdmin('book')) $string_menu .= '<li class="'.SelMenu("aBook-admin.php").'"><a href="aBook-admin.php">Le Book</a></li>';
			if ($fap->isAdmin('gift')) $string_menu .= '<li class="'.SelMenu("aGift-admin.php").'"><a href="aGift-admin.php">Les cadeaux</a></li>';
			if ($fap->isAdmin()) $string_menu .= '<li class="'.SelMenu("aAppli-admin.php").'"><a href="aAppli-admin.php">L\'Application</a></li>';
			if ($fap->isAdmin()) $string_menu .= '<li class="divider"></li>';
			if ($fap->isAdmin('maint')) $string_menu .= '<li class="'.SelMenu("aMaint-admin.php").'"><a href="aMaint-admin.php">Maintenance</a></li>';
			if ($fap->isAdmin()) $string_menu .= '<li class="'.SelMenu("aDev-admin.php").'"><a href="aDev-admin.php">Developpement</a></li>';	
			if ($fap->isDev()) $string_menu .= '<li class="'.SelMenu("aMessMailTester-admin.php").'"><a href="aMessMailTester-admin.php">Test Mail</a></li>';
        $string_menu .= '  </ul>
		</li>
		';
	} 
	if ($fap->isDev()) {
		$string_menu .= '

		';
	}
}
	  
$string_menu .= '
      </ul>
	  <ul class="nav navbar-nav navbar-right">
        '.$infolog.'	
      </ul>
    </div>
  </div>
</nav>';


$bestMonth = $fap->getBestFappeurDate(7);


if ($fap->getId()) {
	
	$nb = 0;
	$date = "";
	if (strpos($_SERVER['REQUEST_URI'],'fFap-fap.php')>-1) {
		
	} else {
		$sql = "select count(*) as c from t_faplogs_fap";
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) $nb = $data['c'];
	}
	if ($fap->isCatchable() and !$fap->hasCapacity('invisible')) 
		$fondCompteurPlus="fondCompteurCatchable"; else $fondCompteurPlus="";
	
	$string_menu .= "<div id='divCompteur'>";

	$mst = array('mst-mirror','mst-speak','mst-pandemic');
	$isMST = false;
	foreach ($mst as $m) $isMST = ($isMST or $fap->whoHasLastCapacity($m));
	if ($isMST) {
		function bugFlag($code,$sens) {
			global $fap, $vGetImg;
			$img = "";
			$id = $fap->whoHasLastCapacity($code);
			if ($id) {
				$fap->hasCapacity($code,$id);
				$info = $fap->logGetInfo($id);
				$opacity = (getMstHealth($code)?"opacity:0.3;":"");
				if ($sens>0) $img .= "<img src='images/bug.gif' class='imgIcone' style='".$opacity."' /> ";
				$img .= "<img src='_getImg.php?img=".$info['img_id'].$vGetImg."&force' class='imgIconeMini' style='".$opacity."' />";
				if ($sens<0) $img .= " <img src='images/bugR.gif' class='imgIcone' style='".$opacity."' />";
				$img .= "&nbsp;&nbsp;&nbsp;";
			}
			return $img;
		}
		$string_menu .= "<marquee class='divBug' direction='left' scrollAmount='2'>";
			for ($i=0; $i<count($mst); $i++) $string_menu .= bugFlag($mst[$i],1);		
		$string_menu .= "</marquee>";
		$string_menu .= "<marquee class='divBug' direction='right' scrollAmount='2'>";
			for ($i=count($mst); $i>0; $i--) $string_menu .= bugFlag($mst[$i-1],-1);
		$string_menu .= "</marquee>";
	}	
	
	$string_menu .= "<div id='divCompteurChiffre' class='fondCompteur ".$fondCompteurPlus."'  nb='".$nb."' date='".$date."' >".$nb."</div>";
	
	if (($fap->isSuperDev() or ($fap->hasCapacity('stats') and !$isApplicationQualif)) and SelMenu("stats.php")) {
		$left = "15px";
		if ($decompteFap) $left = "calc(20px + 3em)";
		$string_menu .= "<div style='position:absolute;top:0;left:".$left.";'><select onchange='document.location.replace(\"?usr=\"+this.value)'>";
		$string_menu .= "<option value=''></option>";
		$sql = "select * from t_utilisateurs_usr order by usr_nom";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {									
			if ($data['usr_id']==$usrDebug) $selected='selected'; else $selected='';
			$string_menu .= "<option value='".$data['usr_id']."' ".$selected.">".$data['usr_nom']."</option>";
		}
		$string_menu .= "</select></div>";
	}

	$string_menu .= "<div id='divConnected' >
					<img src='images/connected.png' class='imgConnected' onclick='affDiv(this)' div='divConnectedList' />
					<div id='divConnectedList' style='display:none;'></div>
					</div>";
	
	if ($isGiftAble) {
		$string_menu .= "<img src='images/gift.gif' id='imgGiftLevel' onclick='document.location.replace(\"iLevel-infos.php\")' />";
	}
	
	if ($decompteFap) {
		$delayFap = 0;
		$last = $fap->getLastFap(null,true);
		if ($last) $delayFap = time()-makeDate($last);
		$string_menu .= "<div id='chronoTimerPage' delay='".$delayFap."' class='divMessage' style='font-size:80%;'></div>";
		$string_menu .= "<script type='text/javascript'>initChronoTimer();</script>";
	}
	
	$string_menu .= "</div>";
	
	//images en precharge
	$string_menu .= "<div style='display:none;' >
						<img src='images/bell.gif' />
						<img src='images/roue.gif' />
						<img src='images/xp.png' />
					</div>";
	
	$majcompt = 60;
	if (isset($t_param['maj_compt'])) $majcompt = intval($t_param['maj_compt']);
	if ($majcompt<1) $majcompt=1;
	$script = "";
	$script .= "var delaiMajFap=".($majcompt*1000).";";
	$script .= "var sonActive=".$sonActive.";";
	$script .= "var sonVolume=".($sonVolume/100).";";
	$script .= "var sonPageCoeff=".($sonPageCoeff).";";
	$script .= "var sonRacine='".($sonRacine)."';";
	$script .= "var sons={};";
	foreach ($t_sonsParam as $type => $v) {
		foreach ($v as $val => $lien) {			
			if ($type=='page' and selMenu($val)) {
				$script .= "sons.page={'wave':'".$lien."', 'actif':".$t_sons['page']['actif']."};";
			}
			if ($type=='animation') {
				$tmp = explode("_",$val);
				$script .= "sons.".$val."={'wave':'".$lien."', 'actif':0};";
				if (isset($t_sons[$tmp[0]])) $script .= "sons.".$val.".actif=".$t_sons[$tmp[0]]['actif'].";";
			}
		}
	}
	$script .= "var confGeoloc=".intval($fap->info['confirm_geoloc']).";";
	$script .= "var animationInitiale=".$animationInitiale.";var memoAnimationInitiale=".$animationInitiale.";";
	$script .= "var animationInitialeSpeed=".$animationInitialeSpeed.";";
	$script .= "var animationInitialeMode='".$animationInitialeMode."';";
	$script .= "var myUsr=".$fap->getId().";";
	if ($bestMonth) $script .= "var bestMonth=".$bestMonth.";";
	else $script .= "var bestMonth=-1;";
	$script .= "var vGetImg='".$vGetImg."';";
	$script .= "var wsPort=".$wsPort.";";
	$script .= "var wsUserConn = {type:'user', appli:document.location.href, usr:myUsr, fap:true};";
	$chtouille = 0;
	if (getMstInfect('mst-chtouille')==$fap->getId()) $chtouille = 1;
	$script .= "var chtouille=".$chtouille.";";
	$string_menu .= "<script>".$script."</script>";
}

if ($fap->getId()) {
	if ($fap->isMdpTemp()) {
		$string_menu .= "<div class='divMessage' >";
		$string_menu .= "Pensez à changer votre mot de passe temporaire !";
		$string_menu .= "</div>";
	}
	if ($fap->info['email']=='') {
		$string_menu .= "<div class='divMessage' >";
		$string_menu .= "<a href='".$fap->getAppName()."profil.php'>La Fapplication a besoin de ton mail</a>";
		$string_menu .= "</div>";
	}
	$string_menu .= "<div id='divNetworkCall' class='divMessage' ></div>";
	
}


$string_buttSound = "";
if ($sonActive) $etat = 'On'; else $etat = 'Off';
$string_buttSound .= "<img class='buttOption buttSound' etat='".$etat."' src='images/note".$etat.".png' id='sonActiveImg' 
							onclick='allumeSon(this);' title='Allumer/éteindre les sons' />";

							

$string_banner = "<div class='bottomCadre'></div>";
if ($fap->getId() and !$fap->isDevSafe() and $bandeauDefile) {
	
	$message = "";
	$string_banner .= "<div id='divMaxime'>";
	
	function infect($code,$nom) {
		global $fap, $vGetImg;
		$mess = "";
		$id = $fap->whoHasLastCapacity($code);
		if ($id) {
			$fap->hasCapacity($code,$id);
			$info = $fap->logGetInfo($id);
			$img = " <img src='_getImg.php?img=".$info['img_id'].$vGetImg."&force' class='imgIconeMini' />";
			$imgAcht = " <img src='images/achtung.gif' class='imgIconeMini' />";
			$fin = " → ".strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date']));
			$by = " by ".getNomUser($id).$img;
			$date = getMstHealth($code);
			if ($date) {
				$imgAcht = "";
				$by = " : immunisé";
				$fin = " → ".strftime("%d/%m %Hh%M",makeDate($date));
			}
			$mess .= $imgAcht." ".$nom." infection ".$imgAcht." <span style='font-size:80%;'>".$by.$fin."</span>";
			$mess .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			$mess .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		}
		return $mess;
	}
	$message .= infect('mst-mirror','Fapocoque');
	$message .= infect('mst-speak','Chlamyfap');
	$message .= infect('mst-pandemic','Pandémia');
	
	if ($fap->level['up']>strftime("%Y-%m-%dT%H:%M:%S",time()-86400)) {
		$message .= "Félicitations, tu es maintenant niveau ".$fap->level['niveau']." !!!";
		$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	}
	
	if (isset($t_users[$bestMonth])) {
		$info = $fap->logGetInfo($bestMonth);
		$img = "<img src='_getImg.php?img=".$info['img_id'].$vGetImg."' class='imgIcone' />";
		$message .= "Le fappeur du mois c'est ... ".$img." ".getNomUser($bestMonth)." &nbsp;&nbsp;&nbsp;";
		$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	}
	
	$t_maximes = array();
	$sql = "select * from t_maximes_mxm";
	$id = $fap->whoHasLastCapacity('mst-speak');
	if ($id and !getMstHealth('mst-speak')) $sql .= " where usr_id=".$id;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		if ($data['mxm_texte']!='') $t_maximes[] = array('usr'=>$data['usr_id'], 'maxime'=>$data['mxm_texte']);
	}
	//randomize();
	if (count($t_maximes)>0) {
		for ($k=0; $k<$nbMaximeDefile; $k++) {
			$choix = rand(0,count($t_maximes));
			if (!isset($t_maximes[$choix])) $choix = $choix-1;
			$message .= $t_maximes[$choix]['maxime']." &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i>by ". getNomUser($t_maximes[$choix]['usr'])."</i>";
			$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			$message .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		}	
	}
	$string_banner .= "<marquee direction='left' scrollAmount='2'>".$message."</marquee>";
	$string_banner .= "</div>";
}

if ($fap->getId()) {
	$string_banner .= "<script>majFap();loadMusique();</script>";	
}



$string_mstPandemicBlock = "";
$id = $fap->whoHasLastCapacity('mst-pandemic');
if ($id) {
	$fap->hasCapacity('mst-pandemic',$id);
	$d = makeDate($fap->capacityInfo['date']);
	$fin = strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d)
			." à ".strftime("%Hh%M",$d);
	$string_mstPandemicBlock .= "<div class='cadre'>";
	$string_mstPandemicBlock .= $string_buttSound;
		$string_mstPandemicBlock .= "<div class='divEntete'>Pandémia infection !</div>";
		$string_mstPandemicBlock .= "<div class='divMessage'>
								".getNomUser($id)." a contaminé la fapplication avec un virus qui bloque l'affichage de toutes les statistiques.
								<br>Les symptômes resteront actifs jusqu'au ".$fin.".
								<br>Mais tu peux te soigner si tu veux... tout simplement en fappant !!!
								<br><a href='fFap-fap.php'>Aller fapper</a>
								</div>";
		$string_mstPandemicBlock .= "";
	$string_mstPandemicBlock .= "</div>";
	$string_mstPandemicBlock .= $string_banner;
	$string_mstPandemicBlock .= "</body></html>";
}
