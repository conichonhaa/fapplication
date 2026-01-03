<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$code = 'mst-chtouille';
$id = $fap->whoHasLastCapacity($code);
if ($id) {
	$string .= "<div class='divEntete'>";
	$string .= "Qui a eu la Chtouille ?";
	$string .= "</div>";
	
	$string .= "<div class='divMessage'>";
	$string .= "Merci à ".getNomUser($id)." qui a lancé cette épidémie qui durera jusqu'au "
				.strftime("%d/%m %Hh%M",makeDate($fap->capacityInfo['date']));
	$string .= "</div>";
	
	$fap->hasCapacity($code,$id);
	$sql = "select * from t_capacity_cpt where cpt_id=".$fap->capacityInfo['cpt'];
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {		
		$tt = explode('+',$data['cpt_info']);
		
		if ($tt[0]!='') {
			$string .= "<div class='divMessage'>";
			$string .= "C'est actuellement <b>".getNomUser($tt[count($tt)-1])."</b> qui a la Chtouille";
			$string .= "</div>";
			
			foreach ($tt as $n) {
				$string .= "<div>";
				$string .= " → ".getNomUser($n);
				$string .= "</div>";
			}
		} else {
			$string .= "<div class='divMessage'>";
			$string .= "Aucun fappeur contaminé pour l'instant";
			$string .= "</div>";
		}
	}
} else {
	$string .= "<div class='divEntete'>";
	$string .= "Pas de Chtouille en cours";
	$string .= "</div>";
}


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;