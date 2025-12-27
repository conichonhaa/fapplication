<?php

$string_options = "";
if (isset($optionsConf['all'])) {
	if (!isset($optionsConf['inline'])) $string_options .= "<div>Stats pour ";
	if ($accesStatsAll) $tt = array('me'=>'Seulement moi','all'=>'Tous les fappeurs');
	else $tt = array('me'=>'Seulement moi');
	$string_options .= "<select id='statsUtilisateur' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$statsUtilisateur) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select></div>";
	$string_options .= "<div>Faps \"annulés\" : ";
	$tt = array('1'=>'Avec','0'=>'Sans');
	foreach($tt as $key => $val) {
		if ($avecFapAnnule==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='avecFapAnnule".$key."' name='avecFapAnnule' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='avecFapAnnule".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	
	$string_options .= "<div>";
	if (!$animationInitiale) $checked='checked'; else $checked="";
	$string_options .= "<input type='checkBox' id='animationInitiale' onchange='glbSendPost(this);' ".$checked." style='margin-left:1em;' />
							<label for='animationInitiale' style='display:inline;' > Animation</label>";		
	$tt = array(1=>'Lente',3=>'Moyenne',5=>'Rapide');
	$string_options .= " &nbsp; <select id='animationInitialeSpeed' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$animationInitialeSpeed) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select>";
	$tt = array('prop'=>'Proportionnelle','max'=>'Bornée','alea'=>'Bruitée');
	$string_options .= "<select id='animationInitialeMode' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$animationInitialeMode) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select></div>";
	
	$string_options .= "<div style='font-size:50%'>&nbsp;</div>";
}	

if (isset($optionsConf['filtre'])) {
	foreach ($t_filtre as $key => $val) {
		if ($val['on']) $checked='checked'; else $checked="";
		$string_options .= "<div><input type='checkBox' id='filtre".$key."' onchange='glbSendPost(this);' ".$checked." style='margin-left:1em;' />
							<label for='filtre".$key."' style='display:inline;' > &nbsp; ".$key."</label></div>";			
	}
}

if (isset($optionsConf['periode'])) {
	$string_options .= "<div>Plage d'analyse : ";
	$tt = array('jour'=>'Jour','semaine'=>'Semaine','lune'=>'Cycle lunaire','saison'=>'Saisons');
	$string_options .= "<select id='plageFrequence' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$plageFrequence) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select></div>";	
	$string_options .= "<div>Précision : ";
	$tt = array(1=>'Forte',2=>'Moyenne',3=>'Faible');
	foreach($tt as $key => $val) {
		if ($precisionFrequence==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='precisionFrequence".$key."' name='precisionFrequence' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='precisionFrequence".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
}

if (isset($optionsConf['graph'])) {
	$string_options .= "<div>Période initiale : ";
	$tt = array(7=>'1 semaine',30=>'1 mois',365=>'1 an', 0=>'no limit');
	$string_options .= "<select id='iniPeriode' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$iniPeriode) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select></div>";	
	$string_options .= "<div>Zoom dynamique : ";
	$tt = array('xy'=>'X et Y','x'=>'Y automatique');
	foreach($tt as $key => $val) {
		if ($modeZoom==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='modeZoom".$key."' name='modeZoom' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='modeZoom".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	$string_options .= "<div>Cumul hiétogramme : ";
	$tt = array(1=>'1 jour',7=>'1 semaine',30=>'1 mois',365=>'1 an');
	$string_options .= "<select id='cumulHieto' onchange='glbSendPost(this)'>";
	foreach ($tt as $key => $val) {
		if ($key==$cumulHieto) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select></div>";	
}

if (isset($optionsConf['snail'])) {
	$string_options .= "<div>Nombre de participants : ";
	$string_options .= "<input type='number' id='nbSnail' min='2' max='10' value='".$nbSnail."' style='text-align:center;width:3em;' onchange='glbSendPost(this)' />";
	$string_options .= "</div>";
	$string_options .= "<div>";
	$tt = array('0'=>'Aléatoire','1'=>'Les meilleurs');
	foreach($tt as $key => $val) {
		if ($snailBestGuest==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='snailBestGuest".$key."' name='snailBestGuest' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='snailBestGuest".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	if ($snailMeInside) $checked='checked'; else $checked="";
	$string_options .= "<div><input type='checkBox' id='snailMeInside' onchange='glbSendPost(this);' ".$checked." style='margin-left:1em;' />
						<label for='snailMeInside' style='display:inline;' > &nbsp; M'inclure systématiquement</label></div>";					
	$string_options .= "<div>Course sur <select name='snailRunPeriodeCustom' onchange='glbSendPost(this);affSnailNbJour(this);' >";
	$tt = array(1=>'1 jour',7=>'1 semaine',30=>'1 mois',365=>'1 an',0=>'No limit','custom'=>'Custom');
	foreach ($tt as $key => $val) {
		if ($key==$snailRunPeriodeCustom) $selected="selected"; else $selected="";
		$string_options .= "<option value='".$key."' ".$selected.">".$val."</option>";
	}
	$string_options .= "</select>";
	if ($snailRunPeriodeCustom=='custom') {
		$display = "inline;";
		$disabled = "";
	} else {
		$display = "none;";
		$disabled = "disabled";
	}
	$string_options .= "<input id='snailRunPeriode' type='number' min='0' style='display:".$display.";width:3em;' ".$disabled." 
					value='".$snailRunPeriode."' onchange='glbSendPost(this)' />";
	$string_options .= "</div>";		
}

if (isset($optionsConf['map'])) {
	$string_options .= "<div>Tracé carte : ";
	$tt = array('dot'=>'Accumulation', 'path'=>'Chemin de Fap', 'area'=>'Enveloppe convexe');
	if ($fap->info['territoire']) $tt['flag'] = 'Territoires conquis';
	foreach($tt as $key => $val) {
		if ($modeMap==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='modeMap".$key."' name='modeMap' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='modeMap".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	if ($mapShowAccuracy) $checked='checked'; else $checked="";
	$string_options .= "<div><input type='checkBox' id='mapShowAccuracy' onchange='glbSendPost(this);' ".$checked." style='margin-left:1em;' />
						<label for='mapShowAccuracy' style='display:inline;'> &nbsp; Montrer l'imprécision de localisation</label></div>";	
	$string_options .= "<div>Zoom initial : ";
	$rec = " (".$mapAgeFapRecent."j)";
	$tt = array('france'=>'France', 'all'=>'Tous les Faps', 'lastOne'=>'Dernier Fap', 'recent'=>'Faps récents ('.$mapAgeFapRecent.'j)');
	foreach($tt as $key => $val) {
		if ($mapInitCenter==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='mapInitCenter".$key."' name='mapInitCenter' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='mapInitCenter".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	if ($mapLocalRelay) $checked='checked'; else $checked="";
	$string_options .= "<div><input type='checkBox' id='mapLocalRelay' onchange='glbSendPost(this);' ".$checked." style='margin-left:1em;' />
						<label for='mapLocalRelay' style='display:inline;'> &nbsp; Activer le relais local (ralentit mais conserve le https)</label></div>";
	$string_options .= "</div>";
}

if (isset($optionsConf['sono'])) {
	if (!isset($optionsConf['inline'])) $string_options .= "<div>";
	if ($sonActive) $checked = "checked"; else $checked = "";
	if ($sonActive) $display = "block"; else $display = "none";
	$string_options .= "<input type='checkBox' id='sonActiveCB'  onchange='glbSendPost(this);affDiv(this);affecteSon(this);' div='reglerSon' ".$checked." />
					<label for='sonActiveCB'> &nbsp; Activer les sons</label></div>";
	$string_options .= "<div id='reglerSon' style='display:".$display."'>";
		$string_options .= "<div>Volume : &nbsp; 0 <input id='sonVolume' type='range' style='width:200px;max-width:40%;display:inline-block;' 
						min='0' max='100' value='".$sonVolume."' onchange='glbSendPost(this);affecteSon(this);' aff='affpvol' oninput='affecteSon(this);'  />&nbsp;
						<span id='affpvol'>".$sonVolume."</span>%</div>";
		foreach ($t_sons as $son => $v) {
			if ($v['actif']) $checked = "checked"; else $checked = "";
			$string_options .= "<div> &nbsp; <input type='checkBox' id='son_".$son."'  onchange='glbSendPost(this);affecteSon(this);' ".$checked." />
							<label for='son_".$son."'> &nbsp; ".$v['label']."</label></div>";
		}
		$string_options .= "<div style='font-style:italic'>";
		$string_options .= "NB: L'autoplay est désactivé par défaut des devices mobiles, empechant la lecture automatique de la musiqe d'ambiance";
		$string_options .= "<br>Pour chrome android vous pouver le réactiver en réglant 
							<a target='_blank' href='chrome://flags/#autoplay-policy'>chrome://flags/#autoplay-policy</a> 
							à \"No user gesture is required\"";
		$string_options .= "</div>";
	$string_options .= "</div>";
}

if (isset($optionsConf['game'])) {
	$string_options .= "<div>Mode : ";
	$tt = array('keyboard'=>'Clavier','mouse'=>'Souris (compatible tactile)');
	foreach($tt as $key => $val) {
		if ($gameJoystick==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='gameJoystick".$key."' name='gameJoystick' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='gameJoystick".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	if ($gamePlayerMultiple) $checked = "checked"; else $checked = "";
	$string_options .= "<div> &nbsp; <input type='checkBox' id='gamePlayerMultiple' onchange='glbSendPost(this);' ".$checked." />
					<label for='gamePlayerMultiple'> &nbsp; Autoriser plusieurs joueurs avec mon compte</label></div>
					<div style='font-size:80%;font-style:italic;'>(désactive le score)</div>";
}

if (isset($optionsConf['chat'])) {
	$string_options .= "<div>Récupération historique : ";
	$tt = array(1=>'1mn', 5=>'5mn', 30=>'30mn', 60=>'1h', 1440=>'1j');
	foreach($tt as $key => $val) {
		if ($chatDelaiRecup==$key) $checked='checked'; else $checked='';
		$string_options .= "<div class='eltBtnRadio' >
					<input type='radio' id='chatDelaiRecup".$key."' name='chatDelaiRecup' ".$checked." value='".$key."' onclick='glbSendPost(this)' />
					<label for='chatDelaiRecup".$key."'> &nbsp;".$val."</label>
					</div>";
	}
	$string_options .= "</div>";
	if ($chatInteractif) $checked = "checked"; else $checked = "";
	$string_options .= "<div> &nbsp; <input type='checkBox' id='chatInteractif' onchange='glbSendPost(this);' ".$checked." />
					<label for='chatInteractif'> &nbsp; Avertir si activité</label></div>";
}




