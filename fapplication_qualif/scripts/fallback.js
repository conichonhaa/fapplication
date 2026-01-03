
function getInfoFap() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				//console.log(xhr.responseText);
				if (doc) {										
					var info = doc.getElementsByTagName('info')[0];
					if (info) {
						var att = info.attributes;
						for (var i=0; i<att.length; i++) {
							localStorage.setItem(att[i].name,att[i].value);
						}
					}	
				}
			}
		}
	};
	url = "_getInfo.php?fallback";
	xhr.open("GET",url,true); 
	xhr.send(null);		
}
function up2(i) {
	var s = i+'';
	if (s.length<2) s = '0'+s;
	return s;
}
function dateJ(d) {
	return up2(d.getDate())+"/"+up2(d.getMonth()+1);
}
function getFapLocal() {
	var offline = document.getElementById('offline');
	var nbOff = 0;
	var nb = localStorage.length;
	var d = new Date();
	for (var i=localStorage.length; i>0; i--)   {
		var clef = localStorage.key(i-1);
		var deb = clef.split('_')[0];
		if (deb=='fap') {
			var f = JSON.parse(localStorage.getItem(clef));
			if (f.usr==usrLocal) {
				if (offline) {
					var date = "";
					if (f.date.y==d.getFullYear()) {
						if (f.date.j==dateJ(d)) date = "auj.";
						else date = f.date.j;
					} else {
						date = f.date.j+"/"+f.date.y;
					}
					date += " "+f.date.h;	
					var txt = date;
					txt += " : <span style='font-style:italic;font-size:80%;'>"+toDMS(f.latitude,['S','N']);
					txt += ' '+toDMS(f.longitude,['W','E'])
					txt += ' (~'+appAcc(f.accuracy)+'m)</span>';
					txt += " <div clef='"+clef+"' onclick='delThisFapLocal(this)' title='Supprimer' "
							+ " class='imgDelete' style='display:inline-block;' >&nbsp;</div>";
					txt += " <div clef='"+clef+"' onclick='sendThisFapLocal(this)' title='Synchroniser' "
							+ " class='imgDelete imgInsert' style='display:inline-block;' >&nbsp;</div>";
					var div = document.createElement('div');
						div.innerHTML = txt;
					offline.appendChild(div);
				}
				nbOff++;	
			}	
		}
	}
	var s = "";
	if (nbOff>1) s = "s";
	var offResult = document.getElementById('offlineResult');
	if (offResult && nbOff>0) {
		txt = "Synchronisation effectuée pour <span id='offlineResultNb' nb='0'>0</span>/"+nbOff+" fap"+s+" hors ligne";
		offResult.innerHTML = txt;
	}
	var offAlert = document.getElementById('offAlert');
	if (offAlert && nbOff>0) {
		txt = "Il y a "+nbOff+" fap"+s+" hors ligne en attente ";
		txt += "&nbsp;&nbsp;&nbsp;<input type='button' value='Synchroniser' onclick='sendFapLocal()' class='inputAlert' />";
		txt += "&nbsp;&nbsp;&nbsp;<input type='button' value='Voir la liste' onclick='document.location.replace(\"fOffline-fap.php\")' class='inputAlert' />";
		offAlert.innerHTML = txt;
		offAlert.style.display = 'block';
	}
	if (offline && nbOff==0) {
		txt = "Il n'y aucun fap hors ligne en attente ";
		offline.innerHTML = txt;
		document.getElementById('offlineButton').style.display = 'none';
	}
}
function sendFapLocal() {
	var nb = localStorage.length;
	for (var i=0; i<localStorage.length; i++)   {
		var clef = localStorage.key(i);
		var deb = clef.split('_')[0];
		if (deb=='fap') {
			var f = JSON.parse(localStorage.getItem(clef));
			if (f.usr==usrLocal) {
				var fd = new FormData;
				for (var k in f) {
					fd.append(k,f[k]);
				}
				glbSendForm(fd);
			}	
		}
	}
	delFapLocal();
	var offAlert = document.getElementById('offAlert');
	if (offAlert) offAlert.innerHTML = "N'oublie pas d'aller voter dans <a href='sIncub-stats.php'>l'incubateur</a>";
}
function delFapLocal() {
	var nb = localStorage.length;
	for (var i=localStorage.length; i>0; i--)   {
		var clef = localStorage.key(i-1);
		var deb = clef.split('_')[0];
		if (deb=='fap') {
			localStorage.removeItem(clef);
		}	
	}
	var div = document.getElementById('offline');
	if (div) while (div.firstChild) div.removeChild(div.firstChild);
}
function delThisFapLocal(elt) {
	var clef = elt.getAttribute('clef');
	localStorage.removeItem(clef);
	var div = elt.parentNode;
	div.parentNode.removeChild(div);
}
function sendThisFapLocal(elt) {
	var clef = elt.getAttribute('clef');
	var f = JSON.parse(localStorage.getItem(clef));
	var fd = new FormData;
	for (var k in f) fd.append(k,f[k]);
	glbSendForm(fd);
	localStorage.removeItem(clef);
	var div = elt.parentNode;
	div.parentNode.removeChild(div);
}
function actuOfflineFap(ok) {
	var div = document.getElementById('offlineResultNb');
	if (div && ok) {
		var nb = parseInt(div.getAttribute('nb')) + 1;
		div.setAttribute('nb',nb);
		div.innerHTML = nb;
		document.getElementById('offlineVote').style.display = 'block';
	}
}



