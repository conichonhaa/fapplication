<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/infos.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

$string .= $string_menu;

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Les Fappeurs";
$string .= "</div>";


if (isset($_GET['tri'])) $tri = $_GET['tri']; else $tri = 'xp';

$string .= "<div style='text-align:right;margin-bottom:20px;' >";
	$tt = array('nom'=>'Nom', 'xp'=>'Expérience', 'niv'=>'Niveau', 'pow'=>'Pouvoir', 'coin'=>'Coffre', 'ex'=>'Exhibition');
	if ($fap->isDev()) $tt['lim'] = 'Pv limit';
	$string .= "Trier par <select onchange='document.location.replace(\"?tri=\"+this.value)' />";
	foreach ($tt as $key => $val) {
		$string .= "<option value='".$key."' ".($key==$tri?"selected":"").">".$val."</option>";
	}
	$string .= "</select>";
$string .= "</div>";

$sql = "select * from t_utilisateurs_usr as usr
		join t_level_lvl as lvl on lvl.usr_id=usr.usr_id";
if ($tri=='xp') $sql .= " order by lvl.lvl_experience desc, usr.usr_nom";	
if ($tri=='nom') $sql .= " order by usr.usr_nom";
if ($tri=='niv') $sql .= " order by lvl.lvl_niveau desc, usr.usr_nom";	
if ($tri=='pow') $sql .= " order by lvl.lvl_power desc, usr.usr_nom";	
if ($tri=='coin') $sql .= " order by lvl.lvl_coffre desc, usr.usr_nom";	
if ($tri=='ex') $sql .= " order by lvl.lvl_exhib desc, usr.usr_nom";
if ($tri=='lim') $sql .= " order by (lvl.lvl_niveau*10-lvl.lvl_power), usr.usr_nom";	
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {				
	$info = $fap->logGetInfo($data['usr_id']);
	$lvl = $fap->logGetLevel($data['usr_id']);
	$string .= "<div class='eltLigne'>";
	
	$string .= "<div>";		
		$string .= "<div class='lvlXP xpInline' >".$lvl['niveau']."</div>";
		$string .= "<img src='_getImg.php?img=".$info['img_id'].$vGetImg."' class='imgIconeInfo' />";
		$string .= "&nbsp;<b>".$info['nom']."</b>";
		if ($info['sexe']!='') $string .= " <img src='images/sexe".$info['sexe'].".png' class='imgIcone' />";	
	$string .= "</div>";

	$string .= "<div class='numXP xpInline' >";
	$string .= "<div class='barreXP herosW xpInline' style='width:100px;'>";
		$pc = 100;
		$string .= "<div class='barreXPfill' style='width:".$pc."%;' ></div>";
	$string .= "</div>";
	$string .= "<div class='numXP xpInline' > ".$lvl['experience']." &nbsp;&nbsp;&nbsp; </div>";
	$string .= "</div>";
	
	$string .= "<div class='numXP xpInline' >";
	$string .= "<div class='powerXP herosH xpInline' style='height:25px;' >";
		$pc = 100;
		$string .= "<div class='powerXPfill' style='height:".$pc."%;' ></div>";
		$string .= "<div class='powerXPfilltop' style='bottom:".$pc."%;' ></div>";
	$string .= "</div>";
	$string .= "<div class='numXP xpInline' > &nbsp;".$lvl['power']." &nbsp;&nbsp;&nbsp; </div>";
	$string .= "</div>";
	
	$string .= "<div class='numXP xpInline' >";
	$string .= "<img src='images/sous.png' style='height:25px;vertical-align:top;' />";
	$string .= "<div class='numXP xpInline' >".$lvl['coffre']." &nbsp;&nbsp;&nbsp; </div>";
	$string .= "</div>";
	
	if ($lvl['exhib']>0) {
		$string .= "<div class='numXP xpInline' >";
		$string .= "<div class='exhibXP xpInline' style='height:20px;width:20px;' ></div>";
		$string .= "<div class='numXP xpInline' > ".intval($lvl['exhib'])." &nbsp;&nbsp;&nbsp; </div>";
		$string .= "</div>";
	}
	if ($fap->isDev()) {
		$lim = $lvl['niveau']*10-$lvl['power'];
		if ($lim<0) {
			$string .= "<div class='numXP xpInline' style='color:red;' > !!! ".$lim." &nbsp;&nbsp;&nbsp; </div>";
		}
		if ($lvl['power']>$lvl['niveau']*9) {
			$string .= "<div class='numXP xpInline' style='color:red;' ><img src='images/achtung.gif' class='imgIcone' /> &nbsp;&nbsp;&nbsp; </div>";
		}
	}
	
	$string .= "<div style='font-size:80%;font-style:italic;margin-left:20px;'>";
	$sql2 = "select * from t_maximes_mxm where usr_id=".$data['usr_id'];
	$req2 = mysql_query($sql2,$fap->conn);
	while ($data2 = mysql_fetch_array($req2)) {	
		$string .= "<div><i>".$data2['mxm_texte']."</i></div>";
	}
	$string .= "</div>";
	
	if ($data['usr_id']==$fap->getId()) {
		$string .= "<div style='font-size:80%;'>";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='iLevel-infos.php'>Mon expérience</a>";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='iMaxime-infos.php'>Mes maximes</a>";
		$string .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='iCoffre-infos.php'>Mon coffre</a>";
		$string .= "</div>";
	}

	$string .= "</div>";	
}
$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;