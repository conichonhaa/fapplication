
window.onload = function() {
	document.getElementById('profilPhoto').addEventListener('change',actuPhoto,false);
}
function actuPhoto(evt) {
	var img = document.getElementById('visu_'+evt.target.getAttribute('id'));
	var files = evt.target.files;
	for (var i=0, f; f=files[i]; i++) {
		if (!f.type.match('image.*')) {
			alert("Le fichier n'est pas une image");
			evt.target.value = '';
			img.setAttribute('src',img.getAttribute('data-src'));
			document.getElementById('send_'+evt.target.getAttribute('id')).style.display = 'none';
			continue;
		}
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				img.setAttribute('src',e.target.result);
				document.getElementById('send_'+evt.target.getAttribute('id')).style.display = 'inline';
			};
		})(f);
		reader.readAsDataURL(f);
	}
}
function sendPhoto(butt) {
	var rep = true;
	var elt = document.getElementById('profilPhoto');
	if (elt.value!='') {
		fd = new FormData();
		fd.append(elt.getAttribute('id')+'_value', elt.value);
		fd.append(elt.getAttribute('id'), elt.files[0]);
		glbSendForm(fd);
		var img = document.createElement('img');
			img.setAttribute('src','images/roue.gif');
			img.setAttribute('id','sendImg_profilPhoto');
			img.style.width = '20px';
			elt.parentNode.insertBefore(img,elt.nextSibling);
		butt.style.display = 'none';	
	}	
}
function loadPhoto(img) {
	document.getElementById('menuAvatar').setAttribute('src','_getImg.php?img='+img+vGetImg);
	document.getElementById('sendImg_profilPhoto').style.display = 'none';
	document.getElementById('profilPhoto').value = '';
}
function chargeImage(elt) {
	document.getElementById(elt.getAttribute('file')).click();
}	

function supprimeMe() {
	rep = confirm("Supprimer mon compte ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','supprime');
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}

function changeEmail(elt) {
	var email = document.getElementById(elt.getAttribute('mail'));
	if (email) {
		email.disabled = false;
		email.focus();
		email.value = email.value;
		elt.setAttribute('class','imgDelete imgCheck');
		elt.setAttribute('title','Confirmer');
		elt.setAttribute('onclick','confirmEmail(this)');
		var lab = document.getElementById(elt.getAttribute('lab'));
		if (lab) lab.innerHTML = "";
	}
}
function confirmEmail(elt) {
	var email = document.getElementById(elt.getAttribute('mail'));
	if (email && email.value!='') {
		email.disabled = true;
		elt.setAttribute('class','imgDelete imgPen');
		elt.setAttribute('title','Modifier');
		elt.setAttribute('onclick','changeEmail(this)');
		var lab = document.getElementById(elt.getAttribute('lab'));
		if (lab) lab.innerHTML = "mail envoyé, en attente confirmation";
		setMailConf(email.getAttribute('usr'),email.value);
	}
}

function changeTel(elt) {
	var tel = document.getElementById('profilTel');
	if (tel) {
		tel.disabled = false;
		tel.focus();
		tel.value = tel.value;
		elt.setAttribute('class','imgDelete imgCheck');
		elt.setAttribute('title','Valider');
		elt.setAttribute('onclick','confirmTel(this)');
	}
}
function confirmTel(elt) {
	var tel = document.getElementById('profilTel');
	if (tel && tel.value!='') {
		tel.disabled = true;
		elt.setAttribute('class','imgDelete imgPen');
		elt.setAttribute('title','Modifier');
		elt.setAttribute('onclick','changeTel(this)');
		glbSendPost(tel);
	}
}

function testNotif(elt) {
	elt.disabled = true;
	elt.style.fontStyle = 'italic';
	elt.value = 'Notification envoyée';
	glbSendPost(elt);
}
function retestNotif() {
	var elt = document.getElementById('profilTestNotif');
	elt.disabled = false;
	elt.style.fontStyle = 'normal';
	elt.value = 'Test Notification';
}


function affInput(elt) {
	var input = document.getElementById(elt.getAttribute('input'));
	input.parentNode.style.display = 'inline';
	input.disabled = false;
	elt.parentNode.style.display = 'none';
}
function testLogin(elt) {
	if (elt.hasAttribute('valide')) {
		elt.removeAttribute('valide');
		elt.style.borderColor = '';
		elt.nextSibling.value = 'Tester';
	}	
}	
function sendLogin() {
	var rep = true;
	var elt = document.getElementById('profilLogin');
	var pts = parseInt(elt.getAttribute('pts'));
	if (pts<1000) {
		alert('Tu dois être au moins niveau 5 pour changer ton login.');
	} else {	
		fd = new FormData();
		fd.append(elt.getAttribute('id'), elt.value);
		if (elt.hasAttribute('valide')) {
			fd.append('valide','1');
			rep = confirm("Attention, cette action te coûtera 1000pts et peut te faire redescendre en niveau.\nConfirmer le changement ?");
		}	
		if (rep) glbSendForm(fd);
	}	
}
function confLogin() {
	var elt = document.getElementById('profilLogin');
	elt.setAttribute('valide','1');
	elt.style.borderColor = 'green';
	elt.nextSibling.value = 'Modifier';
	document.getElementById('profilLoginErr').innerHTML = "";
}
function setLogin(nom,pts) {
	var elt = document.getElementById('profilLogin');
	testLogin(elt);
	elt.parentNode.previousSibling.firstChild.innerHTML = nom;
	document.getElementById('menuLogin').innerHTML = nom;
	elt.parentNode.previousSibling.style.display = 'inline';
	elt.parentNode.style.display = 'none';
	elt.setAttribute('pts',pts);
	if (pts<1000) {
		document.getElementById('profilLoginMod').style.display = 'none';
	}		
}
function resetLogin(err) {
	var elt = document.getElementById('profilLogin');
	testLogin(elt);
	elt.style.borderColor = 'red';
	document.getElementById('profilLoginErr').innerHTML = err;
}

function verifPassword() {
	var pass = document.getElementById('profilPassword');
	var passConf = document.getElementById('profilConfPassword');
	var ok = document.getElementById('profilConfPasswordOk');
	if (pass.value!='' && pass.value==passConf.value) {
		ok.style.display = 'inline';
	} else {
		ok.style.display = 'none';
	}
	document.getElementById('profilConfPasswordMess').innerHTML = '';	
}	
function setPassword() {
	var pass = document.getElementById('profilPassword');
	var passConf = document.getElementById('profilConfPassword');
	if (pass.value!='' && pass.value==passConf.value) {
		glbSendPost(pass);
	}
}
function resetPassword() {
	document.getElementById('profilPassword').value = "";
	document.getElementById('profilConfPassword').value = "";
	document.getElementById('profilConfPasswordOk').style.display = 'none';
	document.getElementById('profilConfPasswordMess').innerHTML = 'enregistré';
}






