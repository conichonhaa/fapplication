<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/admin.css' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/admin.js' ></script>";
$string .= "</head><body>";

$string .= $string_menu;


if ($fap->isAdmin()) {	
	
	if (count($_POST)>0) {
		if (isset($_POST['supprime']) and $_POST['supprime']!='') {
			$fap->deleteUser($_POST['supprime']);
		}

		$string .= "<script>document.location.replace(document.location.href)</script>";
		$string .= "</body></html>";
		echo $string;	
		die();
	}
	
	if (isset($_SESSION['fap']['errorMail'])) {
		$string .= "<div class='divMessage' ><br/>";
		$string .= $_SESSION['fap']['errorMail'];
		$string .= "</div>";
		unset($_SESSION['fap']['errorMail']);
	}

$string .= "<div style='display:none;'>
				<img src='images/remove.png' />
				<img src='images/remove-o.png' />
			</div>";	
	
	$string .= "<div class='cadre' style='text-align:center;'>";
	$string .= "<div class='divEntete' >";
	$string .= "Administration des fappeurs";
	$string .= "</div>";
	
	$never = "";
	$old = "";
	$medium = "";
	$current = "";
	$string .= "<div style='text-align:center;display:inline-block;'>";
	$string .= "<table style='text-align:center;'><tr style='font-weight:bold;' ><td>&nbsp;&nbsp;</td></tr>";
	$sql = "select usr.*,usk.usk_userkey from t_utilisateurs_usr as usr
			left join t_user_key_usk as usk on usk.usr_id=usr.usr_id
			order by usr.usr_nom";
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {				
		
		$user = "";
		// affiche lignes
		$user .= "<tr>";						
		$user .= "<td id='nom_".$data['usr_id']."' elem='activity_".$data['usr_id']."' 
					onclick='affElt(this)' style='cursor:pointer;' >".$data['usr_nom']."</td>";
		if ($data['usr_email']!='') {
			$devinfo = ($fap->isDev()?"title='".$data['usr_email']."'":"");
			$no = ($data['usr_notif_mail']?"":"-no");
			$user .= "<td width='30' ><image src='images/mail".$no.".png' width='25' align='center' ".$devinfo." /></td>";
		} else {
			$user .= "<td width='30' ></td>";	
		}
		if ($data['usr_tel']!='') {
			$devinfo = ($fap->isDev()?"title='".$data['usr_tel']."'":"");
			$no = ($data['usr_notif_sms']?"":"-no");
			$user .= "<td width='30' ><image src='images/tel".$no.".png' width='25' align='center' ".$devinfo." /></td>";
		} else {
			$user .= "<td width='30' ></td>";	
		}	
		if ($data['usk_userkey']!='') {
			$devinfo = ($fap->isDev()?"title='".$data['usk_userkey']."'":"");
			$no = ($data['usr_notif_ifttt']?"":"-no");
			$user .= "<td width='30' ><image src='images/ifttt".$no.".png' width='20' align='center' ".$devinfo." /></td>";
		} else {
			$user .= "<td width='30' ></td>";	
		}	
		$user .= "<td width='10' ></td>";
		if ($data['usr_email']!='') {
			if ($data['usr_password_alea']!='') {
				$sent='sent';
				$m="En attente, Générer un nouveau ?";
				if ($data['usr_password_alea']<strftime("%Y-%m-%dT%H:%M:%S",time()-$fap->getNbjAlea()*24*3600)) {
					$sent='obs';
					$m="Mdp périmé, Générer un nouveau ?";
				}
			} else {
				$sent='';
				$m="Générer un mdp aléatoire";
			}
			$user .= "<td width='30' ><image src='images/des".$sent.".png' width='25' align='center' title='".$m."'
								usr=".$data['usr_id']." onclick='aleaMdp(this)' style='cursor:pointer;' /></td>";
		} else {
			$user .= "<td width='30' ></td>";	
		}
		$user .= "<td width='10' ></td>";
		if ($data['usr_id']!=$fap->getId() and $data['usr_id']!=2)
			$user .= "<td class='imgDelete' onclick='supprime(this)' usr=".$data['usr_id']." title='Supprimper le fappeur' ></td>";
		else 
			$user .= "<td ></td>";	
		$user .= "</tr>";
		$user .= "<tr id='activity_".$data['usr_id']."' style='display:none;'>";
		//$user .= "<tr style=''>";
			$first = makeDate($fap->getFirstActivity($data['usr_id']));
			$last = makeDate($fap->getLastActivity($data['usr_id']));
			$user .= "<td style='font-size:80%;' colspan='8' >"
						.$fap->miniMois(strftime("%m",$first)).strftime(" %Y",$first)
						." → ".$fap->miniMois(strftime("%m",$last)).strftime(" %Y",$last)
						."<br><i>(=".affDuree($last-$first,2).")</i>"
						."<br><i><span style='font-size:80%;'>néant depuis</span> "
						.affDuree(time()-$last,2)."</i></td>";	
		$user .= "</tr>";
		$last = $fap->getLastFap($data['usr_id']);
		if (!$last) $never .= $user;
		elseif ($last<strftime("%Y-%m-%dT%H:%M:%S",time()-366*24*3600)) $old .= $user;
		elseif ($last<strftime("%Y-%m-%dT%H:%M:%S",time()-31*24*3600)) $medium .= $user;
		else $current .= $user;
	}
	$string .= $current;
	if ($medium!="") {
		$string .= "<tr><td colspan='5'>&nbsp;</td></tr>";
		$string .= "<tr><td colspan='5'><i><u>Plus d'un mois sans fap</u></i> ...</td></tr>";
		$string .= $medium;
	}
	if ($old!="") {
		$string .= "<tr><td colspan='5'>&nbsp;</td></tr>";
		$string .= "<tr><td colspan='5'><i><u>Plus d'un an sans fap</u></i> ...</td></tr>";
		$string .= $old;
	}
	if ($never!="") {
		$string .= "<tr><td colspan='5'>&nbsp;</td></tr>";
		$string .= "<tr><td colspan='5'><i><u>Aucun fap</u></i> ...</td></tr>";
		$string .= $never;
	}
	$string .= "</table></div>";	
	$string .= "</div>";

	
} else {	
	$string .= "<div class='divEntete' >";
	$string .= "Accès interdit";
	$string .= "</div>";
}

$string .= $string_banner;
$string .= "</body></html>";
echo $string;	