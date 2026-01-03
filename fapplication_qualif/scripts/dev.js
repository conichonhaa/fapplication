
function devOff() {
	document.location.replace(document.location.href.split('?')[0]+"?modedev=off");
}
function devOn() {
	document.location.replace(document.location.href.split('?')[0]+"?modedev=on");
}
function devChange(elt) {
	document.location.replace(document.location.href.split('?')[0]+"?modedev="+elt.value);
}

function recupFile(elt) {
	var sel = document.getElementById(elt.getAttribute('file'));
	var type = sel.getAttribute('t');
	var form = document.createElement('form');
		form.setAttribute('method','post');
		form.style.display = 'none';
		form.setAttribute('target','_blank');
	var input = document.createElement('input');
		input.setAttribute('name','recup');
		form.appendChild(input);
	var input = document.createElement('input');
		input.setAttribute('name',type);
		input.setAttribute('value',sel.value);
		form.appendChild(input);
	document.body.appendChild(form);
	form.submit();
}

// param mail
function changeServerMail(elt) {
	var span = document.getElementById('adresseMail');
	span.innerHTML = elt.options[elt.selectedIndex].getAttribute('add');
	glbSendPost(elt);
}


// node debug
function makeDelaiU(d,c,u) {
	var aff = "";
	if (d>=c*1000) {
		var q = parseInt(d/c/1000);
		aff = q + u;
		d = d - q*c*1000;
	}
	return [d,aff];
}
function makeDelai(d) {
	var aff = "";
	var s = "";
	[d,s] = makeDelaiU(d,24*3600,"j");
	aff += s;
	[d,s] = makeDelaiU(d,3600,"h");
	aff += s;
	[d,s] = makeDelaiU(d,60,"mn");
	aff += s;
	[d,s] = makeDelaiU(d,1,"s");
	aff += s;
	if (aff=="") aff = "now";
	return aff;
}
function getPageName(app) {
	var ori = app.split('://');
	if (ori.length>1) {
		var p = ori[1].split('/');
		var chem = "";
		for (var i=1; i<p.length-1; i++) {
			chem += "/"+p[i];
		}
	} else {
		var p = [app,app];
		var chem = "";
	}
	return [p[0],chem,p[p.length-1]];
}
var connection = null;
function initNodeDebug() {
	"use strict";
	var info = document.getElementById('nodeInfo');
	var conns = document.getElementById('nodeConnections');
	var vars = document.getElementById('nodeVars');
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	if (!window.WebSocket) {
		info.innerHTML = "Désolé, ton navigateur ne supporte pas les WebSockets";
	}
	var s='';
	if (document.location.protocol=='https:') s = 's';
	//connection = new WebSocket('ws'+s+'://'+document.location.hostname+':'+wsPort);
	connection = new WebSocket('ws'+s+'://'+document.location.hostname+'/wss');
	connection.onopen = function () {
		info.innerHTML = "server on";
		connection.send(JSON.stringify(wsUserConn));
		setTimeout(function(){getNodeDebug();},1000);
	};
	connection.onerror = function (error) {
		info.innerHTML = "server error";
	};
	connection.onmessage = function (message) {
		try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log("'This doesn't look like a valid JSON: ", message.data);
            return;
        }
		if (json.type=='debug') {
			var txt = "";
			var serv = {};
			info.innerHTML = "server on : "+json.data.date+" ("+makeDelai(json.data.time)+")";
			for (var app in json.data.conns) {
				var [s,c,p] = getPageName(app);
				if (c!="") c = "["+c+"] ";
				if (!(s in serv)) serv[s] = [];
				serv[s].push([c+p+" ("+json.data.conns[app].tot+")",json.data.conns[app].list]);
			}
			for (var s in serv) {
				var c = json.data.conns[i];
				txt += "<div><b>"+s+"</b></div>";
				for (var i=0; i<serv[s].length; i++) {
					txt += "<div style='margin-left:10px;'> → "+serv[s][i][0]+"</div>";
					txt += "<div style='margin-left:50px;font-style:italic;'>";
					for (var u=0; u<serv[s][i][1].length; u++) {
						txt += "<div>";
						var nom = serv[s][i][1][u].usr;
						if (serv[s][i][1][u].fap) {
							var d = document.getElementById('usrNom_'+nom);
							if (d) nom = d.innerHTML;
						}
						txt += nom+" : ";
						txt += "connecté="+makeDelai(serv[s][i][1][u].time);
						txt += "&nbsp;&nbsp;/&nbsp;&nbsp;activité="+makeDelai(serv[s][i][1][u].actu);
						txt += "</div>";
					}
					txt += "</div>";
				}
			}
			conns.innerHTML = txt;
		}
		
		if (json.type=='debugVar') {
			if (vars) {
				var txt = "<div><b>Variables</b></div>";
				for (var v in json.data) {
					txt += "<div>"+v+" : ";
					for (var p in json.data[v]) {
						var aff = json.data[v][p];
						if (p=='time') aff = makeDelai(aff);
						txt += p+"="+aff+"&nbsp;&nbsp;&nbsp;&nbsp;";
					}
					txt += "</div>";
				}
				vars.innerHTML = txt;
			}
		}
    };
}
function getNodeDebug() {
	if (connection) connection.send(JSON.stringify({type:'debug'}));
}
function setActuAutoNode(elt) {
	if (elt.checked) timerActuAutoNode = setTimeout(function(){actuAutoNode();},0);
	else clearTimeout(timerActuAutoNode);
}
var timerActuAutoNode = null;
function actuAutoNode() {
	clearTimeout(timerActuAutoNode);
	getNodeDebug();
	timerActuAutoNode = setTimeout(function(){actuAutoNode();},5000);

}	
	
	

