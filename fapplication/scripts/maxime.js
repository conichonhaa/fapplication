

function changeMaxime(elt) {
	var input = document.getElementById('maxime_'+elt.getAttribute('mxm'));
	input.style.display = 'inline';
	input.disabled = false;
	if (input.getBoundingClientRect().width<800) {
		input.rows = parseInt(input.rows*800/input.getBoundingClientRect().width);
	}
	elt.parentNode.style.display = 'none';
	document.getElementById('submitModifMaxime').style.display = 'inline';
}
function deleteMaxime(elt) {
	var mxm = elt.getAttribute('mxm');
	rep = confirm("Supprimer cette maxime ?");
	if (rep) {
		var form = document.createElement('form');
			form.setAttribute('method','post');
			form.style.display = 'none';
		var input = document.createElement('input');
			input.setAttribute('name','suppMaxime');
			input.setAttribute('value',mxm);
			form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}
}