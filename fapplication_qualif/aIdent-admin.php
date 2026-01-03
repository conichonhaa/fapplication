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

if ($fap->isAdmin('special')) {	
	
	if (count($_POST)>0) {
		if (isset($_POST['supprime']) and $_POST['supprime']!='') {
			$sql = "delete from t_identite_remarquable_irq WHERE irq_id=".$_POST['supprime'];
					mysql_query($sql,$fap->conn);
		}
		if (isset($_POST['modif'])) {
			$sql = "select * from t_identite_remarquable_irq";
			$req = mysql_query($sql,$fap->conn);
			while ($data = mysql_fetch_array($req)) {				
				if ($_POST['lib_'.$data['irq_id']]!='') {
					$sql = "UPDATE t_identite_remarquable_irq SET irq_libelle='".esc($_POST['lib_'.$data['irq_id']])."' WHERE irq_id=".$data['irq_id'];
					mysql_query($sql,$fap->conn);
				}	
			}
			if ($_POST['num_add']!='' and intval($_POST['num_add'])>0 and $_POST['lib_add']!='') {
				$sql = "INSERT INTO t_identite_remarquable_irq (irq_numero, irq_libelle) values (".$_POST['num_add'].",'".esc($_POST['lib_add'])."')";
				mysql_query($sql,$fap->conn);
			}	
		}
		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;	
		die();
	}
	
	


	$string .= "<div class='cadre' style='text-align:center;'>";
	$string .= "<div class='divEntete' >";
	$string .= "Administration des identités";
	$string .= "</div>";
	
		$string .= "<form method='post' style='text-align:center;display:inline-block;'>";
	$string .= "<input name='modif' style='display:none;' >";
	$string .= "<input type='submit' value='Enregistrer' /><br/>";
	$string .= "<table style='text-align:center;' ><tr style='font-weight:bold;' >
						<td style='border-right:1px #000000 solid;'>&nbsp;Numéro&nbsp;</td>
						<td >&nbsp;Libellé&nbsp;</td></tr>";
	
	$tforbid = array();
	$tforbid[] = 'mdpdev';
	$l = "";
	foreach ($tforbid as $fb) {
			if ($l!="") $l .= ",";
			$l .= "'".$fb."'";
	}
	$sql = "select * from t_identite_remarquable_irq order by irq_numero";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		$string .= "<tr style='border-top:1px #000000 solid;'>";						
		$string .= "<td style='text-align:right;'>".$data['irq_numero']."&nbsp;:&nbsp;</td>";
		$string .= "<td ><input name='lib_".$data['irq_id']."' value=\"".$data['irq_libelle']."\" style='width:400px;' /></td>";
		$string .= "<td class='imgDelete' onclick='supprimeIdent(this)' irq='".$data['irq_id']."' num='".$data['irq_numero']."' ></td>";
		$string .= "</tr>";
	}
		
	$string .= "<tr><td colspan='3'>&nbsp;</td></tr>";
	$string .= "<tr><td colspan='3' style='font-style:italic;text-align:left;'>Nouveau</td></tr>";
	$string .= "<tr style='border-top:1px #000000 solid;'>";						
		$string .= "<td ><input name='num_add' value='' type='number' style='width:100px;' />&nbsp;:&nbsp;</td>";
		$string .= "<td ><input name='lib_add' value='' style='width:400px;' /></td>";
	$string .= "</tr>";
			
	$string .= "</table>";	
	
	$string .= "</form>";
	
	
	$string .= "</div>";

	
} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	