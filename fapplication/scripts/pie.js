var ns = "http://www.w3.org/2000/svg";
var xref="http://www.w3.org/1999/xlink";

function degres2radians(centreX, centreY, rayon, degres) {
	 var radians = (degres-90) * Math.PI / 180.0;
	 return {
	 x: centreX + (rayon * Math.cos(radians)),
	 y: centreY + (rayon * Math.sin(radians))
	 };
}
 
function monArc(x, y, rayon, angleDepart, angleFin){
	var depart = degres2radians(x, y, rayon, angleFin);
	var fin = degres2radians(x, y, rayon, angleDepart);
	var arc180 = angleFin - angleDepart <= 180 ? "0" : "1";
	var d = [
	"M", depart.x, depart.y,
	"A", rayon, rayon, 0, arc180, 0, fin.x, fin.y,
	"L", x,y,
	"L", depart.x, depart.y
	].join(" ");
	return d;
}
 
function addElements(i,svg){
	angleDepart=angleDepart;
	angleFin=(angleDepart+tabDonnees[i]);

	// dessin des arcs de cercle
	var path = document.createElementNS(ns, 'path'); 
	path.setAttribute('fill',tabCouleur[i]);
	path.setAttribute('d',monArc(120 , 140, rayon, angleDepart*3.6,angleFin*3.6));
	path.setAttribute('id','arc'+i);
	path.setAttribute('p',i);
	path.setAttribute('class',"arc");

	// dessin des carres de legende
	var rect = document.createElementNS(ns, 'rect'); 
	rect.setAttribute('width','16');
	rect.setAttribute('height','16');
	rect.setAttribute('x',260);
	rect.setAttribute('y',30*i+10);
	rect.setAttribute('fill',tabCouleur[i]);
	rect.setAttribute('id','rect'+i);

	// dessin des textes de legende
	var text = document.createElementNS(ns, 'text');
	text.setAttribute('x', 280);
	text.setAttribute('y', 30*i+10+12);
	text.setAttribute('fill', '#999');
	text.setAttribute('font-size','12');
	text.setAttribute('font-family','sans-serif');
	text.setAttribute('font-weight','normal');
	text.setAttribute('id','text'+i);
	text.textContent = tabLabel[i]+' ('+tabDonnees[i]+'%)';

	// ajout des elements au svg
	svg.appendChild(path);
	svg.appendChild(rect);
	svg.appendChild(text);
	// var el = document.getElementById('arc'+i); 
    // el.addEventListener("click", clickArc, false); 
}
 
function drawGraphCam(w){
	angleDepart=0;
	angleFin=0;
	rayon=100;
	// creation du SVG
	var svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('xmlns',ns);
	svg.setAttribute('xmlns:xlink',xref);
	svg.setAttribute('version','1.1');
	svg.setAttribute('viewBox','0 0 500 300');
	svg.style.objectFit = 'contain';
	svg.style.minWidth = '100%';
	svg.style.maxWidth = '100%';
	svg.style.maxHeight = '100%';
	var rect = document.createElementNS(ns, 'rect'); 
	rect.setAttribute('width','500');
	rect.setAttribute('height','300');
	rect.setAttribute('x','0');
	rect.setAttribute('y','0');
	rect.setAttribute('fill','#222222');
	svg.appendChild(rect);
	for (i=0; i<tabDonnees.length;i++){
		addElements(i,svg);
		angleDepart=angleFin;
	}
	var text = document.createElementNS(ns, 'text');
	text.setAttribute('x', 120);
	text.setAttribute('y', 20);
	text.setAttribute('fill', '#999');
	text.setAttribute('font-size','16');
	text.setAttribute('font-family','sans-serif');
	text.setAttribute('font-weight','normal');
	text.setAttribute('text-anchor','middle');
	text.textContent = titrePie;
	svg.appendChild(text);
	while (w.firstChild) w.removeChild(w.firstChild);
	w.appendChild(svg);
}
function getCamXml(elt) {
	var w = affEltCentre();
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange  = function() { 
		if(xhr.readyState  == 4) {
			if(xhr.status  == 200) {
				var doc = xhr.responseXML;
				// console.log(xhr.responseText);
				if (doc) {										
					tabLabel=[];
					tabDonnees=[];
					tabCouleur=[];
					titrePie = "";
					var nom = doc.getElementsByTagName('nom')[0];
					if (nom) titrePie = nom.firstChild.nodeValue;
					var users = doc.getElementsByTagName('user');
					for (var u=0; u<users.length; u++) {
						tabLabel.push(users[u].getElementsByTagName('nom')[0].firstChild.nodeValue);
						tabDonnees.push(parseFloat(users[u].getElementsByTagName('pcent')[0].firstChild.nodeValue));
						tabCouleur.push(users[u].getElementsByTagName('coul')[0].firstChild.nodeValue);
					}	
					drawGraphCam(w);
				}
			}
		}
	};
	url = "_getIncub.php?icb="+elt.getAttribute('icb');
	xhr.open("GET",url,true); 
	xhr.send(null);
}	
var clickArc = function(){
    alert(tabLabel[this.getAttribute("p")]+" : "+tabDonnees[this.getAttribute("p")]+"%");
}


// etoile
function drawGraphData(){
	var divData = document.getElementById('divData');
	var d = divData.firstChild;
	while (d) {
		console.log(d.getAttribute('code'));
		drawGraphStar(d);
		d = d.nextSibling;
	}	
}	
function drawGraphStar(elt){
	angleDepart=0;
	angleFin=0;
	rayon=100;
	var svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('xmlns',ns);
	svg.setAttribute('xmlns:xlink',xref);
	svg.setAttribute('version','1.1');
	svg.setAttribute('width','100%');
	svg.setAttribute('height','100%');
	svg.setAttribute('viewBox','0 0 250 250');

}



