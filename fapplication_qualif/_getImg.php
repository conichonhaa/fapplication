<?php
include_once('communs/menu.php');
include_once('communs/log.php');

$img = file_get_contents("images/fap.png");

$force = false;
if (isset($_GET['force'])) $force = true;

if (isset($_GET['img'])) {
	$cont = $fap->getImg($_GET['img'],$force);
	if ($cont) $img = $cont;
}
if (isset($_GET['self'])) {
	$cont = $fap->getImg($fap->info['img_id'],$force);
	if ($cont) $img = $cont;
}

$flag = null;
if (isset($_GET['flag']) and $_GET['flag']!='') $flag = $_GET['flag'];
if (isset($_GET['fapFlag']) and $_GET['fapFlag']!='') {
	$sql = "select * from t_faplogs_fap where fap_id=".$_GET['fapFlag'];
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) $flag = $data['usr_id'];
}	
if (isset($flag)) {
	$hh = 43;
	include_once('communs/classImg.php');
	$img1 = new img('images/flag.png','flag.png');
	$info = $fap->logGetInfo($flag);
	$img2 = new img();
	if (isset($info['img_id']) and $info['img_id']>0) 
		$img2->loadData($fap->getImg($info['img_id'],$force));
	else $img2->loadFile("images/fap.png","fap.png");
	$h = $img2->height;
	$r = $img2->width/$img2->height;
	$c = $hh/$h;
	$img2->resize($img2->width*$c,$hh);
	$x = $img1->width/2 - $hh*$r/2;
	$img1->merge($img2->getRessource(), $x, 5, $hh*$r, $hh);

	$img = $img1->sendImage(true);
}

$maxage = 86400;
if ($fap->whoHasLastCapacity('mst-mirror')) $maxage = 3600;
header('Pragma: public');
header('Cache-Control: max-age='.$maxage);
header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + $maxage));
header("Content-type: image/png");
echo $img;