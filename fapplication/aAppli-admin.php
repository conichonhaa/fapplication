<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


// TYPE PARAMETRAGE
$t_tpa = array();
$sql = "select * from t_type_parametrage_tpa";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	$t_tpa[$data['tpa_id']] = array('nom'=>$data['tpa_nom']);
}
function valideParam($val,$type) {
	global $t_tpa;
	$valide = true;
	if ($t_tpa[$type]['nom']=='Entier') {
		if (intval($val).""!=$val) $valide = false;
	}
	if ($t_tpa[$type]['nom']=='Réel') {
		if (floatval($val).""!=$val) $valide = false;
	}
	return $valide;
}

function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}
function majParam($col,$data,$acceptNull=true) {
	global $fap, $t_tpa;
	$id = $data['par_id'];
	if (isset($_POST[$col.'_'.$id]) and ($acceptNull or $_POST[$col.'_'.$id]!='')) {
		$val = esc($_POST[$col.'_'.$id]);
		if ($col=='par_valeur') {
			$tpa = $data['tpa_id'];
			if (!valideParam($val,$tpa)) {
				$_SESSION['fap']['messParam'] .= $data['par_code']." : ".'"'.$val.'"'." n'est pas de type ".$t_tpa[$tpa]['nom']."<br>";
				return false;
			}
		}
		$sql = "update t_parametrage_par set ".$col."='".$val."' where par_id=".$id;
		mysql_query($sql,$fap->conn);
	}
}

if ($fap->isAdmin()) {	
	
	if (count($_POST)>0) {
		$_SESSION['fap']['messParam'] = "";
		if (isset($_POST['suppParam']) and $_POST['suppParam']!='') {
			$sql = "delete from t_parametrage_par where par_id=".$_POST['suppParam'];
			mysql_query($sql,$fap->conn);
		}
		if (isset($_POST['modif'])) {				
			$id = $data['par_id'];
			$sql = "select * from t_parametrage_par ";
			$req = mysql_query($sql,$fap->conn);
			while ($data = mysql_fetch_array($req)) {
				majParam('par_code',$data,false);
				majParam('tpa_id',$data,false);
				majParam('par_valeur',$data);
				majParam('par_description',$data);
			}
			if ($_POST['par_code_new']!='') {
				$code = esc($_POST['par_code_new']);
				$sql = "select * from t_parametrage_par where par_code='".$code."'";
				$req = mysql_query($sql,$fap->conn);
				if ($data = mysql_fetch_array($req)) {
					$_SESSION['fap']['messParam'] .= "Le code \"".$code."\" existe déjà<br>";
				} else {
					$valeur = esc($_POST['par_valeur_new']);
					$description =esc($_POST['par_description_new']);
					$tpa = $_POST['tpa_id_new'];
					$sql = "insert into t_parametrage_par (par_code,par_valeur,par_description,tpa_id) values 
													('".$code."','".$valeur."','".$description."',".$tpa.")";
					mysql_query($sql,$fap->conn);
				}
			}
		}
		if (isset($_POST['update'])) {
			$sql = str_replace("\\","",$_POST['update']);
			$tmp = explode(";",$sql);
			foreach ($tmp as $s) mysql_query($s,$fap->conn);
			if (isset($_POST['wait'])) {
				echo $sql;
				die();
			}
		}
		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;	
		die();
	}
	
	if (isset($_SESSION['fap']['messParam'])) {
		$string .= "<div class='divMessage' ><br/>";
		$string .= $_SESSION['fap']['messParam'];
		$string .= "</div>";
		unset($_SESSION['fap']['messParam']);
	}
	
	
		// menage
	$fap->delOldLien();
	$fap->cleanCapacity();

	
	// $string .= "<div class='divMessage' >";
	// $data = openssl_x509_parse(file_get_contents('../_certificat/server.crt'));
	// $validFrom = date('Y-m-d H:i:s', $data['validFrom_time_t']);
	// $d = $data['validTo_time_t'];
	// $jour = strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d);
	// $string .= "Certificat SSL valide jusqu'au ".$jour;
	// $string .= "</div>";
	
	
	
	// MISE A JOUR SQL
	$sqli = "";
	// $sqli .= "create table if not exists t_defi_dfi (dfi_id int NOT NULL AUTO_INCREMENT, dfi_description text,  PRIMARY KEY (dfi_id));";
	// $sqli .= "drop table if exists t_incubateur_icb;";
	// $sqli .= "insert into t_level_lvl (usr_id,lvl_niveau,lvl_points,lvl_experience) select usr_id,1,0,0 from t_utilisateurs_usr where usr_id not in (select usr_id from t_level_lvl);";
	
	$tt = array();
	// $tt[] = array('table'=>'t_parametrage_par','col'=>'tpa_id','type'=>'int');
	// $tt[] = array('table'=>'t_lien_autologin_lan','col'=>'lan_email','type'=>'varchar(255)');
	// $tt[] = array('table'=>'t_utilisateurs_usr','col'=>'usr_admin_son','type'=>null);
	// $tt[] = array('table'=>'t_incubateur_icb','col'=>'icb_recolte','type'=>'boolean');
	// $tt[] = array('table'=>'t_faplogs_fap','col'=>'fap_horsligne','type'=>'boolean');
	// $tt[] = array('table'=>'t_faplogs_fap','col'=>'fap_pos_reloc','type'=>'int');

	foreach ($tt as $t) {
		$sql = "select ".$t['col']." from ".$t['table'].";";
		$req = mysql_query($sql,$fap->conn);
		if (!$req) {
			if ($t['type']) $sqli .= "alter table ".$t['table']." add ".$t['col']." ".$t['type'].";";
		} else {
			if (!$t['type']) $sqli .= "alter table ".$t['table']." drop ".$t['col']." ;";
		}
	}
	if ($sqli!="") {
		$string .= "<div class='divEntete' >";
		$string .= "<form method='post'>";
		$string .= "<input name='update' value=\"".$sqli."\" style='display:none;' >";
		$string .= "<input type='submit' value='Mise à jour SQL' />";
		$string .= " ( <input type='checkbox' name='wait' id='wait' /><label for='wait'> debug mode</label> )";
		$string .= "</form>";
		$string .= "</div>";
	}


	$string .= "<div class='cadre' style='text-align:center;'>";
	$string .= "<div class='divEntete' >";
	$string .= "Administration de l'application";
	$string .= "</div>";
	
	$host = $_SERVER['HTTP_HOST'];
	$ip = getHostByName($host);
	//$string .= "Serveur : ".$fap->getServerId();
	$string .= "<div class='divMessage divMessMini'>Serveur : ".$host." (".$ip.")</div>";
	
	// TYPE PARAMETRAGE
	function makeSelType($data,$dis="display:none;") {
		global $t_tpa;
		$sel = "<select id='tpa_id_".$data['par_id']."' name='tpa_id_".$data['par_id']."' style='".$dis."' >";
		foreach ($t_tpa as $id => $v) {
			if ($data['tpa_id']==$id) $selected='selected'; else $selected='';
			$sel .= "<option value='".$id."' ".$selected." >".$v['nom']."</option>";
		}
		$sel .= "</select>";
		return $sel;
	}
	
	// TABLE PARAMETRAGE
	$string .= "<form method='post' style='text-align:center;display:inline-block;'>";
	$string .= "<input name='modif' style='display:none;' >";
	$string .= "<input type='submit' value='Enregistrer' style='font-size:80%;' />";
	$string .= "<table style='text-align:center;margin-top:5px;' ><tr style='font-weight:bold;' >
						<td style='border-right:1px #000000 solid;'>&nbsp;Code&nbsp;</td>
						<td style='border-right:1px #000000 solid;'>&nbsp;Valeur&nbsp;</td>
						<td colspan='2'>&nbsp;Description&nbsp;</td><td></td>
						</tr>";
	
	$tforbid = array();
	$tforbid[] = 'mdpdev';
	$l = "";
	foreach ($tforbid as $fb) {
			if ($l!="") $l .= ",";
			$l .= "'".$fb."'";
	}
	$sql = "select * from t_parametrage_par ";
	if ($l!="") $sql .= " where par_code not in (".$l.")";
	$sql .= " order by par_code";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		$string .= "<tr style='border-top:1px #000000 solid;'>";						
		if ($fap->isDev()) 
			$string .= "<td style='text-align:right;'><span>
						<div input='par_code_".$data['par_id']."' onclick='affInput(this)' title='Modifier'
						class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>
						".$data['par_code']."</span>
						<input id='par_code_".$data['par_id']."' name='par_code_".$data['par_id']."' value=\"".$data['par_code']."\" 
						style='width:150px;display:none;' disabled />&nbsp;:&nbsp;</td>";
		else $string .= "<td style='text-align:right;'>".$data['par_code']."&nbsp;:&nbsp;</td>";
		$string .= "<td><input name='par_valeur_".$data['par_id']."' value='".$data['par_valeur']."' class='inputAdmin' /></td>";
		if ($data['tpa_id']!="") $nom = $t_tpa[$data['tpa_id']]['nom'];
		else $nom = "";
		if ($fap->isDev()) {
			$img = "<div input='tpa_id_".$data['par_id']."' onclick='affInput(this)' title='Modifier'
						class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>";
			$string .= "<td style='border-right:1px #000000 solid;min-width:85px;'><span>".$nom.$img."</span>".makeSelType($data)."</td>";
		} else $string .= "<td style='border-right:1px #000000 solid;'>".$nom."&nbsp;</td>";
		
		$string .= "<td style='text-align:left;max-width:600px;'><span style='font-style:italic;' >".$data['par_description']." 
						<div input='par_description_".$data['par_id']."' onclick='affInput(this)' title='Modifier'
						class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>
						</span>
						<input id='par_description_".$data['par_id']."' name='par_description_".$data['par_id']."' value=\"".$data['par_description']."\" 
							class='inputAdminDes' style='font-style:italic;display:none;' /></td>";
		if ($fap->isDev()) 
			$string .= "<td class='imgDelete' onclick='supprimeParam(this)' par='".$data['par_id']."' code='".$data['par_code']."' title='Supprimer' ></td>";
		$string .= "</tr>";	
	}
		
	$string .= "<tr><td colspan='3'>&nbsp;</td></tr>";
	$string .= "<tr><td colspan='3' style='font-style:italic;text-align:left;'>Nouveau</td></tr>";
	$string .= "<tr style='border-top:1px #000000 solid;'>";						
		$string .= "<td style='text-align:right;min-width:200px;'><input name='par_code_new' value='' style='width:150px;' />&nbsp;:&nbsp;</td>";
		$string .= "<td><input name='par_valeur_new' value='' class='inputAdmin' /></td>";
		$string .= "<td>".makeSelType(array('par_id'=>'new','tpa_id'=>1),'')."</td>";
		$string .= "<td style='text-align:left;'><input name='par_description_new' value='' class='inputAdminDes' /></td>";	
	$string .= "</tr>";
			
	$string .= "</table>";	
	$string .= "<br>";
	$string .= "<input type='submit' value='Enregistrer' /><br/>";
	$string .= "</form>";
	
	$nb = 0;
	$sql = "select count(*) from t_lien_autologin_lan";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) $nb = $data['count(*)'];
	if ($nb>0) {
		if ($nb>1) $s="s"; else $s="";
		$string .= "<br><br><div class='divMessage' >";
		$string .= "Info : Il y a ".$nb." lien".$s." actif".$s." en attente";
		$string .= "</div>";
	}
	
	if ($fap->isDev()) {
		$sql = "select * from t_lien_autologin_lan";
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req)) {
			$string .= "<br>";
			if ($data['usr_id']) $string .= $t_users[$data['usr_id']]['nom'];
			else $string .= "new: ";
			if ($data['lan_email']!='') $string .= " (".$data['lan_email'].")";
			if ($data['lan_init']) $string .= " (init)";
		}
	}
	
	$string .= "</div>";

} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	