var fapData = {};
function getInfoStorage() {
	for (var i=0; i<localStorage.length; i++) {
		var clef = localStorage.key(i);
		fapData[clef] = localStorage.getItem(clef);
		
	}	
	if (fapData.usr && fapData.usr!="") {
		document.getElementById('menuLogin').innerHTML = fapData.nom + " :: <b>Hors Ligne</b>";
		document.getElementById('menuAvatar').src = root + "_getImg.php?img=" + fapData.img;
		document.getElementById('divFap').style.display = "block";
	}
	getFapLocal();	
}


function up2(i) {
	var s = i+'';
	if (s.length<2) s = '0'+s;
	return s;
}
function dateS(d) {
	return d.getFullYear()+"-"+up2(d.getMonth()+1)+"-"+up2(d.getDate())+"T"+up2(d.getHours())+":"+up2(d.getMinutes())+":"+up2(d.getSeconds());
}
function dateJ(d) {
	return up2(d.getDate())+"/"+up2(d.getMonth()+1);
}
function dateH(d) {
	return up2(d.getHours())+"h"+up2(d.getMinutes());
}

var fdFap = null;
function toDMS(c,axe) {
	var dms = "";
	var l = '';
	if (c<0) l += axe[0];
	else l += axe[1];
	c = Math.abs(c);
	dms += parseInt(c)+"° ";
	c = (c-parseInt(c))*60;
	dms += parseInt(c)+"' ";
	c = (c-parseInt(c))*60;
	dms += parseInt(c*10)/10+"''";
	dms += ' '+l;
	return dms
}
function appAcc(acc) {
	return Math.round(acc*10)/10;
}
function gotPos(position) {
	if (fapWaitting) {
		clearTimeout(fapWaitting);
		var acc = position.coords.accuracy;
		var x = position.coords.longitude;
		var y = position.coords.latitude;
		var mess = "Fap au : "+toDMS(y,['S','N'])+' &nbsp; '+toDMS(x,['W','E']) +' &nbsp; (~'+appAcc(acc)+'m)';
		logErrFap(mess, true);
		fdFap.latitude = y;
		fdFap.longitude = x;
		fdFap.accuracy = acc;
		stockFap();
	}
}
function gotPosApprox(error) {
	logErrFap("Localisation approximative en cours");
	fdFap.error = 'Localisation approximative';
	var options = { enableHighAccuracy: false, maximumAge: 30000, timeout: 5000 };
	if( navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(gotPos, gotErr, options );
	} else {
		gotErr();
	}
}
function gotErr(error) {
	if (fapWaitting) {
		var mess = "";
		clearTimeout(fapWaitting);
		if (error) {
			fdFap.error = error.message;
			mess = '<div class="divMessMini">Echec localisation : "'+error.message+'"</div>';
			if (error.message.indexOf("secure origins")>0) mess += "<div class='divMessMini'>Basculez en https !</div>";
			logErrFap(mess, true);
		}
		var cont = true;
		if (fapData.confGeoloc) cont = confirm("Impossible de géolocaliser ce Fap, enregistrer quand même ?");
		if (cont) {
			stockFap();
		} else {
			forbidFap();
		}
	}
}
function logErrFap(message,fin) {
	var mess = document.getElementById("divErrFap");
	if (mess) {
		mess.innerHTML = message;
		if (!fin) mess.innerHTML += "...<img src='"+root+"images/roue.gif' style='width:10px;height:10px;' />";
	}
	var mess2 = document.getElementById("divErrFapOver");
	if (mess2) {
		mess2.style.height = getComputedStyle(mess).height;
	}
}
var fapWaitting = null;
function debloqueFapWaitting() {
	if (fapWaitting) {
		fdFap.error = "Navigator can't trigger user's choice";
		logErrFap("Navigator can't trigger user's choice", true);
		gotErr();
	}
	fapWaitting = null;
}
function aFappeWait(elt) {
	var butt = document.getElementById('aFappe');
	if (butt) {
		if (butt.innerHTML!='') {
			var rect = butt.getBoundingClientRect();
			butt.style.width = rect.width + "px";
			butt.style.height = rect.height + "px";
		}
		butt.innerHTML = "<img src='"+root+"images/roue.gif' class='imgFap' />";
		butt.setAttribute('memoclick',butt.getAttribute('onclick'));
		butt.removeAttribute('onclick');
	}
	logErrFap("Localisation en cours");
	fdFap = {};
	fdFap.usr = fapData.usr;
	var d = new Date();
	fdFap.d = d/1000;
	fdFap.offline = dateS(d);
	fdFap.date = {j:dateJ(d), h:dateH(d), y:d.getFullYear()};
	fdFap.aFappe = '';
	var options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 };
	if( navigator.geolocation) {
		clearTimeout(fapWaitting);
		fapWaitting = setTimeout(function(){debloqueFapWaitting();}, 15000);
		navigator.geolocation.getCurrentPosition( gotPos, gotPosApprox, options );
	} else {
		fdFap.error = "Navigator don't support geolocation";
		logErrFap("Navigator don't support geolocation", true);
		gotErr();
	}
}
function aFappe() {
	var butt = document.getElementById('aFappe');
	if (butt) {
		var rect = butt.getBoundingClientRect();
		butt.style.width = "auto";
		butt.style.height = "auto";
		txt = "Fap enregistré";
		butt.innerHTML = txt;
		butt.setAttribute('class','buttFappe');
	}
	getFapLocal();
}
function stockFap() {
	if (fdFap.d-fapData.d>fapData.groggy/1) {
		var nb = localStorage.length + 1;
		localStorage.setItem("fap_"+nb,JSON.stringify(fdFap));
		fapData.d = fdFap.d;
		localStorage.setItem("d",fapData.d);
		fapData.last = fdFap.offline;
		localStorage.setItem("last",fapData.last);
		fdFap = {};
		aFappe();
	} else {
		forbidFap("Tu es encore groggy de ton dernier fap",1);
	}	
}	
function forbidFap(error,dizzy) {
	var mess = document.getElementById("divErrFap").innerHTML;
	var txt = "<div><b>Fap non enregistré !</b></div>";
	if (error) txt = "<div style='font-size:80%;'>"+error+"</div>" + txt;
	mess = txt + mess;
	logErrFap(mess, true);
	var butt = document.getElementById('aFappe');
	if (butt) {
		var rect = butt.getBoundingClientRect();
		butt.style.width = "auto";
		butt.style.height = "auto";
		butt.innerHTML = "J'ai Fappé";
		butt.setAttribute('onclick',butt.getAttribute('memoclick'));
		if (dizzy) {
			butt.innerHTML = "<img src='"+root+"images/dizzy-face.png' class='imgFap' />";
		}		
	}
}	


function getFapLocal() {
	var nbOff = 0;
	var nb = localStorage.length;
	var send = false;
	for (var i=0; i<localStorage.length; i++)   {
		var clef = localStorage.key(i);
		var deb = clef.split('_')[0];
		if (deb=='fap') {
			var f = JSON.parse(localStorage.getItem(clef));
			if (f.usr==fapData.usr) {
				nbOff++;	
			}	
		}
	}
	var offAlert = document.getElementById('offAlert');
	if (offAlert && nbOff>0) {
		var s = "";
		if (nbOff>1) s = "s";
		txt = "Il y a "+nbOff+" fap"+s+" hors ligne en attente ";
		offAlert.innerHTML = txt;
		offAlert.style.display = 'block';
	}
}