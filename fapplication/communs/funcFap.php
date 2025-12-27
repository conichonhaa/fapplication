<?php

function fapInBase($date,$lat,$lon,$acc) {
	global $fap;
	$delai = intval((makeDate($date)-makeDate($fap->getLastFap()))/86400);
	if ($delai>=0 and $delai<4) $fap->incPower(4-$delai);
	$sql = "INSERT INTO t_faplogs_fap (usr_id, fap_date, fap_pos_latitude, fap_pos_longitude, fap_pos_accuracy) 
				VALUES (".$fap->getId().",'".$date."',".$lat.",".$lon.",".$acc.");";
	mysql_query($sql,$fap->conn);
	$id = mysql_insert_id();	
	$fap->setCatchForce($id);
	$fap->incPoints(1);
	$fap->incPower();
	getMstHealth('mst-mirror',$date,600);
	getMstHealth('mst-speak',$date,3600);
	getMstHealth('mst-pandemic',$date,86400);
	setMstInfect('mst-chtouille');
	return $id;
}	

function fapCheckCapacity() {
	global $fap;
	$fap->cleanCapacity();
	$t_list = array();
	foreach ($fap->getListUsers() as $usr => $u) {
		if ($fap->hasCapacity('catch',$usr) and $usr!=$fap->getId()) {
			$t_list[] = array('to'=>$usr,'mess'=>$fap->info['nom']." vient juste de fapper",'power'=>"Wire plug power");
		}
	}
	if ($fap->hasCapacity('exhibit') and $fap->capacityInfo['num']>0) {
		$fap->useCapacity('exhibit',$fap->capacityInfo['num']-1);
		$fap->giftPower(50);
		foreach ($fap->getListUsers() as $usr => $u) {
			if ($usr!=$fap->getId() and $fap->getCatchAuth($usr)>0) {
				$t_list[] = array('to'=>$usr,'mess'=>$fap->info['nom']." vient juste de fapper",'power'=>"Exhibition message");
			}			
		}
	}
	if ($fap->hasCapacity('fapstival') and $fap->capacityInfo['num']>0) {
		$fap->useCapacity('fapstival',$fap->capacityInfo['num']-1);
		$fap->giftPower(20);
		$tt = array();
		foreach ($fap->getListUsers() as $usr => $u) {
			if ($usr!=$fap->getId() and $fap->getCatchAuth($usr)>0) {
				$tt[] = $usr;
			}			
		}
		shuffle($tt);
		$nbFapstival = intval(count($tt)/5);
		if ($nbFapstival<2) $nbFapstival = min(2,count($tt));
		if (count($tt)>0) {
			for ($k=0; $k<$nbFapstival; $k++) {
				$choix = rand(0,count($tt));
				if (!isset($tt[$choix])) $choix = $choix-1;
				$usr = $tt[$choix];
				array_splice($tt,$choix,$choix);
				$t_list[] = array('to'=>$usr,'mess'=>$fap->info['nom']." vient juste de fapper",'power'=>"Fapstival message");
			}			
		}
	}
	return $t_list;
}
function getMstHealth($code,$set=false,$delai=0) {
	global $fap;
	if ($set) $set = writeDate(makeDate($set)+$delai);
	$safe = true;
	$myId = $fap->getId();
	$id = $fap->whoHasLastCapacity($code);
	if ($id) {
		$safe = false;
		$found = false;
		$fap->hasCapacity($code,$id);
		$tt = json_decode($fap->capacityInfo['info']);
		if (count($tt)>0) {
			foreach ($tt as $usr => $v) {
				if ($usr==$myId) {
					$found = true;
					if (time()<makeDate($v)) $safe = $v;
					if ($set and $set>$v) $tt->$usr = $set;
				}
			}
		}
		if ($set) {
			if (!$found) $tt->$myId = $set;
			$safe = $set;
			$sql = "update t_capacity_cpt set cpt_info='".json_encode($tt)."' where cpt_id=".$fap->capacityInfo['cpt'];
			mysql_query($sql,$fap->conn);
		}
	}
	return $safe;
}
function setMstInfect($code) {
	global $fap;
	$id = $fap->whoHasLastCapacity($code);
	if ($id) {
		$fap->hasCapacity($code,$id);
		$sql = "update t_capacity_cpt set cpt_info=concat_ws('+',cpt_info,".$fap->getId().") where cpt_id=".$fap->capacityInfo['cpt'];
		mysql_query($sql,$fap->conn);
		$fap->incPoints(10);
		$fap->incPower(10);
	}
}
function getMstInfect($code) {
	global $fap;
	$id = $fap->whoHasLastCapacity($code);
	if ($id) {
		$fap->hasCapacity($code,$id);
		$sql = "select * from t_capacity_cpt where cpt_id=".$fap->capacityInfo['cpt'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {		
			$tt = explode('+',$data['cpt_info']);
			return $tt[count($tt)-1];
		}
	}
}
function isMstInfect($code) {
	global $fap;
	$is = false;
	$id = $fap->whoHasLastCapacity($code);
	if ($id) {
		if ($id==$fap->getId()) $is = true;
		$fap->hasCapacity($code,$id);
		$sql = "select * from t_capacity_cpt where cpt_id=".$fap->capacityInfo['cpt'];
		$req = mysql_query($sql,$fap->conn);
		if ($data = mysql_fetch_array($req)) {		
			$tt = explode('+',$data['cpt_info']);
			foreach ($tt as $n) {
				if ($n==$fap->getId()) $is = true;
			}
			return $is;
		}
	}
}


