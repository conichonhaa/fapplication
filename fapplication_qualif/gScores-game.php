<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/jeux.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/jeux.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
$string .= "<div class='divEntete' id='titre' >";
$string .= "Palmarès";
$string .= "</div>";

$string .= "<div class='divMessage' >";
$string .= "Céder la première place d'un jeu te fera gagner jusqu'à 500 points... mais tu ne pourras plus concourir à ce jeu avant 1 semaine.";
$string .= "</div>";

foreach ($t_games as $game => $val) {
	
	$string .= "<div style='margin-top:30px;display:inline-block;margin-left:30px;vertical-align:top;'>";
	$string .= "<div onclick='affDiv(this)' div='div_".$game."' style='cursor:pointer;' >
					<img id='pm_div_".$game."' src='images/plus.png' class='iconePM' /><u>".$val."</u></div>";		
	$string .= "<div style='margin-left:1em;'>";
		$first = true;
		$sql = "select * from t_scores_sco where sco_game='".$game."' order by sco_score desc, sco_memo desc";
		$req = mysql_query($sql,$fap->conn);
		$nb = mysql_num_rows($req);
		while ($data = mysql_fetch_array($req)) {

			if ($first and $data['usr_id']==$fap->getId() and $data['sco_score']!==null) {
				$string .= "<div><input type='button' game='".$game."' value='Remettre mon titre en jeu' 
							pts='".($data['sco_score']>$data['sco_memo']?"500":"100")."' onclick='resetScore(this)' /></div>";
			}
			$string .= "<div> - ".$t_users[$data['usr_id']]['nom']." : ";
			if ($data['sco_score']!==null) {
				$string .= $data['sco_score'];
			} else {
				$string .= "<span style='font-style:italic;'>ancien vainqueur</span>";
			}	
			if ($data['sco_memo']) {
				$string .= "<span style='font-style:italic;font-size:80%;'> &nbsp; (".$data['sco_memo'].")</span>";
			}
			$string .= "</div>";
			if ($first) $string .= "<div id='div_".$game."' style='display:none;' >";
			$first = false;
		}
		if ($nb==0) {
			$string .= "<div style='font-style:italic;'>Aucun scores enregistrés</div>";
		}
	if (!$first) $string .= "</div>";
	$string .= "</div>";
	$string .= "</div>";
}

$string .= "</div>";
$string .= "<script type='text/javascript'></script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;