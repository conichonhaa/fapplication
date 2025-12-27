<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;

function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}
function majDroit($col,$data) {
	global $fap, $t_tpa;
	$id = $data['ndr_id'];
	if (isset($_POST[$col.'_'.$id]) and ($_POST[$col.'_'.$id]!='')) {
		$val = esc($_POST[$col.'_'.$id]);
		$sql = "update t_nom_droits_ndr set ".$col."='".$val."' where ndr_id=".$id;
		mysql_query($sql,$fap->conn);
	}
}


if ($fap->isAdmin()) {	
	
	if (count($_POST)>0) {
		if (isset($_POST['code_new']) and $_POST['code_new']!='') {
			$code = esc($_POST['code_new']);
			$lib = esc($_POST['libelle_new']);
			if ($lib=='') $lib = $code;
			$sql = "select * from t_nom_droits_ndr where ndr_code='".$code."'";
			$req = mysql_query($sql,$fap->conn);
			if ($data = mysql_fetch_array($req)) {
				$_SESSION['fap']['messParam'] .= "Le code \"".$code."\" existe déjà<br>";
			} else {
				$sql = "insert into t_nom_droits_ndr (ndr_code,ndr_libelle) values ('".$code."','".$lib."')";
				mysql_query($sql,$fap->conn);
			}
		}
		
		if (isset($_POST['addDroit']) and $_POST['addDroit']!='' and $_POST['usr']!='') {
			$sql = "insert into t_droits_utilisateurs_dru (ndr_id,usr_id) values (".$_POST['addDroit'].",".$_POST['usr'].")";
			mysql_query($sql,$fap->conn);
		}
		if (isset($_POST['delDroit']) and $_POST['delDroit']!='') {
			$sql = "delete from t_droits_utilisateurs_dru where dru_id=".$_POST['delDroit'];
			mysql_query($sql,$fap->conn);
		}
		
		if (isset($_POST['modif'])) {				
			$id = $data['par_id'];
			$sql = "select * from t_nom_droits_ndr ";
			$req = mysql_query($sql,$fap->conn);
			while ($data = mysql_fetch_array($req)) {
				majDroit('ndr_code',$data);
				majDroit('ndr_libelle',$data);
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
	
	$string .= "<div style='display:none;'>
					<img src='images/remove.png' />
					<img src='images/remove-o.png' />
				</div>";

			
	$string .= "<div class='cadre' style='text-align:center;'>";
	$string .= "<div class='divEntete' >";
	$string .= "Administration des droits";
	$string .= "</div>";
	
	$string .= "<div>";
	$string .= "<form method='post' style='text-align:center;display:inline-block;'>";
	$string .= "<input name='modif' style='display:none;' >";
	
	$sql = "select * from t_nom_droits_ndr ";
	$req_ndr = mysql_query($sql,$fap->conn);
	while ($data_ndr = mysql_fetch_array($req_ndr)) {				
		$string .= "<div style='margin:20px;'>";
		if ($fap->isDev()) 
			$string .= "<span><div input='ndr_libelle_".$data_ndr['ndr_id']."' onclick='affInput(this)' title='Modifier'
							class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>
						<u>".$data_ndr['ndr_libelle']."</u></span>
						<input id='ndr_libelle_".$data_ndr['ndr_id']."' name='ndr_libelle_".$data_ndr['ndr_id']."' value=\"".$data_ndr['ndr_libelle']."\" 
						style='width:150px;display:none;' disabled />&nbsp;
						(<span><div input='ndr_code_".$data_ndr['ndr_id']."' onclick='affInput(this)' title='Modifier'
							class='imgDelete imgPen' style='display:inline-block;' >&nbsp;</div>
						<u>".$data_ndr['ndr_code']."</u></span>
						<input id='ndr_code_".$data_ndr['ndr_id']."' name='ndr_code_".$data_ndr['ndr_id']."' value=\"".$data_ndr['ndr_code']."\" 
						style='width:150px;display:none;' disabled />)&nbsp;";
		else $string .= "<u>".$data_ndr['ndr_libelle']."</u>&nbsp;";
		$tdu = array();
		$sql = "select * from t_droits_utilisateurs_dru where ndr_id=".$data_ndr['ndr_id'];
		$req_dru = mysql_query($sql,$fap->conn);
		while ($data_dru = mysql_fetch_array($req_dru)) {				
			$tdu[] = $data_dru['usr_id'];
			$string .= "<br>".$t_users[$data_dru['usr_id']]['nom'];
			if (!($data_ndr['ndr_code']=='admin' and $data_dru['usr_id']==2))
			$string .= "&nbsp;<div usr='".$data_dru['dru_id']."' onclick='delDroit(this)' class='imgDelete' style='display:inline-block;' >&nbsp;</div>";
			
		}
		$string .= "<br><select id='addDroit_".$data_ndr['ndr_id']."'><option value=''></option>";
		foreach ($t_users as $usr => $v) {
			if (!in_array($usr,$tdu)) $string .= "<option value='".$usr."'>".$v['nom']."</option>";
		}	
		$string .= "</select><input ndr='".$data_ndr['ndr_id']."' type='button' value='Ajouter' onclick='addDroit(this)' />";
		$string .= "</div>";
	}
	if ($fap->isDev()) $string .= "<input type='submit' value='Enregistrer' />";
	$string .= "</form>";
	$string .= "</div>";
	
	if ($fap->isDev()) {
		$string .= "<div style='margin-top:50px;'>";
		$string .= "<form method='post' style='text-align:center;display:inline-block;'>";
		$string .= "<i>Nouveau droit</i>";
		$string .= "<br>Code : <input name='code_new' />";
		$string .= "<br>Libellé : <input name='libelle_new' />";
		$string .= "<br><input type='submit' value='Enregistrer' />";
		$string .= "</form>";
		$string .= "</div>";
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