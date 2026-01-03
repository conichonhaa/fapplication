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
				var gameSelected='worm';
				var gameScoring=".($gamePlayerMultiple?"0":"1").";
				</script>";
$string .= "</head><body>";

$string .= $string_menu;
$racineImage = "images/jeux/";

$sql = "select * from t_scores_sco where sco_game='worm' and sco_reset>'".strftime("%Y-%m-%dT%H:%M:%S",time())."' and usr_id=".$fap->getId();
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
$expl .= "Jeux de tir où le but est de dégommer ses adversaires en faisant preuve d'adresse et d'ingéniosité.
			<br>Il faudra adapter l'angle et la puissance pour éviter les obstacles tout en tenant compte de la gravité et du vent.
			<br> - au clavier : gauche/droite=angle, haut/bas=puissance, espace=tir, CTRL+droite/gauche=déplacement
			<br> - souris/tactile : clic ou drag pour positionner le tir (positionnement tank si angle>110°)
			<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i>(cliquer sur les encarts d'info permet de geler le mouvement)</i>";
$expl .= "</div>";
$expl .= "</div>";

$call = "<div class='imgCall' div='call' onclick='affDiv(this)'>";
$call .= "<span class='glyphicon glyphicon-bullhorn'></span>";
$call .= "</div>";
$call .= "<div id='call' class='divCall' style='display:none;'>";
$call .= "<input type='button' value='Inviter' div='call' onclick='affDiv(this);callPlayerGame();'/>";
$call .= "</div>";

$pitch = "2515, dans un futur proche lointain, la bataille de fapignan fait rage. 
		<br>Mené à la trique par le Général Grosse Gaule, 
		l'armée des fappeurs libres perd du terrain face aux troupes des Nazizi 
		et les tactiques du fourbe Colonel Van SchproutzInMeinKalbut. 
		Englués sous des assauts ininterrompu de sperme moutarde, 
		nos troupes attendent le bon moment pour se relever et se dresser fièrement à nouveau. 
		<br>Alors, si tu veux défendre un fap libre et respectueux de l'environnement pour les générations futures, 
		prend les armes et bat toi à nos côtés contre les PANZER FAP";


$intro = "<div id='divChat' class='divChat'>";
	$intro .= "<div id='chatContent'></div>";
	$intro .= "<input type='text' id='chatSaisie' disabled />";
	$intro .= "<img src='images/local.png' id='imgChatWorld' onclick='changeChatWorld(this)' />";	
$intro .= "</div>";
$intro .= "<div id='chatButton' class='divChatButton' onclick='affChat(this)' >&lt;</div>";
$intro .= "<div id='divGame' class='divGame' >";
	$intro .= "<div>".$call."</div>";
	$intro .= "<div>".$expl."</div>";
	$intro .= "<div class='divEntete' >Panzer Fap</div>";
	
	$intro .= "<div id='dispoGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='newGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='showGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='createGame' style='margin-top:20px;' ></div>";
	$intro .= "<div id='pitchGame' class='divMessage' style='margin-top:20px;font-size:80%;' >".$pitch."</div>";
	$intro .= "<div id='waitGame' style='margin-top:20px;font-size:50%;' ></div>";
$intro .= "</div>";


$string .= "<div style='display:none;'>
				<img src='".$racineImage."vent.png' />
				<img src='".$racineImage."ventNull.png' />
				<img src='".$racineImage."ventRev.png' />
				<img src='".$racineImage."gravite.png' />
				<img src='".$racineImage."explosion.png' />
				<img src='".$racineImage."BtnFire.png' />
				<img src='".$racineImage."BtnMoins.png' />
				<img src='".$racineImage."BtnPlus.png' />
				</div>";
$string .= "<div id='overDiv' ><div id='divJeux' >".$intro."</div></div>";
	

$string .= "</div>";

$script = "var t_capacity={};t_click={};";
// $t_code = array('life','bomb');
// array_push($t_code,'sperm');
// foreach ($t_code as $code) {
	// if ($fap->hasCapacity($code)) {
		// $script .= "t_capacity['".$code."']=".$fap->capacityInfo['num'].";";
	// }	
// }
// $script .= "t_click['bomb']='useBomb();';";	
$string .= "<script type='text/javascript'>".$script."</script>";

$string .= "<script type='text/javascript'>loadServer();resizeChat();</script>";

	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;