<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


if ($fap->isAdmin('son')) {		
	if (count($_POST)>0) {		
		// param
		$sql = "select * from t_parametrage_par ";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			if (isset($_POST['param_'.$data['par_code']])) {
				$val = $_POST['param_'.$data['par_code']];
				$sql = "update t_parametrage_par set par_valeur='".$val."' where par_id=".$data['par_id'];
				mysql_query($sql,$fap->conn);
			}
		}
		// sons
		if (isset($_POST['suppSon']) and $_POST['suppSon']!='') {
			$sql = "delete from t_sons_son where son_id=".$_POST['suppSon'];
			mysql_query($sql,$fap->conn);
		}
		if (isset($_POST['modif'])) {
			$sql = "select * from t_sons_son";
			$req = mysql_query($sql,$fap->conn);
			while ($data = mysql_fetch_array($req)) {	
				if (isset($_POST['lien_'.$data['son_id']])) {
					$sql = "update t_sons_son set son_lien='".$_POST['lien_'.$data['son_id']]."' where son_id=".$data['son_id'];
					mysql_query($sql,$fap->conn);
				}
			}
		}
		if (isset($_POST['type_new']) and $_POST['type_new']!='' and isset($_POST['typeValue_new']) and $_POST['typeValue_new']!='') {
			$sql = "insert into t_sons_son (son_type,son_type_value,son_lien) values 
						('".$_POST['type_new']."','".$_POST['typeValue_new']."','".$_POST['lien_new']."')";
			mysql_query($sql,$fap->conn);
		}
		if (isset($_POST['newson']) and isset($_FILES['file'])) {
			$doss = $_SERVER['DOCUMENT_ROOT'].$fap->getAppName().$t_param['son_racine'];
			$nom = $_FILES['file']['name'];
			if (file_exists($doss.$nom)) unlink($doss.$nom);
			move_uploaded_file($_FILES['file']['tmp_name'], $doss.$nom);
		}
		if (isset($_POST['delSon']) and $_POST['delSon']!='') {
			$doss = $_SERVER['DOCUMENT_ROOT'].$fap->getAppName().$t_param['son_racine'];
			$nom = $_POST['delSon'];
			if (file_exists($doss.$nom)) unlink($doss.$nom);
		}
		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;	
		die();
	}
	
	$string .= "<div class='cadre' style='text-align:center;'>";
	$string .= $string_buttSound;
	
	$string .= "<div class='divEntete' >";
	$string .= "Administration des sons";
	$string .= "</div>";
	
	
	// TYPE SONS
	function getNomPage($page,$sec=true) {
		global $fap;
		$doss = $_SERVER['DOCUMENT_ROOT'].$fap->getAppName();
		$nom = "";
		$file = $doss."communs/menu.php";
		$cont = file_get_contents($file);
		$p = strpos($cont,'debut-menu');
		$p = strpos($cont,$page,$p);
		if ($p>0) {
			if ($sec) $p = strpos($cont,$page,$p+1);
			if ($p>0) {
				$d = strpos($cont,">",$p+1)+1;
				$p2 = strpos($cont,'<span',$d) - $d;
				if ($p2>=0 and $p2<10) {
					$d = strpos($cont,"</span",$d+5);
					$d = strpos($cont,">",$d+1)+1;
				}
				$f = strpos($cont,"<",$d);
				$nom = str_replace("\\","",substr($cont,$d,$f-$d));
			}
		}
		$tmp = explode('-',$page);
		if (count($tmp)>1 and $nom!='') $nom = getNomPage($tmp[1])." / ".$nom;
		return $nom;
	}
	function listePage() {
		global $fap;
		$tt = array();
		$doss = $_SERVER['DOCUMENT_ROOT'].$fap->getAppName();
		if ($dh = opendir($doss)) {
			while (($file=readdir($dh)) !== false) {				
				if (is_file($doss.$file) and !strpos($doss.$file,"_")>0) {
					$nom = getNomPage($file);
					if ($nom!="") $tt[$file] = $nom;
				}
			}
		}
		return $tt;
	}
	function listeSon($doss) {
		global $fap;
		$tt = array();
		$doss = $_SERVER['DOCUMENT_ROOT'].$fap->getAppName().$doss;
		if ($dh = opendir($doss)) {
			while (($file=readdir($dh)) !== false) {				
				if (is_file($doss.$file)) {
					$tt[$file] = array('sel'=>0);
				}
			}
		}
		ksort($tt);
		return $tt;
	}
	
$string .= "<div style='display:none;'>
				<img src='images/remove.png' />
				<img src='images/remove-o.png' />
			</div>";

	$t_sonType = array();
	$t_sonType['page'] = listePage();
	asort($t_sonType['page']);
	$t_sonType['animation'] = array();
	$t_sonType['animation']['snail_wait'] = "Escargot : attente";
	$t_sonType['animation']['snail_run'] = "Escargot : course";
	$t_sonType['animation']['snail_win'] = "Escargot : gagne";
	$t_sonType['animation']['snail_loose'] = "Escargot : perte";
	$t_sonType['animation']['snail_unknown'] = "Escargot : inconnu";
	$t_sonType['animation']['fap'] = "J'ai fappé";
	$t_sonType['animation']['phallus'] = "Clone phallus";
	$t_sonType['animation']['game_splashFond'] = "Jeu/prends-tout : Musique";
	$t_sonType['animation']['game_splashLoose'] = "Jeu/prends-tout : Perdu";
	$t_sonType['animation']['game_splashShoot'] = "Jeu/prends-tout : Tir";
	$t_sonType['animation']['game_splashMonster'] = "Jeu/prends-tout : Monstronichon";
	$t_sonType['animation']['game_splashTortue'] = "Jeu/prends-tout : Tortue Génial";
	$t_sonType['animation']['game_fuseeFond'] = "Jeu/orbite : Musique";
	$t_sonType['animation']['game_fuseeLoose'] = "Jeu/orbite : Perdu";

	$t_sonType['animation']['game_wormFond'] = "Jeu/panzer : Musique";
	$t_sonType['animation']['game_wormShoot'] = "Jeu/panzer : Tir";
	$t_sonType['animation']['game_wormWhistle'] = "Jeu/panzer : Sifflement";
	$t_sonType['animation']['game_wormBoom'] = "Jeu/panzer : Explosion";
	$t_sonType['animation']['game_wormPressure'] = "Jeu/panzer : Pression";
	
	$t_sonType['animation']['game_arenaFond'] = "Jeu/arena : Musique";
	$t_sonType['animation']['game_arenaTrace'] = "Jeu/arena : Traces";
	$t_sonType['animation']['game_arenaTrace'] = "Jeu/arena : Engluement";
	
	$t_sonType['animation']['chat'] = "Activité chat";
	
	function makeSelType() {
		global $t_sonType;
		$sel = "<select id='type_new' name='type_new' onchange='changeSelType(this)' >";
		$sel .= "<option value='' ></option>";
		foreach ($t_sonType as $key => $val) {			
			$sel .= "<option value='".$key."' >".$key."</option>";
		}
		$sel .= "</select>";
		return $sel;
	}
	function makeSelTypeValue() {
		global $t_sonType, $t_sonTypeForbid;
		$sel = "";
		foreach ($t_sonType as $key => $val) {						
			$sel .= "<select id='typeValue_new_".$key."' name='typeValue_new' style='display:none;' disabled>";
			$sel .= "<option value='' ></option>";
			foreach ($val as $k => $v) {				
				$lib = $k;
				if ($v!="") $lib = $v;
				if (!isset($t_sonTypeForbid[$key][$k])) $sel .= "<option value='".$k."' >".$lib."</option>";
			}			
			$sel .= "</select>";
		}
		$sel .= "<div id='typeValue_new_' style='display:none;'></div>";
		return $sel;
	}
	$l_sons = listeSon($t_param['son_racine']);
	function makeSelSon($id,$val=null) {
		global $fap, $t_param, $l_sons;
		$sel = "<select id='lien_".$id."' name='lien_".$id."' >";
		$sel .= "<option value='' ></option>";
		foreach ($l_sons as $son => $v) {
			if ($son==$val) {
				$selected='selected'; 
				$l_sons[$son]['sel'] = 1;
			} else $selected='';
			$sel .= "<option value='".$son."' ".$selected.">".$son."</option>";
		}
		$sel .= "</select>";
		return $sel;
	}
	
	// MODIF
	$t_sonTypeForbid = array();
	$string .= "<form method='post' style='text-align:center;display:inline-block;'>";
	$string .= "<input name='modif' style='display:none;' >";
	
	// PARAM
	$string .= "<div style='text-align:left;margin-bottom:50px;margin-top:20px;width:100%;'>";
	if (isset($t_param['son_racine'])) {
		$string .= "<div><b>Dossier racine : </b>";
		$string .= "<input id='param_son_racine' name='param_son_racine' value='".$t_param['son_racine']."' style='width:500px;max-width:90%;' disabled />";
		if ($fap->isAdmin()) $string .= "<span><img input='param_son_racine' src='images/modifier.png' width='20' onclick='affInput(this)' style='cursor:pointer;' /></span>";
		$string .= "</div>";
	}
	if (isset($t_param['son_volume'])) {
		$string .= "<div><b>Volume Général : </b>&nbsp; 0 <input name='param_son_volume' type='range' style='width:200px;max-width:40%;display:inline-block;' 
						min='0' max='100' value='".$t_param['son_volume']."' aff='affpvol' oninput='affecteSon(this);'  />&nbsp;
						<span id='affpvol'>".$t_param['son_volume']."</span>%</div>";
	}
	if (isset($t_param['son_pageCoeff'])) {
		$string .= "<div><b>Amortissement musique des pages : </b><input name='param_son_pageCoeff' value='".$t_param['son_pageCoeff']."' 
						type='number' min='0.1' max='1' step='0.1' style='width:55px;' /></div>";
	}
	$string .= "</div>";
	
	// TABLE SONS
	$k = 0;
	$dis = ($sonActive?"":"display:none;");
	$string .= "<table style='text-align:center;' ><tr style='font-weight:bold;' ><td style='border-right:1px #000000 solid;'>&nbsp;Type&nbsp;</td>
						<td style='border-right:1px #000000 solid;'>&nbsp;Valeur&nbsp;</td><td>&nbsp;Lien&nbsp;</td><td></td></tr>";
	

	$sql = "select * from t_sons_son order by son_type, son_type_value ";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		$string .= "<tr style='border-top:1px #000000 solid;'>";						
		$string .= "<td style='border-right:1px #000000 solid;'>&nbsp;".$data['son_type']."&nbsp;</td>";
		$val = $data['son_type_value'];
		if (isset($t_sonType[$data['son_type']][$data['son_type_value']]) and $t_sonType[$data['son_type']][$data['son_type_value']]!='')
			$val = $t_sonType[$data['son_type']][$data['son_type_value']];
		$t_sonTypeForbid[$data['son_type']][$data['son_type_value']] = 1;
		$string .= "<td>&nbsp;".$val."&nbsp;</td>";
		$string .= "<td>".makeSelSon($data['son_id'],$data['son_lien'])."</td>";
		$string .= "<td class='imgDelete' onclick='supprimeSon(this)' son='".$data['son_id']."' ></td>";
		$string .= "<td class='imgDelete imgSon' onclick='playSonAdmin(this)' id='playSonAdmin_".$k."' ref=\"".$data['son_id']."\" style='".$dis."' ></td>";
		$string .= "</tr>";	
		$k++;
	}

	$string .= "<tr><td colspan='3'>&nbsp;</td></tr>";
	$string .= "<tr><td colspan='3' style='font-style:italic;text-align:left;'>Nouveau</td></tr>";
	$string .= "<tr style='border-top:1px #000000 solid;'>";						
		$new = array('son_id'=>'new');
		$string .= "<td>".makeSelType()."</td>";
		$string .= "<td>".makeSelTypeValue()."</td>";
		$string .= "<td>".makeSelSon('new')."</td>";
		$string .= "<td class='imgDelete imgSon' onclick='playSonAdmin(this)' id='playSonAdmin_".$k."' ref='new' style='".$dis."' ></td>";
	$string .= "</tr>";
	$k++;		
	$string .= "</table>";	
	$string .= "<br>";
	$string .= "<input type='submit' value='Enregistrer' /><br/>";
	$string .= "</form>";

	$string .= "<script>var nbSonsTotal=".$k.";</script>";	
	$string .= "<audio id='audioAdmin' src='' ></audio>";
	
	function return_bytes($val) {
		$val = trim($val);
		$last = strtolower($val[strlen($val)-1]);
		$val = (int)$val; // Convert to integer first to avoid PHP 8 warning
		switch($last) {
			case 'g':
				$val *= 1024;
			case 'm':
				$val *= 1024;
			case 'k':
				$val *= 1024;
		}
		return $val;
	}
	function toHuman($val) {
		$bytes = return_bytes($val);
		if ($bytes>1024*1024*1024*1024) return intval($bytes/(1024*1024*1024*1024))."To";
		if ($bytes>1024*1024*1024) return intval($bytes/(1024*1024*1024))."Go";
		if ($bytes>1024*1024) return intval($bytes/(1024*1024))."Mo";
		if ($bytes>1024) return intval($bytes/(1024))."Ko";
		return $bytes."octets";
	}
	
	$string .= "<div style='margin-top:50px;text-align:left;width:100%;'>";
		$string .= "<div onclick='affDiv(this)' div='addson' style='cursor:pointer;' >
						<img id='pm_addson' src='images/moins.png' class='iconePM' />
						<u>Charger un nouveau son</u> : <i>(taille max = ".toHuman(ini_get('upload_max_filesize')).")</i>
						</div>";		
		$string .= "<div id='addson' >";	
		$string .= "<form method='post' enctype='multipart/form-data' style='text-align:left;' >";
		$string .= "<input name='newson' style='display:none;' ><input type='file' name='file' >";
		$string .= "<input type='submit' value='Charger' /><br/>";
		$string .= "</form>";
		$string .= "</div>";
	$string .= "</div>";
	
	$string .= "<div style='margin-top:50px;text-align:left;width:100%;'>";
		$string .= "<div onclick='affDiv(this)' div='suppson' style='cursor:pointer;' >
						<img id='pm_suppson' src='images/plus.png' class='iconePM' /><u>Supprimer un son</u></div>";		
		$string .= "<div id='suppson' style='display:none;' >";
			foreach ($l_sons as $son => $v) {
				if ($v['sel']) {
					$it = "font-style:italic;opacity:0.5;";
					$del = "&nbsp; (utilisé)";
				} else {
					$it = "";
					$del = "&nbsp;<div son='".$son."' onclick='delSon(this)' title='Supprimer' 
									class='imgDelete' style='display:inline-block;' >&nbsp;</div>";
				}
				$string .= "<div style='".$it."'>".$son.$del."</div>";
			}
		$string .= "</div>";
	$string .= "</div>";

	$string .= "<div style='margin-top:50px;'>&nbsp;</div>";
	
	$string .= "</div>";

} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	