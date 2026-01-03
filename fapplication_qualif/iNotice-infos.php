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

$string .= "<div class='divEntete'>";
$string .= "Le mode d'emploi de la FAPplication";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeFap' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeFap' src='images/moins.png' class='iconePM' />Le Fap</div>";		
$string .= "<div id='noticeFap'>";
	$string .= "<div class='emploiItem'>Fapper : <span class='emploiItem2'>ben tu fappes</span></div>";
	$string .= "<div class='emploiItem'>Déclarer : <span class='emploiItem2'>pour rétablir la vérité</span></div>";
	$string .= "<div class='emploiItem'>Positionner : <span class='emploiItem2'>pour tester sa position avant de fapper</span></div>";
	$string .= "<div class='emploiItem'>Récupérer : <span class='emploiItem2'>pour valider ou supprimer les faps hors ligne</span></div>";
	$string .= "<div class='emploiItem'>Annuler : <span class='emploiItem2'>pour annuler un clic malencontreux</span></div>";
	$string .= "<div class='emploiSepare'></div>";
	$string .= "<div class='emploiItem'>Défier : <span class='emploiItem2'>à relever tous ensemble dans le plus bel esprit d'équipe</span></div>";
	$string .= "<div class='emploiItem'>Jauger : <span class='emploiItem2'>pour le fun</span></div>";
	$string .= "<div class='emploiItem'>Parrainer : <span class='emploiItem2'>pour inviter un amis</span></div>";
	$string .= "<div class='emploiItem'>Qualification : <span class='emploiItem2'>pour basculer en site de pré-production</span></div>";
	$string .= "<div class='emploiSepare'></div>";
	$string .= "<div class='emploiItem'>FapChat : <span class='emploiItem2'>pour discuter le bout de gras</span></div>";
	$string .= "<div class='emploiItem'>FapBook : <span class='emploiItem2'>pour commenter ses faps préférés</span></div>";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeHymne' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeHymne' src='images/moins.png' class='iconePM' />L'Hymne</div>";		
$string .= "<div id='noticeHymne'>";
	$string .= "<div class='emploiItem'>La musique et les paroles de l'hymne à la branlette</div>";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeStat' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeStat' src='images/moins.png' class='iconePM' />Les Stats</div>";		
$string .= "<div id='noticeStat'>";
	$string .= "<div class='emploiItem'>Dernier Fap connu : <span class='emploiItem2'>pour repérer les déserteurs</span></div>";
	$string .= "<div class='emploiItem'>Les Escargots : <span class='emploiItem2'>no comment</span></div>";
	$string .= "<div class='emploiExplique'>N'hésite pas à changer les paramètres de la course (nb participants, durée, etc)</div>";
	$string .= "<div class='emploiItem'>Qui suis-je : <span class='emploiItem2'>au cas où tu ne le savais pas déjà</span></div>";
	$string .= "<div class='emploiItem'>Période de retour : <span class='emploiItem2'>es-tu réglé comme un métronome ?</span></div>";
	$string .= "<div class='emploiItem'>Identités remarquables : <span class='emploiItem2'>les Faps aux numéros rigolos</span></div>";
	$string .= "<div class='emploiItem'>Historique : <span class='emploiItem2'>graphiques de tous vos faps depuis la nuit des temps</div>";
	$string .= "<div class='emploiExplique'><img src='images/cursor-default.png' height='20' style='background-color:#ffffff;'> 
				(defaut) cela inhibe les interceptions d'évènements et vous rend un fonctionnement normal</div>";
	$string .= "<div class='emploiExplique'><img src='images/select.png' height='20' style='background-color:#ffffff;'> 
				permet de zoomer sur une selection rectangulaire : coin haut gauche vers coins bas droit (drag souris ou un doigt tactile)</div>";
	$string .= "<div class='emploiExplique'><img src='images/cursor-hand.png' height='20' style='background-color:#ffffff;'> 
				permet de se déplacer sur le graphique (drag souris ou un doigt tacile) OU de zoomer (scroll souris ou deux doigts tactiles)</div>";
	$string .= "<div class='emploiExplique'><img src='images/agrandir.jpg' height='20' style='background-color:#ffffff;'> 
				revenir au zoom initial</div>";
	$string .= "<div class='emploiExplique'><img src='images/courbe.png' height='20' style='background-color:#ffffff;'> 
				 / <img src='images/histo.png' height='20' style='background-color:#ffffff;'>
				bascule entre l'affichage courbe cumulée ou hiétogramme d'intensité</div>";
	$string .= "<div class='emploiItem'>Fap Positioning System : <span class='emploiItem2'>le FPS est un système innovant permettant de géolocaliser vos faps</span></div>";
	$string .= "<div class='emploiItem'>Equivalent sperme : <span class='emploiItem2'>si c'est scientifique, alors c'est vrai</span></div>";
	$string .= "<div class='emploiItem'>Fap 'n GO : <span class='emploiItem2'>attrape les tous</span></div>";
	$string .= "<div class='emploiExplique'>Un jour, à côté du compteur, tu verras peut-être un nom apparaître, c'est qu'il vient juste de fapper : 
				dépêche toi de cliquer dessus pour l'attrapper !
				<br><i>Mais si le compteur est en surbrillance, gare à tes fesses, tu peux te faire attraper à tout moment...
				<br>(un survol avec la souris t'indiqueras le temps restant)</i></div>";
	$string .= "<div class='emploiItem'>Fappeur du mois : <span class='emploiItem2'>... et de l'année !</span></div>";
	$string .= "<div class='emploiItem'>Activité : <span class='emploiItem2'>pour voir ton taux de présence sur la fapplication</span></div>";
	$string .= "<div class='emploiItem'>L'Incubateur : <span class='emploiItem2'>pour voter sur le projet le plus fapfelus</span></div>";
	$string .= "<div class='emploiExplique'>Après chaque fap, tu pourras donner ta voix pour le projet de ton choix. Lorsqu'il en aura obtenu suffisamment,
				il sera enfin fapprouvés et tu pourras commencer sa réalisation.
				<br><i>Inscris aussi le tien, et fais en bien la pub car tu ne pourras pas voter pour lui.</i></div>";
	$string .= "<div class='emploiItem'>Export CSV : <span class='emploiItem2'>pour faire des analyses approfondies sur la nature humaine</span></div>";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeInfo' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeInfo' src='images/moins.png' class='iconePM' />Les Infos</div>";		
$string .= "<div id='noticeInfo'>";
	$string .= "<div class='emploiItem'>Les News : <span class='emploiItem2'>quelques nouveautés au bon vouloir du développeur</span></div>";
	$string .= "<div class='emploiItem'>La Charte : <span class='emploiItem2'>plus qu'un code, c'est une philosophie de vie</span></div>";
	$string .= "<div class='emploiExplique'>L'approbation ou la révocation d'une règle de la charte est soumise au vote consensuel de la communauté des fappeurs,
				puis à la censure exclusive, arbitraire et lunatique de Fappesh (Dieu des Fappeurs)</div>";
	$string .= "<div class='emploiItem'>La Serment : <span class='emploiItem2'>et un engagement à renouveler chaque jour que Fappesh fait</span></div>";
	$string .= "<div class='emploiItem'>Les Fappeurs : <span class='emploiItem2'>pour savoir qui fappe avec toi</span></div>";
	$string .= "<div class='emploiItem'>Les Maximes : <span class='emploiItem2'>pour modifier tes maximes et en ajouter d'autres</span></div>";
	$string .= "<div class='emploiExplique'>Tu gagneras le droit d'en poster de nouvelles avec le temps</div>";
	$string .= "<div class='emploiItem'>Mon expérience : <span class='emploiItem2'>pour suivre l'évolution de ton fappeur</span></div>";
	$string .= "<div class='emploiItem'>Mon coffre : <span class='emploiItem2'>pour mettre ses noisettes au chaud</span></div>";
	$string .= "<div class='emploiItem'>Le mode d'emploi : <span class='emploiItem2'>ben tu es en train de le lire</span></div>";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeOption' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeOption' src='images/moins.png' class='iconePM' />Les Options</div>";		
$string .= "<div id='noticeOption'>";
	$string .= "<div class='emploiItem'>Pour changer des paramètres divers et variés, customiser vos graphs et améliorer votre FAPxpérience</div>";
$string .= "</div>";


$string .= "<div onclick='affDiv(this)' div='noticeGame' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeGame' src='images/moins.png' class='iconePM' />Les Jeux</div>";		
$string .= "<div id='noticeGame'>";
	$string .= "<div class='emploiItem'>Palmarès : <span class='emploiItem2'>pour voir les scores</span></div>";
	$string .= "<div class='emploiItem'>Boutique : <span class='emploiItem2'>pour acheter des capacités</span></div>";
	$string .= "<div class='emploiSepare'></div>";
	$string .= "<div class='emploiItem'>Mise en orbite : <span class='emploiItem2'>évite les gros lolos</span></div>";
	$string .= "<div class='emploiItem'>Prends tout : <span class='emploiItem2'>dégomme tous les monstronichons</span></div>";
	$string .= "<div class='emploiSepare'></div>";
	$string .= "<div class='emploiItem'>Panzer Fap : <span class='emploiItem2'>vise et tir (worm-like)</span></div>";
	$string .= "<div class='emploiItem'>Sperm Arena : <span class='emploiItem2'>englue tes adversaires (snake-like)</span></div>";
$string .= "</div>";


if ($fap->hasAdmin()) {
	$string .= "<div onclick='affDiv(this)' div='noticeAdmin' style='cursor:pointer;' class='emploiTitre' >
						<img id='pm_noticeAdmin' src='images/moins.png' class='iconePM' />L'Administration</div>";		
	$string .= "<div id='noticeAdmin'>";		
		$string .= "<div class='emploiItem'>Diffusion Mail : <span class='emploiItem2'>envoyer des messages d'information</span></div>";
		$string .= "<div class='emploiItem'>Diffusion Sms : <span class='emploiItem2'>envoyer des messages d'information</span></div>";
		$string .= "<div class='emploiSepare'></div>";
		$string .= "<div class='emploiItem'>Les Fappeurs : <span class='emploiItem2'>gestion des comptes</span></div>";
		$string .= "<div class='emploiItem'>Les Droits : <span class='emploiItem2'>gestion des droits</span></div>";
		$string .= "<div class='emploiItem'>Les sons : <span class='emploiItem2'>affectation des sons</span></div>";
		$string .= "<div class='emploiItem'>Les Identités : <span class='emploiItem2'>gestion des faps remarquables</span></div>";
		$string .= "<div class='emploiItem'>L'Incubateur : <span class='emploiItem2'>gestion des projets</span></div>";
		$string .= "<div class='emploiItem'>L'Application : <span class='emploiItem2'>paramètres systèmes</span></div>";
		$string .= "<div class='emploiSepare'></div>";
		$string .= "<div class='emploiItem'>Maintenance : <span class='emploiItem2'>pour l'hébergeur</span></div>";
		$string .= "<div class='emploiItem'>Développement : <span class='emploiItem2'>pour le créateur</span></div>";
		$string .= "<div class='emploiExplique'></div>";
	$string .= "</div>";
}


$string .= "<div onclick='affDiv(this)' div='noticeDroite' style='cursor:pointer;' class='emploiTitre' >
					<img id='pm_noticeDroite' src='images/moins.png' class='iconePM' />Et les deux boutons tout à droite</div>";		
$string .= "<div id='noticeDroite'>";
	$string .= "<div class='emploiItem'>Mon profil<span class='emploiItem2'></span></div>";
	$string .= "<div class='emploiExplique'>Si tu ne renseignes pas bien toutes tes infos de fappeurs, 
					tu ne pourras pas profiter pleinement de toutes les subtilités de la FAPplication</div>";
	$string .= "<div class='emploiItem'>Login / Logout<span class='emploiItem2'></span></div>";
$string .= "</div>";


$string .= "<div class='emploiTitre'></div>";
// $string .= "<div class='emploiItem'></div>";
$string .= "<div class='emploiExplique'></div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;