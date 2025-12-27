<?php
include_once('communs/menu.php');
include_once('communs/head.php');
include_once('communs/log.php');

$string = $string_head;
$string .= "<link rel='stylesheet' href='styles/stats.css".$versionTime."' media='all' type='text/css' />";
$string .= "<script type='text/javascript' src='scripts/pie.js".$versionTime."' ></script>";
$string .= "<script type='text/javascript' src='scripts/stats.js".$versionTime."' ></script>";
$string .= "</head><body>";

$string .= $string_menu;
if (!getMstHealth('mst-pandemic')) {
	$string .= $string_mstPandemicBlock;
	echo $string;
	die();
}


function esc($s) {
	$s = str_replace("\\","",$s);
	$s = str_replace("'","''",$s);
	return $s;
}


if (count($_POST)>0) {
	
	if (isset($_POST['addProjet']) and $_POST['titre_new']!='') {
		$titre = esc($_POST['titre_new']);
		$projet = esc($_POST['projet_new']);
		$sql = "insert into t_incubateur_icb (icb_titre,icb_projet,icb_cible,icb_vote,usr_id) values ('".$titre."','".$projet."',10,0,".$fap->getId().") ";
		mysql_query($sql,$fap->conn);
		$fap->incPoints(10);
		include_once('communs/mail.php');	
		foreach ($fap->whoIsAdmin('incub') as $usr) {	
			$mess = "Bonjour ".$t_users[$usr]['nom']."\r\n\r\n";
			$mess .= $fap->info['nom']." a posté un nouveau projet : \r\n\r\n".str_replace("\\","",$_POST['titre_new'])."\r\n";
			$mess .= str_replace("\\","",$_POST['projet_new'])."\r\n\r\n";
			$mess .= "Va vite le valider pour que l'on puisse le fapprouver !";
			$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."aIncub-admin.php";
			sendMail($usr,$mess,"Nouveau projet à valider");
			sendSms($usr,$fap->info['nom']." a posté un nouveau projet");
			sendIfttt($usr,$fap->info['nom']." a posté un nouveau projet");
		}
	}
	
	if (isset($_POST['vote']) and $_POST['vote']!='' and $_POST['fap']!='') {
		$sql = "update t_faplogs_fap set icb_id=".$_POST['vote']." where fap_id=".$_POST['fap'];
		mysql_query($sql,$fap->conn);
		$sql = "update t_incubateur_icb set icb_vote=(select count(*) as c from t_faplogs_fap where icb_id=".$_POST['vote'].") where icb_id=".$_POST['vote'];
		mysql_query($sql,$fap->conn);	
		$sql = "update t_incubateur_icb set icb_date='".strftime("%Y-%m-%dT%H:%M:%S",time())."' where icb_id=".$_POST['vote'];
		mysql_query($sql,$fap->conn);		
		$fap->incPoints(1);
		$sql = "select * from t_incubateur_icb where icb_vote=icb_cible and icb_id=".$_POST['vote'];
		$req = mysql_query($sql,$fap->conn);	
		if ($data = mysql_fetch_array($req)) {
			include_once('communs/mail.php');
			$mess = "Bonjour ".getNomUser($data['usr_id'])."\r\n\r\n";
			$mess .= "Félicitations, ton projet ".$data['icb_titre']." a été fapprouvé !!!";
			$mess .= "\r\n\r\nTu peux aller récolter les voix obtenues !";
			$mess .= "\r\n".$fap->getServerName().$fap->getAppName()."sIncub-stats.php";
			sendMail($data['usr_id'],$mess,"Ton projet a été fapprouvé");
			sendSms($data['usr_id'],"Ton projet a été fapprouvé");
			sendIfttt($data['usr_id'],"Ton projet a été fapprouvé");
		}	
	}
	
	if (isset($_POST['recolte']) and $_POST['recolte']!='') {
		$sql = "update t_incubateur_icb set icb_recolte=1 where icb_id=".$_POST['recolte'];
		mysql_query($sql,$fap->conn);	
		$sql = "select * from t_incubateur_icb where icb_id=".$_POST['recolte'];
		$req = mysql_query($sql,$fap->conn);	
		if ($data = mysql_fetch_array($req)) $fap->incPoints($data['icb_cible']*10);
	}	

	$string .= "<script>document.location.replace(document.location.href.split('?')[0])</script>";
	$string .= "</body></html>";
	echo $string;	
	die();
}

$string .= "<div class='cadre'>";
$string .= $string_buttSound;

$string .= "<div class='divEntete' >";
$string .= "Construisons aujourd'hui le fap de demain";
$string .= "</div>";

$string .= "<div class='imgInfo' div='explique' onclick='affDiv(this)'>";
$string .= "<span class='glyphicon glyphicon-question-sign'></span>";
$string .= "</div>";
	$string .= "<div id='explique' class='divMessage' style='display:none;' >";
	$string .= "Vous avez rêvé d'un projet complètement fapfelus ? 
				Vous vous demandez s'il est réalisable et si d'autres seraient prêt à embarquer dans l'aventure avec vous ?
				Alors n'hésitez plus, inscrivez votre idée ici, 
				un administrateur sera à vos côtés pour la rendre attractive et pour évaluer son degré de dificulté.
				<br>Il sera alors mis aux voix des fappeurs, 
				chaque fap pourra être attribué au projet de son choix (excepté le sien) jusqu'à ce qu'il soit collectivement fapprouvés !
				<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A vos méninges et bonne chance à tous.";
	$string .= "</div>";
	
	

$fapVote = $fap->getFapVotable();

if (count($_GET)>0) {
	
	$back = "<div style='text-align:center;'>
				<input type='button' value=\"Revenir à l'incubateur\" onclick='document.location.replace(document.location.href.split(\"?\")[0])' />
				</div>";
	
	if (isset($_GET['vote'])) {
		$string .= "<div class='divMessage' >";
		$string .= "Je donne mon sperme pour la postérité";
		$string .= "</div>";
		$string .= $back;
		
		if ($fapVote) {
			$sql = "select * from t_incubateur_icb where icb_vote<icb_cible and icb_valide=1 and usr_id<>".$fap->getId()." 
						order by ((icb_cible-icb_vote)/icb_cible),icb_vote desc" ;
			$req = mysql_query($sql,$fap->conn);
			$nb = mysql_num_rows($req);
			while ($data = mysql_fetch_array($req)) {
				$s = "<div class='eltBlocFond' >";
				$s .= "<div div='projet_".$data['icb_id']."' onclick='affDiv(this)' style='cursor:pointer;' >";
				$s .= "<b>".$data['icb_titre']." : ".percent($data['icb_vote'],$data['icb_cible'])."%</b>";
				$s .= " &nbsp; <form method='post' style='display:inline-block;' ><input name='vote' value='".$data['icb_id']."' style='display:none;' />";
				$s .= "<input name='fap' value='".$fapVote."' style='display:none;' />";
				$s .= "<input type='image' src='images/pouce.gif' id='vote_".$data['icb_id']."' code='vote' balise='input'
								onclick='event.stopPropagation();gainXP(this);hideElements(this,\"disable\");'
								style='vertical-align:middle;width:40px;outline:none;cursor:pointer;' title=\"j'aime\" />";
				$s .= "</form></div>";
				$s .= "<div id='projet_".$data['icb_id']."' style='display:none;' >";
				$s .= "<div class='eltProjet eltProjetTexte'>";
				$s .= "<div class='eltProjetTitre'>by ".getNomUser($data['usr_id'])."";
				$s .= " &nbsp; (".$data['icb_vote']."/".$data['icb_cible']." : <img icb='".$data['icb_id']."' src='images/pie.svg' 
							style='width:20px;cursor:pointer;' onclick='getCamXml(this)' title='Voir Stats' />)</div>";	
				$s .= "<div>".str_replace("\n","<br>",$data['icb_projet'])."</div></div>";
				if ($data['img_id']!='') $s .= "<div class='eltProjet eltProjetImage'><img src='_getImg.php?img=".$data['img_id'].$vGetImg."' 
									style='width:100%;' onclick='affImgCentre(".$data['img_id'].")' title='Voir image' /></div>";
					
				$s .= "</div>";
				$s .= "</div>";
				$string .= $s;
			}
			if ($nb==0) {
				$string .= "<div class='divMessage' >";
				$string .= "<br><br>Aucun projet disponible...";
				$string .= "</div>";
			}	
		} else {
			$string .= "<div class='divMessage' >";
			$string .= "<br><br>Il faut d'abord fapper avant de pouvoir voter...";
			$string .= "</div>";
		}	
	} 	
 
} else {

	$string .= "<div style='text-align:center;'>";
		if ($fapVote) $string .= "<div style='display:inline-block;margin-right:20px;'>
									<input type='button' value='Voter' onclick='document.location.replace(document.location.href+\"?vote\")' />
									</div>";	
	$string .= "</div>";	

	
	if ($fap->isAdmin('incub')) {
		$s = "<div class='divAdmin' >";
		$s .= "<br><a href='aIncub-admin.php'>Il y a des projets en attente de validation</a>";
		$s .= "</div>";
		$sql = "select * from t_incubateur_icb where icb_valide is null " ;
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$string .= $s;
		}	
	}
	
	
	$sql = "select * from t_incubateur_icb where icb_vote<icb_cible and usr_id=".$fap->getId()." limit 1" ;
	$req = mysql_query($sql,$fap->conn);
	if ($data = mysql_fetch_array($req)) {
		$sql = "select * from t_incubateur_icb where icb_valide is null and usr_id=".$fap->getId();
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {
			$string .= "<div class='divMessage' >";
			$string .= "Ton projet \"".$data['icb_titre']."\" est en cours de validation par un administrateur";
			$string .= "</div>";
		}
	} else {
		$string .= "<div class='eltBlocFond' >";
		$string .= "<div div='projet_add' onclick='affDiv(this)' style='cursor:pointer;font-weight:bold;'>Ajouter un projet :</div>";
		$string .= "<div id='projet_add' style='display:none;' ><form method='post' ><input name='addProjet' style='display:none;' />";
		$string .= "<input name='titre_new' required />";
		$string .= "<br><textarea name='projet_new' rows='3' cols='80' style='max-width:90%;'></textarea>";
		$string .= "<br><input type='submit' value='Envoyer' />";
		$string .= "</form></div>";
		$string .= "</div><br><br>";
	}	


	$fapprouves = "";
	$fappurnes = "";
	$lst = "";
	$sql = "select * from t_incubateur_icb where icb_valide=1 order by ((icb_cible-icb_vote)/icb_cible), icb_date desc" ;
	$req = mysql_query($sql,$fap->conn);
	while ($data = mysql_fetch_array($req)) {
		$d = makeDate($data['icb_date']);
		if ($data['icb_vote']<$data['icb_cible']) 
			$st = percent($data['icb_vote'],$data['icb_cible'])."%"; 
		else 
			$st = "le ".strftime("%d ",$d).$fap->convMoisFrancais(strftime("%B",$d)).strftime(" %Y",$d);
			
		$img = "";
		$rec = "";		
		if ($data['icb_vote']==$data['icb_cible'] and !$data['icb_recolte']) {
			if ($data['usr_id']==$fap->getId()) {
				$rec = "<div ><form method='post' ><input name='recolte' value='".$data['icb_id']."' style='display:none;' />";
				$rec .= "<input type='submit' value='Récolter' onclick='gainXP(this);' />";
				$rec .= "</form></div >";
			}	
			$img = "<img src='images/sous.png' style='float:right;height:30px;' >";
		}	
		
		$s = "<div class='eltBlocFond' >";
		$s .= "<div div='projet_".$data['icb_id']."' onclick='affDiv(this)' style='cursor:pointer;' >";
		$s .= "<b>".$data['icb_titre']." : ".$st."</b>";
		$s .= "<span style='margin-left:20px;display:none;font-style:italic;' id='statsMe_".$data['icb_id']."' usr='".$fap->getId()."' 
						data-src='_getImg.php?img=".$fap->info['img_id'].$vGetImg."' owner='".$data['usr_id']."' ></span>";
		$s .= $img;
		$s .= "</div >";
		$s .= $rec;	
		
		$s .= "<div id='projet_".$data['icb_id']."' style='display:none;' >";
		$s .= "<div class='eltProjet eltProjetTexte'>";
		$img = $fap->logGetInfo($data['usr_id'])['img_id'];
		if ($img!='' and $img!=0) $img="<img class='imgIcone' src='_getImg.php?img=".$img.$vGetImg."' />"; else $img="";
		$s .= "<div class='eltProjetTitre'>by ".$img." ".getNomUser($data['usr_id']);
		$s .= " &nbsp; (".$data['icb_vote']."/".$data['icb_cible']." : <img icb='".$data['icb_id']."' src='images/pie.svg' 
					style='width:20px;cursor:pointer;' onclick='getCamXml(this)' title='Voir Stats' />)</div>";	
		$s .= "<div>".str_replace("\n","<br>",$data['icb_projet'])."</div></div>";
		if ($data['img_id']!='') $s .= "<div class='eltProjet eltProjetImage'><img src='_getImg.php?img=".$data['img_id'].$vGetImg."' 
							style='width:100%;' onclick='affImgCentre(".$data['img_id'].")' title='Voir image' /></div>";
			
		$s .= "</div>";
		$s .= "</div>";
		if ($data['icb_vote']<$data['icb_cible']) $fappurnes .= $s;
		else $fapprouves .= $s;
		if ($lst!='') $lst .= ";";
		$lst .= $data['icb_id'];
	}	
	$butt = "<input lst='".$lst."' type='button' value='mes voix' onclick='getStatsMe(this);event.stopPropagation();' class='buttStats' />";
	
	if ($fappurnes!="") {
		$string .= "<div style='margin-top:30px;'>";
		$string .= "<div onclick='affDiv(this)' div='fappurnes' style='cursor:pointer;' >
						<img id='pm_fappurnes' src='images/moins.png' class='iconePM' /><u>Les projets en cours".$butt."</u></div>";		
		$string .= "<div id='fappurnes'>".$fappurnes."</div>";
		$string .= "</div>";		
	}	
	if ($fapprouves!="") {	
		$string .= "<div style='margin-top:30px;'>";
		$string .= "<div onclick='affDiv(this)' div='fapprouves' style='cursor:pointer;' >
						<img id='pm_fapprouves' src='images/moins.png' class='iconePM' /><u>Les projets fapprouvés".$butt."</u></div>";		
		$string .= "<div id='fapprouves'>".$fapprouves."</div>";
		$string .= "</div>";
	}	
}

$string .= "<div style='display:none;'>
			<img src='images/moins.png' class='iconePM' />
			<img src='images/plus.png' class='iconePM' />
			</div>";
			

$string .= "</div>";
	
$string .= $string_banner;
$string .= "</body></html>";
echo $string;