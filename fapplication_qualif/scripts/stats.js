
function getStatsMe(elt) {
	var lst = elt.getAttribute('lst').split(";");
	for (var l=0; l<lst.length; l++) {
		getIncubXml(lst[l]);
	}	
	elt.setAttribute('onclick','hideStatsMe(this);event.stopPropagation();');
	elt.value = "enlever";
}
function hideStatsMe(elt) {
	var lst = elt.getAttribute('lst').split(";");
	for (var l=0; l<lst.length; l++) {
		var span = document.getElementById('statsMe_'+lst[l]);
		if (span) {
			span.style.display = 'none';
		}	
	}	
	elt.setAttribute('onclick','getStatsMe(this);event.stopPropagation();');
	elt.value = "mes voix";
}	
function getIncubXml(icb) {
	var span = document.getElementById('statsMe_'+icb);
	if (span) {
		span.style.display = 'inline';
		span.innerHTML = "<img class='imgIcone' src='images/roue.gif' />";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange  = function() { 
			if(xhr.readyState  == 4) {
				if(xhr.status  == 200) {
					var doc = xhr.responseXML;
					// console.log(xhr.responseText);
					if (doc) {										
						span.innerHTML = "<img class='imgIcone' src='"+span.getAttribute('data-src')+"' />";
						var nom = doc.getElementsByTagName('nom')[0];
						if (nom) titrePie = nom.firstChild.nodeValue;
						var users = doc.getElementsByTagName('user');
						for (var u=0; u<users.length; u++) {
							var usr = users[u].getElementsByTagName('id')[0].firstChild.nodeValue;
							if (usr==span.getAttribute('usr')) {
								txt = " = "+users[u].getElementsByTagName('voix')[0].firstChild.nodeValue+" (";
								txt += users[u].getElementsByTagName('pcent')[0].firstChild.nodeValue+"%)";
								span.innerHTML += txt;
							}
						}
						if (span.getAttribute('usr')==span.getAttribute('owner')) span.innerHTML += " ton projet !";
					}
				}
			}
		};
		var url = "_getIncub.php?icb="+icb;
		xhr.open("GET",url,true); 
		xhr.send(null);
	}	
}	


function traceLast(num) {
	var divP = document.getElementById('divData'+num);
	var divG = document.getElementById('divGraph'+num);
	var divI = document.createElement('div');
		divG.appendChild(divI);
	
	var h = document.getElementById('imgRef').getBoundingClientRect().height;
	var wh = h*1.5;
	h = h * 1.3;
	var w = divG.getBoundingClientRect().width-wh/2;
	var nbl = 1;
	var point = divP.firstChild;
	var f = 1;
	while (point) {
		var d = parseFloat(point.getAttribute('d'));
		var pos = w*(d/78) + wh/4;
		var l = null;
		var forbid = [];
		var img = divI.firstChild;
		while (img) {
			var ll = parseInt(img.getAttribute('l'));
			var x = parseFloat(img.getAttribute('x'));
			if (pos<x+wh) forbid.push(ll);
			img = img.nextSibling;
		}
		var k = 0;
		while (k<nbl && l==null) {
			if (forbid.indexOf(k)<0) l = k;
			k++;
		}	
		if (l==null) {
			l = nbl;
			nbl++;
		}
		var div = document.createElement('div');
			div.setAttribute('l',l);
			div.setAttribute('x',pos);
			div.style.position = 'absolute';
			div.style.left = (pos-wh/2) +"px";
			div.style.width = wh +"px";
			div.style.top = (l*h + 10) +"px";
			div.style.textAlign = "center";
			div.style.fontSize = "8px";
			divI.appendChild(div);
		var img = document.createElement('img');
			img.setAttribute('src','_getImg.php?img='+point.getAttribute('img')+vGetImg);
			img.setAttribute('class','imgIcone2');
			img.setAttribute('title',point.getAttribute('lib'));
			div.appendChild(img);
		var div2 = document.createElement('div');
			div2.innerHTML = point.getAttribute('nom');
			div2.setAttribute('class','imgText');
			div.appendChild(div2);	
		point = point.nextSibling;
	}
	if (!animationInitiale) {
		var img = divI.firstChild;
		while (img) {
			var l = parseInt(img.getAttribute('l'));
			var pos = parseFloat(img.getAttribute('x'));
			var x = w;
			var y = 0;
			var v1 = Math.max(1,Math.round(w/200));
			var v2 = Math.max(1,Math.round(nbl/2));
			var delai = 60 - animationInitialeSpeed*10;
			if (animationInitialeMode=='max') {
				v1 = 2 + parseInt(animationInitialeSpeed/2);
				v2 = 1 + parseInt(animationInitialeSpeed/2);
				delai = 10;
			}
			if (animationInitialeMode=='prop') {
				v1 = Math.max(1,Math.round(12*Math.abs(w-(pos-wh/2))/w));
				v2 = Math.max(1,Math.round(l));
				delai = 60 - animationInitialeSpeed*10;
			}
			if (animationInitialeMode=='alea') {
				x = Math.round(Math.random()*w);
				y = Math.round(Math.random()*nbl*h);
				v1 = Math.max(1,Math.round(12*Math.abs(x-(pos-wh/2))/w));
			}			
			var s1 = Math.abs(pos-wh/2-x)/(pos-wh/2-x);
			var s2 = Math.abs(l*h+10-y)/(l*h+10-y);
			img.style.left = x + "px";
			img.style.top = y + "px";
			moveImg(img,Math.round(pos-wh/2-x),Math.round(l*h+10-y),v1*s1,v2*s2,delai);	
			img = img.nextSibling;
		}
	}
	divG.style.height = (nbl*h + 80) +"px";
	var tpos = [0,13,43,68,78];
	var tlib = ["Ce Jour","Ce Mois","Cette Année","Au delà"];
	for (var p=0; p<tpos.length-1; p++) {
		var x = w*(tpos[p]/78);
		var wx = w*(tpos[p+1]/78) - x ;
		var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = x +"px";
			div.style.width = wx +"px";
			div.style.top = (nbl*h + 20) +"px";
			div.style.textAlign = "center";
			div.style.fontWeight = "bold";
			div.style.fontStyle = "italic";
			div.innerHTML = tlib[p];
			div.style.borderTop = "1px dotted #000000";
			divG.appendChild(div);
		var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = x +"px";
			div.style.width = wx +"px";
			div.style.top = "0px";
			div.style.height = (nbl*h + 30) +"px";
			if (p<tpos.length-2) div.style.borderRight = "1px dotted #000000";
			div.style.borderTop = "1px dotted #000000";
			divG.appendChild(div);
	}	
	divG.appendChild(divI);
}



// test capture photo
window.onload = function() {
	if (document.getElementById('capture')) document.getElementById('capture').addEventListener('change',actuPhoto,false);
}
function actuPhoto(evt) {
	var img = document.getElementById('visu_'+evt.target.getAttribute('id'));
	var files = evt.target.files;
	for (var i=0, f; f=files[i]; i++) {
		if (!f.type.match('image.*')) {
			alert("Le fichier n'est pas une image");
			evt.target.value = '';
			img.style.display = 'none';
			continue;
		}
		var reader = new FileReader();
		reader.onload = (function(theFile) {
			return function(e) {
				img.setAttribute('src',e.target.result);
				img.style.display = 'inline';
			};
		})(f);
		reader.readAsDataURL(f);
	}
}

