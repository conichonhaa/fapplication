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
function whatClassment($id) {
	global $fap;
	$sql = "select count(*) as c from t_faplogs_fap where fap_id<=".$id;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {						
		return $data['c'];
	}
}

if (count($_POST)>0) {
	include_once('communs/mail.php');
	if (isset($_POST['valide'])) {
		$sql = "update t_fapbook_fbk set fbk_valide=1 where fap_id=".$_POST['fap'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['supprime'])) {
		$sql = "delete from t_fapbook_fbk where fap_id=".$_POST['fap'];
		mysql_query($sql,$fap->conn);
	}
	if (isset($_POST['denonce'])) {
		$sql = "select * from t_fapbook_fbk as fbk
				join t_faplogs_fap as fap on fap.fap_id=fbk.fap_id
				where fap_id=".$_POST['fap'];
		$req = mysql_query($sql,$fap->conn);	
		if ($data = mysql_fetch_array($req)) {
			include_once('communs/mail.php');
			$mess = "Bonjour ".getNomUser($data['usr_id'])."\r\n\r\n";
			$mess .= "La page de ton book sur le fap n°".whatClassment($data['fap_id'])." ne respecte pas la charte de la fapplication.";
			$mess .= "\r\n\r\nVa vite la modifier s'il te plait !";
			$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."fBook-fap.php";
			sendMail($data['usr_id'],$mess,"Page du book calomnieuse");
			sendSms($data['usr_id'],"Page du book calomnieuse");
			sendIfttt($data['usr_id'],"Page du book calomnieuse");
		}
	}
	$string .= "<script>document.location.replace(document.location.href)</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;




if ($fap->isAdmin('book')) {
	$string .= "<div class='divEntete' >";
	$string .= "Administration du FapBook";
	$string .= "</div>";

	$inconnu = "";
	$valide = "";
	
	$sql = "select * from t_fapbook_fbk as fbk order by fbk_valide, fap_id desc";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {	
		$s = "<div class='eltBlocFond' >";
			$s .= "<div onclick='affDiv(this);' style='cursor:pointer;' div='bookElt".$data['fap_id']."' >";
				$s .= "<b>Fap n°".whatClassment($data['fap_id'])."</b>";
			$s .= "</div >";
			if ($data['fbk_valide']) $dis = "display:none;"; else $dis = "";
			$s .= "<div style='".$dis."' id='bookElt".$data['fap_id']."' >";
				$s .= "<div class='eltProjet eltProjetTexte'><u>Histoire du fap :</u>";
				if (!$data['fbk_valide']) {
					$s .= "<span>";
					$s .= " &nbsp; <input type='button' value='Approuver' onclick='approuveBook(this)' fap='".$data['fap_id']."' />";
					$s .= " &nbsp; <input type='button' value='Dénoncer' onclick='denonceBook(this)' fap='".$data['fap_id']."' />";
					$s .= "</span>";
				}
				$s .= "<br>".str_replace("\n","<br>",$data['fbk_commentaire'])."</div>";
				if ($data['img_id']!='') $s .= "<div class='eltProjet eltProjetImage'><img src='_getImg.php?img=".$data['img_id'].$vGetImg."' 
									style='width:400px;max-width:100%;' onclick='affImgCentre(".$data['img_id'].")' title='Voir image' /></div>";
				$s .= " &nbsp; <input type='button' value='Supprimer' onclick='supprimeBook(this)' fap='".$data['fap_id']."' />";
			$s .= "</div>";
		$s .= "</div>";
		if ($data['fbk_valide']) $valide .= $s;
		else $inconnu .= $s;
	}	
	
	$string .= "<div style='display:none;'>
				<img src='images/moins.png' class='iconePM' />
				<img src='images/plus.png' class='iconePM' />
				</div>";

	if ($inconnu!='') {
		$string .= "<div style='margin-top:30px;'>";
		$string .= "<div onclick='affDiv(this)' div='inconnu' style='cursor:pointer;' >
						<img id='pm_inconnu' src='images/moins.png' class='iconePM' /><u>Nouveau dans le Book</u></div>";
		$string .= "<div id='inconnu'>".$inconnu."</div>";
		$string .= "</div>";
	}

		$string .= "<div style='margin-top:30px;'>";
		$string .= "<div onclick='affDiv(this)' div='valide' style='cursor:pointer;' >
						<img id='pm_valide' src='images/plus.png' class='iconePM' /><u>Le Book validé</u></div>";	
		$string .= "<div id='valide' style='display:none;'>".$valide."</div>";
		$string .= "</div>";

	
	
	$string .= "</div>";
} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}
	


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;