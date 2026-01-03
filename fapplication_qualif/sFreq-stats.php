<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "<link rel='stylesheet' href='styles/graph.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/graph.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' >var modeZoom='".$modeZoom."';</script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


$friand = "Il semble que tu es plutôt friand du";
$ton = "ton";
if ($statsUtilisateur=='all') {
	$friand = "Pour fapper en même temps que tes amis choisis le";
	$ton = "notre";
}

$fapmin = 60;
if (isset($t_param['fapdelai_min'])) $fapmin = intval($t_param['fapdelai_min']);

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

	$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('all'=>'','periode'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> graphiques</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";
	$string .= "<img elem='divGraphG' class='buttOption buttFullScreen' src='images/fullscreen.png' onclick='sendToFull(this)' title='Plein écran' />";


	
	$t_periode = array();
	$lst = "";
	if ($plageFrequence=='saison') {
		$tt = array('Hiver','Printemps','Eté','Automne');
		$tp = 9;
		$minip = 0;
		$pmax = 36;
	}
	if ($plageFrequence=='lune') {
		$tt = array('Nouvelle Lune','Premier Quartier','Pleine Lune','Dernier Quartier');
		$tp = 7;
		$minip = 1;
		$pmax = 28;
	}	
	if ($plageFrequence=='semaine') {
		$tt = array('Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi');
		$tp = 4;
		$minip = 1;
		$pmax = 28;
	}	
	if ($plageFrequence=='jour') {
		$tt = array('Nuit','Matin','Après-midi','Soir');
		$tp = 6;
		$minip = 0;
		$pmax = 24;
	}
	if ($precisionFrequence==2) $precisionFrequence = $tp/2;
	elseif ($precisionFrequence==3) $precisionFrequence = $tp;
	foreach ($tt as $k => $v) {
		if ($lst!="") $lst .= ","; 
		$lst .= "'".$v."'"; 
	}	
	$string .= "<script type='text/javascript'>var lstPeriode=[".$lst."]; var pasPeriode=".$tp."; var miniPeriode=".$minip.";</script>";
	
	
	$memoP = null;
	$nb= 0;
	$nbt = 0;
	$nbd = 0;
	$score = 1;
	$last = null;
	$maxint = null;
	$minint = null;
	$moyint = null;
	$sumint = 0;
	$sc = 0;
	$triche = array();
	$doute = array();
	$lt_usr = array();
	
	$nbAnnule = 0;
	$nbDeclare = 0;
	$nbLocalise = 0;
	
	$sql = "select * from t_faplogs_fap";
	$where = " where";
	if ($usrDebug!='') {
		$sql .= $where." usr_id=".$usrDebug."";
		$where = " and";
	}
	else if ($statsUtilisateur=='me') {
		$sql .= $where." usr_id=".$fap->getId()."";
		$where = " and";
	}
	if ($avecFapAnnule=='0') {
		$sql .= $where." (fap_annule is null or fap_annule=0)";
		$where = " and";
	}
	$sql .= " order by fap_date";
	$req = mysql_query($sql,$fap->conn);
	$nb = mysql_num_rows($req);
	while ($data = mysql_fetch_array($req)) {						
		$d = makeDate($data['fap_date']);
		
		if ($plageFrequence=='jour') $p = intval(strftime('%H',$d)/$precisionFrequence)*$precisionFrequence;
		if ($plageFrequence=='semaine') $p = intval((strftime('%H',$d)/6+strftime('%w',$d)*4)/$precisionFrequence)*$precisionFrequence;
		if ($plageFrequence=='lune') {
			$dep = makeDate('2015-01-20T13:13:00');
			$rev =  27.3217;
			$q = intval(($d-$dep)/$rev);
			$p =  $d-$dep - $q*$rev;
			$p = intval($p/$precisionFrequence)*$precisionFrequence;
		}
		if ($plageFrequence=='saison') {
			$p = intval(strftime('%j',$d)+11);
			if ($p>365) $p = $p-365;
			$p = intval($p/10.14/$precisionFrequence)*$precisionFrequence;
		}
		
		if (!isset($t_periode[$p])) $t_periode[$p] = 0;
		$t_periode[$p]++;
		if ($data['usr_id']==$fap->getId()) $memoP = $p;
		if ($fap->isDev() and $data['usr_id']==$usrDebug) $memoP = $p;
		
		if ($last) {
			$int = $d-$last;
			
			if (!$maxint) $maxint = $int;
			if (!$minint) $minint = $int;
			$maxint = max($maxint,$int);
			$minint = min($minint,$int);
			$sumint += $int;
			$c = 0.9;
			if (isset($lt_usr[$data['usr_id']])) {
				$intusr = $d - $lt_usr[$data['usr_id']];
				if ($intusr<$fapmin) {
					$c = $c*(0.75+$int/(4*$fapmin));
					$nbd++;
					if (!isset($doute[$data['usr_id']])) $doute[$data['usr_id']] = array();
					$doute[$data['usr_id']][] = "<a href='fSupp-fap.php?fap=".$data['fap_id']."'>"
						.strftime("%d/%m/%Y %Hh%M",$lt_usr[$data['usr_id']])."</a> (+".affDuree($intusr).")";
				}
			}		
			if ($int>24*3600*3) $c = $c*max(0.1,1-$int/(24*3600*35));
			if ($int<24*3600 and $int>3600) $c = 1;
			$sc += $c;
		} else {
			$sc = 0.1;
		}

		if ($data['fap_annule']) $nbAnnule++;
		if ($data['fap_declare']) $nbDeclare++;
		if ($data['fap_pos_longitude']) $nbLocalise++;
		$last = $d;
		$lt_usr[$data['usr_id']] = $d;
	}
	
	
	if ($nb>1) $moyint = $sumint/($nb-1);
	if ($nb>0) $sc = $sc/$nb;
	$score = $score*$sc;
	
	$string .= "<div id='divGraphG' >";
	$string .= "<div style='display:inline-block;margin-left:20px;'>";
		$string .= "<img id='fleche' class='zoomButton' src='images/cursor-default.png' style='background-color:#bbbbbb;' onclick='affiche_fleche()' title='Pointeur' />";
		$string .= "<img id='select' class='zoomButton' src='images/select.png' onclick='affiche_select()' title='Zoom sélection' />";
		$string .= "<img id='main' class='zoomButton' src='images/cursor-hand.png' onclick='affiche_main()' title='Zoom scroll et déplacement' />";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$string .= "<img id='agrandir' class='zoomButton' src='images/agrandir.jpg' onclick='trace()' title='Zoom initial' />";
	$string .= "</div>";
	if ($nb>0) {
		$nbf = 1;
		$string .= "<script type='text/javascript'>var nbfPeriode=".$nbf.";</script>";
		if (isset($t_periode[$pmax-$precisionFrequence])) $v=$t_periode[$pmax-$precisionFrequence]; else $v=0; 
		$xml = "<div id='divPoints' xmax='".$pmax."' xmin='0' prec='".$precisionFrequence."' fin='".percent($v,$nb)."' >";
		ksort($t_periode);
		for ($k=-$nbf; $k<$nbf+1; $k++) {
			for ($p=0; $p<$pmax; $p=$p+$precisionFrequence) {
				if (isset($t_periode[$p])) $v=$t_periode[$p]; else $v=0; 
				if ($memoP==$p) $last="last"; else $last="";
				$xml .= "<div ind='".($p+$pmax*$k)."' nb='".percent($v,$nb)."' ".$last." ></div>";
			}
		}	
		$xml .= "</div>";
		$string .= $xml;
		$string .= "<div id='divGraph' class='divGraph' ratio='2'></div>";
		$string .= "<div id='divPos' style='text-align:right;'></div>";
		$string .= "<script type='text/javascript'>tracePeriode();</script>";
		$string .= "<div style='font-style:italic;font-size:80%;text-align:right;margin:10px;'>NB : Le point rouge situe ton dernier fap</i></div>";
	}
	$string .= "</div>";
	
	$detail = "<div>";
	$detail .= "<div class='eltBlocInline'><u>Intervalle entre les faps</u> :";
	$detailAdmin = "";
	if ($moyint) $detail .= "<br> - moyenne : ".affDuree($moyint);
	if ($minint) $detail .= "<br> - mini : ".affDuree($minint);
	if ($maxint) $detail .= "<br> - maxi : ".affDuree($maxint);
	$detail .= "</div>";
	if (count($doute)>0) {
		$detail .= "<div class='eltBlocInline'><i>";
		if (count($doute)>0) {
			if ($nbt>1) $s="s"; else $s="";
			$detail .= "<div><u>".$nbd." Fap".$s." douteux (<".affDuree($fapmin).")</u> :";
			$usr_id = $fap->getId();
			if ($fap->isDev() and $usrDebug!='') $usr_id = $usrDebug;
			foreach ($doute as $usr => $t) {
				foreach ($t as $d) {
					if ($usr==$usr_id) $detail .= "<br> - ".$d;
				}
			}
			$detail .= "</div>";
		}
		$detail .= "</i></div>";
	}
	
	// stats generales
	$detail .= "<div class='eltBlocInline'><b><u>Décompte général</u> :</b>";
		$detail .= "<br> - Comptés : ".$nb;
		if ($avecFapAnnule=='0') $detail .= "<br> - Annulés : <i>non comptabilisés</i>";
		else $detail .= "<br> - Annulés : ".$nbAnnule;
		$detail .= "<br> - Déclarés : ".$nbDeclare;
		$detail .= "<br> - Localisés : ".$nbLocalise;
	$detail .= "</div>";	
	$detail .= "</div>";
	
	
	if ($detailAdmin!="") {
		$string .= "<div class='alert alert-danger'>";
		$string .= "Faps impossibles (<".$fapkill."s) : ".$detailAdmin;
		$string .= "</div>";
	}
	
	$score = (intval($score*1000)/10)."%";

	if ($nb==0) {
		$string .= "<div><br><b>Aucun Fap, mais pourquoi tu t'es inscrit ?</b></div>";
	} else {
		$string .= "<div><br><i>Le score représente l'assiduité et la franchise.
					<br>Il dépend de la régularité avec laquelle vous participez à l'effort collectif.
					<br>Il sera par contre drastiquement impacté si des faps sont considérés trop rapprochés...</i>";
		$string .= "<br><b> &nbsp;&nbsp;&nbsp; => ".$ton." score est de ".$score."</b>";
		$string .= "".$detail."</div>";
		
	}

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;