<?php

include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
	
$string .= "</head><body>";


$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}



function whoIsTheOne($nb) {
	global $fap;
	$usr = -1;
	$id = -1;
	if ($nb>0) {
		$c = 0;
		$sql = "select * from t_faplogs_fap order by fap_id limit ".$nb;
		$req = mysql_query($sql,$fap->conn);
		while ($data = mysql_fetch_array($req) and $c<$nb) {						
			$c++;
			$usr = $data['usr_id'];
			$id = $data['fap_id'];
		}
		if ($c<$nb) $usr = -1;
	}
	return array($usr, $id);
}
function isInBook($id,$me) {
	global $fap;
	$sql = "select * from t_fapbook_fbk where fap_id=".$id." 
			and (fbk_public=1 or ".$me.")";
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {						
		return true;
	}
}
function makeLigne($nb,$lib) {
	global $fap, $vGetImg;
	list($usr,$id) = whoIsTheOne($nb);
	$info = $fap->logGetInfo($usr);
	if (isset($info['img_id']) and $info['img_id']!='' and $info['img_id']!='0') 
		$img="<img src='_getImg.php?img=".$info['img_id'].$vGetImg."' class='imgIcone' style='' />"; else $img="";
	$book = "<td style='text-align:center;padding-left:0.5em;' >:</td>";
	if ($usr>=0) {
		$me = ($usr==$fap->getId()?"1":"0");
		if (isInBook($id,$me)) $book = "<td style='padding-left:0.5em;' ><a href='fBook-fap.php?book=".$id."#bookElt".$id."'>
					<img src='images/book.png' class='imgIcone' title='Voir le Book' style='cursor:pointer;' /></a></td>";
		elseif ($fap->getId()==$usr) $book = "<td style='padding-left:0.5em;' ><a href='fBook-fap.php?add=".$id."#bookaddtitle'>
					<img src='images/book-add.png' class='imgIcone' title='Ajouter au Book' style='cursor:pointer;' /></a></td>";
	}
	$tr = "<tr style='vertical-align:middle;'>
				<td style='text-align:right;padding-right:0.5em;max-width:30%;'>".$lib."</td>
				<td style='text-align:center;'>(".$nb.")</td>
				".$book."
				<td style='text-align:center;padding-left:0.5em;'>".$img."</td>
				<td style='font-weight:bold;text-align:left;padding-left:0.5em;'>".getNomUser($usr)."</td>
				</tr>";
	return $tr;
}


$t_users[-1]['nom'] = '???';

$string .= "<div class='cadre' style='text-align:center;'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Les Faps remarquables";
$string .= "</div>";

$string .= "<div style='text-align:center;margin-top:50px;display:inline-block;'>";
$string .= "<table style='text-align:center;width:100%;'>";
$sql = "select * from t_identite_remarquable_irq order by irq_numero";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$string .= makeLigne($data['irq_numero'],$data['irq_libelle']);
}
$string .= "</table>";
$string .= "</div>";


$string .= "<div class='divMessage' style='margin-top:50px;'>";
$string .= "Tu as une idée d'identité remarquable ?";
$string .= "<br>Alors propose son petit nom à la communauté...";
$string .= "</div>";


$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;