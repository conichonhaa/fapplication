var ns = "http://www.w3.org/2000/svg";
var xref="http://www.w3.org/1999/xlink";
var nbPixW = 1000;
var nbPixH = 600;
var speedDown = 2;

function creerSVG(nom,divG) {
	var svg = document.getElementById(nom);
	if (svg) svg.parentNode.removeChild(svg);
	if (!divG) divG = document.getElementById('divGame');
	var svg = document.createElementNS(ns,'svg');
	svg.setAttribute('id',nom);
	svg.setAttribute('xmlns',ns);
	svg.setAttribute('xmlns:xlink',xref);
	svg.setAttribute('version','1.1');
	//svg.setAttribute('preserveAspectRatio','none');
	divG.appendChild(svg);	
	var rect = divG.getBoundingClientRect();
	var ratio = parseFloat(divG.getAttribute('ratio'));	
	svg.setAttribute('width',rect.width);
	//svg.setAttribute('height',rect.width/ratio);
	svg.setAttribute('width','100%');
	svg.setAttribute('height','100%');
	svg.style.position = 'relative';
	svg.setAttribute('viewBox','0 '+(-1*nbPixH)+' '+nbPixW+' '+nbPixH);
	return svg;
}


// worm
var physicsGroundWorm = {};
	physicsGroundWorm.relief = {nom:'Relief', list:['Plaine','Colline','Montagne'], def:2};
	physicsGroundWorm.vent = {nom:'Vent', list:['Calme','Brise','Mistral','Variable'], def:0, bornes:[-100,100]};
	physicsGroundWorm.gravite = {nom:'Gravité', list:['Lune','Terre','Jupiter','Changeante'], def:1, bornes:[1,30]};
var valueGroundWorm = {};
	valueGroundWorm.altitude = null;

function genererTerrainWorm(nom) {
	if (nom) divG = document.getElementById(nom);
	var svg = creerSVG('svgGame',divG);
	creerTerrainWorm(svg);
}
function creerModelePionWorm(svg) {
	var defs = document.createElementNS(ns,'defs');	
		defs.setAttribute('id','defsSVG');

	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','pion');
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',1);
	g.appendChild(c);		
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-3);
		r.setAttribute('y',-20);
		r.setAttribute('width',6);
		r.setAttribute('height',20);
	g.appendChild(r);				
	defs.appendChild(g);
		
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cutPower');
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-3);
		r.setAttribute('y',-110);
		r.setAttribute('width',6);
		r.setAttribute('height',80);
		r.y0 = -130;
	cp.appendChild(r);
	defs.appendChild(cp);	
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','power');
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-3);
		r.setAttribute('y',-130);
		r.setAttribute('width',6);
		r.setAttribute('height',100);
		r.setAttribute('fill','#ff0000');
		r.setAttribute('clip-path','url(#cutPower)');
	g.appendChild(r);	
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-3);
		r.setAttribute('y',-130);
		r.setAttribute('width',6);
		r.setAttribute('height',100);
		r.setAttribute('fill','none');
		r.setAttribute('stroke','#ff0000');
		r.setAttribute('stroke-width',1);
	g.appendChild(r);	
	defs.appendChild(g);

	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cut-off-bottom');
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-12);
		r.setAttribute('y',-12);
		r.setAttribute('width',24);
		r.setAttribute('height',16);
	cp.appendChild(r);
	defs.appendChild(cp);

	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','pionSocle');
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',12);
		c.setAttribute('clip-path','url(#cut-off-bottom)');
	g.appendChild(c);
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',-7);
		c.setAttribute('cy',5);
		c.setAttribute('r',2);
	g.appendChild(c);
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',7);
		c.setAttribute('cy',5);
		c.setAttribute('r',2);
	g.appendChild(c);	
	defs.appendChild(g);
	
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','bullet');
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',3);
	g.appendChild(c);				
	defs.appendChild(g);
	
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','bulletIndic');
	var c = document.createElementNS(ns,'path');
		c.setAttribute('d','M 0,0 L 2,20 L -2,20 L 0,0 Z');
		c.setAttribute('fill','#000000');
	g.appendChild(c);				
	defs.appendChild(g);
	
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','deadcross');		
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-3);
		r.setAttribute('y',-20);
		r.setAttribute('width',6);
		r.setAttribute('height',30);
	g.appendChild(r);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-10);
		r.setAttribute('y',-12);
		r.setAttribute('width',20);
		r.setAttribute('height',6);
	g.appendChild(r);	
	defs.appendChild(g);
	
	svg.appendChild(defs);
}
function creerAltitudeWorm() {
	valueGroundWorm.altitude = [];
	var rC = 0.01;
	var rG = 0.000001;
	var rL = 0.001;
	if (physicsGroundWorm.relief.choix=='Montagne') {
		var p1 = 3;
		var p2 = 1;
		var i1 = 3;
		var i2 = 4;
	}
	if (physicsGroundWorm.relief.choix=='Colline') {
		var rL = 0.0001;
		var p1 = 3;
		var p2 = 4;
		var i1 = 4;
		var i2 = 3;
	}	
	if (physicsGroundWorm.relief.choix=='Plaine') {
		var p1 = 2;
		var p2 = 8;
		var i1 = 6;
		var i2 = 3;
	}	
	var proche = false;
	var sensG = 1;
	var sensL = 1;
	var sens  = 1;
	var y0 = Math.round(Math.random()*nbPixH/i1+nbPixH/i2);
	var y = y0;
	var nbGlob = 0;
	var nbLoc = 0;
	var nbProche = 0;
	var pas = 1;
	for (i=0; i<nbPixW; i++) {
		pas = Math.floor(Math.random()*p1)/p2;
		if (Math.abs(y-y0)>=(nbPixW-i)/p2) {
			y = y + pas*Math.abs(y0-y)/(y0-y);
		} else {
			if (proche && nbProche<100) {
				nbProche++;
			} else {
				proche = false;
				nbProche = 0;
				var a = Math.random();
				if (a < rC+rG*nbGlob) {
					sensG = -1*sensG;
					nbGlob = 0;
				} else nbGlob++;
				var p = rC+rL*nbLoc;
				if (sensL<0) p=p*10;
				if (a < p) {
					sensL = -1*sensL;
					nbLoc = 0;
				} else nbLoc++;
				sens = sensG*sensL;
				if ((sens<0 && y<100) || (sens>0 && y>nbPixH-150)) {
					sens = -1*sens;
					proche = true;
				}
			}
			y = y + sens*pas;
		}
		valueGroundWorm.altitude.push(y);
	}		
}
function creerVentWorm() {
	if (physicsGroundWorm.vent.choix=='Calme') {
		valueGroundWorm.vent = 0;
		valueGroundWorm.ventSens = null;
	}
	if (physicsGroundWorm.vent.choix=='Brise') {
		var min = 10;
		var max = 40;
		valueGroundWorm.vent = min + Math.round(Math.random()*(max-min));
		var s = Math.random()-0.5;
		if (s==0) valueGroundWorm.ventSens = 1;
		else valueGroundWorm.ventSens = Math.abs(s)/s;
	}
	if (physicsGroundWorm.vent.choix=='Mistral') {
		var min = 60;
		var max = 100;
		valueGroundWorm.vent = min + Math.round(Math.random()*(max-min));
		var s = Math.random()-0.5;
		if (s==0) valueGroundWorm.ventSens = 1;
		else valueGroundWorm.ventSens = Math.abs(s)/s;
	}
	if (physicsGroundWorm.vent.choix=='Variable') {
		valueGroundWorm.vent = '?';
		valueGroundWorm.ventAleatoire = true;
	}
}
function creerGraviteWorm() {
	if (physicsGroundWorm.gravite.choix=='Lune') {
		valueGroundWorm.gravite = 1.6;
	}	
	if (physicsGroundWorm.gravite.choix=='Terre') {
		valueGroundWorm.gravite = 9.8;
	}	
	if (physicsGroundWorm.gravite.choix=='Jupiter') {
		valueGroundWorm.gravite = 24.8;
	}	
	if (physicsGroundWorm.gravite.choix=='Changeante') {
		valueGroundWorm.gravite = '?';
		valueGroundWorm.graviteAleatoire = true;
	}	
}
function creerTerrainWorm(svg) {
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',0);
		r.setAttribute('y',-nbPixH);
		r.setAttribute('width',nbPixW);
		r.setAttribute('height',nbPixH);
		r.setAttribute('fill','#FAFBFC');
	svg.appendChild(r);
	var path = document.createElementNS(ns,'path');
		path.setAttribute('id','terrain');
		path.setAttribute('fill','#87641F');
		path.setAttribute('stroke-width',1);
	svg.appendChild(path);	
	setTerrainWorm();
	// var r = document.createElementNS(ns,'text');
		// r.setAttribute('x',nbPixW/2);
		// r.setAttribute('y',-20);
		// r.style.backgroundColor = '#FAFBFC';
		// r.setAttribute('text-anchor','middle');
		// r.innerHTML = 'test and retest';
	// svg.appendChild(r);
}
function setTerrainWorm() {
	var alt = valueGroundWorm.altitude;
	var d = "M 0,0 ";
	for (i=0; i<alt.length; i++) {
		d += " L "+i+","+(-1*alt[i]);
	}
	d += " L "+nbPixW+","+alt[nbPixW-1]+" L "+nbPixW+",0 L 0,0";
	document.getElementById('terrain').setAttribute('d',d);	
	if (gameListPlayer.list) {
		for (var i=0; i<gameListPlayer.list.length; i++) {
			var obj = document.getElementById("pion_"+gameListPlayer.list[i].pid);
			if (obj) descendrePionWorm(obj);
		}
	}
}
function creerPionWorm(svg,x,color,pid,usr) {
	var pion = document.createElementNS(ns,'use');
		pion.setAttributeNS(xref, 'xlink:href', '#pion');
		pion.setAttribute('x', x);
		pion.setAttribute('y', -1*nbPixH);
		pion.setAttribute('fill', color);
		pion.setAttribute('pid', pid);
		pion.setAttribute('usr', usr);
		pion.setAttribute('id', "pion_"+pid);
		pion.angle = 0;
		pion.power = 50;
		pion.nbPts = 0;
		pion.setAttribute('cursor', 'pointer');
	svg.appendChild(pion);
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#pionSocle');
		s.setAttribute('x', x);
		s.setAttribute('y', -1*nbPixH);
		s.setAttribute('fill', color);
		s.setAttribute('cursor', 'pointer');
	svg.appendChild(s);
	pion.socle = s;
	creerScoreWorm(pion);
	descendrePionWorm(pion);
	document.getElementById('infoAngle').innerHTML = pion.angle;
	document.getElementById('infoPower').innerHTML = pion.power;
	return pion;
}
function descendrePionWorm(obj) {
	var alt = valueGroundWorm.altitude;
	var x = Math.round(obj.getAttribute('x')/1);
	var y = -obj.getAttribute('y')/1;
	obj.removeAttribute('transform');
	if (y>alt[x]) {
		y = Math.max(y-speedDown,alt[x]);
		obj.setAttribute('y',-y);
		obj.socle.setAttribute('y',-y);
		obj.scoreBarre.setAttribute('y',-y);
		obj.infoBarre.setAttribute('y',-y);
		if (obj.deadcross) obj.deadcross.setAttribute('y',-y);
		setTimeout(function(){descendrePionWorm(obj);},10);
	} else {
		obj.setAttribute('transform','rotate('+obj.angle+','+x+','+(-y)+')');
		if (obj.powerBarre) {
			deletePower();
			affectPower();
		}
	}
}
function creerScoreWorm(pion) {
	var pid = pion.getAttribute('pid');
	var defs = document.getElementById('defsSVG');
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cut-score_'+pid);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-12);
		r.setAttribute('y',13);
		r.setAttribute('width',24);
		r.setAttribute('height',4);
		r.total = 24;
	cp.appendChild(r);
	defs.appendChild(cp);		
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('id','pionScore_'+pid);
		r.setAttribute('x',-12);
		r.setAttribute('y',13);
		r.setAttribute('width',24);
		r.setAttribute('height',4);
		r.setAttribute('clip-path','url(#cut-score_'+pid+')');
	defs.appendChild(r);		
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#pionScore_'+pid);
		s.setAttribute('x', pion.getAttribute('x'));
		s.setAttribute('y', pion.getAttribute('y'));
	pion.parentNode.appendChild(s);
	pion.scoreBarre = s;
	modifScoreWorm(pid,100);
	
	var t = document.createElementNS(ns,'text');
		t.setAttribute('id','pionInfo_'+pid);
		t.setAttribute('x',0);
		t.setAttribute('y',31);
		t.setAttribute('font-size',12);
		t.innerHTML = getNom(pion.getAttribute('usr'));
		t.setAttribute('text-anchor','middle');	
	defs.appendChild(t);
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#pionInfo_'+pid);
		s.setAttribute('x', pion.getAttribute('x'));
		s.setAttribute('y', pion.getAttribute('y'));
	pion.parentNode.appendChild(s);
	pion.infoBarre = s;
}
function modifScoreWorm(pid,v) {
	var pion = document.getElementById('pion_'+pid);
	var r = document.getElementById('cut-score_'+pid).firstChild;
	r.setAttribute('width',r.total*v/100);
	if (v>50) var coul = degrade('#F7E300','#03F700',v-50,50);
	else var coul = degrade('#F71800','#F7E300',v,50);		
	pion.scoreBarre.setAttribute('fill',coul);
	pion.score = v;
}
function modifPtsWorm(pid,v) {
	var pion = document.getElementById('pion_'+pid);
	pion.nbPts = v;
}
function modifPower(v) {
	var r = document.getElementById('cutPower').firstChild;
	r.setAttribute('y',r.y0+100-v);
	r.setAttribute('height',v);
	document.getElementById('infoPower').innerHTML = v;
}
function affectPower() {
	if (objGame) {
		modifPower(objGame.power);
		var s = document.createElementNS(ns,'use');
			s.setAttributeNS(xref, 'xlink:href', '#power');
			s.setAttribute('x', objGame.getAttribute('x'));
			s.setAttribute('y', objGame.getAttribute('y'));
			s.setAttribute('transform','rotate('+objGame.angle+','+objGame.getAttribute('x')+','+objGame.getAttribute('y')+')');
		objGame.parentNode.appendChild(s);
		objGame.powerBarre = s;
	}
}
function deletePower() {
	if (objGame) {
		if (objGame.powerBarre) {
			objGame.parentNode.removeChild(objGame.powerBarre);
			objGame.powerBarre = null;
		}
	}	
}
function bougerCanon(v,abs) {
	if (objGame) {
		if (abs) objGame.angle = v;
		else objGame.angle = objGame.angle + v;
		if (Math.abs(objGame.angle)>100) objGame.angle = 100*Math.abs(objGame.angle)/objGame.angle;
		var x = objGame.getAttribute('x');
		var y = objGame.getAttribute('y');
		objGame.setAttribute('transform','rotate('+objGame.angle+','+x+','+y+')');
		if (!objGame.powerBarre) affectPower();
		objGame.powerBarre.setAttribute('transform','rotate('+objGame.angle+','+x+','+y+')');
		document.getElementById('infoAngle').innerHTML = objGame.angle;
		sendPionWorm();
	}
}
function bougerPower(v,abs) {
	if (objGame) {
		if (abs) objGame.power = v;
		else objGame.power = objGame.power + v;
		if (objGame.power>100) objGame.power = 100;
		if (objGame.power<1) objGame.power = 1;
		modifPower(objGame.power);
		sendPionWorm();
	}
}
function bougerTank(v) {
	if (objGame) {
		var dep = document.getElementById('infoTank').innerHTML/1 + v;
			if (Math.abs(dep)<100) {
			var x0 = Math.round(objGame.getAttribute('x')/1);
			var falaise = false;
			var memo = valueGroundWorm.altitude[x0];
			for (var i=x0; i<x0+v; i++) {
				var x = i + 1;
				if (x>=nbPixW) x = x - nbPixW;
				if (x<0) x = x + nbPixW;
				var a = valueGroundWorm.altitude[i+1];
				if (a-memo>10) falaise = true;
				memo = a;
			}
			var x = Math.round(x0 + v);
			if (x>=nbPixW) x = x - nbPixW;
			if (x<0) x = x + nbPixW;
			if (!falaise) {
				document.getElementById('infoTank').innerHTML = dep;
				var y = valueGroundWorm.altitude[x];
				objGame.setAttribute('x',x);
				objGame.setAttribute('y',-y);
				objGame.socle.setAttribute('x',x);
				objGame.socle.setAttribute('y',-y);
				objGame.scoreBarre.setAttribute('x',x);
				objGame.scoreBarre.setAttribute('y',-y);
				objGame.infoBarre.setAttribute('x',x);
				objGame.infoBarre.setAttribute('y',-y);
				objGame.setAttribute('transform','rotate('+objGame.angle+','+x+','+(-y)+')');
				if (objGame.powerBarre) {
					deletePower();
					affectPower();
				}
			}
			sendPionWorm();
		}
	}
}
function sendPionWorm() {
	if (gameListPlayer.list[gameListPlayer.actif].pid==playerpid) {
		var data = {};
		data.pid = playerpid;
		var pion = document.getElementById('pion_'+playerpid);
		data.angle = pion.angle;
		data.power = pion.power;
		data.x = pion.getAttribute('x');
		data.y = pion.getAttribute('y');
		var dataS = JSON.stringify(data);
		sendDataGame('function','setPionWorm(\''+dataS+'\');');
	}
}
function setPionWorm(dataS) {
	var data = JSON.parse(dataS);
	if (data.pid!=playerpid) {
		var pion = document.getElementById('pion_'+data.pid);
		pion.angle = data.angle;
		pion.power = data.power;
		pion.setAttribute('x',data.x);
		pion.setAttribute('y',data.y);
		pion.socle.setAttribute('x',data.x);
		pion.socle.setAttribute('y',data.y);
		pion.scoreBarre.setAttribute('x',data.x);
		pion.scoreBarre.setAttribute('y',data.y);
		pion.infoBarre.setAttribute('x',data.x);
		pion.infoBarre.setAttribute('y',data.y);
		pion.setAttribute('transform','rotate('+data.angle+','+data.x+','+data.y+')');
	}
}
function creerBullet() {
	if (objGame) {
		var pid = objGame.getAttribute('pid');
		if (sonActive && sons.game_wormShoot && sons.game_wormShoot.actif) {
			sons.game_wormWhistle.pid = pid;
			if (!sons.game_wormShoot.load.paused) {
				sons.game_wormShoot.load.pause();
				sons.game_wormShoot.load.currentTime = 0;
			}
			sons.game_wormShoot.load.play();
			sons.game_wormShoot.load.addEventListener("ended", whistleBullet, false);
			sons.game_wormWhistle.load.addEventListener("ended", whistleBullet, false);
		}		
		var b = document.getElementById("bullet_"+pid);
		if (b) b.parentNode.removeChild(b);
		var b = document.createElementNS(ns,'use');
			b.setAttributeNS(xref, 'xlink:href', '#bullet');
			var x = objGame.getAttribute('x')/1 + 10*Math.sin(objGame.angle*Math.PI/180);
			var y = -objGame.getAttribute('y')/1 + 10*Math.cos(objGame.angle*Math.PI/180);
			b.setAttribute('pid', pid);
			b.setAttribute('id', "bullet_"+pid);
			b.vx = (objGame.power/10)*Math.sin(objGame.angle*Math.PI/180);
			b.vy = (objGame.power/10)*Math.cos(objGame.angle*Math.PI/180);
			b.setAttribute('x', x);
			b.setAttribute('y', -y);
		objGame.parentNode.appendChild(b);
		if (gameListPlayer.list[gameListPlayer.actif].pid==playerpid) {
			deletePower();
			b.original = true;
		}
		bougerBullet(pid);
	}
}
function whistleBullet() {
	var pid = sons.game_wormWhistle.pid;
	var b = document.getElementById("bullet_"+pid);
	if (b) {
		sons.game_wormWhistle.load.currentTime = 0;
		sons.game_wormWhistle.load.play();
	} else {
		sons.game_wormShoot.load.removeEventListener("ended", whistleBullet);
		sons.game_wormWhistle.load.removeEventListener("ended", whistleBullet);
	}
}
function bougerBullet(pid) {
	var b = document.getElementById("bullet_"+pid);
	if (b) {
		var x = b.getAttribute('x')/1 + b.vx;
		var y = -1*b.getAttribute('y')/1 + b.vy;
		b.vy = b.vy - valueGroundWorm.gravite/200;
		if (x>nbPixW) x = x - nbPixW;
		if (x<0) x = x + nbPixW;
		var alt = valueGroundWorm.altitude[Math.floor(x)];
		var alt = Math.min(Math.abs(y-alt),nbPixH);
		b.vx = b.vx + valueGroundWorm.ventSens*valueGroundWorm.vent/100/(1+nbPixH-alt);
		setBullet(pid,x,y);
		if (y<valueGroundWorm.altitude[Math.round(x)]) {
			explodeBullet(x,y,b.original);
		} else {
			setTimeout(function(){bougerBullet(pid);},vitesse);
		}
	}
}
function setBullet(pid,x,y) {
	var b = document.getElementById("bullet_"+pid);
	if (b) {
		b.setAttribute('x', x);
		b.setAttribute('y', -y);
		if (y<valueGroundWorm.altitude[Math.round(x)]) {
			b.parentNode.removeChild(b);
			hideBulletIndicateur(pid)
		} else {
			if (y>nbPixH) affBulletIndicateur(b)
			else hideBulletIndicateur(pid)
		}
	}
}
function affBulletIndicateur(b) {
	var pid = b.getAttribute('pid');
	var s = document.getElementById("bulletIndic_"+pid);
	if (!s) {
		var s = document.createElementNS(ns,'use');
			s.setAttributeNS(xref, 'xlink:href', '#bulletIndic');
			s.setAttribute('id', "bulletIndic_"+pid);
			s.setAttribute('y', -1*nbPixH);
		b.parentNode.appendChild(s);
	}
	s.setAttribute('x', b.getAttribute('x'));
}
function hideBulletIndicateur(pid) {
	var s = document.getElementById("bulletIndic_"+pid);
	if (s) s.parentNode.removeChild(s);
}
function explodeBullet(x,y,original) {
	var b = document.createElementNS(ns,'image');
		b.setAttributeNS(xref, 'xlink:href', 'images/jeux/explosion.png');
		b.setAttribute('x', x);
		b.setAttribute('y', -y);
		b.setAttribute('width', 0);
		b.setAttribute('height', 0);
		b.setAttribute('opacity', 1);
		b.dim = 0;
		b.px = x;
		b.py = y;
		b.original = original;
	var svg = document.getElementById('svgGame');
	svg.appendChild(b);
	explosionBullet(b);
	if (sonActive && sons.game_wormBoom && sons.game_wormBoom.actif) {
		if (!sons.game_wormBoom.load.paused) {
			sons.game_wormBoom.load.pause();
			sons.game_wormBoom.load.currentTime = 0;
		}
		if (!sons.game_wormShoot.load.paused) {
			sons.game_wormShoot.load.pause();
			sons.game_wormShoot.load.currentTime = 0;
		}
		if (!sons.game_wormWhistle.load.paused) {
			sons.game_wormWhistle.load.pause();
			sons.game_wormWhistle.load.currentTime = 0;
		}
		sons.game_wormBoom.load.play();
	}
}
function explosionBullet(b) {
	if (b) {
		if (b.dim<50) {
			b.dim++;
			b.setAttribute('x', b.px-b.dim);
			b.setAttribute('y', -(b.py+b.dim));
			b.setAttribute('width', b.dim*2);
			b.setAttribute('height', b.dim*2);
		} else {
			var op = b.getAttribute('opacity');
			if (op==1) degatsBullet(b);
			if (op>0) b.setAttribute('opacity', op-0.05);
			else {
				b.parentNode.removeChild(b);
				b = null;
			}
		}
		setTimeout(function(){explosionBullet(b);},20);
	}
}
function degatsBullet(b) {
	if (b) {
		if (b.original) {
			for (var i=Math.round(b.px-55); i<Math.round(b.px+55); i++) {
				var l = 100;
				var y0 = b.py + l*Math.sqrt(3)/2;
				var sq = Math.max(l*l-(b.px-i)*(b.px-i),0);
				var y = y0 - Math.sqrt(sq);
				var x = i;
				if (x>=nbPixW) x = x - nbPixW;
				if (x<0) x = x + nbPixW;
				var ny = Math.min(valueGroundWorm.altitude[x],y);
				valueGroundWorm.altitude[x] = Math.max(50,ny);
			}
			sendDataGame('valueGroundWorm',valueGroundWorm);
			sendDataGame('function','setTerrainWorm();');
			var nbleft = 0;
			if (gameListPlayer.list) {
				for (var i=0; i<gameListPlayer.list.length; i++) {
					var obj = document.getElementById("pion_"+gameListPlayer.list[i].pid);
					if (obj && !obj.dead) {
						nbleft++;
						var x = obj.getAttribute('x')/1;
						var y = -obj.getAttribute('y')/1;
						var dist = Math.sqrt((x-b.px)*(x-b.px)+(y-b.py)*(y-b.py));
						if (dist<50) {
							var s = obj.score-(50-dist);
							if (gameListPlayer.list[i].pid!=playerpid) {
								var myPion = document.getElementById("pion_"+playerpid);
								myPion.nbPts += Math.round(50-dist);
								sendDataGame('function','modifPtsWorm('+playerpid+','+myPion.nbPts+');');
							}
							if (s>0) {
								sendDataGame('function','modifScoreWorm('+obj.getAttribute('pid')+','+s+');');
							} else {
								sendDataGame('function','killPlayerWorm('+obj.getAttribute('pid')+');');
								nbleft--;
							}
						}
					}
				}
			}
			if (nbleft>1) nextPlayer(true);
			else endGame();
		}
	}
}
function killPlayerWorm(pid) {
	var pion = document.getElementById("pion_"+pid);
	pion.dead = true;
	pion.setAttribute('opacity',0);
	pion.socle.setAttribute('opacity',0);
	pion.scoreBarre.setAttribute('opacity',0);
	markCross(pion);
	gameListPlayer.nbPlayersLeft--;
	console.log(gameListPlayer.nbPlayersLeft);
	if (gameListPlayer.nbPlayersLeft<2) {
		clearTimeout(timerMoveObject);
		endGameReseau();
	}
}
function markCross(pion) {
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#deadcross');
		s.setAttribute('x', pion.getAttribute('x'));
		s.setAttribute('y', pion.getAttribute('y'));
		s.setAttribute('fill', pion.getAttribute('fill'));
	pion.parentNode.appendChild(s);
	pion.deadcross = s;
}



// arena
var physicsGroundArena = {};
	physicsGroundArena.bord = {xmin:20, xmax:nbPixW-20, ymin:20, ymax:nbPixH-20};
	physicsGroundArena.wormHole = {
		x:[[100,50,50],[290,20,20],[470,60,60],[690,20,20],[850,50,50]],
		y:[[80,40,40],[270,60,60],[480,40,40]]
	};
	physicsGroundArena.sandColor = '#FCEDBB';
var valueGroundArena = {};
	valueGroundArena.speed = 2;
	valueGroundArena.length = 0;
	
function creerModelePionArena(svg) {
	var defs = document.createElementNS(ns,'defs');	
		defs.setAttribute('id','defsSVG');
		
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','pion');
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',-5);
		c.setAttribute('cy',8);
		c.setAttribute('r',7);
	g.appendChild(c);
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',5);
		c.setAttribute('cy',8);
		c.setAttribute('r',7);
	g.appendChild(c);		
	var c = document.createElementNS(ns,'ellipse');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('rx',5);
		c.setAttribute('ry',14);
	g.appendChild(c);	
	defs.appendChild(g);
	
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','bullet');
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',3);
	g.appendChild(c);				
	defs.appendChild(g);

	svg.appendChild(defs);
}
function creerTerrainArena(svg) {
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',0);
		r.setAttribute('y',-nbPixH);
		r.setAttribute('width',nbPixW);
		r.setAttribute('height',nbPixH);
		r.setAttribute('fill',physicsGroundArena.sandColor);
	svg.appendChild(r);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',5);
		r.setAttribute('y',-nbPixH+5);
		r.setAttribute('width',nbPixW-10);
		r.setAttribute('height',nbPixH-10);
		r.setAttribute('fill','none');
		r.setAttribute('stroke','#030201');
		r.setAttribute('stroke-width',6);
	svg.appendChild(r);
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id','wormHole');
	svg.appendChild(g);
	creerWormHoleArena(physicsGroundArena.wormHole);
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id',"tracesOff");
	svg.appendChild(g);
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id',"traces");
	svg.appendChild(g);
	var g = document.createElementNS(ns,'g');
		g.setAttribute('id',"pions");
	svg.appendChild(g);
}
function creerPionArena(x,y,color,pid,usr) {
	var g = document.getElementById("pion").cloneNode(true);
		g.setAttribute('id',"pionRef_"+pid);
	document.getElementById("defsSVG").appendChild(g);
	var pion = document.createElementNS(ns,'use');
		pion.setAttributeNS(xref, 'xlink:href', '#pionRef_'+pid);
		pion.setAttribute('x', x);
		pion.setAttribute('y', -y);
		pion.setAttribute('fill', color);
		pion.setAttribute('pid', pid);
		pion.setAttribute('usr', usr);
		pion.setAttribute('id', "pion_"+pid);
		pion.angle = 0;
		pion.speed = valueGroundArena.speed;
		pion.ref = g;
		pion.dim = 5;
		pion.nbPts = 0;
	document.getElementById("pions").appendChild(pion);
	creerScoreArena(pion);
}
function creerScoreArena(pion) {
	var pid = pion.getAttribute('pid');
	var defs = document.getElementById('defsSVG');
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cut-score_'+pid);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-12);
		r.setAttribute('y',20);
		r.setAttribute('width',24);
		r.setAttribute('height',4);
		r.total = 24;
	cp.appendChild(r);
	defs.appendChild(cp);			
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('id','pionScore_'+pid);
		r.setAttribute('x',-12);
		r.setAttribute('y',20);
		r.setAttribute('width',24);
		r.setAttribute('height',4);
		r.setAttribute('clip-path','url(#cut-score_'+pid+')');
	defs.appendChild(r);
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#pionScore_'+pid);
		s.setAttribute('x', pion.getAttribute('x'));
		s.setAttribute('y', pion.getAttribute('x'));
	pion.parentNode.appendChild(s);
	pion.scoreBarre = s;
	pion.scoreBarreRef = r;
	modifScoreArena(pid,100);
	
	var t = document.createElementNS(ns,'text');
		t.setAttribute('id','pionInfo_'+pid);
		t.setAttribute('x',0);
		t.setAttribute('y',35);
		t.setAttribute('font-size',12);
		t.innerHTML = getNom(pion.getAttribute('usr'));
		t.setAttribute('text-anchor','middle');	
	defs.appendChild(t);
	var s = document.createElementNS(ns,'use');
		s.setAttributeNS(xref, 'xlink:href', '#pionInfo_'+pid);
		s.setAttribute('x', pion.getAttribute('x'));
		s.setAttribute('y', pion.getAttribute('y'));
	pion.parentNode.appendChild(s);
	pion.infoBarre = s;
}
function modifScoreArena(pid,v) {
	var pion = document.getElementById('pion_'+pid);
	if (pion) {
		var r = document.getElementById('cut-score_'+pid).firstChild;
		r.setAttribute('width',r.total*v/100);
		if (v>50) var coul = degrade('#F7E300','#03F700',v-50,50);
		else var coul = degrade('#F71800','#F7E300',v,50);		
		pion.scoreBarre.setAttribute('fill',coul);
	}
}
function setPionArenaAngle(pid,v) {
	var b = document.getElementById("pion_"+pid);
	if (b) {
		b.angle = v;
		if (b.angle>180) b.angle = b.angle-360;
		if (b.angle<-180) b.angle = b.angle+360;
		b.ref.setAttribute('transform','rotate('+b.angle+')');
		b.scoreBarreRef.setAttribute('transform','rotate('+b.angle+')');
	}
}
function setPionArena(pid,data) {
	var b = document.getElementById("pion_"+pid);
	if (b) {
		b.angle = data.angle;
		b.nbPts = data.nbPts;
		b.ref.setAttribute('transform','rotate('+b.angle+')');
		b.scoreBarreRef.setAttribute('transform','rotate('+b.angle+')');
		b.setAttribute('x', data.x);
		b.setAttribute('y', -data.y);
		b.scoreBarre.setAttribute('x', data.x);
		b.scoreBarre.setAttribute('y', -data.y);
		b.infoBarre.setAttribute('x', data.x);
		b.infoBarre.setAttribute('y', -data.y);
		creerTraceArena(null,data.x,data.y);
	}
}
function setDataArena(data) {
	creerWormHoleArena(data.wormHole);
	for (var pid in data.pions) {
		setPionArena(pid,data.pions[pid]);
		modifScoreArena(pid,data.pions[pid].score);
		if (data.pions[pid].dead) killPlayerArena(pid);
	}
	for (var i=0; i<data.newtraces.length; i++) {
		creerTraceArena(data.newtraces[i]);
	}
	for (var i=0; i<data.deltraces.length; i++) {
		effaceTraceArenaPid(data.deltraces[i]);
	}
}
function creerWormHoleArena(wormHole) {
	var g = document.getElementById('wormHole');
	if (g) {
		var w = wormHole.x;
		while (g.firstChild) g.removeChild(g.firstChild);
		for (var i=0; i<physicsGroundArena.wormHole.x.length; i++) {
			var l = [nbPixH-5,5];
			for (var j=0; j<l.length; j++) {
				var r = document.createElementNS(ns,'line');
					r.setAttribute('x1',w[i][0]);
					r.setAttribute('y1',-l[j]);
					r.setAttribute('x2',w[i][0]+w[i][1]);
					r.setAttribute('y2',-l[j]);
					r.setAttribute('fill','none');
					r.setAttribute('stroke',physicsGroundArena.sandColor);
					r.setAttribute('stroke-width',6);
				g.appendChild(r);
			}
		}
		var w = wormHole.y;
		for (var i=0; i<w.length; i++) {
			var l = [nbPixW-5,5];
			for (var j=0; j<l.length; j++) {
				var r = document.createElementNS(ns,'line');
					r.setAttribute('y1',-w[i][0]);
					r.setAttribute('x1',l[j]);
					r.setAttribute('y2',-w[i][0]-w[i][1]);
					r.setAttribute('x2',l[j]);
					r.setAttribute('fill','none');
					r.setAttribute('stroke',physicsGroundArena.sandColor);
					r.setAttribute('stroke-width',6);
				g.appendChild(r);
			}
		}
	}
}
function creerTraceArena(obj,x,y,player) {
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('fill','#ffffff');
		if (x) c.setAttribute('cx',x);
		if (y) c.setAttribute('cy',-y);
		c.setAttribute('r',3);
		c.setAttribute('opacity',1);
	if (obj) {
		c.setAttribute('cx',obj.x);
		c.setAttribute('cy',-obj.y);
		c.setAttribute('id','trace_'+obj.pid);
		document.getElementById("traces").appendChild(c);
		setTimeout(function(){c.setAttribute('r',9);},500);
		if (sonActive && sons.game_arenaTrace && sons.game_arenaTrace.actif) {
			if (!sons.game_arenaTrace.load.paused) {
				sons.game_arenaTrace.load.pause();
				sons.game_arenaTrace.load.currentTime = 0;
			}
			sons.game_arenaTrace.load.play();
		}
	} else {
		document.getElementById("tracesOff").appendChild(c);
		setTimeout(function(){effaceTraceArena(c);},50);
	}
}
function effaceTraceArena(obj) {
	if (obj) {
		var op = obj.getAttribute('opacity')-0.05;
		if (op>0) {
			obj.setAttribute('opacity',op);
			setTimeout(function(){effaceTraceArena(obj);},20);
		} else {
			obj.parentNode.removeChild(obj);
		}
	}
}
function effaceTraceArenaPid(pid) {
	var obj = document.getElementById('trace_'+pid);
	effaceTraceArena(obj);
}
function killPlayerArena(pid) {
	var pion = document.getElementById("pion_"+pid);
	if (pion && !pion.dead) {
		pion.dead = true;
		pion.setAttribute('opacity',0);
		pion.scoreBarre.setAttribute('opacity',0);
		gameListPlayer.nbPlayersLeft--;
		if (gameListPlayer.nbPlayersLeft<2) {
			clearTimeout(timerMoveObject);
			endGameReseau();
			endGame();
		}
	}
	console.log(gameListPlayer.nbPlayersLeft);
}
// tempo pour palier latence
function isWormHoleArena(dim,v) {
	var is = false;
	var w = physicsGroundArena.wormHole[dim];
	for (var i=0; i<w.length; i++) {
		if (v>w[i][0] && v<w[i][0]+w[i][1]) is = true;
	}
	return is;
}
function bougerPionArena() {
	if (gameListPlayer.list) {
		for (var i=0; i<gameListPlayer.list.length; i++) {
			var pion = document.getElementById("pion_"+gameListPlayer.list[i].pid);
			if (pion && !pion.dead && !pion.freeze) {		
				var obj = {};
				obj.x = pion.getAttribute('x')/1;
				obj.y = -pion.getAttribute('y')/1;
				obj.angle = pion.angle;
				obj.speed = pion.speed;
				var vx = obj.speed*Math.sin(obj.angle*Math.PI/180);
				var vy = obj.speed*Math.cos(obj.angle*Math.PI/180);
				var x = obj.x + vx;
				var y = obj.y + vy;
				if (x<physicsGroundArena.bord.xmin) {
					if (this.isWormHoleArena('y',y)) {
						x = physicsGroundArena.bord.xmax;
					} else {
						x = physicsGroundArena.bord.xmin;
						obj.angle = -obj.angle;
					}
				}
				if (x>physicsGroundArena.bord.xmax) {
					if (isWormHoleArena('y',y)) {
						x = physicsGroundArena.bord.xmin;
					} else {
						x = physicsGroundArena.bord.xmax;
						obj.angle = -obj.angle;
					}
				}
				if (y<physicsGroundArena.bord.ymin) {
					if (isWormHoleArena('x',x)) {
						y = physicsGroundArena.bord.ymax;
					} else {
						y = physicsGroundArena.bord.ymin;
						obj.angle = 180-obj.angle;
					}
				}
				if (y>physicsGroundArena.bord.ymax) {
					if (isWormHoleArena('x',x)) {
						y = physicsGroundArena.bord.ymin;
					} else {
						y = physicsGroundArena.bord.ymax;
						obj.angle = 180-obj.angle;
					}
				}
				if (obj.angle>180) obj.angle = obj.angle-360;
				if (obj.angle<-180) obj.angle = obj.angle+360;
				obj.x = x;
				obj.y = y;
				setPionArena(gameListPlayer.list[i].pid,obj);
			}
		}
	}
}
var pidArenaBullet = 0;
function fireArena() {
	if (sonActive && sons.game_arenaShoot && sons.game_arenaShoot.actif) {
		if (!sons.game_arenaShoot.load.paused) {
			sons.game_arenaShoot.load.pause();
			sons.game_arenaShoot.load.currentTime = 0;
		}
		sons.game_arenaShoot.load.play();
	}	
	var pion = document.getElementById("pion_"+playerpid);
	if (pion && !pion.dead) {	
		pidArenaBullet++;
		var b = document.createElementNS(ns,'use');
			b.setAttributeNS(xref, 'xlink:href', '#bullet');
			var obj = {};
				obj.angle = pion.angle;
				obj.speed = pion.speed*3;
				obj.x = pion.getAttribute('x')/1;
				obj.y = -pion.getAttribute('y')/1;
				var vx = obj.speed*Math.sin(obj.angle*Math.PI/180);
				var vy = obj.speed*Math.cos(obj.angle*Math.PI/180);
				var x = obj.x + vx*2;
				var y = obj.y + vy*2;
			b.setAttribute('pid', playerpid);
			b.setAttribute('id', "bullet_"+pidArenaBullet);
			b.vx = vx;
			b.vy = vy;
			b.setAttribute('x', x);
			b.setAttribute('y', -y);
			b.ori = {x:x,y:y};
		pion.parentNode.appendChild(b);
		bougerBulletArena(b);
	}
}
function bougerBulletArena(b) {
	if (b) {
		var x = b.getAttribute('x')/1 + b.vx;
		var y = -b.getAttribute('y')/1 + b.vy;
		var dist = Math.sqrt((b.ori.x-x)*(b.ori.x-x) + (b.ori.y-y)*(b.ori.y-y));
		b.setAttribute('x', x);
		b.setAttribute('y', -y);
		if (dist>400) {
			b.parentNode.removeChild(b);
			b = null;
			var pion = document.getElementById("pion_"+playerpid);
			glueArena(pion,x,y);
		}
		for (var i=0; i<gameListPlayer.list.length; i++) {
			var pion = document.getElementById("pion_"+gameListPlayer.list[i].pid);
			if (pion && !pion.dead && pion.getAttribute('pid')!=playerpid) {
				var px = pion.getAttribute('x')/1;
				var py = -pion.getAttribute('y')/1;
				var dist = Math.sqrt((px-x)*(px-x) + (py-y)*(py-y));
				if (dist<10) {
					b.parentNode.removeChild(b);
					b = null;
					glueArena(pion,x,y);
				}
			}
		}
		setTimeout(function(){bougerBulletArena(b);},20);
	}
}
function glueArena(pion,x,y) {
	var b = document.createElementNS(ns,'use');
	var b = document.createElementNS(ns,'image');
		b.setAttributeNS(xref, 'xlink:href', 'images/jeux/splash.png');
		b.setAttribute('x', x);
		b.setAttribute('y', -y);
		b.setAttribute('width', 0);
		b.setAttribute('height', 0);
		b.setAttribute('opacity', 1);
		b.dim = 0;
		b.px = x;
		b.py = y;
	var svg = document.getElementById('svgGame');
	svg.appendChild(b);
	pion.freeze = b;
	glueArenaExpand(pion);
}
function glueArenaExpand(pion) {
	var b = pion.freeze;
	if (b) {
		if (b.dim<50) {
			b.dim++;
			b.setAttribute('x', b.px-b.dim);
			b.setAttribute('y', -(b.py+b.dim));
			b.setAttribute('width', b.dim*2);
			b.setAttribute('height', b.dim*2);
			setTimeout(function(){glueArenaExpand(pion);},20);
		} else {
			setTimeout(function(){glueArenaFreeze(pion);},2000);
		}
	}
}
function glueArenaFreeze(pion) {
	var b = pion.freeze;
	if (b) {	
		var op = b.getAttribute('opacity');
		if (op>0) b.setAttribute('opacity', op-0.05);
		else {
			b.parentNode.removeChild(b);
			b = null;
			pion.freeze = null;
		}
		setTimeout(function(){glueArenaFreeze(pion);},20);
	}
}
// fin tempo


// pour memoire
function rgbToHex(rgb) {
    var bin = rgb.b | (rgb.g << 8) | (rgb.r << 16);
    return '#' + (0x1000000 + bin).toString(16).slice(1)
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function degrade(c1,c2,pas,tot) {
	var d = hexToRgb(c1);
	var f = hexToRgb(c2);
	var m = {
        r: d.r + (f.r-d.r)*pas/tot,
        g: d.g + (f.g-d.g)*pas/tot,
        b: d.b + (f.b-d.b)*pas/tot
    };
	return rgbToHex(m);
}
