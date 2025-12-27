<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/jeux.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/jeux.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/jeux-reseau.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/jeux-svg.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' >
				var gameJoystick='".$gameJoystick."';
				var gamePlayerMultiple=".$gamePlayerMultiple.";
				var gameSelected='arena';
				var gameScoring=".($gamePlayerMultiple?"0":"1").";
				</script>";
$string .= "</head><body>";

$string .= $string_menu;
$racineImage = "images/jeux/";

$sql = "select * from t_scores_sco where sco_game='arena' and sco_reset>'".strftime("%Y-%m-%dT%H:%M:%S",time())."' and usr_id=".$fap->getId();
$req = mysql_query($sql,$fap->conn);
if ($data = mysql_fetch_array($req)) {
	$string .= "<div class='divMessage' >";
	$string .= "Tu peux jouer mais ton score ne sera pas enregistré avant ".strftime("%d/%m/%Y %Hh%M",makeDate($data['sco_reset']));
	$string .= "</div>";
}

$string .= "<div class='divMessage' id='info' ></div>";

$string .= "<div class='cadre' >";
$string .= $string_buttSound;
	
	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('game'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> de Jeu</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='document.location.reload();' /></div>
				</div>";				
	$string .= "<img elem='divJeux' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";

	
$string .= "<div id='usrList' style='display:none;' >";
foreach ($t_users as $usr => $v) {
	$string .= "<div id='usrNom_".$usr."'  >".getNomUser($usr)."</div>";
}	
$string .= "</div>";


$expl = "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$expl .= "<span class='glyphicon glyphicon-question-sign'></span>";
$expl .= "</div>";
$expl .= "<div id='explique' style='text-align:right;display:none;margin-bottom:20px;'>";
$expl .= "<div style='display:inline-block;text-align:left;font-style:italic;max-width:100%;'>";
$expl .= "Jeux de plateau où l'objectif est d'engluer ses adversaires dans les traces de son sperme.
			<br>Attention toutefois à ne pas marcher sur le votre... il est tout aussi corosif !
			<br> - au clavier : flèches pour corriger le déplacement (CTRL + flèches pour un changement radical de direction)
			<br> - souris/tactile : clic ou drag pour indiquer la nouvelle direction";
$expl .= "</div>";
$expl .= "</div>";

$call = "<div class='imgCall' div='call' onclick='affDiv(this)'>";
$call .= "<span class='glyphicon glyphicon-bullhorn'></span>";
$call .= "</div>";
$call .= "<div id='call' class='divCall' style='display:none;'>";
$call .= "<input type='button' value='Inviter' div='call' onclick='affDiv(this);callPlayerGame();'/>";
$call .= "</div>";

$pitch = "";

$intro = "<div id='divChat' class='divChat'>";
	$intro .= "<div id='chatContent'></div>";
	$intro .= "<input type='text' id='chatSaisie' disabled />";
	$intro .= "<img src='images/local.png' id='imgChatWorld' onclick='changeChatWorld(this)' />";				
$intro .= "</div>";
$intro .= "<div id='chatButton' class='divChatButton' onclick='affChat(this)' >&lt;</div>";
$intro .= "<div id='divGame' class='divGame' >";
	$intro .= "<div>".$call."</div>";
	$intro .= "<div>".$expl."</div>";
	$intro .= "<div class='divEntete' >Sperm Arena</div>";
	$intro .= "<div id='dispoGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='newGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='showGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='createGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='pitchGame' class='divMessage' style='margin-top:20px;font-size:80%;' >".$pitch."</div>";
	$intro .= "<div id='waitGame' style='margin-top:20px;font-size:50%;' ></div>";
$intro .= "</div>";
	

$string .= "<div style='display:none;'>
				<img src='".$racineImage."cible.png' />
				</div>";
$string .= "<div id='overDiv' ><div id='divJeux' >".$intro."</div></div>";

	
$string .= "</div>";

$script = "var t_capacity={};t_click={};";
$string .= "<script type='text/javascript'>".$script."</script>";

$string .= "<script type='text/javascript'>loadServer();resizeChat();</script>";

$string .= $string_banner;
$string .= "</body></html>";
echo $string;