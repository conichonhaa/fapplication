function supprime(elt) {
	var usr = elt.getAttribute('usr');
	var nom = document.getElementById('nom_'+usr).innerHTML;
	rep = confirm("Supprimer "+'"'+nom+'"'+" et tous ses Faps ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','supprime');
			input.setAttribute('value',usr);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}

function aleaMdp(elt) {
	var usr = elt.getAttribute('usr');
	var nom = document.getElementById('nom_'+usr).innerHTML;
	rep = confirm("Générer un mot de passe aléatoire pour "+'"'+nom+'"'+" ?");
	if (rep) {
		var input = document.createElement('input');
			input.setAttribute('id','aleamdp');
			input.setAttribute('value',usr);
		glbSendPost(input);
		elt.parentNode.removeChild(elt);
	}
}
function confAdmEmail(elt) {
	var usr = elt.getAttribute('usr');
	var nom = document.getElementById('nom_'+usr).innerHTML;
	rep = confirm("Envoyer un mail de confirmation pour "+'"'+nom+'"'+" ?");
	if (rep) {
		var email = elt.getAttribute('email');
		if (email!='') {	
			setMailConf(usr,email);
			elt.parentNode.removeChild(elt);
		}
	}
}


function affInput(elt) {
	var input = document.getElementById(elt.getAttribute('input'));
	input.style.display = 'inline';
	input.disabled = false;
	elt.parentNode.style.display = 'none';
}
function supprimeParam(elt) {
	var par = elt.getAttribute('par');
	var code = elt.getAttribute('code');
	rep = confirm("Supprimer "+'"'+code+'"'+" ?\nCela peut provoquer de sévères dysonctionnements dans la FAPplication.");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','suppParam');
			input.setAttribute('value',par);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}


// SONS
function supprimeSon(elt) {
	var son = elt.getAttribute('son');
	rep = confirm("Supprimer ce son ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','suppSon');
			input.setAttribute('value',son);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}
function delSon(elt) {
	var son = elt.getAttribute('son');
	rep = confirm("Supprimer ce fichier du serveur ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','delSon');
			input.setAttribute('value',son);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}
function changeSelType(elt) {
	var sel = document.getElementById('typeValue_new_'+elt.value);
	var c = sel.parentNode.firstChild;
	while (c) {
		if (c==sel) {
			c.style.display = 'inline';
			c.disabled = false;
		} else {
			c.style.display = 'none';
			c.disabled = true;
		}
		c = c.nextSibling; 
	}
}
function affPlaySonAdmin() {
	for (var i=0; i<nbSonsTotal; i++) {
		var img = document.getElementById("playSonAdmin_"+i);
		if (img) {
			if (sonActive) img.style.display = '';
			else img.style.display = 'none';
		}
	}
	var audio = document.getElementById('audioAdmin');
	if (!sonActive && audio) audio.pause();
}
function playSonAdmin(elt) {
	var audio = document.getElementById('audioAdmin');
	if (audio) {
		audio.pause();
		audio.currentTime = 0;
		var src = document.getElementById('lien_'+elt.getAttribute('ref')).value;
		if (src!="") {
			audio.src = sonRacine+src;
			audio.play();
		}
	}
}


// DIFFUSION
function confMessage() {
	var choix = document.getElementsByName('choix');
	var nbSend = document.getElementById('nbSend');
	var nb = parseInt(nbSend.innerHTML);
	if (isNaN(nb)) nb = 0;
	var mess = "tous les fappeurs";
	if (choix[1].checked) {
		var s = "";
		if (nb>1) s = "s";
		mess = nb+" fappeur"+s;
	}
	if (nb>0) return confirm("Confirmer l'envoi du message à "+mess);
	else return false;
}
function pickAllUsers(elt) {
	var div = document.getElementById('listUsers');
	var nbSend = document.getElementById('nbSend');
	if (elt.value=='all') {
		div.style.display = 'none';
		nbSend.innerHTML = nbSend.getAttribute('all');
	}
	if (elt.value=='pick') {
		div.style.display = 'block';
		nbSend.innerHTML = nbSend.getAttribute('pick');
	}
}
function selAllUsers(elt) {
	var inputs = document.getElementById('listUsers').getElementsByTagName('INPUT');
	var nbSend = document.getElementById('nbSend');
	var nb = 0;
	if (elt.getAttribute('id')=='pickAll') {
		for (var i=0; i<inputs.length; i++) {
			if (inputs[i]!=elt  && !inputs[i].disabled) {
				inputs[i].checked = elt.checked;
				if (elt.checked) nb++;
			}
		}
	} else {
		var checked = true;
		for (var i=0; i<inputs.length; i++) {
			if (inputs[i].getAttribute('id')!='pickAll' && !inputs[i].disabled) {
				checked = checked && inputs[i].checked;
				if (inputs[i].checked) nb++;
			}
		}
		document.getElementById('pickAll').checked = checked;
	}
	nbSend.setAttribute('pick',nb);
	nbSend.innerHTML = nb;
}
function sendMessageMail(usr) {
	var message = document.getElementById('message').innerHTML;
	var titre = document.getElementById('titre').innerHTML;
	var fd = new FormData();
	fd.append('sendMail', usr);
	fd.append('message', message);
	fd.append('titre', titre);
	fd.append('url', '');
	fd.append('sent', 'isSentMessage');
	glbSendForm(fd);
}
function sendMessageSms(usr) {
	var message = document.getElementById('message').innerHTML;
	var fd = new FormData();
	fd.append('sendSms', usr);
	fd.append('message', message);
	fd.append('sent', 'isSentMessage');
	glbSendForm(fd);
}
function sendMessageIfttt(usr) {
	var message = document.getElementById('message').innerHTML;
	var fd = new FormData();
	fd.append('sendIfttt', usr);
	fd.append('message', message);
	fd.append('sent', 'isSentMessage');
	glbSendForm(fd);
}
function isSentMessage(usr,ok) {
	var div = document.getElementById('sent_'+usr);
	if (div) {
		if (ok=='') div.innerHTML = "<img src='images/ok.gif' style='width:20px;vertical-align:text-bottom;'>";
		else div.innerHTML = ok;
	}
}


// IDENTITE
function supprimeIdent(elt) {
	var irq = elt.getAttribute('irq');
	var num = elt.getAttribute('num');
	rep = confirm("Supprimer le fap n°"+num+" ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','supprime');
			input.setAttribute('value',irq);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}

// INCUBATEUR
function supprimeIncub(elt) {
	var icb = elt.getAttribute('icb');
	var titre = elt.getAttribute('titre');
	rep = confirm("Supprimer le projet \""+titre+"\" ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','supprime');
			input.setAttribute('value',icb);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
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

// DROITS
function delDroit(elt) {
	var usr = elt.getAttribute('usr');
	var form = document.createElement('form');
		form.setAttribute('method','post');
		form.style.display = 'none';
	var input = document.createElement('input');
		input.setAttribute('name','delDroit');
		input.setAttribute('value',usr);
		form.appendChild(input);
	document.body.appendChild(form);
	form.submit();
}
function addDroit(elt) {
	var ndr = elt.getAttribute('ndr');
	var sel = document.getElementById('addDroit_'+ndr);
	if (sel && sel.value!='') {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','addDroit');
			input.setAttribute('value',ndr);
			form.appendChild(input);
		var input = document.createElement('input');
			input.setAttribute('name','usr');
			input.setAttribute('value',sel.value);
			form.appendChild(input);	
		document.body.appendChild(form);
		form.submit();
	}	
}


// BOOK
function sendBook(type,fap) {
	var fd = new FormData();
		fd.append('fap', fap);
		fd.append(type, '');
	var xhr = new XMLHttpRequest();
	xhr.open("POST","",true); 
	xhr.send(fd);		
}
function approuveBook(elt) {
	sendBook('valide',elt.getAttribute('fap'));
	var d = elt.parentNode.parentNode.parentNode.parentNode;
	var v = document.getElementById('valide');
	v.insertBefore(d,v.firstChild);
	elt.parentNode.parentNode.removeChild(elt.parentNode);
}
function denonceBook(elt) {
	
}
function supprimeBook(elt) {
	var rep = confirm('Supprimer cette page du book ?');
	if (rep) {
		sendBook('supprime',elt.getAttribute('fap'));
		var d = elt.parentNode.parentNode.parentNode.parentNode;
		d.parentNode.removeChild(d);
	}
}


// gift
function affGiftIco(elt) {
	var usr = elt.value;
	var div = document.getElementById('usr_'+usr);
	var v = "";
	var l = ['lvl','pow','cof','xp'];
	for (var i=0; i<l.length; i++) {
		if (div) {
			v = div.getAttribute(l[i]);
		} else {
			v = '?';
		}
		document.getElementById('ico'+l[i]).innerHTML = v;
	}
}






