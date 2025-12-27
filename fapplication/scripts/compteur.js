

function majFap() {
	getNbFap();
	getConnexion();
	getChatMessage();
	getNetworkCall();
	getChronoTimer();
	setTimeout(function(){majFap();},delaiMajFap);
}
function getNbFap() {
	var compt = document.getElementById('divCompteurChiffre');
	if (compt.getAttribute('nb')!='0') affCompteur(compt,compt.getAttribute('nb')+"");
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {
					var nbfap = doc.getElementsByTagName('nbfap');
					if (nbfap) nbfap = nbfap[0];
					if (nbfap) {
						var usr = nbfap.getAttribute('usr');
						var date = nbfap.getAttribute('date');
						var nb = parseInt(nbfap.firstChild.nodeValue);
						majCompteur(nb);
						compt.setAttribute('date',date);
					}					
					var noms = doc.getElementsByTagName('noms');
					var txt = "";
					var l = 0;
					for (var n=0; n<noms.length; n++) {
						var usr = noms[n].getAttribute('usr');
						var fap = noms[n].getAttribute('fap');
						var nom = noms[n].firstChild.nodeValue;
						l = l + nom.length;
						if (txt!='') {
								txt = txt + " + ";
								l = l + 3;
						}
						txt = txt + "<span id='catchFap_"+usr+"' usr='"+usr+"' fap='"+fap+"' onclick='catchFap(this)' style='cursor:pointer;' >"+nom+"</span>";						
					}
					
					var catchs = doc.getElementsByTagName('catchs');
					var txt2 = "";
					var txtfin = "t'a";
					for (var c=0; c<catchs.length; c++) {
						var nom = catchs[c].firstChild.nodeValue;
						l = l + nom.length;
						if (txt2!='') {
								txt2 = txt2 + ", ";
								l = l + 2;
								txtfin = "t'ont";
						}
						txt2 = txt2 + nom;		
					}
					if (txt2!="") {
						txtfin = " " + txtfin + " attrapé !";
						l = l + txtfin.length;
						if (txt!="") {
							txt += ". ";
							l += 2;
						}
						txt += "<span style='color:#C21F7A;'>"+txt2 + txtfin+"</span>";
					}
					if (txt!="") affNoms(txt,l);
					var classe = doc.getElementsByTagName('class');
					if (classe) classe = classe[0];
					if (classe) {
						compt.setAttribute('class',classe.firstChild.nodeValue);
					}
					var catchlimit = doc.getElementsByTagName('catchlimit');
					if (catchlimit) catchlimit = catchlimit[0];
					if (catchlimit) {						
						compt.setAttribute('catchlimit',catchlimit.firstChild.nodeValue);
						compt.setAttribute('onmouseover','calcCatchLimit(this)');
						compt.setAttribute('onclick','affCatchLimit(this)');
					} else {
						compt.removeAttribute('catchlimit');
						compt.removeAttribute('onmouseover');
						compt.removeAttribute('onclick');
						var title = document.getElementById('spanCatchLimit');
						if (title) title.parentNode.removeChild(title);
					}
				}
			}
		}
	};
	url = "_getInfo.php?nbfap";
	var date = compt.getAttribute('date');
	if (date!='') url += "&date="+date;
	xhr.open("GET",url,true); 
	xhr.send(null);
}
function majCompteur(n) {
	var compt = document.getElementById('divCompteurChiffre');
	var nb = parseInt(compt.getAttribute('nb'));
	if (n>nb) incCompteur(n-nb);
	if (n<nb) {
		compt.setAttribute('nb',n);
		affCompteur();
	}
}

function incCompteur(n) {
	var pas = 1;
	if (n>100) {
		var p = parseInt(Math.log10(n))-1;
		var a = Math.pow(10,p);
		pas = a;
	}
	var compt = document.getElementById('divCompteurChiffre');
	var nb = parseInt(compt.getAttribute('nb'));
	compt.setAttribute('nb',nb+pas);
	affCompteur();
	if (n>pas) setTimeout(function(){incCompteur(n-pas);},1);
}
function affCompteur() {
	var compt = document.getElementById('divCompteurChiffre');
	var nb = compt.getAttribute('nb');
	while (compt.firstChild) compt.removeChild(compt.firstChild);
	for (var k=0; k<nb.length; k++) {
		if (k>0 && (nb.length-k)%3==0) {
			var d = document.createElement('div');
				d.setAttribute('class','sepCompteur');
				d.innerHTML = " ";
			compt.appendChild(d);
		}
		var d = document.createElement('div');
			d.setAttribute('class','chiffreCompteur');
			d.innerHTML = nb.substring(k,k+1);
		compt.appendChild(d);
	}
}

function affNoms(txt,l) {
	if (txt!='') {
		var compt = document.getElementById('divCompteurChiffre');
		var div = document.createElement('div');
			div.innerHTML = txt;
			div.style.position = 'absolute';
			div.style.zIndex = '1';
			div.style.textAlign = 'left';
			div.style.fontWeight = 'bold';
			div.style.left = (compt.getBoundingClientRect().left + 2) + "px";
			div.style.top = "0px";
			div.style.width = "0px";
			div.style.whiteSpace = "nowrap";
			div.setAttribute('w',(l+10)*12 + 22);
			compt.parentNode.insertBefore(div,compt);
		defileNoms(div,1);
	}
}
function defileNoms(div,sens) {
	div.style.width = (parseInt(div.style.width) + sens) + "px";
	div.style.left = (parseInt(div.style.left) - sens) + "px";
	if (parseInt(div.style.width)>parseInt(div.getAttribute('w'))) sens = -1;
	if (parseInt(div.style.width)>0) setTimeout(function(){ defileNoms(div,sens);},50);
	else div.parentNode.removeChild(div);
}


function catchFap(elt) {
	var usr = elt.getAttribute('usr');
	elt.removeAttribute('onclick');
	elt.style.textDecoration = 'line-through';
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				//console.log(xhr.responseText);
				if (doc) {
					var catchfap = doc.getElementsByTagName('catchfap');
					if (catchfap) catchfap = catchfap[0];
					if (catchfap) {
						elt.parentNode.removeChild(elt);
						txt = "Bravo tu as attrapé "+catchfap.firstChild.nodeValue;
						l = txt.length;
						txt = "<span style='color:#C21F7A;'>"+txt+"</span>";
						affNoms(txt,l);
						var compt = document.getElementById('divCompteurChiffre');
						gainXP(compt);
					}
					var catcherr = doc.getElementsByTagName('catcherr');
					if (catcherr) catcherr = catcherr[0];
					if (catcherr) {
						elt.parentNode.removeChild(elt);
						txt = catcherr.firstChild.nodeValue;
						l = txt.length;
						txt = "<span style='color:#C21F7A;'>"+txt+"</span>";
						affNoms(txt,l);
					}
				}
			}
		}
	};	
	var url = "_getInfo.php?catchfap="+usr+"&fap="+elt.getAttribute('fap');
	xhr.open("GET",url,true); 
	xhr.send(null);
}
function infoFap(lst) {
	txt = "";
	for (var l=0; l<lst.length; l++) {
		if (txt!="") txt += ", ";
		txt += lst[l];
	}
	if (txt!="") {
		txt = "Ton fap a été notifié à " + txt;
		l = txt.length;
		txt = "<span style='color:#C21F7A;'>"+txt+"</span>";
		affNoms(txt,l);
	}
}




function affDelai(dd) {
	var s = "";
	dd = parseInt(dd/1000);
	if (dd>3600) s += parseInt(dd/3600) + 'h ';
	dd = dd - parseInt(dd/3600)*3600;
	if (dd>60) s += parseInt(dd/60) + 'mn ';
	dd = dd - parseInt(dd/60)*60;
	if (dd>0) s += parseInt(dd) + 's ';
	return s;
}
function calcCatchLimit(elt) {
	var d = new Date();
	var dl = new Date(elt.getAttribute('catchlimit')*1000);
	var delai = affDelai(dl-d);
	if (delai!="") {
		elt.setAttribute('title',delai);
	} else {
		getNbFap();
	}
}
function affCatchLimit(elt) {
	var title = document.getElementById('spanCatchLimit');
	if (title) {
		title.parentNode.removeChild(title);
	} else {
		title = document.createElement('div');
		title.setAttribute('id','spanCatchLimit');
		title.setAttribute('class','affDelaiCatchable');
		title.style.top = elt.getBoundingClientRect().height + "px";
		title.innerHTML = elt.getAttribute("title");
		elt.parentNode.appendChild(title);
	}
}


// connexions
function getConnexion() {
	var compt = document.getElementById('divCompteurChiffre');
	if (compt.getAttribute('nb')!='0') affCompteur(compt,compt.getAttribute('nb')+"");
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {
					var connexions = doc.getElementsByTagName('connexion');
					var txt = "";
					var l = 0;
					for (var c=0; c<connexions.length; c++) {
						var usr = connexions[c].getAttribute('usr');
						var img = connexions[c].getAttribute('img');
						var nom = connexions[c].getAttribute('nom');
						var duree = connexions[c].getAttribute('duree');
						txt += "<div>";
						txt += "<img class='imgIcone' src='_getImg.php?img="+img+vGetImg+"' />";
						txt += "&nbsp;"+nom+" : "+duree+"";
						txt += "</div>";						
					}
					if (txt!='') {
						txt = "<div><i><b><u>Sur le serveur</u> :</b></i></div>" + txt;
						document.getElementById('divConnected').style.display = 'inline-block';
						document.getElementById('divConnectedList').innerHTML = txt;
					} else {
						document.getElementById('divConnected').style.display = 'none';
						document.getElementById('divConnectedList').style.display = 'none';
					}	
				}
			}
		}
	};
	var url = "_getInfo.php?connexion";
	xhr.open("GET",url,true); 
	xhr.send(null);
}

// chat
function getChatMessage() {
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {
					var chat = doc.getElementsByTagName('chat');
					if (chat) chat = chat[0];
					if (chat) {
						var mess = chat.getAttribute('message');
						var see = chat.getAttribute('see');
						if (mess!='') {
							if (see<mess) {
								ringBellBandeau();
							}
						}
					}
				}
			}
		}
	};
	var url = "_getInfo.php?chat";
	xhr.open("GET",url,true); 
	xhr.send(null);
}
function ringBellBandeau() {
	var img = document.getElementById('menuAvatar');
	var h = parseInt(getComputedStyle(img).height);
	document.body.style.position = 'relative';
	var a = document.createElement('a');
		a.setAttribute('href',"fChat-fap.php");
		a.style.position = 'absolute';
		a.style.zIndex = '1000';
		a.style.cursor = 'pointer';
		a.style.top = h*2 + 'px';
		a.style.left = '20px';
	var bell = document.createElement('img');
		bell.src = 'images/bell.gif';
		bell.style.height = h*2 + 'px';
	a.appendChild(bell);
	document.body.appendChild(a);
	if (sonActive && sons.chat && sons.chat.actif) {
		if (!sons.chat.load.paused) {
			sons.chat.load.pause();
			sons.chat.load.currentTime = 0;
		}
		sons.chat.load.play();
	}
	setTimeout(function(){bell.parentNode.removeChild(bell);},5000);
}

// jeux
function getNetworkCall() {
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {
					var txt = "";
					var networks = doc.getElementsByTagName('network');
					for (var n=0; n<networks.length; n++) {
						txt += "<div>"+networks[n].innerHTML+"</div>";
					}
					document.getElementById('divNetworkCall').innerHTML = txt;
				}
			}
		}
	};
	var url = "_getInfo.php?network";
	xhr.open("GET",url,true); 
	xhr.send(null);
}

// decompte fap
function getChronoTimer() {
	var xhr =  new XMLHttpRequest(); 
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {
					var chronos = doc.getElementsByTagName('chrono');
					for (var c=0; c<chronos.length; c++) {
						var div = document.getElementById('chronoTimer'+chronos[c].getAttribute('code'));
						if (div) {
							div.removeAttribute('init');
							div.setAttribute('delay',chronos[c].getAttribute('delay'));
						}
					}
				}
			}
		}
	};
	var url = "_getInfo.php?chrono";
	xhr.open("GET",url,true); 
	xhr.send(null);
}
function up2(i) {
	var s = i+'';
	if (s.length<2) s = '0'+s;
	return s;
}
function setChronoTimer() {
	setChronoTimerUnit('Me');
	setChronoTimerUnit('All');
	setChronoTimerUnit('Page');
}
function setChronoTimerUnit(code) {
	var chronoTimer = document.getElementById('chronoTimer'+code);
	if (chronoTimer) {
		var d = new Date().getTime();
		if (!chronoTimer.hasAttribute('init')) chronoTimer.setAttribute('init',d);
		var init = chronoTimer.getAttribute('init')/1;
		var delay = Math.round(chronoTimer.getAttribute('delay')/1 + (d-init)/1000);
		var txt = "";
		if (delay>86400) {
			var p = parseInt(delay/86400);
			txt += p + "j ";
			delay = delay - p*86400;
		}
		var p = parseInt(delay/3600);
		txt += up2(p) + ":";
		delay = delay - p*3600;
		var p = parseInt(delay/60);
		txt += up2(p) + ":";
		delay = delay - p*60;
		txt += up2(delay);
		chronoTimer.innerHTML = txt;
	}
}
var timerChrono = null;
function initChronoTimer() {
	var d = new Date().getTime();
	timerChrono = setInterval(function(){setChronoTimer();},1000);
}



	