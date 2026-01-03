<?php

class secure {

	private $rootfap = "";
	private $nomApp = "";
	private $tdossRestricted = array();
	private $tfilesRestricted = array();
	
	private $dossApp = "/fapplication/";
	private $dossAppQual = "/fapplication_qualif/";
	private $dnsApp = "fap.brenat";
	private $dnsAppQual = "qualif.fap.brenat";
	
	private $tdoss = array();
	private $tfiles = array();
	private $tfiles2 = array();
	
	public function __construct($fap) {
		if ($fap->isDev()) $this->init($fap);
		else $this->initLight();
	}
	protected function init($fap) {	
		$tmp = explode("/",$_SERVER['PHP_SELF']); 
		for ($k=0;$k<count($tmp)-1;$k++) $this->nomApp .= $tmp[$k]."/";
		$this->rootfap = $_SERVER['DOCUMENT_ROOT'].$this->nomApp;
		$this->rootfap = preg_replace('#/+#','/',$this->rootfap);
		if (!$fap->isSuperDev()) $this->tdossRestricted[] = 'restricted';
		if (!$fap->isSuperDevAll()) {
			$this->tdossRestricted[] = 'bootstrap';
			$this->tdossRestricted[] = 'openlayers';
			$this->tdossRestricted[] = 'PHPMailer-master';
			$this->tdossRestricted[] = 'sons/sound_design_Fapplication';
			$this->tdossRestricted[] = 'sons/sound_design_128kbs';
		}
		$this->tdoss[] = "";
		$this->explore($this->rootfap);
	}
	protected function initLight() {	
		$tmp = explode("/",$_SERVER['PHP_SELF']);
		for ($k=0;$k<count($tmp)-1;$k++) $this->nomApp .= $tmp[$k]."/";
	}
	private function serv2utf8($nom) {
		$nom = utf8_encode($nom);
		return $nom;
	}
	private function utf82serv($nom) {
		$nom = utf8_decode($nom);
		return $nom;
	}
	private function sansRoot($f,$root=null) {
		if (!$root) $root = $this->rootfap;
		return str_replace($root,"",$f);
	}
	private function isAllowed($doss,$rac=null) {
		foreach($this->tdossRestricted as $d) {
			if ($doss==$d or $rac and $rac.$doss==$d) {
				return false;
			}
		}
		return true;
	}
	private function isListed($doss) {
		foreach($this->tdoss as $d) {
			if ($doss==$d) {
				return true;
			}
		}
		return false;
	}
	private function explore($doss) {
		$liste = "";
		$sousdoss = "";
		if ($dh = opendir($doss)) {
			while (($file=readdir($dh)) !== false) {
				$nd = $doss.$file."/";
				if ($file!="." and $file!=".." and is_dir($nd)) {
					if ($this->isAllowed($file,$this->sansRoot($doss))) {
						$sousd = $this->explore($nd);
						$this->tdoss[] = $this->serv2utf8($this->sansRoot($nd));
					}
				} else {				
					if (is_file($doss.$file)) {
						$f = $this->serv2utf8(str_replace($this->rootfap,"",$doss.$file));
						$this->tfiles[] = $f;
						$this->tfiles2[$f] = array($this->serv2utf8($this->sansRoot($doss)),$this->serv2utf8($file));
					}
				}
			}
		}
	}
	public function getFile() {
		return $this->tfiles;
	}
	public function getFile2() {
		return $this->tfiles2;
	}
	public function getArbo() {
		return $this->tdoss;
	}
	private function extractZip($doss,$nom) {
		$zip = new ZipArchive;
		if ($zip->open($this->rootfap.$doss.$nom) === TRUE) {
			$nd = pathinfo($this->rootfap.$doss.$nom, PATHINFO_BASENAME);
			$zip->extractTo($this->rootfap.$doss);
			// $extractPath = $this->utf82serv($this->rootfap.$doss);
			// for ($i=0; $i<$zip->numFiles; $i++) {
				// $realName = $this->zipConv($zip->getNameIndex($i));
				// $zip->extractTo($extractPath,$zip->getNameIndex($i));
				// echo $extractPath.$zip->getNameIndex($i)." : ". $this->rootfap.$realName;
				// rename($extractPath.$zip->getNameIndex($i), $this->rootfap.doss.$realName);
			// }
			$zip->close();
			return true;
		}
	}
	public function uploadFile($d,$tf,$nd) {	
		if ($this->isAllowed($d) and $this->isListed($d)) {
			$doss = $this->utf82serv($d);
			if ($nd!="") {
				$doss .= $this->utf82serv($nd)."/";
				mkdir($doss);
			}
			$nom = $this->utf82serv($tf['name']);
			if (file_exists($this->rootfap.$doss.$nom)) unlink($this->rootfap.$doss.$nom);
			move_uploaded_file($tf['tmp_name'], $this->rootfap.$doss.$nom);
			$ext = strtolower(pathinfo($this->rootfap.$doss.$nom, PATHINFO_EXTENSION));
			if ($ext=='zip') {
				if ($this->extractZip($doss,$nom)) unlink($this->rootfap.$doss.$nom);
			}
		}
	}
	public function downloadFile($file) {
		$doss = "";
		$tmp = explode("/",$file);
		for ($k=0;$k<count($tmp)-1;$k++) $doss .= $tmp[$k]."/";
		$nom = $this->utf82serv($tmp[count($tmp)-1]);
		if ($this->isAllowed($doss) and $this->isListed($doss)) {
			$f = $this->utf82serv($this->rootfap.$file);
			if ($f!='' and file_exists($f)) {
				header('Content-disposition: attachment; filename='.$nom);
				header('Content-type: text/plain');
				echo file_get_contents($f);
				die();
			}
		}
	}
	private function convZip($nom) {
		return @iconv("ISO-8859-1", "IBM850", $nom);
	}
	private function zipConv($nom) {
		return @iconv("IBM850", "ISO-8859-1", $nom);
	}
	public function downloadDoss($doss, $zip=null, $dbase='') {
		if($zip===null) {
			if ($doss=="") $doss = $this->rootfap;
			$d = "";
			$tmp = explode("/",$doss);
			for ($k=0;$k<count($tmp)-2;$k++) $d .= $tmp[$k]."/";
			$nom = $tmp[count($tmp)-2].".zip";
			$nf = $this->utf82serv($d.$nom);
			$zip = new ZipArchive();
			if($zip->open($nf, ZipArchive::CREATE) !== TRUE) return false;
			//$doss = $this->utf82serv($doss);
		}		
		if($dbase=="") $dbase=$doss;	
		if(file_exists($doss)) {
			if ($dh=opendir($doss)) {     
				while (($file=readdir($dh))!==false) {
					if ($file!='..' && $file!='.' and $this->isAllowed($this->sansRoot($doss.$file,$dbase))) {
						if (is_dir($doss.$file)) {
							$zip->addEmptyDir($this->convZip($this->sansRoot($doss.$file,$dbase)));
							$this->downloadDoss($doss.$file."/",$zip,$dbase);
						}
						else $zip->addFile($doss.$file,$this->convZip($this->sansRoot($doss.$file,$dbase)));
					}
				}
				closedir($dh);
			}
		}
		if($dbase==$doss) {
			$zip->close();
			header('Content-disposition: attachment; filename='.$nom);
			header('Content-type: text/plain');
			echo file_get_contents($nf);
			unlink($nf);
			die();
		}
	}

	public function deleteFile($file) {
		$doss = "";
		$tmp = explode("/",$file);
		for ($k=0;$k<count($tmp)-1;$k++) $doss .= $tmp[$k]."/";
		if ($this->isAllowed($doss) and $this->isListed($doss)) {
			$f = $this->utf82serv($this->rootfap.$file);
			if (file_exists($f)) unlink($f);
		}
	}
	public function deleteDoss($doss) {
		if ($doss!='' and $this->isAllowed($doss) and $this->isListed($doss)) {
			$doss = $this->utf82serv($this->rootfap.$doss);
			$this->rm_dir($doss);
		}
	}
	
	// copie globale qualif <-> fap
	private function copy_dir($dir2copy,$dir_paste) {
		if (is_dir($dir2copy)) {
			if ($dh=opendir($dir2copy)) {     
				while (($file = readdir($dh))!==false) {
					if ($file!='..' && $file!='.') {
						if (!is_dir($dir_paste)) mkdir($dir_paste);
						if(is_dir($dir2copy.$file)) $this->copy_dir($dir2copy.$file.'/', $dir_paste.$file.'/');     
						else copy($dir2copy.$file, $dir_paste.$file); 
					}
				}
				closedir($dh); 
			}
		}
	}
	private function rm_dir($dir,$self=true) {
		if (is_dir($dir)) {
			if ($dh=opendir($dir)) {     
				while (($file = readdir($dh))!==false) {
					if ($file!='..' && $file!='.') {
						if(is_dir($dir.$file)) $this->rm_dir($dir.$file.'/');     
						else unlink($dir.$file);
					}
				}
				closedir($dh);
			}
			if ($self) rmdir($dir);
		}
	}
	public function FapQualChange($href,$chem=false) {
		global $isApplicationQualif;
		if ($this->nomApp!='/' and $this->nomApp!='' or $chem) $app = ($isApplicationQualif?$this->dossAppQual:$this->dossApp);
		else $app = ($isApplicationQualif?$this->dnsAppQual:$this->dnsApp); 
		$tqual = array();
		$tqual[$this->dossApp] = $this->dossAppQual;
		$tqual[$this->dossAppQual] = $this->dossApp;
		$tqual[$this->dnsApp] = $this->dnsAppQual;
		$tqual[$this->dnsAppQual] = $this->dnsApp;
		return str_replace($app,$tqual[$app],$href);	
	}
	public function FapQual() {
		$orig = $this->rootfap;
		$dest = $this->FapQualChange($orig,true);
		if ($orig!='' and $dest!='') {
			$this->rm_dir($dest,false); 
			$this->copy_dir($orig,$dest);
		}	
	}
	public function FapQualLeg() {
		global $isApplicationQualif;
		$leg = ($isApplicationQualif?'Qualif->Fap':'Fap->Qualif');
		return $leg;		
	}
	
	// recuperation de la base
	private function extractBase($conn,$sepInstruction=false) {
		$tmax = 65536;
		$tables = array();
		$req = mysql_query('show tables', $conn);
		while($row = mysql_fetch_row($req)) {
			$tables[] = $row[0];
		}
		$dump = "";
		foreach($tables as $table) {
			$result = mysql_query('SELECT * FROM '.$table, $conn);
			$num_fields = mysql_num_fields($result);		
			$dump .= 'DROP TABLE if exists '.$table.';';
			if ($sepInstruction) $dump .= '--SEPARE!!';
			$row2 = mysql_fetch_row(mysql_query('SHOW CREATE TABLE '.$table, $conn));
			$dump .= "\n\n".$row2[1].";\n\n";
			if ($sepInstruction) $dump .= '--SEPARE!!';
			for ($i = 0; $i < $num_fields; $i++) {
				while($row = mysql_fetch_row($result)) {
					$dump .= 'INSERT INTO '.$table.' VALUES(';
					for($j=0; $j < $num_fields; $j++) {
						if (!$sepInstruction and strlen($row[$j])>$tmax) $row[$j] = substr($row[$j],0,$tmax);
						$row[$j] = addslashes($row[$j]);
						if (!isset($row[$j])) $row[$j] = ""; 
						$row[$j] = '"'.$row[$j].'"';
						if (!strpos(" ".mysql_field_flags($result,$j),"not_null")>0 and $row[$j]=='""') 
							$row[$j] = 'null';						
						$dump .= $row[$j];
						if ($j < ($num_fields-1)) $dump .= ',';
					}
					$dump .= ");\n";
					if ($sepInstruction) $dump .= '--SEPARE!!';
				}
			}
		}
		return $dump;
	}
	public function downloadBase($conn) {
		$dump = $this->extractBase($conn);
		header('Content-disposition: attachment; filename=dumpbase.sql');
		header('Content-type: text/plain');
		echo $dump;
		die();
	}
	public function FapQualBase($fap) {
		$dump = $this->extractBase($fap->conn,true);
		$tqual = array();
		$tqual['fapbase'] = 'fapbase_qualif';
		$tqual['fapbase_qualif'] = 'fapbase';
		$db = $tqual[$fap->db];
		mysql_select_db($db,$fap->conn);
		$tt = explode("--SEPARE!!",$dump);
		foreach ($tt as $s) mysql_query($s,$fap->conn);
	}
	
	// images
	public function downloadImages($conn) {		
		$doss = "files/";		
		$nom = "photo.zip";
		$nf = $doss.$nom;
		$zip = new ZipArchive();
		if($zip->open($nf, ZipArchive::CREATE) !== TRUE) return false;		
		$sql = "select * from t_images_img";
		$req = mysql_query($sql, $conn);
		while($data = mysql_fetch_array($req)) {
			$zip->addFromString($data['img_id'],$data['img_contenu']);
		}
		$zip->close();
		header('Content-disposition: attachment; filename='.$nom);
		header('Content-type: text/plain');
		echo file_get_contents($nf);
		unlink($nf);
		die();
	}
	public function uploadImages($file,$conn) {
		$doss = "files/";		
		$nom = "photo.zip";
		$nf = $doss.$nom;
		move_uploaded_file($file['tmp_name'],$nf);
		$zip = new ZipArchive;
		if ($zip->open($nf) === TRUE) {				
			$sql = "select * from t_images_img";
			$req = mysql_query($sql, $conn);
			while($data = mysql_fetch_array($req)) {
				$nd = pathinfo($this->rootfap.$doss.$nom, PATHINFO_BASENAME);
				$cont = $zip->getFromName($data['img_id']);
				if ($cont) {
					$sql = "update t_images_img set img_contenu='".addslashes($cont)."' where img_id=".$data['img_id'];
					mysql_query($sql,$conn);
				}
			}
			$zip->close();
		}
		unlink($nf);
	}
	
	
}