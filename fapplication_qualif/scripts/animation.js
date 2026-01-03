


function ouvreParam(elt) {
	var div = document.getElementById(elt.getAttribute('div'));
	var fleche = document.getElementById(elt.getAttribute('fleche'));
	if (div.style.display=='block') {
		div.style.display='none';
		fleche.innerHTML='▼';
	} else {
		div.style.display='block';
		fleche.innerHTML='▲';
	}
}

function initImg(img,rect) {
	img.style.left = rect.left + document.body.scrollLeft + "px";
	img.style.top = rect.top + document.body.scrollTop + "px";
	img.style.position = "absolute";
}
function jumpImg(img,h,v) {
	img.style.left = parseInt(img.style.left)+h + "px";
	img.style.top = parseInt(img.style.top)+v + "px";
}
function moveImg(img,h,v,dh,dv,delai) {
	if (Math.abs(h)>0 || Math.abs(v)>0) {
		if (Math.abs(h)<Math.abs(dh)) dh = h;
		if (Math.abs(v)<Math.abs(dv)) dv = v;
		jumpImg(img,dh,dv);
		h = h - dh;
		v = v - dv;
		setTimeout(function() {moveImg(img,h,v,dh,dv,delai);},delai);
	}
}
	
function initFunkyBite(delai) {
	var modele = document.getElementById('funkybite');
	if (modele && !animationInitiale) {
		setTimeout(function() {funkyBite(modele);},delai*1000);
		setTimeout(function() {initFunkyBite(delai);},delai*1000);
	}
}
function funkyBite(modele) {
	if (sonActive && sons.phallus && sons.phallus.actif) {
		if (!sons.phallus.load.paused) {
			sons.phallus.load.pause();
			sons.phallus.load.currentTime = 0;
		}
		sons.phallus.load.play();
	}
	var img = modele.cloneNode();
	var rect = modele.getBoundingClientRect();
	initImg(img,rect);
	document.body.appendChild(img);
	document.body.insertBefore(img,document.body.firstChild);
	var sens = Math.random()*2 - 1;
	sens = sens/Math.abs(sens);
	img.setAttribute('x',sens);
	var sens = Math.random()*2 - 1;
	sens = sens/Math.abs(sens);
	img.setAttribute('y',sens);
	danseImg(img,20);
}
function danseImg(img,delai) {
	var rect = img.getBoundingClientRect();
	var x = parseInt(img.getAttribute('x'));
	var y = parseInt(img.getAttribute('y'));
	if (rect.left<0) x = 1;
	if (rect.top<0) y = 1;
	if (rect.left+rect.width+23>window.innerWidth) x = -1;
	if (rect.top+rect.height+23>window.innerHeight) y = -1;
	img.setAttribute('x',x);
	img.setAttribute('y',y);
	jumpImg(img,x*parseInt(Math.random()*3+1),y*parseInt(Math.random()*3+1));
	setTimeout(function() {danseImg(img,delai);},delai);
}


function test(img) {
	var rect = img.getBoundingClientRect();
	initImg(img,rect);
	moveImg(img,100,0,1,0,20);
}
function changeImg(img,etat) {
	if (etat=='run') {
		var e = 'Mad';
		if (parseInt(img.getAttribute('pos'))==parseInt(img.style.left)) e = 'Sleep';
		img.setAttribute('src','images/snail'+e+'.gif');
	}
	if (etat=='fin') {
		var win = img.getAttribute('win');
		img.setAttribute('src','images/snail'+win+'.gif');
		if (img.hasAttribute('me') || img.hasAttribute('sans')) {
			if (img.hasAttribute('me')) var mf = 'snail_'+win.toLowerCase();
			if (img.hasAttribute('sans')) var mf = 'snail_unknown';
			if (sonActive && sons[mf] &&  sons[mf].actif) {
				if (sons.snail_run) sons.snail_run.load.pause();
				sons[mf].load.play();
			}	
		}
		
	}
}
function resetSonSnail() {
	for (var son in sons) {
		if (son.split('_')[0]=='snail') {
			sons[son].load.pause();
			sons[son].load.currentTime = 0;
		}
	}
}
function videSnail() {
	runActive = 0;
	resetSonSnail();
	document.getElementById('messageCourseEscargot').innerHTML="";
	var ce = document.getElementById('courseEscargotCircuit');
	while (ce.firstChild) ce.removeChild(ce.firstChild);
	for (var l=0; l<imgSnail.length; l++) {
		if (imgSnail[l].parentNode) imgSnail[l].parentNode.removeChild(imgSnail[l]);
	}
	imgSnail = [];
	var ce = document.getElementById('courseEscargot');
	var c = ce.firstChild;
	while (c) {
		if (c.hasAttribute('snail')) {
			var s = c.getAttribute('snail');
			var modele = document.getElementById(s);
			if (modele) modele.style.visibility = 'visible';
			var span = document.getElementById(modele.getAttribute('id')+'info');
			if (span) {
				span.innerHTML = "";
				span.setAttribute('nb','-1');
			}
		}
		c = c.nextSibling;
	}
}
var runActive = 0;
var runSound = null;
var imgSnail = [];
function initImgRel(img,modele) {
	var rect = modele.getBoundingClientRect();
	var rectP = modele.parentNode.getBoundingClientRect();
	modele.parentNode.style.position = 'relative';
	img.style.left = rect.left-rectP.left + "px";
	img.style.top = rect.top-rectP.top + "px";
	img.style.position = "absolute";
}
function initSnail() {
	runActive = 1;
	if (sonActive && sons.snail_run &&  sons.snail_run.actif) {
		if (sons.snail_wait) sons.snail_wait.load.pause();
		sons.snail_run.load.play();
	}
	document.getElementById('messageCourseEscargot').innerHTML="Go";
	var ce = document.getElementById('courseEscargot');
	var c = ce.firstChild;
	while (c) {
		if (c.hasAttribute('snail')) {
			var s = c.getAttribute('snail');
			var modele = document.getElementById(s);
			if (modele) {
				changeInfo(modele);
				var img = modele.cloneNode();
				imgSnail.push(img);
				var rect = modele.getBoundingClientRect();
				initImgRel(img,modele);
				img.setAttribute('src','images/snailMad.gif');
				modele.parentNode.appendChild(img);
				modele.style.visibility = 'hidden';
				runStep(img);
			}
		}
		c = c.nextSibling;
	}
}
var coeffRunSnail = 10;
var nbstep = 0;
function runSnail() {
	videSnail();
	if (sonActive && sons.snail_run &&  sons.snail_run.actif) {
		sons.snail_wait.load.play();
	}
	var ce = document.getElementById('courseEscargot');
	var max = parseInt(ce.getAttribute('max'));
	coeffRunSnail = parseInt(0.9*(ce.getBoundingClientRect().width)/max);
	nbstep = parseInt(ce.getAttribute('nbstep'));
	document.getElementById('courseEscargot');
	document.getElementById('messageCourseEscargot').innerHTML="Ready";
	setTimeout(function(){document.getElementById('messageCourseEscargot').innerHTML="Steady";},2600);
	setTimeout(function(){initSnail();},5200);
}
function runStep(img) {	
	if (runActive) {
		var step = img.getAttribute('step');
		var l = step.split(";");
		document.getElementById('messageCourseEscargot').innerHTML="Go "+parseInt(100*(nbstep-l.length)/nbstep)+"%";
		var m = parseInt(l.shift());
		img.setAttribute('pos',parseInt(img.style.left));
		for (var i=0; i<m; i++) {
			setTimeout(function() {moveImg(img,coeffRunSnail,0,1,0,20);},i*100);
			setTimeout(function() {changeInfo(img);},i*100);
		}
		img.setAttribute('step',l.join(";"));	
		setTimeout(function(){changeImg(img,'run');},50);
		if (l.length>0) setTimeout(function(){runStep(img);},2000);
		else setTimeout(function(){
				changeImg(img,'fin');
				var mess = document.getElementById('messageCourseEscargot');
				mess.innerHTML="Finish";
				tryGainXP(mess,'daily-snail');
			},4000);
	}
}
function changeInfo(img) {
	var id = img.getAttribute('id');
	var span = document.getElementById(id+'info');
	if (span) {
		var nb = parseInt(span.getAttribute('nb'))+1;
		span.setAttribute('nb',nb);
		if (bestMonth==myUsr) span.innerHTML = " : "+nb;
	}
}






