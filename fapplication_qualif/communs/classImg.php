<?php
// ini_set("memory_limit","1024M");

class img {
	private $extListe = array('jpg','jpeg','png','gif','wbmp','webp');
	private $ext = null;
	private $data = null;
	private $source = null;
	private $thumb = null;
	
	public function __construct($file=null, $nomfile=null) {
		if ($file) $this->loadFile($file, $nomfile);
		// var_dump($this);
	}
	public function loadData($data) {
		$loc = 'files/classImage';
		$f = @fopen($loc, 'w');
		@fwrite($f,$data);
		@fclose($f);
		$this->loadFile($loc);
		unlink($loc);
	}	
	public function loadFile($file, $nomfile=null) {
		$this->nom = $file;
		if ($nomfile) $this->nom = $nomfile;
		$source = $this->getExtByTry($file);
		if (!$source) {
			$this->getExtByName();
			if (in_array($this->ext,$this->extListe)) {
				if ($this->ext=='jpg' or $this->ext=='jpeg') $source = @imagecreatefromjpeg($file);
				if ($this->ext=='png') $source = @imagecreatefrompng($file);
				if ($this->ext=='gif') $source = @imagecreatefromgif($file);
				if ($this->ext=='wbmp') $source = @imagecreatefrombmp($file);	
				if ($this->ext=='webp') $source = @imagecreatefromwebp($file);
			} 
		}
		if ($source) {
			//$this->data = file_get_contents($file);
			$this->source = $source;
			$this->thumb = $source;
			imagealphablending($this->thumb, false);
			imagesavealpha($this->thumb, true);
			list($this->width, $this->height) = getimagesize($file);
		}			
	}
	protected function getExtByTry($file) {
		$source = false;
		$source = @imagecreatefrompng($file);
		if ($source) $this->ext = 'png';
		else {
			$source = @imagecreatefromjpeg($file);
			if ($source) $this->ext = 'jpg';
			else {
				$source = @imagecreatefromgif($file);
				if ($source) $this->ext = 'gif';
				else {
					$source = @imagecreatefrombmp($file);	
					if ($source) $this->ext = 'bmp';
					else {
						// $source = @imagecreatefromwebp($file);
						// if ($source) $this->ext = 'webp';
					}
				}
			}
		}
		return $source;
	}	
	protected function getExtByName() {
		$tmp = explode('.',$this->nom);
		$ext = "";
		if (count($tmp)>1) {
			$this->ext = strtolower($tmp[count($tmp)-1]);
		} else {
			$this->ext = 'jpg';
		}	
	}
	public function getExt() {
		return $this->ext;
	}
	public function resize($newwidth, $newheight) {
		if ($this->source) {
			$this->thumb = imagecreatetruecolor($newwidth, $newheight);
			imagealphablending($this->thumb, false);
			imagecopyresized($this->thumb, $this->source, 0, 0, 0, 0, $newwidth, $newheight, $this->width, $this->height);
			imagesavealpha($this->thumb, true);
		}	
	}
	public function getRessource() {
		return $this->thumb;
	}	
	public function merge($img, $x, $y, $w, $h) {
		if ($this->thumb) {
			imagealphablending($this->thumb, true);
			imagecopy($this->thumb, $img , $x , $y , 0 , 0 , $w , $h);
			imagealphablending($this->thumb, false);
			imagesavealpha($this->thumb, true);
		}	
	}
	protected function setHeader() {
		if ($this->ext=='jpg' or $this->ext=='jpeg') header("Content-type: image/jpg");
		if ($this->ext=='png') header("Content-type: image/png");
		if ($this->ext=='gif') header("Content-type: image/gif");
		if ($this->ext=='wbmp') header("Content-type: image/wbmp");
		if ($this->ext=='webp') header("Content-type: image/webp");
	}	
	public function sendImage($loc=null) {
		if ($this->thumb) {
			if ($loc) $loc = 'files/classImage.'.$this->ext;
			else $this->setHeader();
			if ($this->ext=='jpg' or $this->ext=='jpeg') imagejpeg($this->thumb, $loc, 100);
			if ($this->ext=='png') imagepng($this->thumb, $loc);
			if ($this->ext=='gif') imagegif($this->thumb, $loc);
			if ($this->ext=='wbmp') imagewbmp($this->thumb, $loc);
			if ($this->ext=='webp') imagewebp($this->thumb, $loc);
			imagedestroy($this->thumb);
			if ($loc) {
				$data = file_get_contents($loc);
				unlink($loc);
				return $data;
			}
		}	
	}
	public function tailleMax($taille) {
		if ($this->source and $this->height>0) {
			if ($this->width*$this->height>$taille) {
				$r = $this->width/$this->height;
				$w = intval(sqrt($taille*$r));
				$h = intval($w/$r);
				$this->resize($w,$h);
			}	
		}	
	}	
	public function setQuality($quality) {
		if ($this->source and $this->height>0) {
			$w = intval($this->width*$quality/100);
			$h = intval($this->height*$quality/100);
			$this->resize($w,$h);
		}	
	}	
	public function setRatioWH($ratio) {
		if ($this->source and $this->height>0) {
			if ($this->height*$ratio>$this->width) {
				$this->height = $this->width/$ratio;
			} else {
				$this->width = $this->height*$ratio;
			}
		}	
	}	
	public function setRatioMax($ratio) {
		if ($this->source and $this->height>0) {
			if ($this->height>$this->width*$ratio) {
				$this->height = $this->width*$ratio;
			}
			if ($this->width>$this->height*$ratio) {
				$this->width = $this->height*$ratio;
			}
		}	
	}
}	





