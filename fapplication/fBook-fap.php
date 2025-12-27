<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;	
	
$string .= "<script type='text/javascript' src='scripts/fap.js".$versionTime."' ></script>";
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "</head><body>";

function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}


if (count($_POST)>0) {

	if (isset($_POST['commentaire_new']) and $_POST['commentaire_new']!='') {
		$public = (isset($_POST['public_new'])?"1":"null");
		$sql = "insert into t_fapbook_fbk (fap_id,fbk_commentaire,fbk_public) values 
				(".$_POST['fap'].",'".esc($_POST['commentaire_new'])."',".$public.") ";
		 mysql_query($sql,$fap->conn);
		if (isset($_FILES['image_new']) and $_FILES['image_new']['tmp_name']!='') {
			$blob = file_get_contents($_FILES['image_new']['tmp_name']);
			include_once('communs/classImg.php');
			$img = new img($_FILES['image_new']['tmp_name']);
			$img->tailleMax(1000000);
			$blob = $img->sendImage(true);
			$sql = "INSERT INTO t_images_img (img_contenu) VALUES ('".addslashes($blob)."')";
			$req2 = mysql_query($sql,$fap->conn);
			if ($req2) {
				$id = mysql_insert_id();
				$sql = "update t_fapbook_fbk SET img_id=".$id." WHERE fap_id=".$_POST['fap'];
				mysql_query($sql,$fap->conn);
				if ($public=='null') {
					$sql = "update t_images_img SET usr_id=(select usr_id from t_faplogs_fap where fap_id=".$_POST['fap'].")
							WHERE img_id=".$id;
					mysql_query($sql,$fap->conn);
				}	
			}
		}
	}
	if (isset($_POST['modbook']) and $_POST['modbook']!='') {
		$id = $_POST['modbook'];
		$public = (isset($_POST['public_'.$id])?"1":"null");
		$sql = "update t_fapbook_fbk set fbk_commentaire='".esc($_POST['commentaire_'.$id])."', fbk_public=".$public.", fbk_valide=null
					where fap_id=".$id;
		mysql_query($sql,$fap->conn);			
		if (isset($_FILES['image_'.$id]) and $_FILES['image_'.$id]['tmp_name']!='') {
			$blob = file_get_contents($_FILES['image_'.$id]['tmp_name']);
			include_once('communs/classImg.php');
			$img = new img($_FILES['image_'.$id]['tmp_name']);
			$img->tailleMax(1000000);
			$blob = $img->sendImage(true);
			$sql = "INSERT INTO t_images_img (img_contenu) VALUES ('".addslashes($blob)."')";
			$req2 = mysql_query($sql,$fap->conn);
			if ($req2) {
				$img = mysql_insert_id();
				$sql = "select * from t_fapbook_fbk where fap_id=".$id;
				$req3 = mysql_query($sql,$fap->conn);
				if ($data3 = mysql_fetch_array($req3)) {
					if ($data3['img_id']!='') {
						$sql = "DELETE FROM t_images_img WHERE img_id=".$data3['img_id'];
						mysql_query($sql,$fap->conn);
					}
				}
				$sql = "update t_fapbook_fbk SET img_id=".$img." WHERE fap_id=".$id;
				mysql_query($sql,$fap->conn);
			}
		}
		if (isset($_POST['suppimg_'.$id])) {
			$sql = "select * from t_fapbook_fbk where fap_id=".$id;
			$req3 = mysql_query($sql,$fap->conn);
			if ($data3 = mysql_fetch_array($req3)) {
				if ($data3['img_id']!='') {
					$sql = "DELETE FROM t_images_img WHERE img_id=".$data3['img_id'];
					mysql_query($sql,$fap->conn);
				}
			}
			$sql = "update t_fapbook_fbk SET img_id=null WHERE fap_id=".$id;
			mysql_query($sql,$fap->conn);
		} else {
			$sql = "select * from t_fapbook_fbk where fap_id=".$id;
			$req3 = mysql_query($sql,$fap->conn);
			if ($data3 = mysql_fetch_array($req3)) {
				if ($data3['img_id']!='') {
					if (isset($_POST['public_'.$id])) {
						$sql = "update t_images_img SET usr_id=null WHERE img_id=".$data3['img_id'];
						mysql_query($sql,$fap->conn);
					} else {
						$sql = "update t_images_img SET usr_id=(select usr_id from t_faplogs_fap where fap_id=".$id.") 
								WHERE img_id=".$data3['img_id'];
						mysql_query($sql,$fap->conn);
					}
				}
			}
		}	
	}
	if (isset($_POST['suppbook']) and $_POST['suppbook']!='') {
		$sql = "select * from t_fapbook_fbk WHERE fap_id=".$_POST['suppbook'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			if ($data['img_id']!='') {
				$sql = "DELETE FROM t_images_img WHERE img_id=".$data['img_id'];
				mysql_query($sql,$fap->conn);
			}
		}	
		$sql = "delete from t_fapbook_fbk WHERE fap_id=".$_POST['suppbook'];
		mysql_query($sql,$fap->conn);
	}	
	
	$string .= "<script>document.location.replace(document.location.href.split('#')[0].split('?')[0])</script>";
	$string .= "</body></html>";
	echo $string;
	die();
}

$string .= $string_menu;
	

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<img div='options' class='buttOption buttParam' src='images/engrenage.png' onclick='affDiv(this)' title='Options' />";
	$optionsConf = array('filtre'=>'');
	include_once('communs/funcOptions.php');
	$string .= "<div id='options' style='display:none;'><div class='cadreOptionEntete' >Paramètres
				<span class='cadreOptionEnteteCompl'> des filtres</span>
				&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-repeat' onclick='reloadOption(this);' ></span></div>
				<div class='cadreOption' >".$string_options
				."<br><input type='button' value='Actualiser' onclick='reloadOption(this);' /></div>
				</div>";

$string .= "<div class='divEntete' >";
$string .= "FapBook";
$string .= "</div>";



// en attente validation projet
// enlever "fapprobation" et dans formulaire : disabled, opacity:0.5, onclic

$string .= "<div class='divMessage' >";
$string .= "S'il te plait, raconte moi une histoire";
$string .= "</div>";


function whatClassment($id) {
	global $fap;
	$sql = "select count(*) as c from t_faplogs_fap where fap_id<=".$id;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {						
		return $data['c'];
	}
}
function isInBook($id) {
	global $fap;
	$sql = "select * from t_fapbook_fbk where fap_id=".$id;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {						
		return true;
	}
}
function getResume($description, $maxCar) {
	$lib = str_replace("\n"," ",$description);
	if (strlen($lib)>$maxCar) {
		$tt = explode(" ",$lib);
		$k = 0;
		$lib = "";
		while (strlen($lib." ".$tt[$k])<$maxCar and $k<count($tt)) {
			$lib .= $tt[$k]." ";
			$k++;
		}	
		if ($lib=="") $lib = substr($description,0,$maxCar)." ";
		$lib .= "...";
	}
	return $lib;
}
function affCoord($v) {
	$aff = "?";
	if ($v!='') $aff = round($v*100)/100;
	return $aff;
}	

$last = null;
$getFap = array();
$res = "";
$t_old = array();
$sql = "select * from t_faplogs_fap where usr_id=".$fap->getId()." order by fap_date desc";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	if (!isInBook($data['fap_id'])) {
		if (isset($_GET['add'])) {
			if ($_GET['add']==$data['fap_id']) $last = $data;
		} elseif (!$last) $last = $data;
		$detail = "<div style='margin-left:1em;'>";
		if ($data['fap_annule']) $detail .= "*";
		$num = whatClassment($data['fap_id']);
		$date = strftime("%d/%m/%Y %Hh%M",makeDate($data['fap_date']));
		$lat = affCoord($data['fap_pos_latitude']);
		$lon = affCoord($data['fap_pos_longitude']);
		$detail .= "<input id='choose_".$data['fap_id']."' type='button' value='n°".$num."' onclick='chooseFap(this)' 
						fap='".$data['fap_id']."' num='".$num."' date='".$date."' lat='".$lat."' lon='".$lon."' />";
		$detail .= " : ".$date." &nbsp; <span style='font-style:italic;font-size:80%;'>(lat:".$lat.", lon:".$lon.")</span>";
		if ($data['fap_pos_latitude']) 
			$detail .= "&nbsp;<div fap='".$data['fap_id']."' onclick='affPosSeek(this)' voir='seekOld' title='Voir ce Fap'
								class='imgDelete imgVoir' style='display:inline-block;' >&nbsp;</div>";
		$detail .= "</div>";
		$keyVal = null;
		foreach ($t_filtre as $key => $val) {
			if ($val['on']) {
				$kk = strftime($val['str'],makeDate($data['fap_date']));
				if (isset($val['group'])) {
					$k = (intval($kk/$val['group'])*$val['group']);
					$kk = $k."-".($k+$val['group']-1);
				}	
				if (isset($_GET['fap']) and $_GET['fap']==$data['fap_id']) $getFap[$kk] = 1;
				if ($keyVal) $keyVal = array($kk => $keyVal);
				else $keyVal = $kk;
			}
		}
		if ($keyVal) {
			affTab($keyVal, $detail, $t_old);
		} else {
			$res .= $detail;
		}
	}	
}

function affTab($keyVal, $cont, &$tt) {
	if (is_array($keyVal)) {
		foreach ($keyVal as $key => $val) {
			affTab($val, $cont, $tt[$key]);
		}
	} else {
		if (!isset($tt[$keyVal])) $tt[$keyVal] = "";
		$tt[$keyVal] .= $cont;			
	}
}
function makeButton($tt) {
	global $getFap;
	$s = "";
	foreach ($tt as $key => $val) {
		if (is_array($val)) $det = makeButton($val);
		else $det = $val;
		if ((isset($_SESSION['fap']['memoAffFiltre']['filtre'.$key]) and $_SESSION['fap']['memoAffFiltre']['filtre'.$key]=='true') 
			or isset($getFap[$key]))
			$display=""; else $display="display:none;";
		$s .= "<input type='button' div='filtre".$key."' onclick='affDiv(this);memoFiltre(this);' style='cursor:pointer;' value='".$key."' >";
		$s .= "<div id='filtre".$key."' style='".$display."margin-top:0px;'>".$det."</div>";
	}
	return $s;
}


if ($last) {
$string .= "<div class='eltBlocFond' >";
	$string .= "<div id='bookaddtitle' div='bookadd' style='cursor:pointer;' onclick='affDiv(this)'>
				<b>Commenter le fap n°<span id='num' >".whatClassment($last['fap_id'])."</span></b></div>";	
	$dis = "display:none;";
	if (isset($_GET['add']) and $_GET['add']==$last['fap_id']) $dis = "";
	$string .= "<div id='bookadd' style='".$dis."' >";	
	$string .= "<div style='display:inline-block;'>";
		$string .= "<div id='date' class='champFige'>".strftime("%d/%m/%Y %Hh%M",makeDate($last['fap_date']))."</div>";
		$string .= " &nbsp; <div id='lat' class='champFige'>".affCoord($last['fap_pos_latitude'])."</div>";
		$string .= "&nbsp;<div id='lon' class='champFige'>".affCoord($last['fap_pos_longitude'])."</div>";
	$string .= "</div >";
	
	if ($last['fap_pos_latitude']) $dis = "display:inline-block;"; else $dis = "display:none;";
		$string .= "&nbsp;<div fap='".$last['fap_id']."' onclick='affPosAdd(this)' id='see' title='Voir ce Fap'
								class='imgDelete imgVoir' style='".$dis."' >&nbsp;</div>";
	$string .= "<div id='seeAdd' style='display:none;'>
				<iframe src='' width='400' height='300' id='seeAddFrame' style='max-width:90%;'></iframe>
				</div >";
	
	$string .= "<div style='display:inline-block;margin-left:20px;'>";
		$string .= "<input type='button' div='booklist' onclick='affDiv(this)' value='Rechercher un ancien Fap' >";
	$string .= "</div >";	

	$string .= "<div id='seekOld' style='display:none;'>
				<iframe src='' width='400' height='300' id='seekOldFrame' style='max-width:90%;'></iframe>
				<input type='button' id='seekOldButt' onclick='chooseFap(this)' />
				</div >";
	
	$string .= "<div id='booklist' style='display:none;' >";
		$string .= makeButton($t_old);
		$string .= $res;
	$string .= "</div>";

	$string .= "<div style='margin-top:20px;'>";
		$string .= "<form method='post' enctype='multipart/form-data' >";
		$string .= "<input id='fap' name='fap' value='".$last['fap_id']."' style='display:none;' >";
		$string .= "<div style='display:inline-block;max-width:100%;'>";
			$string .= "<input type='checkbox' id='public_new' name='public_new' />";
			$string .= "<label for='public_new' > &nbsp; Publique</label>";
			$string .= "<br><textarea name='commentaire_new' rows='4' cols='70' style='max-width:98%;' ></textarea>";
			
			$string .= "<br><input type='submit' value='Enregistrer' />";
		$string .= "</div>";
		$string .= "<div style='display:inline-block;vertical-align:top;margin-left:20px;'>";
			$string .= "<img data-src='_getImg.php' src='_getImg.php' style='height:200px;cursor:pointer;'  
									onclick='chargeImage(this)' id='visu_image_new' file='image_new' />
									<input type='file' id='image_new' name='image_new' style='display:none;' >";		
		$string .= "</div>";
		$string .= "</form>";
		$string .= "<script>changeImageLoad('image_new');</script>";
	$string .= "</div >";
	$string .= "</div >";
$string .= "</div>";
} else {
	if (isset($_GET['add']) and $_GET['add']!="") {
		$string .= "<div class='eltBlocFond' >";
		$string .= "<i>Tu ne peux pas commenter un fap qui n'est pas le tien...</i>";
		$string .= "</div >";		
	} else {
		$string .= "<div class='eltBlocFond' >";
		$string .= "<i>Tu n'as aucun fap !</i>";
		$string .= "</div >";
	}
}


$monbook = "";
$publicbook = "";
$sql = "select * from t_fapbook_fbk as fbk
		join t_faplogs_fap as fap on fap.fap_id=fbk.fap_id
		where fap.usr_id=".$fap->getId()." or fbk.fbk_public=1
		order by fap.fap_date desc";
$req = mysql_query($sql,$fap->conn);
while ($data = mysql_fetch_array($req)) {
	$s = "<div class='eltBlocFond' id='bookElt".$data['fap_id']."' >";
		if ($data['usr_id']==$fap->getId()) $mod = "<div onclick='modifieBook(this)' title='modifier' 
													class='imgDelete imgPen' style='display:inline-block' >&nbsp;</div>";
		else $mod = "";
		$like = intval($data['fbk_like']);
		$s .= "<div onclick='affBook(this);' style='cursor:pointer;' >";
			$s .= "<b>".getNomUser($data['usr_id'])."</b><span> : ".getResume($data['fbk_commentaire'], 80)."
					<span style='float:right;'>
						<img src='images/coeur-red.png' style='height:20px;' /> 
						<span style='font-size:80%;font-style:italic;' id='likeid2_".$data['fap_id']."' >".$like."</span>
					</span></span>";
		$s .= "</div >";
		
		$dis = "display:none;";
		if (isset($_GET['book']) and $_GET['book']==$data['fap_id']) $dis = "";
		$s .= "<div style='".$dis."' >";
		
		$num = whatClassment($data['fap_id']);
		$date = strftime("%d/%m/%Y %Hh%M",makeDate($data['fap_date']));
		$lat = affCoord($data['fap_pos_latitude']);
		$lon = affCoord($data['fap_pos_longitude']);
		$s .= "<div >";
			$d = makeDate($data['fap_date']);
			$st = "le ".strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d)." à ".strftime("%Hh%M",$d);
			$s .= "<div class='eltProjet eltProjetTexte'>".$mod."&nbsp; n°".$num." : ".$st."
					<br><i>(lat:".$lat.", lon:".$lon.")</i>";
			if ($data['fap_pos_latitude'])	
				$s .= "<div fap='".$data['fap_id']."' onclick='affPosBook(this)' voir='idlabvoir' title='Voir ce Fap'
								class='imgDelete imgVoir' style='display:inline-block' >&nbsp;</div>
					<iframe src='' width='400' height='300' id='idlabvoir_".$data['fap_id']."' style='display:none;max-width:90%;'></iframe>";
			if ($data['usr_id']==$fap->getId())
				$s .= "<a href='fGeoloc-fap.php?fap=".$data['fap_id']."'><div title='Positionner ce Fap'
								class='imgDelete imgPos' style='display:inline-block' >&nbsp;</div></a>";
								
			$sql = "select * from t_identite_remarquable_irq where irq_numero=".$num;
			$req_irq = mysql_query($sql,$fap->conn);
			if ($data_irq = mysql_fetch_array($req_irq)) {				
				$s .= "<br><a href='sSpecial-stats.php'>
							<div title='Identité remrquable' class='imgDelete imgId' style='display:inline-block' >&nbsp;</div>
							<span style='font-size:80%;font-style:italic;color:#000000;'> ".$num." : ".$data_irq['irq_libelle']."</span>
						</a>";
			}
			$s .= "<br>
					<div title=\"J'aime\" class='imgDelete imgLike' style='display:inline-block'
						fbk='".$data['fap_id']."'  onclick='likeBook(this)' >&nbsp;</div> 
					<span style='font-size:80%;font-style:italic;color:#000000;' 
						id='likeid_".$data['fap_id']."' nb='".$like."'>".$like."</span>";			
								
			$s .= "<br><br><u>Histoire du fap :</u><br>".str_replace("\n","<br>",$data['fbk_commentaire'])."</div>";
			if ($data['img_id']!='') $s .= "<div class='eltProjet eltProjetImage'><img src='_getImg.php?img=".$data['img_id'].$vGetImg."' 
								style='width:100%;' onclick='affImgCentre(".$data['img_id'].")' title='Voir image' /></div>";
		$s .= "</div>";
		if ($data['usr_id']==$fap->getId()) {
			$s .= "<div style='display:none;' >";
				$s .= "<form method='post' enctype='multipart/form-data' >";
				$s .= "<input name='modbook' value='".$data['fap_id']."' style='display:none;' >";
				$s .= "<div>";
					$s .= "<div onclick='annuleBook(this)' title='annuler' class='imgDelete imgReturn' style='display:inline-block' >&nbsp;</div>";
					$s .= "<span>n°".$num."</span>";
					$s .= " &nbsp; <div class='champFige'>".$date."</div>";
					$s .= " &nbsp; <div class='champFige'>".$lat."</div>";
					$s .= "&nbsp;<div class='champFige'>".$lon."</div>";
				$s .= "</div>";	
				$s .= "<div style='display:inline-block;'>";
					$s .= "<input type='checkbox' id='idlabpublic_".$data['fap_id']."' name='public_".$data['fap_id']."' ".($data['fbk_public']?"checked":"")." />";
					$s .= "<label for='idlabpublic_".$data['fap_id']."' > &nbsp; Publique</label>";
					$s .= "<br><textarea name='commentaire_".$data['fap_id']."' rows='4' cols='70' style='max-width:90%;'>".$data['fbk_commentaire']."</textarea>";
					$s .= "<br><input type='submit' value='Enregistrer' />";
					$s .= " &nbsp; <input type='button' value='Supprimer' onclick='suppBook(this)' fap='".$data['fap_id']."' />";
				$s .= "</div>";
				$s .= "<div style='display:inline-block;vertical-align:top;margin-left:20px;'>";
					$s .= "<img data-src='_getImg.php?img=".$data['img_id'].$vGetImg."' src='_getImg.php?img=".$data['img_id'].$vGetImg."' style='height:200px;cursor:pointer;'  
											onclick='chargeImage(this)' id='visu_idlabimage_".$data['fap_id']."' file='idlabimage_".$data['fap_id']."' />
											<input type='file' id='idlabimage_".$data['fap_id']."' name='image_".$data['fap_id']."' style='display:none;' >";
					if ($data['img_id']!='') $s .= "<br><input type='checkbox' id='idlabimg_".$data['fap_id']."' name='suppimg_".$data['fap_id']."' />
								<label for='idlabimg_".$data['fap_id']."' > &nbsp; Supprimer</label>";											
				$s .= "</div>";
				$s .= "</form>";
				$s .= "<script>changeImageLoad('idlabimage_".$data['fap_id']."');</script>";			
			$s .= "</div>";
		}
		$s .= "</div>";
	$s .= "</div>";
	if ($data['usr_id']==$fap->getId()) {
		$monbook .= $s;
		$s = str_replace("likeid","likeidpub",$s);
	}
	$s = str_replace("idlab","idlab2",$s);
	if ($data['fbk_public']) $publicbook .= $s;
}

$string .= "<div style='display:none;'>
			<img src='images/moins.png' class='iconePM' />
			<img src='images/plus.png' class='iconePM' />
			</div>";
			
			
if ($fap->isAdmin('book')) {
	$s = "<div class='divAdmin' >";
	$s .= "<br><a href='aBook-admin.php'>Il y a des histoires en attente de validation</a>";
	$s .= "</div>";
	$sql = "select * from t_fapbook_fbk where fbk_valide is null " ;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$string .= $s;
	}	
}
	

if ($monbook!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='monbook' style='cursor:pointer;' >
					<img id='pm_monbook' src='images/moins.png' class='iconePM' /><u>Mon Book</u></div>";
	$string .= "<div id='monbook'>".$monbook."</div>";
	$string .= "</div>";
}
if ($publicbook!='') {
	$string .= "<div style='margin-top:30px;'>";
	$string .= "<div onclick='affDiv(this)' div='publicbook' style='cursor:pointer;' >
					<img id='pm_publicbook' src='images/plus.png' class='iconePM' /><u>Le Book publique</u></div>";	
	$string .= "<div id='publicbook' style='display:none;'>".$publicbook."</div>";
	$string .= "</div>";
}

$string .= "</div>";

	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;