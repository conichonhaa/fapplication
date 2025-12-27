<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/profil.css' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;


$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete'>";
$string .= "Options de la Fapplication";
$string .= "</div>";

$string .= "<div style='font-style:italic;'>Sauvegarder en quittant ? ";
$tt = array(1=>'Oui',0=>'Non');
foreach($tt as $key => $val) {
	if ($sauvParametres==$key) $checked='checked'; else $checked='';
	$string .= "<div class='eltBtnRadio' >
				<input type='radio' id='sauvParametres".$key."' name='sauvParametres' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
				<label for='sauvParametres".$key."'> &nbsp;".$val."</label>
				</div>";
}
$string .= " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type='button' id='resetOptions' value=' Réinitialiser ' onclick='glbSendPost(this)' />";
$string .= "</div>";

$string .= "<div style='font-style:italic;margin-left:1em;margin-top:10px;'>- Bandeau défilant ? ";
$tt = array(1=>'Oui',0=>'Non');
foreach($tt as $key => $val) {
	if ($bandeauDefile==$key) $checked='checked'; else $checked='';
	$string .= "<div class='eltBtnRadio' >
				<input type='radio' id='bandeauDefile".$key."' name='bandeauDefile' ".$checked." value='".$key."' onclick='glbSendPost(this,1)' />
				<label for='bandeauDefile".$key."'> &nbsp;".$val."</label>
				</div>";
}
$string .= "</div>";
$string .= "<div style='font-style:italic;margin-left:1em;'>- Recevoir les invitations ? ";
$tt = array(1=>'Oui',0=>'Non');
foreach($tt as $key => $val) {
	if ($networkInvitation==$key) $checked='checked'; else $checked='';
	$string .= "<div class='eltBtnRadio' >
				<input type='radio' id='networkInvitation".$key."' name='networkInvitation' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
				<label for='networkInvitation".$key."'> &nbsp;".$val."</label>
				</div>";
}
$string .= "</div>";
$string .= "<div style='font-style:italic;margin-left:1em;'>- Décompte Fap sur toutes les pages ? ";
$tt = array(1=>'Oui',0=>'Non');
foreach($tt as $key => $val) {
	if ($decompteFap==$key) $checked='checked'; else $checked='';
	$string .= "<div class='eltBtnRadio' >
				<input type='radio' id='decompteFap".$key."' name='decompteFap' ".$checked." value='".$key."' onclick='glbSendPost(this,1)' />
				<label for='decompteFap".$key."'> &nbsp;".$val."</label>
				</div>";
}
$string .= "</div>";

$string .= "<div class='sousTitre'><span class='sousTitreU'>Statistiques</span> : &nbsp; ";
$optionsConf = array('all'=>'','inline'=>'');
include('communs/funcOptions.php');
$string .= $string_options;


$string .= "<div class='sousTitre'><span class='sousTitreU'>Qui suis-je</span> : &nbsp; </div>";
$optionsConf = array('periode'=>'');
include('communs/funcOptions.php');
$string .= $string_options;	


$string .= "<div class='sousTitre'><span class='sousTitreU'>Graphique</span> : &nbsp; </div>";
$optionsConf = array('graph'=>'');
include('communs/funcOptions.php');
$string .= $string_options;	


$string .= "<div class='sousTitre'><span class='sousTitreU'>Course Escargots</span> : &nbsp; </div>";
$optionsConf = array('snail'=>'');
include('communs/funcOptions.php');
$string .= $string_options;	


$string .= "<div class='sousTitre'><span class='sousTitreU'>Géolocalisation</span> : &nbsp; </div>";
$optionsConf = array('map'=>'');
include('communs/funcOptions.php');
$string .= $string_options;	


$string .= "<div class='sousTitre'><span class='sousTitreU'>Sonorisation</span> : &nbsp; ";
$optionsConf = array('sono'=>'','inline'=>'');
include('communs/funcOptions.php');
$string .= $string_options;


$string .= "<div class='sousTitre'><span class='sousTitreU'>Jeux</span> : &nbsp; ";
$optionsConf = array('game'=>'');
include('communs/funcOptions.php');
$string .= $string_options;


$string .= "<div class='sousTitre'><span class='sousTitreU'>Chat</span> : &nbsp; ";
$optionsConf = array('chat'=>'');
include('communs/funcOptions.php');
$string .= $string_options;

	
$string .= "<div><br></div>";

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;