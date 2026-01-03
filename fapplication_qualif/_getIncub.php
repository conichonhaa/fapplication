<?php
include_once('communs/menu.php');
include_once('communs/log.php');

session_write_close();

$string = "";
$xml  = "<xml>";

function gradient($startColor,$endColor, $stepNumber) {
	$colors = array($startColor);
	$i = 1;
	if ($stepNumber>2) {
		$sColor = str_split($startColor,2);
		$eColor = str_split($endColor,2);
		for($i = 0 ;$i< 3 ;$i++)
		{
			$diff [$i] = (hexdec($sColor[$i])-hexdec($eColor[$i]))/($stepNumber-2);
		}
		for ($i = 1;$i<$stepNumber;$i++)
		{
			$c = str_split($colors[$i-1],2);
			$colors[$i] = sprintf('%02X',max(0,min(255,(hexdec($c[0])-$diff[0])))).
			sprintf('%02X',max(0,min(255,(hexdec($c[1])-$diff[1])))).
			sprintf('%02X',max(0,min(255,(hexdec($c[2])-$diff[2]))));
		}
	}	
	$colors[$i] = $endColor;
	return $colors;
}

if (isset($_GET['icb']) and $_GET['icb']!='') {
	$xml .= "<projet icb='".$_GET['icb']."' >";
	$sql = "select * from t_incubateur_icb where icb_id=".$_GET['icb'] ;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		$cible = $data['icb_cible'];
		$xml .= "<nom>".$data['icb_titre']."</nom>";
		$xml .= "<cible>".$cible."</cible>";
		$xml .= "<vote>".$data['icb_vote']."</vote>";
		
		$xml .= "<users>";
		$sql = "select usr_id, count(*) as c from t_faplogs_fap where icb_id=".$_GET['icb']." group by usr_id order by c desc" ;
		$req2 = mysql_query($sql,$fap->conn);
		$t_coul = gradient('BF2C44','422BBA',mysql_num_rows($req2)+1);
		$c = 0;
		while ($data2 = mysql_fetch_array($req2)) {
			$xml .= "<user>";
			$xml .= "<nom>".getNomUser($data2['usr_id'])."</nom>";
			$xml .= "<id>".$data2['usr_id']."</id>";
			$xml .= "<voix>".($data2['c'])."</voix>";
			$xml .= "<pcent>".percent($data2['c'],$cible,2)."</pcent>";
			$xml .= "<coul>#".$t_coul[$c]."</coul>";
			$xml .= "</user>";
			$c++;
		}
		if ($cible>$data['icb_vote']) {
			$xml .= "<user>";
			$xml .= "<nom>manquant</nom>";
			$xml .= "<id>0</id>";
			$xml .= "<voix>".($cible-$data['icb_vote'])."</voix>";
			$xml .= "<pcent>".percent($cible-$data['icb_vote'],$cible,2)."</pcent>";
			$xml .= "<coul>none</coul>";
			$xml .= "</user>";
		}	
		$xml .= "</users>";
	}	
	$xml .= "</projet>";
}


$xml .= "</xml>";
header("Content-type: text/xml");
echo $xml;