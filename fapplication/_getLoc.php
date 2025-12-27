<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$mapInitCenter = 'all';
$modeMap = 'flag';


$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/map.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/map.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='openlayers/OpenLayers.js' ></script>";
$string .= "<script type='text/javascript' src='openlayers/proj4js-combined.js' ></script>";
$string .= "<script type='text/javascript' >var modeMap='".$modeMap."';var mapShowAccuracy=".$mapShowAccuracy.";var mapLocalRelay=".$mapLocalRelay.";</script>";
$string .= "</head><body style='overflow:hidden;'>";


$points = "";
$b = null;

if (isset($_GET['fap']) and $_GET['fap']!='') {
	$sql = "select fap.* from t_faplogs_fap as fap
			left join t_fapbook_fbk as fbk on fbk.fap_id=fap.fap_id
			where fap.fap_id=".$_GET['fap']."
			and (fap_pos_latitude is not null and fap_pos_latitude<>0)
			and (fap.usr_id=".$fap->getId()." or fbk.fbk_public=1 or fap.fap_defi=1)
			order by fap_pos_longitude,fap_pos_latitude";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {	
		$nb++;
		$x = $data['fap_pos_longitude'];
		$y = $data['fap_pos_latitude'];
		$acc = $data['fap_pos_accuracy'];
		$isme = "";
		if ($data['usr_id']==$fap->getId()) $isme = "fap='".$data['fap_id']."'";
		$d = makeDate($data['fap_date'])/1;
		$points .= "<fap x='".$x."' y='".$y."' acc='".$acc."' ".$isme."' date='".$data['fap_date']."' ind='".$d."' usr='".$data['usr_id']."' ></fap>";
		if (!$b) $b = array('xmin'=>$x, 'xmax'=>$x, 'ymin'=>$y, 'ymax'=>$y);
		$b = array('xmin'=>min($x,$b['xmin']), 'xmax'=>max($x,$b['xmax']), 'ymin'=>min($y,$b['ymin']), 'ymax'=>max($y,$b['ymax']));
		$xx = $x;
		$yy = $y;
		$zoom = 15;
	}
	
	
	if ($points!="") {
		$center = "";
		if ($b) $center = "xmin='".$b['xmin']."' xmax='".$b['xmax']."' ymin='".$b['ymin']."' ymax='".$b['ymax']."'";
		$center .= " maxZoom='12'";
		if ($xx) $center = "x='".$xx."' y='".$yy."' zoom='".$zoom."'";
		$string .= "<div id ='divPoints' style='display:none;' ".$center." >";
		$string .= $points;
		$string .= "</div>";
		$string .= "<div id='overDiv' ><div id='divMap' ratio='1.8' embed='1' ></div></div>";
		$string .= "<script type='text/javascript'>var t_users=null; chargeMap();</script>";
	}
}
$string .= "</body></html>";
echo $string;