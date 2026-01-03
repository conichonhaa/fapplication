
function changeUserKey(elt) {
	var key = document.getElementById('uskUserKey');
	if (key) {
		key.disabled = false;
		key.focus();
		key.value = key.value;
		elt.setAttribute('class','imgDelete imgCheck');
		elt.setAttribute('title','Valider');
		elt.setAttribute('onclick','confirmUserKey(this)');
	}
}
function confirmUserKey(elt) {
	var key = document.getElementById('uskUserKey');
	if (key && key.value!='') {
		key.disabled = true;
		elt.setAttribute('class','imgDelete imgPen');
		elt.setAttribute('title','Modifier');
		elt.setAttribute('onclick','changeUserKey(this)');
		var fd = new FormData();
		fd.append('uskUserKey',key.value);
		fd.append('uskAppKey',key.getAttribute('app'));
		glbSendForm(fd);
		var span = document.getElementById('uskUrlWebhook');
		span.innerHTML = "<img src='images/roue.gif' style='height:1em;' />";
		var img = document.getElementById('uskUrlWebhookImg');
		img.style.display = 'none';
		var img = document.getElementById('uskToggle');
		img.setAttribute('src',img.getAttribute('on'));
	}
}
function toggleActiveKey(elt) {
	var usk = elt.getAttribute('usk');
	if (usk!='') {
		var val = elt.getAttribute('val');
		var tog = 'off';
		if (val=='off')tog = 'on';
		var fd = new FormData();
		fd.append('uskActif',usk);
		fd.append('toggle',tog);
		glbSendForm(fd);
		elt.setAttribute('val',tog);
		elt.setAttribute('src',elt.getAttribute(tog));
		var div = document.getElementById('uskBlocGeneral');
		if (tog=='on') div.style.opacity = '';
		else div.style.opacity = '0.5';
	}
}
function randomForeignKey(elt) {
	var rep = confirm("Générer une nouvelle clef ?\nIl faudra la reporter dans l'applet webhooks");
	if (rep) {
		glbSendPost(elt);
		var span = document.getElementById('uskUrlWebhook');
		span.innerHTML = "<img src='images/roue.gif' style='height:1em;' />";
		var img = document.getElementById('uskUrlWebhookImg');
		img.style.display = 'none';
	}
}
function getForeignKey(key) {
	var span = document.getElementById('uskUrlWebhook');
	var img = document.getElementById('uskUrlWebhookImg');
	if (key!='') {
		span.innerHTML = span.getAttribute('url') + key;
		img.style.display = 'inline-block';
	} else {
		span.innerHTML = "???";
		img.style.display = 'none';
	}
}
function copyUrl(elt) {
	var obj = document.getElementById(elt.getAttribute('cible'));   
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(obj);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(obj);
        selection.removeAllRanges();
        selection.addRange(range);
    }
	document.execCommand("Copy", true);
}