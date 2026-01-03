<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
	
$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

$age = $fap->getAgeDecFap();
$tot = $fap->getNbDecFap();
$nb = $fap->getDispoDecFap();


$string .= "<div id='mstAlert' class='divMessage'></div>";

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Déclarer un ancien Fap";
$string .= "</div>";

$string .= "<div class='divMessage divMessMini' >";
if ($age>1) $s="s"; else $s="";
$string .= "NB : Il n'est pas possible de déclarer un Fap vieux de plus de ".$age." jour".$s." et un maximum de ".$tot." par jour";
$string .= "<br>(encore <span id='nbDecFap'>".$nb."</span> pour aujourd'hui)";
$string .= "</div>";

$d = time();
$string .= "<br><div style='text-align:center;'>";
$string .= "Date : <input type='date' id='jour' value='".strftime("%Y-%m-%d",$d)."' 
				min='".strftime("%Y-%m-%d",$d-$age*24*3600)."' max='".strftime("%Y-%m-%d",$d)."' class='inputJour' />";
$string .= "<input type='time' id='heure' name='heure' value='".strftime("%H:%M",$d-60)."' class='inputHeure' />";
$string .= "<input type='button' value='Déclarer' onclick='declareFap(this)' name='aFappe' action='' declare='' />";
$string .= "<div id='aFappe' class='buttFappe' style='margin-top:5px;max-width:300px;margin:auto;'></div>";	
$string .= "</div>";

$string .= "<div class='divMessage' id='divErrFap'></div>";


// $sql = "select* from t_faplogs_fap where usr_id=".$fap->getId()." and fap_declare>'".strftime("%Y-%m-%dT%H:%M:%S",time()-24*3600)."'";
// $req = mysql_query($sql,$fap->conn);
// while ($data = mysql_fetch_array($req)) {
	// $string .= "<div>".$data['fap_date']."  ,  ".$data['fap_declare']."</div>";
// }

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;