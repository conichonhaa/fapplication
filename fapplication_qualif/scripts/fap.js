

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
		fdFap.append('latitude', y);
		fdFap.append('longitude', x);
		fdFap.append('accuracy', acc);
		glbSendForm(fdFap);
	}
}
function gotPosApprox(error) {
	logErrFap("Localisation approximative en cours");
	fdFap.append('error','Localisation approximative');
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
			fdFap.append('error',error.message);
			mess = '<div class="divMessMini">Echec localisation : "'+error.message+'"</div>';
			if (error.message.indexOf("secure origins")>0) mess += "<div class='divMessMini'>Basculez en https !</div>";
			logErrFap(mess, true);
		}
		var cont = true;
		if (confGeoloc) cont = confirm("Impossible de géolocaliser ce Fap, enregistrer quand même ?");
		else {
			mess += "<div class='divMessMini'>Pour activer la confirmation avant d'enregistrer un Fap non géolocalisé ";
			mess += "<a href='profil.php'>modifez votre profil</a></div>";
			logErrFap(mess, true);
		}
		if (cont) {
			glbSendForm(fdFap);
		} else {
			forbidFap();
		}
	}
}
function logErrFap(message,fin) {
	var mess = document.getElementById("divErrFap");
	if (mess) {
		mess.innerHTML = message;
		if (!fin) mess.innerHTML += "...<img src='images/roue.gif' style='width:10px;height:10px;' />";
	}
	var mess2 = document.getElementById("divErrFapOver");
	if (mess2) {
		mess2.style.height = getComputedStyle(mess).height;
	}
}
var fapWaitting = null;
function debloqueFapWaitting() {
	if (fapWaitting) {
		fdFap.append('error',"Navigator can't trigger user's choice");
		logErrFap("Navigator can't trigger user's choice", true);
		gotErr();
	}
	fapWaitting = null;
}
function aFappeWait(elt) {
	if (chtouille) {
		document.location.replace("fFap-fap.php");
	} else {
		var butt = document.getElementById('aFappe');
		if (butt) {
			if (butt.innerHTML!='') {
				var rect = butt.getBoundingClientRect();
				butt.style.width = rect.width + "px";
				butt.style.height = rect.height + "px";
			}
			butt.innerHTML = "<img src='images/roue.gif' class='imgFap' />";
			butt.setAttribute('memoclick',butt.getAttribute('onclick'));
			butt.removeAttribute('onclick');
		}
		logErrFap("Localisation en cours");
		fdFap = new FormData();
		fdFap.append(elt.getAttribute('id'), '');
		fdFap.append(elt.getAttribute('name'), '');
		if (elt.hasAttribute('declare')) fdFap.append('declare',elt.getAttribute('declare'));
		var options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 };
		if( navigator.geolocation) {
			// var watchID = navigator.geolocation.watchPosition( gotPos, gotErr, options );
			// var timeout = setTimeout( function() { navigator.geolocation.clearWatch( watchID ); }, 5000 );
			clearTimeout(fapWaitting);
			fapWaitting = setTimeout(function(){debloqueFapWaitting();}, 15000);
			navigator.geolocation.getCurrentPosition( gotPos, gotPosApprox, options );
		} else {
			fdFap.append('error',"Navigator don't support geolocation");
			logErrFap("Navigator don't support geolocation", true);
			gotErr();
		}
	}
}
function aFappe() {
	var butt = document.getElementById('aFappe');
	dataGainXp.delay = 0;
	dataGainXp.interval = 10;
	gainXP(butt);
	getNbFap();
	checkCapacity();
	getChronoTimer();
	getAlertMST();
	var memoPhallus = false;
	if (sons.phallus && sons.phallus.actif) {
		memoPhallus = true;
		sons.phallus.actif = 0;
	}
	var funky = document.getElementById('funkybite');
	if (funky) {funky.click();funky.click();funky.click();funky.click();funky.click();}
	var funky = document.getElementById('funkybite2');
	if (funky) {funky.click();funky.click();funky.click();funky.click();funky.click();}
	if (memoPhallus) sons.phallus.actif = 1;
	if (sonActive && sons.fap && sons.fap.actif) {
		if (!sons.fap.load.paused) {
			sons.fap.load.pause();
			sons.fap.load.currentTime = 0;
		}
		sons.fap.load.play();
	}
	if (butt) {
		var rect = butt.getBoundingClientRect();
		butt.style.width = "auto";
		butt.style.height = "auto";
		txt = "Fap enregistré<br><a href='sIncub-stats.php?vote' class='aFap' >";
		txt += "<img src='images/urne.gif' class='imgFap' />&nbsp;Voter</a>";
		butt.innerHTML = txt;
		butt.setAttribute('class','buttFappe');
	}
	var butt = document.getElementById('nbDecFap');
	if (butt) butt.innerHTML = parseInt(butt.innerHTML)-1;
}
function declareFap(elt) {
	logErrFap("Vérification en cours");
	var date = document.getElementById("jour").value+"T"+document.getElementById("heure").value+":00";
	elt.setAttribute('declare',date);
	aFappeWait(elt);
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
			butt.innerHTML = "<img src='images/dizzy-face.png' class='imgFap' />";
			if (dizzy==2) butt.innerHTML = "<img src='images/clock.png' class='imgFap' />";
		}		
	}
}

function checkCapacity() {
	var fd = new FormData();
	fd.append('checkCapacity', '');
	glbSendForm(fd);
}
function sendMessageCapacity(usr,message,titre) {
	var fd = new FormData();
	fd.append('sendMail', usr);
	fd.append('message', message);
	fd.append('titre', titre);
	fd.append('catch', '');
	glbSendForm(fd);
	
	var fd = new FormData();
	fd.append('sendSms', usr);
	fd.append('message', message);
	glbSendForm(fd);

	var fd = new FormData();
	fd.append('sendIfttt', usr);
	fd.append('message', message);
	glbSendForm(fd);
}	

function getAlertMST() {
	var fd = new FormData();
	fd.append('checkMST', '');
	glbSendForm(fd);
}
function alertChtouille() {
	mess = "<img src='images/achtung.gif' class='imgIconeMini' /><b> Tu as attrapé la Chtouille !</b>";
	mess += "<br>Tu ne pourras plus fapper avant d'être délivré par un autre fappeur";
	mess += "<br><a href='iMst-infos.php' >Voir la liste des contaminés</a>";
	var div = document.getElementById('mstAlert');
	if (div) {
		div.innerHTML = mess;
	}
}


// suppression faps

function suppFap(elt) {
	var fap = elt.getAttribute('fap');
	var act = elt.getAttribute('act');
	var fd = new FormData();
	fd.append('suppFap', fap);
	fd.append('act', act);
	glbSendForm(fd);
	var nbAnnule = document.getElementById('nbAnnule');
	var nb = parseInt(nbAnnule.getAttribute('nb'));
	if (act=='null') {
		elt.setAttribute('act','1');
		elt.setAttribute('class','imgDelete');
		elt.setAttribute('title','Annuler ce Fap');	
		elt.parentNode.style.color = '#000000';
		elt.parentNode.firstChild.style.display = 'none';
		nb--;
	} else {
		elt.setAttribute('act','null');
		elt.setAttribute('class','imgDelete imgInsert');
		elt.setAttribute('title','Ré-activer ce Fap');	
		elt.parentNode.style.color = '#888888';
		elt.parentNode.firstChild.style.display = 'inline-block';	
		nb++;
	}
	nbAnnule.setAttribute('nb',nb);
	nbAnnule.innerHTML = nb + " fap";
	if (nb>1) nbAnnule.innerHTML += "s";
}

function seekKill() {
	var supps = document.getElementsByTagName('SUPP');
	for (var s=0; s<supps.length; s++) {
		if (supps[s].getAttribute('lib')!='') {
			for (var k=1; k<2; k++) {
				if (!supps[s-k].hasAttribute('traite')) {
					supps[s-k].setAttribute('traite','1');
					var txt = " &nbsp; <i>"+supps[s].getAttribute('lib')+"</i>";
					supps[s-k].parentNode.innerHTML += txt;
				}
			}
		}
	}
}


// fapbook
var memoScrollTop = null;
function chooseFap(elt) {
	var list = ['fap','num','date','lat','lon'];
	for (var l=0; l<list.length; l++) {
		var d = document.getElementById(list[l]);
		if (d) {
			if (d.tagName=='INPUT') d.setAttribute('value',elt.getAttribute(list[l]));
			else d.innerHTML = elt.getAttribute(list[l]);
		}	
	}
	var d = document.getElementById('booklist');
	if (d.style.display!='none') d.style.display = 'none';
	var d = document.getElementById('seekOld');
	if (d.style.display!='none') d.style.display = 'none';
	d.setAttribute('src','');
	var d = document.getElementById('seeAdd');
	if (d.style.display!='none') d.style.display = 'none';
	d.setAttribute('src','');
	var d = document.getElementById('see');
	d.setAttribute('fap',elt.getAttribute('fap'));
	if (elt.getAttribute('lat')!='?') d.style.display = 'inline-block';
	else d.style.display = 'none';
	document.location.replace('#bookaddtitle');
}
function chargeImage(elt) {
	document.getElementById(elt.getAttribute('file')).click();
}	
function changeImageLoad(id) {
	document.getElementById(id).addEventListener('change',changeImage,false);
}
function changeImage(evt) {
	var img = document.getElementById('visu_'+evt.target.getAttribute('id'));
	var files = evt.target.files;
	for (var i=0, f; f=files[i]; i++) {
		if (!f.type.match('image.*')) {
			alert("Le fichier n'est pas une image");
			evt.target.value='';
			img.setAttribute('src',img.getAttribute('data-src'));
			continue;
		}
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				img.setAttribute('src',e.target.result);
			};
		})(f);
		reader.readAsDataURL(f);
	}
}
function modifieBook(elt) {
	var div = elt.parentNode.parentNode;
	div.style.display = 'none';
	div.nextSibling.style.display = 'block';
}
function annuleBook(elt) {
	var div = elt.parentNode.parentNode.parentNode;
	div.style.display = 'none';
	div.previousSibling.style.display = 'block';
}
function affBook(elt) {
	var div = elt.nextSibling;
	if (div) {
		if (div.style.display=='none') {
			div.style.display = 'block';
			elt.firstChild.nextSibling.style.display = 'none';
		} else {
			div.style.display = 'none';
			elt.firstChild.nextSibling.style.display = 'inline';
		}
	}
}
function suppBook(elt) {
	var rep = confirm("Supprimer ce fap du FapBook ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','suppbook');
			input.setAttribute('value',elt.getAttribute('fap'));
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}	
function likeBook(elt) {
	var fbk = elt.getAttribute('fbk');
	var span = document.getElementById('likeid_'+fbk);
	var nb = parseInt(span.getAttribute('nb')) + 1;
	span.setAttribute('nb',nb);
	span.innerHTML = nb;
	document.getElementById('likeid2_'+fbk).innerHTML = nb;
	var pub = document.getElementById('likeidpub_'+fbk);
	if (pub) {
		pub.setAttribute('nb',nb);
		pub.innerHTML = nb;
		document.getElementById('likeidpub2_'+fbk).innerHTML = nb;
	}
	var fd = new FormData();
	fd.append('likeBook',fbk);
	fd.append('nb',nb);
	glbSendForm(fd);
}
function affPosBook(elt) {
	var fap = elt.getAttribute('fap');
	var voir = elt.getAttribute('voir');
	var fr = document.getElementById(voir+'_'+fap);
	if (fr) {
		if (fr.getAttribute('src')=='') fr.setAttribute('src','_getLoc.php?fap='+fap);
		if (fr.style.display=='none') {
			fr.style.display = 'block';
			elt.src = 'images/voir-no.png';
		} else {
			fr.style.display = 'none';
			elt.src = 'images/voir.png';
		}
	}
}	
function affPosSeek(elt) {
	var fap = elt.getAttribute('fap');
	document.getElementById('seekOld').style.display = 'block';
	document.getElementById('seekOldFrame').setAttribute('src','_getLoc.php?fap='+fap);
	var b = document.getElementById('choose_'+fap);
	var b2 = document.getElementById('seekOldButt');
	if (b2) {
		b2.setAttribute('fap',b.getAttribute('fap'));
		b2.setAttribute('num',b.getAttribute('num'));
		b2.setAttribute('date',b.getAttribute('date'));
		b2.setAttribute('lat',b.getAttribute('lat'));
		b2.setAttribute('lon',b.getAttribute('lon'));
		b2.value = 'choisir le n°'+b.getAttribute('num');
	}
	var d = document.getElementById('seeAdd');
	if (d) {
		if (d.style.display!='none') d.style.display = 'none';	
		d.setAttribute('src','');	
	}
	memoScrollTop = document.body.scrollTop;
	document.location.replace('#seekOld');
}
function affPosAdd(elt) {
	var fap = elt.getAttribute('fap');
	document.getElementById('seeAdd').style.display = 'block';
	document.getElementById('seeAddFrame').setAttribute('src','_getLoc.php?fap='+fap);
	var d = document.getElementById('seekOld');
	if (d.style.display!='none') d.style.display = 'none';
	d.setAttribute('src','');
	document.location.replace('#seeAdd');
}
function hideSeekOld(elt) {
	if (memoScrollTop!=null) document.body.scrollTop = memoScrollTop;
	elt.parentNode.style.display="none";
}

function setMax(elt) {
	var input = elt.previousSibling;
	if (input) input.value = input.getAttribute('max');
}

