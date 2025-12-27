<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$news = array();
if (isset($t_param['news_info']) and $t_param['news_info']!='') $news = json_decode($t_param['news_info'],true);

if (count($_POST)>0) {
	if (isset($_POST['info'])) {
		$news[] = $fap->getId();
		$json = json_encode($news, JSON_UNESCAPED_UNICODE);
		$sql = "update t_parametrage_par set par_valeur='".$json."' where par_code='news_info'";
		mysql_query($sql,$fap->conn);
	}
	
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<b>Le Fap de l'été</b>
<br><br>Il en faut peu pour être heureux
<br>Vraiment très peu pour être heureux
<br>Il faut se satisfaire du nécessaire
<br>Un petit fap et ça repart
<br>Un fap à graver dans l'histoire
<br>A partager ou a garder secret

<br><br><i>L'abus de fap est dangereux pour la santé. Fappez avec modération.</i>
";
//$string .= "<br><br><span style='font-size:120%;'> &nbsp; Enjoy ! Et n'hésitez pas à consulter le <a href='iNotice-infos.php'>mode d'emploi</a>.</span></i>";
//$string .= "<br><br><i>Hint: non pas cette fois ci</i>";

$string_info = "";
$isInfo = false;
foreach ($news as $key => $usr) {
	$string_info .= "<br> - ".getNomUser($usr);
	if ($usr==$fap->getId()) $isInfo = true;
}
// if (!$isInfo) {
	// $string .= "<form method='post' style='margin-top:30px;'>";
	// $string .= "<input style='display:none;' name='info' >";
	// $string .= "<input type='submit' value=\"Je l'ai fait\" >";
	// $string .= "</form>";
// }

// $string .= "<div style='margin-top:30px;'>";
// $string .= "<b>Ils l'ont fait :</b>";
// $string .= $string_info;
// $string .= "</div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;
