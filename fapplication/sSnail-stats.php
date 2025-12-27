<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/snail.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/animation.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


$nbPeriode = 5*intval($snailRunPeriode/3);
$nbPeriode = 10;

// requete base
$liste = "";
$nbCherche = $nbSnail;
$periode = 24*3600*$snailRunPeriode;
$datedeb = strftime("%Y-%m-%dT%H:%M:%S",time()-$periode);
if ($snailRunPeriode<=0) {
	$sql = "select * from t_faplogs_fap order by fap_date limit 1";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) $datedeb = $data['fap_date'];
	else $datedeb = strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600);
	$periode = time()-makeDate($datedeb);
}
$datelimiteString = "";
if ($snailRunPeriode>0) $datelimiteString = " and fap_date>'".$datedeb."'";
$where = "where 1".$datelimiteString;
$annule = "";
if ($avecFapAnnule=='0') $annule = " and (fap_annule is null or fap_annule<>1)";
$usr_id = $fap->getId();
if ($usrDebug!='') $usr_id = $usrDebug;
if ($snailMeInside) {
	$liste .= $usr_id;
	$nbCherche = $nbCherche - 1;
	$where .= " and usr_id<>".$usr_id;
}
if ($snailBestGuest) {
	$sql = "select usr_id from t_faplogs_fap ".$where.$annule." group by usr_id order by count(usr_id) desc limit ".$nbCherche;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		if ($liste!="") $liste.=",";
		$liste.=$data['usr_id'];
		$nbCherche = $nbCherche - 1;
	}
}
$tpart = array();
$sql = "select usr_id from t_utilisateurs_usr";
if ($liste!='') $sql .= " where usr_id not in (".$liste.")";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$tpart[] = $data['usr_id'];
}
for ($i=0; $i<$nbCherche; $i++) {
	$nb = count($tpart);
	if ($nb>0) {
		$k = rand(0,$nb-1);
		if ($liste!="") $liste.=",";
		$liste.=$tpart[$k];
		unset($tpart[$k]);
		$tpart = array_values($tpart);
	}
}
$max = 0;
$t_run = array();
$sql = "select * from t_utilisateurs_usr where usr_id in (".$liste.")";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	$t_run[$data['usr_id']] = array('id'=>$data['usr_id'],'nom'=>$data['usr_nom'],'fap'=>array());
	$t_run[$data['usr_id']]['tot'] = 0;
	for ($i=0; $i<$nbPeriode;$i++) {
		$t_run[$data['usr_id']]['fap'][$i] = 0;
	}
}
$sql = "select * from t_faplogs_fap where usr_id in (".$liste.") ".$datelimiteString.$annule;
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$p = intval($nbPeriode*(makeDate($data['fap_date'])-makeDate($datedeb))/($periode));
	$t_run[$data['usr_id']]['fap'][$p]++;
	$t_run[$data['usr_id']]['tot']++;
	$max = max($max,$t_run[$data['usr_id']]['tot']);
}
if (!isset($t_run[$fap->getId()])) $sansMoi="sans='1'"; else $sansMoi="";
shuffle($t_run);

$string .= "<div style='display:none;'>";
$string .= "... course des escargots en développement ...";
$string .= "<img id='snailSleep' src='images/snailSleep.gif' dx='' dy='' />
				<img id='snailWin' src='images/snailWin.gif' dx='' dy='' />
				<img id='snailLoose' src='images/snailLoose.gif' dx='' dy='' />
				<img id='snailMad' src='images/snailMad.gif' dx='' dy='' />
				<img id='snailStart' src='images/snailStart.gif' dx='0' dy='0' />";
$string .= "</div>";

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('snail'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> de la course</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";

	$string .= "<div class='lanceEscargot'>";
	$string .= "<input type='button' value='Démarrer la course' onclick='runSnail()' />";
	$string .= " &nbsp; <span id='messageCourseEscargot'></span>";
	$string .= "</div>";
	$string .= "<div id='courseEscargot' class='pisteEscargot' max='".$max."' nbstep='".$nbPeriode."' >";
		foreach ($t_run as $id => $run) {
			if ($run['id']==$fap->getId()) {
				$me="me='1'";
				$pisteMe='pisteEscargotMe';
			} else {
				$me="";
				$pisteMe='';
			}
			if ($sansMoi!="" and $id==0) $me=$sansMoi;
			$info = $fap->logGetInfo($run['id']);
			if ($info['img_id']!='' and $info['img_id']!='0') $img="<img src='_getImg.php?img=".$info['img_id'].$vGetImg."' class='imgIcone' />"; else $img="";
			$string .= "<div snail='snail".$id."' class='pisteEscargot ".$pisteMe."'>";
				$string .= "<div >";
				$step = implode(";",$run['fap']);
				if ($max>0 and $max==$run['tot']) $win='Win'; else $win='Loose';
				$string .= "<img id='snail".$id."' src='images/snailStart.gif' onclick='test(this)' step='".$step."' pos='0' win='".$win."' ".$me." />";
				$string .= "<br>".$run['nom']." ".$img."<span id='snail".$id."info' nb='-1'></span>";
				$string .= "</div>";
			$string .= "</div>";
		}
	$string .= "</div>";
	$string .= "<div id='courseEscargotCircuit' ></div>";
$string .= "</div>";

	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;