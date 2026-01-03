
var objGame = null;
var keys = [];
var vitesse = 20;
var isStarted = false;
var timePlay = null;
var gameSelected = null;
var moveTrigger = null;
var moveFreeze = {};

var racineImage = 'images/jeux/';



var resizeTimer;
function resizeJeux(ev) {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function() {
		resizeCadre();
		if (document.getElementById('divGame')) {
			resizeGame();
			resizeChat();
		}
	}, 250);
}
function resizeCadre() {
	var div = document.getElementById('divJeux');
	if (div) {
		var ratio = getBestRatio(div);
		var rect = div.getBoundingClientRect();
		div.style.height = rect.width/ratio + 'px';
		if (objGame && objGame.parentNode) {
			var r = objGame.getBoundingClientRect();
			var rp = objGame.parentNode.getBoundingClientRect();
			var marge = 70*parseInt(objGame.style.width)/200;
			var y = parseInt(objGame.style.top);
			var x = parseInt(objGame.style.left);
			var end = rp.width - r.width + marge;
			var fond = rp.height - r.height + marge;
			if (y>=fond) objGame.style.top = fond + 'px';
			if (x>=end) objGame.style.left = end + 'px';
		}		
	}
}

function checkKey(ev) {
	if (ev.target.parentNode && ev.target.parentNode.getAttribute('id')=='divChat') {
		
	} else {
		if (ev.keyCode=='66') useBomb();
	}
}
var isCtrl = false;
function addKey(ev) {
	if (ev.target.parentNode && ev.target.parentNode.getAttribute('id')=='divChat') {
		
	} else {
		var k = ev.keyCode;
		dedans = false;
		for (var i=0; i<keys.length; i++) {
			if (keys[i]==k) dedans = true;
		}
		if (!dedans) keys.push(k);
		if (k==17) isCtrl = true;
		ev.preventDefault();
	}
}
Array.prototype.unset = function(val) {
	var index = this.indexOf(val)
	if (index > -1) {
		this.splice(index,1);
	}
}
function removeKey(ev) {
	var k = ev.keyCode;
	keys.unset(k);
	if (k==17) isCtrl = false;
	ev.preventDefault();
}


function divStart(div) {
	var d = document.createElement('div');
	d.setAttribute('class','divStart');
	d.innerHTML = "Démarrer";
	var r = div.getBoundingClientRect();
	d.style.left = (r.width-400)/2 + "px";
	d.style.top = (r.height-100)/2 + "px";
	div.appendChild(d);
	d.setAttribute('onclick','startGameGlobal(this)');
}
function divEnd(tt) {
	clearTimeout(timerDifficulty);
	var div = document.getElementById('divJeux');
	var d = document.createElement('div');
	d.setAttribute('class','divStart');
	d.innerHTML = tt;
	d.setAttribute('onclick','menage()');
	var r = div.getBoundingClientRect();
	d.style.left = (r.width-400)/2 + "px";
	d.style.top = (r.height-100)/2 + "px";
	div.appendChild(d);
	if (gameSelected=='fusee') {
		sonFond = sons.game_fuseeFond;
		sonLoose = sons.game_fuseeLoose;
	}
	if (gameSelected=='splash') {
		sonFond = sons.game_splashFond;
		sonLoose = sons.game_splashLoose;
	}
	if (sonActive && sonFond && sonFond.actif && sonLoose && sonLoose.actif) {
		sonFond.load.pause();
		sonFond.load.currentTime = 0;
		sonLoose.load.play();
	}
}
function menage(nom) {
	if (!nom) nom = 'divJeux';
	var div = document.getElementById(nom);
	while (div.firstChild) div.removeChild(div.firstChild);
	if (gameSelected=='fusee') initFusee();
	if (gameSelected=='splash') initSplash();
	if (gameSelected=='worm') initWorm();
	if (gameSelected=='arena') initArena();
}
function makeImgCapacity(code) {
	var a = "";
	if (t_click[code]) a = "style='cursor:pointer;' onclick='"+t_click[code]+"'";
	var s = "&nbsp;&nbsp;<img class='imgCapacity' src='images/jeux/"+code+".png' "+a+" />:";
	return s;
}	
function creerScore() {
	var div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.backgroundColor = "#ffffff";
		div.style.paddingLeft = "5px";
		div.style.paddingRight = "5px";
		div.style.left = '0px';
		div.style.top = '0px';
		div.style.zIndex = 10;
	document.getElementById('divJeux').appendChild(div);
	var d = document.createElement('div');
		d.setAttribute('id','divScore');
		d.style.display = 'inline-block';
	div.appendChild(d);
	if (gameSelected=='fusee') {
		d.setAttribute('start',0);
		d.innerHTML = "tps: 0";
	}
	if (gameSelected=='splash') {
		d.setAttribute('kill',0);
		d.setAttribute('miss',0);
		d.innerHTML = "kill: 0, miss: 0 ";
	}
	var d = document.createElement('div');
		d.setAttribute('id','divCapacity');
		d.style.display = 'inline-block';
	div.appendChild(d);	
	for (code in t_capacity) {
		if (t_capacity[code]) {
			d.setAttribute(code,t_capacity[code]);
			d.innerHTML += makeImgCapacity(code);
			var d2 = document.createElement('div');
				d2.setAttribute('id','divCapacity_'+code);
				d2.style.display = 'inline-block';
				d2.innerHTML = t_capacity[code];
				d.appendChild(d2);
		}	
	}	
}
function sendScore(s) {
	fd = new FormData();
	fd.append('scoreGame', '');
	fd.append('game', gameSelected);
	fd.append('score', s);
	glbSendForm(fd);
}
function resetScore(elt) {
	var pts = elt.getAttribute('pts');
	var rep = confirm('Effacer mon score et gagner '+pts+'pts ? \nOui, ça fait trop longtemps que je suis le meilleur !');
	if (rep) {
		fd = new FormData();
		fd.append('resetScoreGame','');
		fd.append('game', elt.getAttribute('game'));
		glbSendForm(fd);
		elt.parentNode.nextSibling.parentNode.removeChild(elt.parentNode.nextSibling);
		elt.parentNode.parentNode.removeChild(elt.parentNode);
		gainXP(document.getElementById('titre'));
	}
}
function useCapacity(code) {
	var div = document.getElementById('divCapacity');
	if (div && div.hasAttribute(code)) {
		var n = div.getAttribute(code);
		if (n>0) {
			div.setAttribute(code,n-1);
			document.getElementById('divCapacity_'+code).innerHTML = (n-1);
			return true;
		}	
	}	
}
function useBomb() {
	if (useCapacity('bomb')) {
		sendCapacity('bomb');
		var div = document.getElementById('divJeux');
		var divScore = document.getElementById('divScore');
		if (gameSelected=='splash') {
			var nbk = divScore.getAttribute('kill');
			var nbm = divScore.getAttribute('miss');
		}	
		var c = div.firstChild;
		while (c) {
			var o = null;
			if (c.enemy==1) o = c;
			c = c.nextSibling;
			if (o) {
				if (gameSelected=='splash') {	
					nbk++;
					o.setAttribute('src',racineImage+'monsterkilled.png');
					dismissImg(o);
					monstreInline.unset(o);
				} else {
					o.parentNode.removeChild(o);
				}	
			}
		}
		if (gameSelected=='splash') {
			divScore.setAttribute('kill',nbk);
			divScore.innerHTML = "kill: "+nbk+", miss: "+nbm+" ";
		}	
	}
}
function sendCapacity(code) {
	var div = document.getElementById('divCapacity');
	if (div && div.hasAttribute(code)) {
		var num = div.getAttribute(code);
		fd = new FormData();
		fd.append('useCapacity', '');
		fd.append('code', code);
		fd.append('num', num);
		glbSendForm(fd);
	}	
}	

function startGameGlobal(elt) {
	clearTimeout(timerDifficulty);
	if (elt) elt.parentNode.removeChild(elt);
	isStarted = true;
	timePlay = new Date();
	var sonFond = null;
	if (gameSelected=='fusee') {
		if (gameJoystick=='keyboard') moveObjGame();
		creerScore();
		sonFond = sons.game_fuseeFond;
		depDefile = 1;
		pBubbs = 10;
	}
	if (gameSelected=='splash') {
		if (gameJoystick=='keyboard') moveObjGame();
		creerScore();
		sonFond = sons.game_splashFond;
		nbMonstre = 1;
		lifeTortue = 10;
		monstreInline = [];
		creerMonstre();
	}
	if (gameSelected=='worm') {
		sonFond = sons.game_wormFond;
	}
	if (gameSelected=='arena') {
		sonFond = sons.game_arenaFond;
	}
	if (sonActive && sonFond && sonFond.actif) {
		if (sonActive && sons.page && sons.page.actif) {
			if (!sons.page.load.paused) sons.page.load.pause();	
		}
		if (!sonFond.load.paused) {
			sonFond.load.pause();
			sonFond.load.currentTime = 0;
		}
		sonFond.load.loop = true;
		sonFond.load.play();
	}
	timerDifficulty = setTimeout(function(){incDifficulty();},30000);
}
var timerDifficulty = null;
function incDifficulty() {
	clearTimeout(timerDifficulty);
	if (gameSelected=='fusee') {
		depDefile = depDefile + 1;
		pBubbs = pBubbs + 10;
		makeBubbs(-1);
		makeBubbs(1);
	}
	if (gameSelected=='splash') {
		nbMonstre = nbMonstre + 1;
		lifeTortue = lifeTortue + 5;
		makeTortue();
	}
	timerDifficulty = setTimeout(function(){incDifficulty();},30000);
}
var timerMoveObject = null;
function moveObjGame() {
	clearTimeout(timerMoveObject);
	var vx = parseInt(objGame.getAttribute('vx'));
	var vy = parseInt(objGame.getAttribute('vy'));
	if (vx>0) vx = vx-1;
	if (vx<0) vx = vx+1;
	if (vy>0) vy = vy-1;
	if (vy<0) vy = vy+1;
	for (var i=0; i<keys.length; i++) {
		if (keys[i]==37) vx = vx-2;
		if (keys[i]==38) vy = vy-2;
		if (keys[i]==39) vx = vx+2;
		if (keys[i]==40) vy = vy+2;
	}
	var vmax = parseInt(objGame.getAttribute('vmax'));
	vx = Math.min(vx,vmax);
	vx = Math.max(vx,-vmax);
	vy = Math.min(vy,vmax);
	vy = Math.max(vy,-vmax);
	var x = parseInt(objGame.style.left);
	var y = parseInt(objGame.style.top);
	var marge = 70*parseInt(objGame.style.width)/200;
	var rp = objGame.parentNode.getBoundingClientRect();
	var r = objGame.getBoundingClientRect();
	var fond = rp.height - r.height + marge;
	var end = rp.width - r.width + marge;
	x = x + vx;
	y = y + vy;
	if (x<=-marge) {x=-marge; vx=0;};
	if (x>=end) {x=end; vx=0;};
	if (y<=-marge) {y=-marge; vy=0;};
	if (y>=fond) {y=fond; vy=0;};
	var dir = '';
	if (vy>2) dir = 'D';
	if (vy<-2) dir = 'U';
	if (objGame.hasAttribute('src0')) objGame.setAttribute('src',objGame.getAttribute('src0')+dir+'.png');
	objGame.style.left = x + 'px';
	objGame.style.top = y + 'px';
	objGame.setAttribute('vx',vx);
	objGame.setAttribute('vy',vy);
	if (isStarted) timerMoveObject = setTimeout(function() {moveObjGame();},vitesse);
}

function mouseCoords(ev){ 
	if(ev.pageX || ev.pageY){ 
		return {x:ev.pageX, y:ev.pageY}; 
	} 
	return { 
		x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
		y:ev.clientY + document.body.scrollTop  - document.body.clientTop 
	}; 
}
function fingerCoords(ev,f) {
	ev.preventDefault();
	if (!f) f = 0;
	tt = ev.targetTouches;
	return {x:parseInt(tt[f].pageX), y:parseInt(tt[f].pageY)}; 
}

function moveStop(ev) {
	moveTrigger = false;
}
function moveBeginTouch(ev) {
	moveTrigger = true;
	moveToTouch(ev);
}
function moveActionTouch(ev) {
	if (isStarted && moveTrigger) {
		var pos = fingerCoords(ev);
		if (gameSelected=='fusee') moveToPos(pos);
		if (gameSelected=='splash') moveToPos(pos);
		if (gameSelected=='worm') moveToPosSVG(pos);
		if (gameSelected=='arena') moveToPosSVG(pos);
	}
}
function moveToTouch(ev) {
	if (isStarted) {
		var pos = fingerCoords(ev);
		if (gameSelected=='fusee') moveToPos(pos);
		if (gameSelected=='splash') moveToPos(pos);
		if (gameSelected=='worm') moveToPosSVG(pos);
		if (gameSelected=='arena') moveToPosSVG(pos);
	}
}
function moveBeginMouse(ev) {
	moveTrigger = true;
	moveToClick(ev);
}
function moveActionMouse(ev) {
	if (isStarted && moveTrigger) {
		var pos = mouseCoords(ev);
		if (gameSelected=='fusee') moveToPos(pos);
		if (gameSelected=='splash') moveToPos(pos);
		if (gameSelected=='worm') moveToPosSVG(pos);
		if (gameSelected=='arena') moveToPosSVG(pos);
	}
}
function moveToClick(ev) {
	if (isStarted) {
		var pos = mouseCoords(ev);
		if (gameSelected=='fusee') moveToPos(pos);
		if (gameSelected=='splash') moveToPos(pos);
		if (gameSelected=='worm') moveToPosSVG(pos);
		if (gameSelected=='arena') moveToPosSVG(pos);
		ev.stopPropagation();
	}
}
var timerPosition = null;
function moveToPos(pos) {
	clearTimeout(timerPosition);
	if (isStarted) {
		var divJeux = document.getElementById('divJeux');
		var rect = divJeux.getBoundingClientRect();
		var r = objGame.getBoundingClientRect();
		var nx = pos.x;
		if (nx<rect.left) nx = rect.left;
		if (nx>rect.left+rect.width) nx = rect.left+rect.width;
		var ny = pos.y;
		if (ny<rect.top) ny = rect.top;
		if (ny>rect.top+rect.height) ny = rect.top+rect.height;
		var dxc = parseInt(nx - rect.left - document.body.scrollLeft - r.width/2);
		var dyc = parseInt(ny - rect.top - document.body.scrollTop - r.height/2);
		var x = parseInt(objGame.style.left);
		var y = parseInt(objGame.style.top);
		var vmax = parseInt(objGame.getAttribute('vmax'));
		var pcent = parseFloat(objGame.getAttribute('pcent'));
		var dx = parseInt((dxc-x)*pcent);	
		if (Math.abs(dx)<1 && x!=dxc) dx = Math.abs(dxc-x)/(dxc-x);
		if (Math.abs(dx)>vmax) dx = vmax*Math.abs(dx)/dx;
		var xf = x + dx;
		var dy = parseInt((dyc-y)*pcent);
		if (Math.abs(dy)<1 && y!=dyc) dy = Math.abs(dyc-y)/(dyc-y);
		if (Math.abs(dy)>vmax) dy = vmax*Math.abs(dy)/dy;;
		var yf = y + dy;
		var dir = '';
		if (dy>2) dir = 'D';
		if (dy<-2) dir = 'U';
		if (objGame.hasAttribute('src0')) objGame.setAttribute('src',objGame.getAttribute('src0')+dir+'.png');
		objGame.style.left = xf + 'px';
		objGame.style.top = yf + 'px';
		if (xf!=dxc || yf!=dyc) timerPosition = setTimeout(function(){moveToPos(pos);},20);
		else {
			if (gameSelected=='splash') splashTo(xf+r.width/2,yf+r.height/2);
		}
		
	}
}


function getSvgCoord(pos) {
	var svg = document.getElementById('svgGame');
	var rect = svg.getBoundingClientRect();
	var vb = svg.getAttribute('viewBox').split(' ');
	var ratioSVG = vb[2]/vb[3];
	var ratioDIV = rect.width/rect.height;
	if (ratioSVG>ratioDIV) dim = {width:rect.width, height:rect.width/ratioSVG};
	else dim = {width:rect.height*ratioSVG, height:rect.height};	
	var centreSVG = {x:vb[0]/1+vb[2]/2, y:-vb[1]/1-vb[3]/2};
	var centreDIV = {x:(rect.left+rect.right)/2, y:(rect.top+rect.bottom)/2};
	var x = centreSVG.x + (pos.x-centreDIV.x)*vb[2]/dim.width;
	var y = centreSVG.y + (-pos.y+centreDIV.y)*vb[3]/dim.height;
	return {x:x, y:y};
}
function moveToPosSVG(pos) {
	clearTimeout(timerPosition);
	if (gameSelected=='worm') {
		if (isStarted && gameListPlayer.list[gameListPlayer.actif]&& gameListPlayer.list[gameListPlayer.actif].pid==playerpid) {
			var coord = getSvgCoord(pos);
			var x = parseFloat(objGame.getAttribute('x'));
			var y = -parseFloat(objGame.getAttribute('y'));
			var dist = Math.round(Math.sqrt((x-coord.x)*(x-coord.x)+(y-coord.y)*(y-coord.y))-30);
			var angle = Math.round(Math.atan2(coord.x-x,coord.y-y)*180/Math.PI);
			if (dist<20) {
				//fireWorm();
			} else if (angle<-110 || angle>110) {
				if (!moveFreeze.tank) bougerTank(angle/Math.abs(angle));
			} else {
				if (!moveFreeze.angle) bougerCanon(angle, true);
				if (!moveFreeze.power) bougerPower(dist, true);
			}
		}
	}
	if (gameSelected=='arena') {
		var coord = getSvgCoord(pos);
		var x = parseFloat(objGame.getAttribute('x'));
		var y = -parseFloat(objGame.getAttribute('y'));
		var angle = Math.round(Math.atan2(coord.x-x,coord.y-y)*180/Math.PI);
		sendDataGame('capture',{pid:playerpid, angle:angle});
	}
}
function listenToEventSVG() {
	clearTimeout(timerMoveObject);
	var actif = false;
	if (gameListPlayer.list[gameListPlayer.actif]) 
		actif = gameListPlayer.list[gameListPlayer.actif].pid==playerpid;
	if (gameSelected=='worm') {
		var v = {a:0, p:0, t:0};
		for (var i=0; i<keys.length; i++) {
			if (keys[i]==37) {
				if (isCtrl) v.t = v.t - 1;
				else v.a = v.a - 1;
			}
			if (keys[i]==39) {
				if (isCtrl) v.t = v.t + 1;
				else v.a = v.a + 1;
			}
			if (keys[i]==38) v.p = v.p + 1;
			if (keys[i]==40) v.p = v.p - 1;
			if (keys[i]==32) fireWorm();
		}
		if (v.a && actif) bougerCanon(v.a);
		if (v.p && actif) bougerPower(v.p);
		if (v.t && actif) bougerTank(v.t);
	}
	if (gameSelected=='arena') {
		var b = document.getElementById("pion_"+playerpid);
		var v = 0;
		var vmaj = {x:0,y:0};
		for (var i=0; i<keys.length; i++) {
			if (keys[i]==37) {
				if (isCtrl) vmaj.x = vmaj.x-1;
				else {
					if (b.angle<90 && b.angle>-90) v = v-1;
					if (b.angle>90 || b.angle<-90) v = v+1;
				}
			}
			if (keys[i]==38) {
				if (isCtrl) vmaj.y = vmaj.y+1;
				else {
					if (b.angle>0) v = v-1;
					if (b.angle<0) v = v+1;
				}
			}
			if (keys[i]==39) {
				if (isCtrl) vmaj.x = vmaj.x+1;
				else {
					if (b.angle<90 && b.angle>-90) v = v+1;
					if (b.angle>90 || b.angle<-90) v = v-1;
				}
			}
			if (keys[i]==40) {
				if (isCtrl) vmaj.y = vmaj.y-1;
				else {
					if (b.angle>0) v = v+1;
					if (b.angle<0) v = v-1;
				}
			}
			// if (keys[i]==32) fireArena();
		}
		if (v) {
			v = b.angle + v;
			if (v>180) v = v-360;
			if (v<-180) v = v+360;
			sendDataGame('capture',{pid:playerpid, angle:v});
		}
		if (vmaj.x || vmaj.y) {
			if (vmaj.x==0) v = 90 - vmaj.y*90;
			else if (vmaj.y==0) v = vmaj.x*90;
			else v = vmaj.x*90 - vmaj.x*vmaj.y*45;
			sendDataGame('capture',{pid:playerpid, angle:v});
		}
		getGame();
		bougerPionArena();
	}
	timerMoveObject = setTimeout(function(){listenToEventSVG();},vitesse);
}



// Fusee
var vitesseDefile = 20;
var depDefile = 0;
var pBubbs = 10;
function initFusee() {
	var div = document.getElementById('divJeux');
	if (div) {
		resizeCadre();
		window.addEventListener('resize', resizeJeux, false);
		window.addEventListener('keydown', checkKey, false);
		if (gameJoystick=='keyboard') {
			window.addEventListener('keydown', addKey, false);
			window.addEventListener('keyup', removeKey, false);
		}
		if (gameJoystick=='mouse') {
			//div.addEventListener('touchstart', moveToTouch, false);
			div.addEventListener('click', moveToClick, false);
		}
		var r = div.getBoundingClientRect();
		var s = 200;
		if (t_capacity['mini']) s = s/t_capacity['mini'];
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('id','fusee');
		img.setAttribute('src0',racineImage+'rocket');
		img.setAttribute('src',racineImage+'rocket.png');
		img.style.width = s + "px";
		img.style.left = 0 + "px";
		img.style.top = (r.height-s)/2 + "px";
		img.setAttribute('vx',0);
		img.setAttribute('vy',0);
		img.setAttribute('vmax',15);
		img.setAttribute('pcent',0.2);
		img.style.zIndex = 3;
		div.appendChild(img);
		objGame = img;
		div.style.backgroundColor = "#091436";
		gameSelected = 'fusee';
		divStart(div);
		for (var i=0; i<((r.width*r.height)/10000); i++) makeStar(true);
	}
}
function makeStar(init) {
	var div = document.getElementById('divJeux');
	var r = div.getBoundingClientRect();
	var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'star.gif');
		img.style.width = "10px";
		if (init) var x = Math.random()*r.width;
		else var x = r.width;
		var y = Math.random()*r.height;
		img.style.left = x + "px";
		img.style.top = y + "px";
		img.style.zIndex = 1;
		div.appendChild(img);
	moveStar(img);
}
function moveStar(obj) {
	if (obj && obj.parentNode){
		var x = parseInt(obj.style.left);
		var y = parseInt(obj.style.top);
		var div = document.getElementById('divJeux');
		var r = div.getBoundingClientRect();
		x = x-depDefile;
		if (x<10 || y>r.height) {
			obj.parentNode.removeChild(obj);
			makeStar();
			var app = Math.random()*100;
			if (app<pBubbs) {
				makeBubbs();
			}
		} else {
			obj.style.left = (x-depDefile) + 'px';
			setTimeout(function(){moveStar(obj);},vitesseDefile);
		}
	}	
	var divScore = document.getElementById('divScore');
	var d = new Date();
	if (divScore && isStarted) divScore.innerHTML = "tps: "+affDelai(d-timePlay);	
}
function makeBubbs(bord) {
	var s = 80;
	if (t_capacity['mini']) s = s/t_capacity['mini'];
	var div = document.getElementById('divJeux');
	var r = div.getBoundingClientRect();
	var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'bubbs.png');
		img.style.width = s + "px";
		var x = r.width - s;
		var y = Math.random()*r.height - s/2;
		if (bord && bord<0) y = -s/2;
		if (bord && bord>0) y = r.height - s/2;
		img.style.left = x + "px";
		img.style.top = y + "px";
		img.style.zIndex = 2;
		img.enemy = 1;
		div.appendChild(img);
	moveBubbs(img);
}
function moveBubbs(obj) {
	if (obj && obj.parentNode){
		var x = parseInt(obj.style.left);
		var y = parseInt(obj.style.top);
		var rb = obj.getBoundingClientRect();
		var r = objGame.getBoundingClientRect();
		var isIntercept = true;
		isIntercept = isIntercept && isStarted;
		isIntercept = isIntercept && (r.top + r.height/2)>(rb.top)  && (r.top + r.height/2)<(rb.top + rb.height);
		isIntercept = isIntercept && (r.left + r.width/2)>(rb.left) && (r.left + r.width/2)<(rb.left + rb.width);
		if (isIntercept) {
			if (!useCapacity('life')) {
				intercept();
			} else {
				obj.parentNode.removeChild(obj);
			}	
		}
		var div = document.getElementById('divJeux');
		var r = div.getBoundingClientRect();
		x = x-depDefile;
		if (x<10 || y>r.height) {
			obj.parentNode.removeChild(obj);
			var app = Math.random()*100;
			if (app<pBubbs) {
				makeBubbs();
			}
		} else {
			obj.style.left = (x-depDefile) + 'px';
			if (isStarted) setTimeout(function(){moveBubbs(obj);},vitesseDefile);
		}
	}
}

function intercept() {
	var d = new Date();
	isStarted = false;
	depDefile = 0;
	sendScore(parseInt((d-timePlay)/1000));
	divEnd("Tu as survecu "+affDelai(d-timePlay));
}






// splash
var listeMonstre = [];
listeMonstre.push({src:'soldat1.png', tmin:50, tmax:200, pcent:80});
listeMonstre.push({src:'soldat2.png', tmin:50, tmax:200, pcent:80});
listeMonstre.push({src:'boss.png', tmin:100, tmax:250, pcent:40});
listeMonstre.push({src:'bigboss.png', tmin:200, tmax:300, pcent:20});
var monstreInline = [];
var vitesseMonstre = 3000;
var nbMonstre = 1;
var pTouche = 0.5;
var tailleSplash = 50;
var ratioKilled = 1;
function initSplash() {
	var div = document.getElementById('divJeux');
	if (div) {
		resizeCadre();
		window.addEventListener('resize', resizeJeux, false);
		window.addEventListener('keydown', checkKey, false);
		if (gameJoystick=='keyboard') {
			window.addEventListener('keydown', addKey, false);
			window.addEventListener('keyup', removeKey, false);
		}
		if (gameJoystick=='mouse') {
			//div.addEventListener('touchstart', moveToTouch, false);
			div.addEventListener('click', moveToClick, false);
		}
		var r = div.getBoundingClientRect();
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'cible.png');
		img.style.width = "100px";
		img.style.left = (r.width-200)/2 + "px";
		img.style.top = (r.height-200)/2 + "px";
		img.setAttribute('vmax',50);
		img.setAttribute('pcent',0.5);
		img.setAttribute('vx',0);
		img.setAttribute('vy',0);
		img.style.zIndex = 3;
		div.appendChild(img);
		objGame = img;
		var bg = "url('"+racineImage+"fondSplash.jpg') no-repeat center";
			bg += ", url('"+racineImage+"fondSplash-medium.jpg') no-repeat center";
			bg += ", url('"+racineImage+"fondSplash-mini.jpg') no-repeat center";
		div.style.background = bg;
		div.style.backgroundSize = 'cover';
		gameSelected = 'splash';
		divStart(div);
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'monsterkilled.png');
		img.style.width = "10%";
		img.style.opacity = 0;
		div.appendChild(img);
		setTimeout(function(){getRatioKilled(img)},100);
	}	
}
function getRatioKilled(img) {
	var r = img.getBoundingClientRect();
		ratioKilled = r.width/r.height;
		img.parentNode.removeChild(img);
}
function splashTo(x,y) {
	if (sonActive && sons.game_splashShoot && sons.game_splashShoot.actif) {
		if (!sons.game_splashShoot.load.paused) {
			sons.game_splashShoot.load.pause();
			sons.game_splashShoot.load.currentTime = 0;
		}
		sons.game_splashShoot.load.play();
	}
	var div = document.getElementById('divJeux');
	var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'splash.png');
		img.style.width = tailleSplash + "px";
		img.style.left = (x-tailleSplash/2) + "px";
		img.style.top = (y-tailleSplash/2) + "px";
		img.style.zIndex = 3;
		img.style.opacity = 1;
	div.appendChild(img);
	checkAllMonstre(img);
	killTortue(img);
	setTimeout(function(){dismissImg(img);},500);
}
function splashFin() {
	if (sonActive && sons.game_splashShoot && sons.game_splashShoot.actif) {
		if (!sons.game_splashShoot.load.paused) {
			sons.game_splashShoot.load.pause();
			sons.game_splashShoot.load.currentTime = 0;
		}
		sons.game_splashShoot.load.play();
	}
	var div = document.getElementById('divJeux');
	var r = div.getBoundingClientRect();
	var taille = Math.min(r.width,r.height)*1.5;
	var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+'splash.png');
		img.style.width = r.width*1.2 + "px";
		img.style.height = r.height*1.2 + "px";
		img.style.left = (-r.width*0.1) + "px";
		img.style.top = (-r.height*0.1) + "px";
		img.style.zIndex = 4;
		img.style.opacity = 1;
	div.appendChild(img);
}
function dismissImg(img) {
	if (img) {
		var o = parseFloat(img.style.opacity)-0.1;
		if (o>0) {
			img.style.opacity = o;
			setTimeout(function(){dismissImg(img);},200);
		} else {
			if (img.parentNode) img.parentNode.removeChild(img);
		}
	}
}
function creerMonstre() {
	if (isStarted) {
		checkAllMonstre();
		killTortue();
		var nb = Math.random()*nbMonstre;
		for (var i=0; i<nb; i++) {
			var alea = Math.random()*10;
			setTimeout(makeMonstre(),100*i*alea/10);
		}
		setTimeout(function(){creerMonstre();},vitesseMonstre);
	}
}
function makeMonstre() {
	if (isStarted) {
		for (var m=0; m<listeMonstre.length; m++) {
			var pcent = Math.random()*100;
			if (pcent<listeMonstre[m].pcent) {
				setTimeout('makeMonstreInd('+m+')', 800*m);
			}
		}
	}
}
function makeMonstreInd(m) {
	if (sonActive && sons.game_splashMonster && sons.game_splashMonster.actif) {
		if (!sons.game_splashMonster.load.paused) {
			sons.game_splashMonster.load.pause();
			sons.game_splashMonster.load.currentTime = 0;
		}
		sons.game_splashMonster.load.play();
	}
	var div = document.getElementById('divJeux');
	var r = div.getBoundingClientRect();
	var img = document.createElement('img');
		img.style.position = 'absolute';
		img.setAttribute('src',racineImage+listeMonstre[m].src);
		var taille = listeMonstre[m].tmin + Math.random()*(listeMonstre[m].tmax-listeMonstre[m].tmin);
		img.style.width = taille + "px";
		var x = Math.random()*(r.width-taille);
		var y = Math.random()*(r.height-taille);
		img.style.left = x + "px";
		img.style.bottom = y + "px";
		img.style.zIndex = 1;
		img.style.opacity = 1;
		img.enemy = 1;
		img.timer = new Date();
		div.appendChild(img);
	monstreInline.push(img);
}
function checkAllMonstre(splash) {
	var d = new Date();
	var divScore = document.getElementById('divScore');
	var nbk = parseInt(divScore.getAttribute('kill'));
	var nbm = parseInt(divScore.getAttribute('miss'));
	var puissanceBullet = 1;
	if (t_capacity['sperm']) puissanceBullet = t_capacity['sperm'];
	var nbBullet = 0;
	for (var m=monstreInline.length-1; m>=0; m--) {
		var touche = false;
		if (splash) {
			var rm = monstreInline[m].getBoundingClientRect();
			var rs = splash.getBoundingClientRect();
			var isIntercept = (nbBullet<puissanceBullet);
			isIntercept = isIntercept && isStarted;
			isIntercept = isIntercept && (rs.top + rs.height/2)>(rm.top + rm.height*(0.5-pTouche/2))  && (rs.top + rs.height/2)<(rm.top + rm.height*(0.5+pTouche/2));
			isIntercept = isIntercept && (rs.left + rs.width/2)>(rm.left + rm.width*(0.5-pTouche/2)) && (rs.left + rs.width/2)<(rm.left + rm.width*(0.5+pTouche/2));
			if (isIntercept) {
				nbk++;
				monstreInline[m].setAttribute('src',racineImage+'monsterkilled.png');
				touche = true;
				nbBullet++;
			}
		}
		var delai = (d-monstreInline[m].timer)/1000;
		if (!touche && delai>10) {
			nbm++;
			touche = true;
		}
		if (touche) {
			dismissImg(monstreInline[m]);
			monstreInline.unset(monstreInline[m]);
		}
	}	
	divScore.setAttribute('kill',nbk);
	divScore.setAttribute('miss',nbm);
	divScore.innerHTML = "kill: "+nbk+", miss: "+nbm+" ";
	if (nbm>nbk) {
		if (!useCapacity('life')) {
			finishSplash();
		}
	}		
}
var tortue = null;
var lifeTortue = 10;
function makeTortue() {
	if (isStarted) {
		if (sonActive && sons.game_splashTortue && sons.game_splashTortue.actif) {
			if (!sons.game_splashTortue.load.paused) {
				sons.game_splashTortue.load.pause();
				sons.game_splashTortue.load.currentTime = 0;
			}
			sons.game_splashTortue.load.play();
		}
		var div = document.getElementById('divJeux');
		var r = div.getBoundingClientRect();
		var img = document.createElement('img');
			img.style.position = 'absolute';
			img.setAttribute('src',racineImage+'tortue_genial.gif');
			var taille = 20 + Math.random()*100;
			img.style.width = taille + "px";
			var x = Math.random()*(r.width-taille);
			var y = r.height-taille;
			img.style.left = x + "px";
			img.style.bottom = (-taille/10) + "px";
			img.style.zIndex = 2;
			img.style.opacity = 1;
			img.life = lifeTortue;
			img.enemy = 1;
			img.timer = new Date();
		div.appendChild(img);
		tortue = img;
	}
}
function killTortue(splash) {
	if (tortue) {
		var d = new Date();
		var divScore = document.getElementById('divScore');
		var nbk = parseInt(divScore.getAttribute('kill'));
		var nbm = parseInt(divScore.getAttribute('miss'));
		var puissanceBullet = 1;
		if (t_capacity['sperm']) puissanceBullet = t_capacity['sperm'];
		var touche = false;
		if (splash) {
			var rt = tortue.getBoundingClientRect();
			var rs = splash.getBoundingClientRect();
			var isIntercept = isStarted;
			isIntercept = isIntercept && (rs.top + rs.height/2)>(rt.top + rt.height*(0.5-pTouche/2))  && (rs.top + rs.height/2)<(rt.top + rt.height*(0.5+pTouche/2));
			isIntercept = isIntercept && (rs.left + rs.width/2)>(rt.left + rt.width*(0.5-pTouche/2)) && (rs.left + rs.width/2)<(rt.left + rt.width*(0.5+pTouche/2));
			if (isIntercept) {
				tortue.life = tortue.life-puissanceBullet;
			}
			if (tortue.life<=0) touche = true;
		}
		var delai = (d-tortue.timer)/1000;
		if (!touche && delai>10) {
			touche = true;
			if (!useCapacity('life')) {
				splashFin();
				finishSplash();
			}	
		}
		if (touche) {
			dismissImg(tortue);
			tortue = null;
		}
	}
}
function finishSplash() {
	isStarted = false;
	var divScore = document.getElementById('divScore');
	var nbk = parseInt(divScore.getAttribute('kill'));
	var nbm = parseInt(divScore.getAttribute('miss'));
	var s = nbk-nbm;
	sendScore(s);
	divEnd("Ton score : "+s);
}



// worm
function initWorm() {
	resizeCadre();
	resizeGame();
	resizeChat();
	startGameGlobal();
	var svg = creerSVG('svgGame');
	creerModelePionWorm(svg);
	creerTerrainWorm(svg);
	creerCartoucheWorm('divGame');
	var nb = gameListPlayer.list.length;
	gameListPlayer.nbPlayersLeft = nb;
	for (var p=0; p<nb; p++) {
		var gl =  gameListPlayer.list[p];
		var x = parseInt(gl.pos*nbPixW/nb + nbPixW/nb/2);
		creerPionWorm(svg,x,gl.color,gl.pid,gl.usr);
	}
	isStarted = true;
	window.addEventListener('resize', resizeJeux, false);
	//window.addEventListener('keydown', checkKey, false);
	window.addEventListener('keydown', addKey, false);
	window.addEventListener('keyup', removeKey, false);
	setTimeout(function(){listenToEventSVG();},2000);
	svg.addEventListener('click', moveToClick, false);
	svg.addEventListener('mousedown', moveBeginMouse, false);
	svg.addEventListener('mousemove', moveActionMouse, false);
	svg.addEventListener('mouseup', moveStop, false);
	svg.addEventListener('touchstart', moveBeginTouch, false);
	svg.addEventListener('touchmove', moveActionTouch, false);
	svg.addEventListener('touchend', moveStop, false);
	
}
function creerCartoucheWorm(nom) {
	var divG = document.getElementById(nom);
	var d = document.getElementById('divInfoGame');
	if (d) d.parentNode.removeChild(d);
	d = document.createElement('div');
		d.setAttribute('id','divInfoGame');
		var img = "";
		if (nom=='divGame') img = "<img src='images/roue.gif' class='imgInfoGame' />";
		var txt = "<span id='infoPlayer'>"+img+"</span>";
		var f = valueGroundWorm.vent;
		var img = 'ventNull.png';
		var fleche = "";
		if (valueGroundWorm.ventSens!=null) {
			if (valueGroundWorm.ventSens<0) {
				img = 'ventRev.png';
				fleche = " ←";
			} else {
				img = 'vent.png';
				fleche = " →";
			}
		}
		if (f!='?') f = Math.abs(f) +'km/h'+fleche;
		txt += " &nbsp; <img src='images/jeux/"+img+"' class='imgInfoGame' id='imgVent' /> <span id='infoVent'>"+f+"</span>";
		var f = valueGroundWorm.gravite;
		if (f!='?') f += 'm²/s';
		txt += " &nbsp; <img src='images/jeux/gravite.png' class='imgInfoGame' /> <span id='infoGravite'>"+f+"</span>";
		d.innerHTML = txt;
		d.setAttribute('class','divInfoGame');
		if (nom=='divGame') {
			d.style.position = 'absolute';
			d.style.zIndex = 100;
		}
	divG.insertBefore(d,divG.firstChild);
	
	if (nom=='divGame') {
		var d = document.createElement('div');
		var txt = ""
		txt += "<img src='images/jeux/BtnMoins.png' onclick='changeMovement(this)' val='-1' move='angle' class='btnActionGame' />";
		txt += "<span class='spanInfo' onclick='freezeMovement(this)' move='angle' >A=<span id='infoAngle'></span>°</span>";
		txt += "<img src='images/jeux/BtnPlus.png' onclick='changeMovement(this)' val='1' move='angle' class='btnActionGame' />";
		txt += " &nbsp; ";
		txt += "<img src='images/jeux/BtnMoins.png' onclick='changeMovement(this)' val='-1' move='power' class='btnActionGame' />";
		txt += "<span class='spanInfo' onclick='freezeMovement(this)' move='power' >P=<span id='infoPower'></span>%</span>";
		txt += "<img src='images/jeux/BtnPlus.png' onclick='changeMovement(this)' val='1' move='power' class='btnActionGame' />";
		txt += " &nbsp; ";
		txt += "<img src='images/jeux/BtnMoins.png' onclick='changeMovement(this)' val='-1' move='tank' class='btnActionGame' />";
		txt += "<span class='spanInfo' onclick='freezeMovement(this)' move='tank' >X=<span id='infoTank'>0</span>m</span>";
		txt += "<img src='images/jeux/BtnPlus.png' onclick='changeMovement(this)' val='1' move='tank' class='btnActionGame' />";
		txt += " &nbsp; ";
		txt += "<img src='images/jeux/BtnFire.png' onclick='fireWorm();' class='btnActionGame imgInfoGame' />";
		txt += " (<span id='infoTimer'></span>)";
		txt += " &nbsp; <span style='font-size:80%;'>Préc: ";
		txt += "<img src='images/jeux/BtnMoins.png' onclick='changeMovement(this)' val='-1' move='prec' class='btnActionGame' />";
		txt += "<span id='infoPrec'>5</span>";
		txt += "<img src='images/jeux/BtnPlus.png' onclick='changeMovement(this)' val='1' move='prec' class='btnActionGame' /></span>";
		txt += " &nbsp; ";
		d.innerHTML = txt;
		d.setAttribute('class','divInfoGame');
		d.style.position = 'absolute';
		d.style.bottom = 0;
		d.style.zIndex = 100;
		divG.insertBefore(d,divG.firstChild);
	}
}
function fireWorm() {
	var actif = false;
	if (gameListPlayer.list[gameListPlayer.actif]) 
		actif = gameListPlayer.list[gameListPlayer.actif].pid==playerpid;
	if (isStarted && actif) {
		if (isStarted) nextPlayer();
		isStarted = false;
	}
}

function changeMovement(elt) {
	var prec = document.getElementById('infoPrec');
	if (gameSelected=='worm') {
		var p = prec.innerHTML/1;
		var actif = false;
		if (gameListPlayer.list[gameListPlayer.actif]) 
			actif = gameListPlayer.list[gameListPlayer.actif].pid==playerpid;
		if (actif) {
			if (elt.getAttribute('move')=='angle') bougerCanon(p*elt.getAttribute('val')/1);
			if (elt.getAttribute('move')=='power') bougerPower(p*elt.getAttribute('val')/1);
			if (elt.getAttribute('move')=='tank') bougerTank(p*elt.getAttribute('val')/1);
			if (elt.getAttribute('move')=='prec') bougerPrecMouvement(elt.getAttribute('val')/1);
		}
	}
}
function bougerPrecMouvement(v) {
	var prec = document.getElementById('infoPrec');
	var p = prec.innerHTML/1 + v;
	if (p<1) p = 1;
	if (p>10) p = 10;
	prec.innerHTML = p;
}
function freezeMovement(elt) {
	if (elt.hasAttribute('freeze')) {
		elt.removeAttribute('freeze');
		elt.setAttribute('class','spanInfo');
		delete moveFreeze[elt.getAttribute('move')];
	} else {
		elt.setAttribute('freeze','1');
		elt.setAttribute('class','spanInfo spanInfoFreeze');
		moveFreeze[elt.getAttribute('move')] = 1;
	}
}
function endGameReseau() {
	var winner = null;
	var fame = "";
	var myScore = null;
	for (var i=0; i<gameListPlayer.list.length; i++) {
		var obj = document.getElementById("pion_"+gameListPlayer.list[i].pid);
		if (obj) {
			if (!obj.dead) winner = gameListPlayer.list[i];
			fame += "<div>"+getNom(gameListPlayer.list[i].usr)+" : "+obj.nbPts+"</div>";
			if (gameListPlayer.list[i].usr==myUsr) myScore = obj.nbPts;
		}
	}
	var txt = "";
	if (winner)
	txt += "<div style='margin-top:50px;font-size:150%'>"
			+ "<div style='width:50px;background-color:"+winner.color+";display:inline-block'>&nbsp;</div>"
			+ " &nbsp; " + getNom(winner.usr)+" a gagné !</div>";
	txt += "<div style='margin-top:20px;'><input type='button' value='Rejouer' onclick='replay(this);' /></div>";
	txt += "<div style='margin-top:20px;font-size:80%;'>"+fame+"</div>";
	document.getElementById('divGame').innerHTML = txt;
	if (gameScoring) {
		if (myScore!=null) sendScore(myScore);
		if (winner && winner.usr==myUsr) incPowerGameReseau();
	} else {
		document.getElementById('divGame').innerHTML += "<br>no score";
	}
}
function replay(elt) {
	elt.parentNode.innerHTML = "<img src='images/roue.gif' class='imgInfoGame' />";
	document.location.reload();
}
function incPowerGameReseau() {
	var fd = new FormData();
	fd.append('incPower',1);
	glbSendForm(fd);
}

//arena
function initArena() {
	resizeCadre();
	resizeGame();
	resizeChat();
	startGameGlobal();
	var svg = creerSVG('svgGame');
	creerModelePionArena(svg);
	creerTerrainArena(svg);
	var nb = gameListPlayer.list.length;
	gameListPlayer.nbPlayersLeft = nb;
	for (var p=0; p<nb; p++) {
		var gl =  gameListPlayer.list[p];
		var x = parseInt(gl.pos*nbPixW/nb + nbPixW/nb/2);
		var y = parseInt(gl.pos*nbPixH/nb + nbPixH/nb/2);
		creerPionArena(x,y,gl.color,gl.pid,gl.usr);
	}
	objGame = document.getElementById("pion_"+playerpid);
	isStarted = true;
	window.addEventListener('resize', resizeJeux, false);
	//window.addEventListener('keydown', checkKey, false);
	window.addEventListener('keydown', addKey, false);
	window.addEventListener('keyup', removeKey, false);
	setTimeout(function(){listenToEventSVG();},500);
	svg.addEventListener('click', moveToClick, false);
	svg.addEventListener('mousedown', moveBeginMouse, false);
	svg.addEventListener('mousemove', moveActionMouse, false);
	svg.addEventListener('mouseup', moveStop, false);
	svg.addEventListener('touchstart', moveBeginTouch, false);
	svg.addEventListener('touchmove', moveActionTouch, false);
	svg.addEventListener('touchend', moveStop, false);
	
}




