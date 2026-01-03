<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	

$string .= "<link rel='stylesheet' href='styles/index.css".$versionTime."' media='all' type='text/css' />";	
$string .= "<script type='text/javascript' src='scripts/chat.js".$versionTime."' ></script>";
$string .= "<script>var myUsr=".$fap->getId().";var chatDelai=".($chatDelaiRecup*60000).";var chatInteractif=".$chatInteractif.";</script>";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('chat'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> graphiques</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
				
				
$string .= "<div class='divEntete' style='position:relative;'>";
$string .= "FapChat";
$string .= "<img id='chatBell' src='images/bell-off.gif' onclick='changeInteractif(this)' 
				style='height:50px;".($chatInteractif?"":"opacity:0.3").";cursor:pointer;' />";

	$string .= "<div class='imgCall' div='call' onclick='affDiv(this)'>";
	$string .= "<span class='glyphicon glyphicon-bullhorn'></span>";
	$string .= "</div>";
	$string .= "<div id='call' class='divCall' style='display:none;'>";
	$string .= "<input type='button' value='Inviter' div='call' onclick='affDiv(this);callPlayerChat();'/>";
	$string .= "</div>";
$string .= "</div>";

$string .= "<div class='divMessage' id='info' ></div>";

$string .= "<div id='chatText' class='' >";
	$string .= "<div id='chatContent'></div>";
    $string .= "<input type='text' id='chatSaisie' disabled />";
	$string .= "<img src='images/local.png' id='imgChatWorld' onclick='changeChatWorld(this)' />";
$string .= "</div>";

$string .= "<div id='chatList' class='' >";
	$string .= "<div style='text-decoration:underline;font-weight:bold;' >Online :</div>";
	foreach ($t_users as $usr => $v) {
		$string .= "<div id='chat_".$usr."' style='display:none;' >";
		$string .= "<img id='write_".$usr."' src='images/write.png' style='display:none;height:15px;' />";
		$string .= " <span >".getNomUser($usr)."</span>";
		$string .= " <span id='chatNom_".$usr."' style='display:none;' >".getNomUser($usr)."</span>";
		$string .= "</div>";
	}
$string .= "</div>";

$string .= "</div>";
$string .= "<script>loadChat();</script>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;