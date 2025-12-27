
function actuListeDefie() {
	var sel = document.getElementById('defie');
	if (sel) {
		var usr = sel.value;
		var m = parseInt(document.getElementById('mise').value);
		while (sel.firstChild) sel.removeChild(sel.firstChild);
		var o = document.createElement('option');
		sel.appendChild(o);
		var c = document.getElementById('listeFappeurs').firstChild;
		while (c) {
			var p = parseInt(c.getAttribute('power'));
			var n = parseInt(c.getAttribute('niveau'));
			if (p>=m) {
				var o = document.createElement('option');
					o.setAttribute('value',c.getAttribute('usr'));
					o.innerHTML = c.getAttribute('nom');
					if (usr==c.getAttribute('usr')) o.setAttribute('selected','selected');
					sel.appendChild(o);
			}	
			c = c.nextSibling;
		}	
	}
}	

function lanceDefi() {
	var ok = true;
	ok = ok && document.getElementById('defie').value!='';
	ok = ok && document.getElementById('description').value!='';
	if (ok) document.getElementById('submit').disabled = false;
	else document.getElementById('submit').disabled = true;
}	

function affPosFap(elt) {
	var fap = elt.getAttribute('fap');
	var dfi = elt.getAttribute('dfi');
	document.getElementById('seek'+dfi).style.display = 'block';
	document.getElementById('seek'+dfi+'Frame').setAttribute('src','_getLoc.php?fap='+fap);
	document.location.replace('#seek'+dfi);
}
function changeFapDefi(elt) {
	var fd = new FormData();
	fd.append('defiFap', '');
	fd.append('fap', elt.getAttribute('fap'));
	if (elt.checked) fd.append('defi',1);
	glbSendForm(fd);
}

