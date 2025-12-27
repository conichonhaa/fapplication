var param = {};
	param.version = "";
	param.version = "?v="+(Math.floor(Date.now()/60000));
	// param.version = "?v=0";
	param.loading = {toLoad:0, loaded:0, error:0};
	param.cheatMode = false;
	param.serverData = {};
		param.serverData.info = {};
		param.serverData.object = {};
		param.serverData.memo = {hand:{}, appear:[], wait:{}};
	
function init() {
	addScript("modules/async.min.js", function(){param.async=true;});
	addScript("scripts/load.js", function(){initialisePage();});
	addScript("scripts/webSocket.js", function(){loadServer();});
	addScript("scripts/board.js");
	addScript("scripts/play.js");
	addScript("scripts/draw.js");
	addScript("scripts/team.js");
	addScript("scripts/param.js", function(){recupLocal();});
	addScript("scripts/audio.js", function(){initAudio();});
	
	addStyle("styles/board.css");
	addStyle("styles/load.css");
	checkReady();
}
function checkReady(callback) {
	// console.log(param.loading);
	if (param.loading.toLoad>param.loading.loaded+param.loading.error) {
		setTimeout(function(){checkReady(callback);},1000);
	} else {
		if (callback) callback(null);
	}
}
async function addScript(s, callback) {
	param.loading.toLoad++;
	var script = document.createElement('script');
		script.src = s;
		if (param.version) script.src += param.version;
	document.head.appendChild(script);
	script.addEventListener('load', function(e){
		param.loading.loaded++;
		if (callback) callback(null,e);
	}, false); 
	script.addEventListener('error', function(e){
		param.loading.error++;
	}, false); 
}
async function addStyle(s, callback) {
	param.loading.toLoad++;
	var style = document.createElement('link');
		style.href = s;
		style.setAttribute('rel','stylesheet');
		style.setAttribute('media','all');
		style.setAttribute('type','text/css');
		if (param.version) style.href += param.version;
	document.head.appendChild(style);
	style.addEventListener('load', function(e){
		param.loading.loaded++;
		if (callback) callback(null,e);
	}, false); 
	style.addEventListener('error', function(e){
		param.loading.error++;
	}, false); 
}
async function addImage(s, callback) {
	param.loading.toLoad++;
	var div = document.getElementById('divLoading');
	if (!div) {
		div = document.createElement('div');
		div.id = 'divLoading';
		div.style.display = 'none';
		document.body.appendChild(div);
	}
	var img = document.createElement('img');
		img.src = s;
	div.appendChild(img);
	img.addEventListener('load', function(e){
		param.loading.loaded++;
		if (callback) callback(null,e);
	}, false); 
	img.addEventListener('error', function(e){
		param.loading.error++;
	}, false); 
}
function HttpRequest(xhr) {
	var xhr; 
	try {  xhr = new ActiveXObject('Msxml2.XMLHTTP');   }
	catch (e) {
		try {   xhr = new ActiveXObject('Microsoft.XMLHTTP'); }
		catch (e2) {
			try {  xhr = new XMLHttpRequest();  }
			catch (e3) {  xhr = false;   }
		}
	}
	return xhr;
}
function sendRequest(url, fd, callback) {
	var xhr = HttpRequest(xhr);
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				// console.log(xhr.responseText);
				if (callback) callback(xhr.responseXML);
			}
			if(xhr.status  == 0) {
				if (callback) callback(null);
			}
		}
	};
	if (fd) {
		xhr.open("POST",url,true); 
		xhr.send(fd);
	} else {
		xhr.open("GET",url,true); 
		xhr.send(null);
	}
}
function getRequest(url, callback) {
	sendRequest(url, null, callback)
}
function postRequest(url, fd, callback) {
	sendRequest(url, fd, callback);
}
function getEltNodeValue(doc,tag) {
	var rep = null;
	if (doc) rep = doc.getElementsByTagName(tag);
	if (rep) rep = rep[0];
	if (rep) rep = rep.firstChild;
	if (rep) rep = rep.nodeValue;
	return rep;
}
async function waitFor(callback, p) {
	if (!p) p = {};
	if (!p.count) p.count = 0;
	if (!p.max) p.max = 10;
	if (!p.delay) p.delay = 2000;
	if (p.DOM) {
		var info = document.getElementById(p.DOM);
		var id = p.DOM;
	}
	if (p.param) {
		var info = p.handle[p.param];
		var id = (p.code?p.code:"")+p.param;
	}
	if (!p.launch) {
		if (!waitForId[id]) waitForId[id] = 0;
		waitForId[id]++;
		p.launch = waitForId[id];
	}
	if (p.launch==waitForId[id]) {
		p.count++;
		if (info!==undefined && info!==null) {
			callback(info);
		} else {
			if (p.count<p.max) {
				clearTimeout(timeoutId[id]);
				timeoutId[id] = setTimeout(function(){waitFor(callback, p)},p.delay);
			} else {
				if (!p.abort) callback(null);
			}
		}
	}	
}
var timeoutId = {};
var waitForId = {};
async function getDOM(id, callback) {
	waitFor(callback, {DOM:id, abort:1});
}
async function getParam(p, callback, handle, code) {
	if(!handle) handle = param;
	var pp = {handle:handle, param:p, max:20, delay:500, code:code};
	waitFor(callback, pp);
}


