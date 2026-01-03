
function makeImg(img) {
	return ;
}	

function getDefiFap(usr) {
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				if (doc) {
					var defifap = doc.getElementsByTagName('defifap');
					if (defifap) defifap = defifap[0];
					if (defifap) {
						//console.log(defifap);
						var txt = defifap.getAttribute('nom') + "&nbsp;";
						txt += "<img src='_getImg.php?img="+defifap.getAttribute('img')+vGetImg+"' class='imgIcone2 click' onclick='changeDefi()' />";
						document.getElementById('nbUsrFaps').innerHTML = txt;
						contest.visiteur = defifap.getAttribute('nb')
						contest.commentaire = defifap.firstChild.nodeValue;
					}					
				}
			}
		}
	};
	url = "_getInfo.php?defifap";
	if (usr) url += "="+usr;
	xhr.open("GET",url,true); 
	xhr.send(null);
}


var contest = {visiteur:null, fap:null};
function actualiseDefi() {
	makeCompteur(); 
	getDefiFap();
}
function rejouer(usr) {
	contest.visiteur = null;
	document.getElementById('nbUsrFaps').innerHTML = "<img src='images/roue.gif' class='imgIcone2' />";
	document.getElementById('defiCommentaire').innerHTML = "";
	getDefiFap(usr);
	initCompteur();
}
function setContest() {
	if (contest.visiteur==null) setTimeout(function(){setContest();},1000);
	else {
		var r = document.getElementById('rectVar');
		if (r.hasAttribute('init')) r.removeAttribute('init');
		setTimeout(function(){
			bougeCompteur(contest.visiteur);
			var txt = contest.commentaire;
			txt += "<br><input type='button' value='Rejouer' onclick='rejouer();' />";
			document.getElementById('defiCommentaire').innerHTML = txt;	
		},1000);	
	}	
}		

var ns = "http://www.w3.org/2000/svg";
var xref="http://www.w3.org/1999/xlink";
function initSVG() {
	var svg = document.getElementById('svgCompteur');
	if (svg) svg.parentNode.removeChild(svg);
	var divG = document.getElementById('divGraph');
	var svg = document.createElementNS(ns,'svg');
	svg.setAttribute('id','svgCompteur');
	svg.setAttribute('xmlns',ns);
	svg.setAttribute('xmlns:xlink',xref);
	svg.setAttribute('version','1.1');
	svg.setAttribute('preserveAspectRatio','none');
	divG.appendChild(svg);	
	var rect = divG.getBoundingClientRect();
	var ratio = parseFloat(divG.getAttribute('ratio'));	
	svg.setAttribute('width',rect.width);
	svg.setAttribute('height',rect.width/ratio);
	svg.setAttribute('width','100%');
	svg.setAttribute('height','100%');
	svg.style.position = 'relative';	
	return svg;
}
function makeCompteur() {
	var svg = initSVG();
	var vb = "-50 -44 100 47";
	svg.setAttribute('viewBox',vb);
	var defs = document.createElementNS(ns,'defs');
	svg.appendChild(defs);
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cutBottom');
		defs.appendChild(cp);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('x',-50);
		r.setAttribute('y',-50);
		r.setAttribute('width',100);
		r.setAttribute('height',50);
		cp.appendChild(r);
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','cutVar');
		cp.setAttribute('clip-path','url(#cutBottom)');
		defs.appendChild(cp);	
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('id','rectVar');
		r.setAttribute('x',-50);
		r.setAttribute('y',-50);
		r.setAttribute('width',100);
		r.setAttribute('height',50);
		r.setAttribute('transform','rotate(90)');
		cp.appendChild(r);
		

	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',42);
		c.setAttribute('stroke',"#36781D");
		c.setAttribute('fill',"#6AE83A");
		c.setAttribute('stroke-width',2);
		c.setAttribute('clip-path','url(#cutBottom)');
	svg.appendChild(c);	
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',42);
		c.setAttribute('stroke',"#871717");
		c.setAttribute('fill',"#D62424");
		c.setAttribute('stroke-width',2);
		c.setAttribute('clip-path','url(#cutVar)');
	svg.appendChild(c);
	
	var g = document.createElementNS(ns,'g');	
		g.setAttribute('stroke-width',0.5);
		g.setAttribute('stroke',"#454444");
		g.setAttribute('fill',"none");
		svg.appendChild(g);
	var r = document.createElementNS(ns,'path');
		r.setAttribute('d','M -43,0 0,0 Z');
		r.setAttribute('stroke',"#36781D");
		g.appendChild(r);
	var r = document.createElementNS(ns,'path');
		r.setAttribute('d','M 0,0 43,0 Z');
		r.setAttribute('stroke',"#871717");
		g.appendChild(r);	
	
	var g = document.createElementNS(ns,'g');	
		g.setAttribute('id','pin');
		g.setAttribute('stroke-width',1);
		//g.setAttribute('stroke-linejoin','round');
		g.setAttribute('stroke',"#292828");
		g.setAttribute('fill',"#454444");
		var r = document.createElementNS(ns,'path');
		r.setAttribute('d','M 0,0 -41,0 Z');
		g.appendChild(r);
		var r = document.createElementNS(ns,'path');
		r.setAttribute('d','M -37,2 -41,0 -37,-2 Z');
		g.appendChild(r);
		var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',0);
		c.setAttribute('cy',0);
		c.setAttribute('r',2);
		g.appendChild(c);
		g.setAttribute('transform','rotate(90)');
	svg.appendChild(g);
	
	
	initCompteur();
}
function bougeCompteur(deg) {
	var r = document.getElementById('rectVar');
	r.setAttribute('angle',deg);
	var rot = parseInt(r.getAttribute('transform').split('rotate(')[1].split(')')[0]);
	r.setAttribute('rot',rot);
	if (deg!=rot) {
		var sens = (deg-rot)/Math.abs(deg-rot);
		r.setAttribute('sens',sens);
		incCompteur();
	}
}
function incCompteur() {
	var r = document.getElementById('rectVar');
	var deg = parseInt(r.getAttribute('angle'));
	var rot = parseFloat(r.getAttribute('rot'));
	var sens = parseInt(r.getAttribute('sens'));
	var rot = rot + sens;
	r.setAttribute('rot',rot);
	r.setAttribute('transform','rotate('+rot+')');
	var pin = document.getElementById('pin');
	pin.setAttribute('transform','rotate('+rot+')');
	if (sens>0 && deg>rot) setTimeout(function(){incCompteur();},10);
	else if (sens<0 && deg<rot) setTimeout(function(){incCompteur();},10);
	else if (r.hasAttribute('init')) initCompteur();
}
function initCompteur() {
	var r = document.getElementById('rectVar');
	var decP = Math.random()*60+110;
	var decM = Math.random()*60+10;
	if (!r.hasAttribute('init')) r.setAttribute('init',decP);
	var init = parseInt(r.getAttribute('init'));
	setTimeout(function(){bougeCompteur(init);},200);
	if (init>90) r.setAttribute('init',decM);
	if (init<90) r.setAttribute('init',90);
	if (init==90) {
		r.removeAttribute('init');
		setContest();
	}
}	

function changeDefi() {
	var liste = document.getElementById('listeDefi');
	if (liste) {
		document.getElementById('nbUsrFaps').innerHTML = liste.innerHTML;
	} else {
		alert("Désolé, seul le fappeur du mois peut choisir son concurrent.");
	}
}

	

