<?php
include_once('../communs/classFAP.php');
$fap = new fap;
include_once('../communs/funcDate.php');
include_once('../communs/variables.php');
$root = "/fapplication/";
$img = "";
echo $fap->getId();

if ($fap->getId()) {
	$cont = $fap->getImg($_GET['img']);
	if ($cont) $img = $cont;
}

// header('Pragma: public');
// header('Cache-Control: max-age=86400');
// header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));
// header("Content-type: image/png");
echo $img;