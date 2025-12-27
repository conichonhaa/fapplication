var sonCharge = {};
var sonPage = null;

// window.addEventListener('mousemove',playMusiquePageGesture,false);
// window.addEventListener('touchstart',playMusiquePageGesture,false);
function playMusiquePageGesture() {
	if (!sonPage) {
		initMusique();
		sonPage = true;
	}
}
function loadMusique() {
	for (var son in sons) {
		sons[son].load = new Audio(sonRacine+sons[son].wave);
	}
	initMusique();
}
function initMusique() {
	for (var son in sons) {
		sons[son].load.volume = sonVolume;
	}
	if (sons.page) {
		sons.page.load.volume = sonPageCoeff*sonVolume;
		if (sonActive && sons.page.actif) {
			if (sons.page.load.paused) {
				if (sons.page.load.play()) sonPage=true;	
			}
		} else {
			sons.page.load.pause();
		}
	}
	if (typeof sonFond != "undefined") {
		if (sonActive && sonFond.actif) {
			if (sons.page.load.paused) sonFond.load.play();	
		} else {
			sonFond.load.pause();
			// sonFond.load.currentTime = 0;
		}
	}
}
function affecteSon(elt) {
	var id = elt.getAttribute('id');
	if (id=='sonActiveCB') {
		sonActive = elt.checked;
		var img = document.getElementById('sonActiveImg');
		//console.log(img);
		if (img) {
			if (sonActive) var etat = 'On';
			else var etat = 'Off';
			img.setAttribute('val',sonActive);
			img.src = 'images/note'+etat+'.png';
			img.setAttribute('etat',etat);
		}
	}
	else if (id=='sonVolume') sonVolume = elt.value/100;
	else if (sons[id]) sons[id].actif=elt.checked;
	if (elt.type=='range') {
		document.getElementById(elt.getAttribute('aff')).innerHTML = elt.value;
	}
	initMusique();
}
function allumeSon(elt) {
	var etat = elt.getAttribute('etat');
	if (etat=='Off') {
		sonActive = 1;
		etat = 'On';
	} else {
		sonActive = 0;
		etat = 'Off';
	}
	elt.setAttribute('val',sonActive);
	elt.src = 'images/note'+etat+'.png';
	elt.setAttribute('etat',etat);
	glbSendPost(elt);
	initMusique();
	var cb = document.getElementById('sonActiveCB');
	if (cb) {
		cb.checked = sonActive;
		affDiv(cb);
	}
	var img = document.getElementById("playSonAdmin_0");
	if (img) {
		affPlaySonAdmin();
	}
	
}
function affSnailNbJour(elt) {
	var input = document.getElementById('snailRunPeriode');
	if (elt.value=='custom') {
		input.style.display = 'inline';
		input.disabled = false;
	} else {
		input.style.display = 'none';
		input.disabled = true;
	}
}


function affDiv(elt) {
	var div = document.getElementById(elt.getAttribute('div'));
	var img = document.getElementById('pm_'+elt.getAttribute('div'));
	if (div) {
		if (div.style.display=='none') {
			div.style.display = 'block';
			if (img) img.src = 'images/moins.png';
		} else {
			div.style.display = 'none';
			if (img) img.src = 'images/plus.png';
		}
	}
}
function affDivComp(elt) {
	var div = document.getElementById(elt.getAttribute('div'));
	if (div) {
		div.style.display = 'block';
		elt.parentNode.style.display = 'none';
	}
}
function affElt(elt) {
	var elem = document.getElementById(elt.getAttribute('elem'));
	if (elem) {
		if (elem.style.display=='none') elem.style.display = '';
		else elem.style.display = 'none';
	}
}

function glbSendPost(elt,force) {
	var rep = true;
	if (elt.hasAttribute('message')) rep = confirm(message);
	if (rep) {
		if (force) {
			var img = document.createElement('img');
				img.setAttribute('src','images/roue.gif');
				img.style.width = '20px';
				elt.parentNode.insertBefore(img,elt.nextSibling);
		}
		//var val = elt.getAttribute('value');
		var val = elt.value;
		if (elt.hasAttribute('type') && elt.getAttribute('type').toLowerCase()=='checkbox') {
			if (elt.checked) val = '1';
			else val = '0';
		}
		if (elt.hasAttribute('val')) val = elt.getAttribute('val');
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange  = function() { 
			if(xhr.readyState  == 4) {
				if(xhr.status  == 200) {
					var doc = xhr.responseXML;
					// console.log(xhr.responseText);
					if (doc) {										
						var reload = doc.getElementsByTagName('reload')[0];
						if (reload || force) {
							var url = document.location.href;
							document.location.replace(url);
						}
						if (elt.hasAttribute('action')) {
							setTimeout(elt.getAttribute('action'),0);
						}
						var action = doc.getElementsByTagName('action')[0];
						if (action && action.firstChild) {
							setTimeout(action.firstChild.nodeValue,0);
						}
					}
				}
			}
		};
		fd = new FormData();
		fd.append(elt.getAttribute('id'), val);
		if (elt.hasAttribute('name')) fd.append(elt.getAttribute('name'), val);
		url = "_setParam.php";
		xhr.open("POST",url,true); 
		xhr.send(fd);		
	}
}
function glbSendForm(fd) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {										
					var action = doc.getElementsByTagName('action')[0];
					if (action && action.firstChild) {
						setTimeout(action.firstChild.nodeValue,0);
					}
				}
			}
		}
	};
	url = "_setParam.php";
	xhr.open("POST",url,true); 
	xhr.send(fd);		
}

function memoFiltre(elt) {
	fd = new FormData();
	fd.append('memoFiltre', elt.getAttribute('div'));
	fd.append('affiche',document.getElementById(elt.getAttribute('div')).style.display!='none');
	glbSendForm(fd);
}

function setMailConf(usr,email) {
	fd = new FormData();
	fd.append('usr', usr);
	fd.append('email', email);
	glbSendForm(fd);
}

function getBestRatio(elt) {
	var rect = elt.getBoundingClientRect();
	var offsetY = window.pageYOffset || document.documentElement.scrollTop;
	return (rect.width)/(window.innerHeight-(rect.top+offsetY)*1.8);
}

function reloadOption(elt) {
	elt.disabled = true;
	var img = document.createElement('img');
		img.setAttribute('src','images/roue.gif');
		img.setAttribute('class','imgIcone');
		elt.parentNode.insertBefore(img,elt.nextSibling); 
	document.location.reload();
}	


// FULL SCREEN
document.addEventListener('fullscreenchange',fullScreenChange, false);
document.addEventListener('mozfullscreenchange',fullScreenChange, false);
document.addEventListener('webkitfullscreenchange',fullScreenChange, false);
document.addEventListener('msfullscreenchange',fullScreenChange, false);
function fullScreenChange(ev){
	var isfull = false;
	var elem = ev.target
	if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.isFullScreen) {
		isfull = true;
	}
	if (elem.hasAttribute('init')) setTimeout(elem.getAttribute('init'),0);
	if (!isfull) {
		
	}
}
function sendToFull(elt) {
	var elem = document.getElementById(elt.getAttribute('elem'));
	if (elem) {
		elem.style.width = '100%';
		elem.style.height = '100%';
		requestFullScreen(elem);	
	}
}
function requestFullScreen(elem){
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    }
	
}



// ELT CENTRE
function affImgCentre(id) {
	var img = document.createElement('img');
		img.style.width = '100%';
		img.style.margin = 'auto';
		img.style.objectFit = 'contain';
		img.style.minWidth = '100%';
		img.style.maxWidth = '100%';
		img.style.maxHeight = '100%';
		img.setAttribute('src','_getImg.php?img='+id+vGetImg);
	affEltCentre(img);	
}	
function affEltCentre(elt) {
	var div = document.createElement('div');
		div.style.position = 'absolute';
		div.setAttribute('id','divPhotoFond');
		div.style.left = 0;
		div.style.top = 0;
		div.style.right = 0;
		div.style.height = $(document).height() + 'px';
		div.style.backgroundColor = '#222222';
		div.style.opacity = 0.8;
		div.style.zIndex = 10;
		div.style.cursor = 'pointer';
		div.setAttribute('onclick','closePhoto(this)');
	document.body.appendChild(div);
	var offsetY = window.pageYOffset || document.documentElement.scrollTop;
	var div = document.createElement('div');
		div.style.position = 'absolute';
		div.setAttribute('id','divPhoto');
		div.style.left = 0;
		div.style.right = 0;
		div.style.top = offsetY + 'px';
		div.style.height = window.innerHeight + 'px';
		div.style.margin = 'auto';
		div.style.textAlign = 'center';
		div.style.verticalAlign = 'middle';
		div.style.display = 'flex';
		div.style.flexDirection = 'column';
		div.style.justifyContent = 'center';
		div.style.zIndex = 12;
		div.style.cursor = 'pointer';
		div.setAttribute('onclick','closePhoto(this)');
	document.body.appendChild(div);
	
	var divint = document.createElement('div');
		divint.style.width = '100%';
		divint.style.height = '90%';
		divint.style.margin = 'auto';
		divint.style.textAlign = 'center';
		divint.style.verticalAlign = 'middle';
		divint.style.display = 'flex';
		divint.style.flexDirection = 'column';
		divint.style.justifyContent = 'center';
		div.appendChild(divint);
	if (elt) {
		divint.appendChild(elt);
	} else {
		var img = document.createElement('img');
		img.style.width = '200px';
		img.style.height = '200px';
		img.style.margin = 'auto';
		img.style.objectFit = 'contain';
		img.setAttribute('src','images/roue.gif');
		divint.appendChild(img);
	}
	document.body.style.overflow = 'hidden';
	return divint;
}
function closePhoto() {
	var div = document.getElementById('divPhotoFond');
	if (div) div.parentNode.removeChild(div);
	var div = document.getElementById('divPhoto');
	if (div) div.parentNode.removeChild(div);
	document.body.style.overflow = 'auto';
}

window.addEventListener('touchstart',affTitleInfo,false);
var divTitleInfo = null;
function affTitleInfo(ev) {
	hideTitleInfo();
	var elt = ev.target;
	if (elt.hasAttribute('title') && !elt.hasAttribute('onclick')) {
		var title = elt.getAttribute('title');
		var rect = elt.getBoundingClientRect();
		var offsetY = window.pageYOffset || document.documentElement.scrollTop;
		var offsetX = window.pageXOffset || document.documentElement.scrollLeft;
		var d = document.createElement('div');
			d.style.position = 'absolute';
			d.style.left = rect.left + offsetX + 'px';
			d.style.top = rect.top + offsetY + 'px';
			d.style.zIndex = 10000;
			d.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
			d.innerHTML = title;
		document.body.appendChild(d);
		divTitleInfo = d;
	}
}
function hideTitleInfo() {
	if (divTitleInfo) {
		divTitleInfo.parentNode.removeChild(divTitleInfo);
		divTitleInfo = null;
	}
}


function hideElements(elt,action) {
	if (!action) action = 'hide';
	var code = elt.getAttribute('code');
	var balise = elt.getAttribute('balise');
	var colls = document.getElementsByTagName(balise);
	for (var c=0; c<colls.length; c++) {
		var id = colls[c].getAttribute('id');
		if (id) {
			console.log(id);
			var deb = id.split('_')[0];
			if (deb==code) {
				if (action=='destroy') colls[c].parentNode.removeChild(colls[c]);
				if (action=='hide') colls[c].style.display = 'none';
				if (action=='disable') {
					colls[c].style.opacity = '0.1';
					colls[c].style.disabled = true;
					colls[c].removeAttribute('onclick');
				}
			}
		}
	}
}


// gain xp
var dataGainXp = {};
dataGainXp.delay = 200;
dataGainXp.interval = 20;
dataGainXp.max = 100;
function tryGainXP(obj,code,max) {
	dataGainXp.obj = obj;
	var fd = new FormData();
	fd.append('gainXP',code);
	if (max) fd.append('max',max);
	glbSendForm(fd);
}
function gainXP(obj) {
	if (!obj) obj = dataGainXp.obj;
	var rect = obj.getBoundingClientRect();
	var img = document.createElement('img');
		img.setAttribute('src','images/xp.png');
		img.style.position = 'absolute';
		img.style.left = (rect.left+rect.right)/2 + 'px';
		img.style.top = (rect.top+rect.bottom)/2 + 'px';
		img.style.width = 'auto';
		img.style.height = '0px';
		img.style.opacity = 1;
		img.style.zIndex = 1000;
	document.body.appendChild(img);
	zoomImg(img,dataGainXp.max);
}
function zoomImg(img,max) {
	var h = parseInt(img.style.height);
	if (h<max) {
		img.style.height = (h + 2) + 'px';
		img.style.left = (parseInt(img.style.left) - 1) + 'px';
		img.style.top = (parseInt(img.style.top) - 1) + 'px';
		setTimeout(function(){zoomImg(img,max);},dataGainXp.interval);
	} else {
		setTimeout(function(){hideImg(img);},dataGainXp.delay);
	}
}
function hideImg(img) {
	var o = img.style.opacity;
	if (o>0) {
		img.style.opacity = o - 0.01;
		setTimeout(function(){hideImg(img);},dataGainXp.interval);
	} else {
		img.parentNode.removeChild(img);
	}
}


