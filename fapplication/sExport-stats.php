<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "</head><body>";

$string .= "<script type='text/javascript' src='scripts/stats.js".$versionTime."' ></script>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}

$nbJour = 0;



if (isset($_GET['csv'])) {
	$csv = "Fap;Declare;Annule";	
	if ($statsUtilisateur=='me') $csv .= ";Longitude;Latitude;Precision;Erreur localisation";	
	$csv .= "\n";	
	$where = " where";
	$sql = "select * from t_faplogs_fap";
	if ($fap->isDev() and $usrDebug!='') {
		$sql .= $where." usr_id=".$usrDebug."";
		$where = " and";
	}
	else if ($statsUtilisateur=='me') {
		$sql .= $where." usr_id=".$fap->getId()."";
		$where = " and";
	}
	if ($nbJour>0) $sql .= $where." fap_date>'".strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600*$nbJour)."'";
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {						
		$csv .= $data['fap_date'].";".$data['fap_declare'].";".$data['fap_annule'];
		if ($statsUtilisateur=='me') $csv .= ";".$data['fap_pos_longitude'].";".$data['fap_pos_latitude'].";".$data['fap_pos_accuracy'].";".$data['fap_pos_error'];
		$csv .= "\n";
	}
	
	header('Content-disposition: attachment; filename=faps.csv');
	header('Content-type: text/plain');
	echo $csv;
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
				
	
	$usrExp = $fap->getId();
	if ($usrDebug!='') $usrExp = $usrDebug;
	if (!$fap->isDev() and $usrDebug!='') {
		$string .= "<div class='divMessage' >";
		$string .= "Les lunettes ne sont pas assez puissantes pour faire un export des autres fappeurs";
		$string .= "</div>";
		$usrExp = $fap->getId();
	}

	
	$tt = array('me'=>getNomUser($usrExp),'all'=>'Tous les fappeurs');			
	$string .= "<div>Export pour <i><b>".$tt[$statsUtilisateur]."</b></i></div>";

	
	$string .= "<div style='margin-top:1em;'>";
	$string .= "<input type='button' value='Exporter les Faps en CSV' onclick='window.open(\"?csv\")' />";
	$string .= "</div>";
	

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;