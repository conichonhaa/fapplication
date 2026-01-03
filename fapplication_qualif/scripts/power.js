

function buyCapacity(elt) {
	var mess = "Consommer du pouvoir ?";
	var pv = elt.getAttribute('pow');
	if (pv && pv!='') mess = "Acheter pour "+pv+"pv ?"
	return confirm(mess);
}

function winCapacity(elt) {
	var mess = "Obtenir du pouvoir ?";
	var pv = elt.getAttribute('pow');
	if (pv && pv!='') mess = "Vendre son corps pour "+pv+"pv ?"
	return confirm(mess);
}

function setMax(elt) {
	var input = elt.previousSibling;
	if (input) input.value = input.getAttribute('max');
}