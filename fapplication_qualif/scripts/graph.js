var ns = "http://www.w3.org/2000/svg";
var xref="http://www.w3.org/1999/xlink";
var zx = 24*3600*1000;
var deltaX = 5000;
var deltaYc = 2;

var colorFill = '#CFA9CF';
var colorStroke = '#544654';

var coefficient = null;
function actuCoeff() {
	var divG = document.getElementById('divGraph');
	var zoom = parseFloat(divG.getAttribute('zoom'));
	var coeff = parseFloat(divG.getAttribute('coeff'));
	var x0 = parseFloat(divG.getAttribute('x0'));
	var ep = parseFloat(divG.getAttribute('ep'));
	var ymax =  parseFloat(divG.getAttribute('ymax'));
	coefficient = {};
	coefficient.x0 = x0;
	coefficient.x = coeff;
	coefficient.ymax = -ymax*zoom;
	coefficient.y = zoom;
	coefficient.ep = ep;
	coefficient.xmoins = 20*ep;
	coefficient.wplus = 30*ep;
	coefficient.ymoins = 10*ep;
	coefficient.hplus = 20*ep;
	coefficient.anim = animationInitiale/100;
}
function getAnimY(y) {
	if (animationInitialeMode=='max') return Math.max(y,coefficient.ymax*coefficient.anim); 
	if (animationInitialeMode=='prop') return y*coefficient.anim; 
	if (animationInitialeMode=='alea') return y*coefficient.anim + coefficient.ymax*Math.random()*(1-coefficient.anim); 
	return y;
}	

function switchGraph(elt) {
	if (modeGraph=='courbe') {
		modeGraph = 'histo';
		elt.setAttribute('src','images/courbe.png');
	} else {
		modeGraph = 'courbe';
		elt.setAttribute('src','images/histo.png');
	}
	affiche_fleche();
	animationInitiale = memoAnimationInitiale;
	var input = document.createElement('input');
	input.setAttribute('id','modeGraph');
	input.setAttribute('value',modeGraph);
	glbSendPost(input);
	if (bornes) trace(bornes.xmin,bornes.xmax);
	else trace();
}
var bornes = null;
function memoBornes(xmin,xmax) {
	bornes = {'xmin':xmin, 'xmax':xmax};
}
l_svg = [];
function initSVG() {	
	var svg = initSVG_nom('svg');
	var svg = initSVG_nom('svgFap',true);
		initCP(svg);
	var svgX = initSVG_nom('svgFapX',true);
		initCP(svgX,'x');
	var svgX = initSVG_nom('svgFapXa',true);
	var svgY = initSVG_nom('svgFapY',true);	
		initCP(svgY,'y');
	var svgY = initSVG_nom('svgFapYa',true);	
	var svgM = initSVG_nom('svgFapMove',true);
	return svg;
}
function initSVG_nom(nom,abs) {
	var svg = document.getElementById(nom);
	if (svg) svg.parentNode.removeChild(svg);
	var divG = document.getElementById('divGraph');
	var svg = document.createElementNS(ns,'svg');
	svg.setAttribute('id',nom);
	l_svg.push(nom);
	svg.setAttribute('xmlns',ns);
	svg.setAttribute('xmlns:xlink',xref);
	svg.setAttribute('version','1.1');
	svg.setAttribute('preserveAspectRatio','none');
	divG.appendChild(svg);	
	var rect = divG.getBoundingClientRect();
	var ratio = parseFloat(divG.getAttribute('ratio'));	
	svg.setAttribute('width',rect.width);
	svg.setAttribute('height',rect.width/ratio);
	svg.setAttribute('width','100%');
	svg.setAttribute('height','100%');
	if (abs) {
		svg.style.position = 'absolute';
		svg.style.left = '0px';
		svg.style.top = '0px';
	} else svg.style.position = 'relative';	
	return svg;
}
function initCP(svg,axe) {
	var id = svg.getAttribute('id');
	var defs = document.createElementNS(ns,'defs');
		svg.appendChild(defs);
	var cp = document.createElementNS(ns,'clipPath');
		cp.setAttribute('id','svgVisuGraph_'+id);
		defs.appendChild(cp);
	var r = document.createElementNS(ns,'rect');
		r.setAttribute('id','svgVisuGraphRect_'+id);
		cp.appendChild(r);
	if (axe) r.setAttribute('axe',axe);
}	
function initCPg(svg) {
	var svgg = document.createElementNS(ns,'g');
		svgg.setAttribute('clip-path','url(#svgVisuGraph_'+svg.getAttribute('id')+')');
		svg.appendChild(svgg);
	return svgg;	
}		
function setVBsvgUnitaire(svg,xmin,xmax,ymin,ymax,c) {	
	if (!c) c = {x:1,y:1};
	var vb = ((xmin-coefficient.x0)*coefficient.x-coefficient.xmoins*c.x)+' '+(-ymax*coefficient.y-coefficient.ymoins*c.y)+' ';
	vb += ((xmax-xmin)*coefficient.x+coefficient.wplus*c.x)+' '+((ymax-ymin)*coefficient.y+coefficient.hplus*c.y)
	svg.setAttribute('viewBox',vb);
	svg.setAttribute("xmin",xmin);
	svg.setAttribute("xmax",xmax);
	svg.setAttribute("ymin",ymin);
	svg.setAttribute("ymax",ymax);
	
	var r = document.getElementById('svgVisuGraphRect_'+svg.getAttribute('id'));
	if (r) {
		r.setAttribute('x',(xmin-coefficient.x0)*coefficient.x);
		r.setAttribute('y',-ymax*coefficient.y-coefficient.ep*5*c.y);
		r.setAttribute('width',(xmax-xmin)*coefficient.x+coefficient.ep*5*c.x);
		r.setAttribute('height',(ymax-ymin)*coefficient.y+coefficient.ep*5*c.y);
		if (r.hasAttribute('axe')) {
			if (r.getAttribute('axe')=='x') {
				r.setAttribute('y',-ymin*coefficient.y-coefficient.ymoins*c.y);
				r.setAttribute('height',coefficient.hplus*c.y);
			}	
			if (r.getAttribute('axe')=='y') {
				r.setAttribute('x',(xmin-coefficient.x0)*coefficient.x-coefficient.xmoins*c.x);
				r.setAttribute('width',coefficient.wplus*c.x);
			}
		}	
	}	
}
function setVBsvg(xmin,xmax,ymin,ymax) {
	for (var s=0; s<l_svg.length; s++) {
		var svg = document.getElementById(l_svg[s]);
		if (svg) {
			setVBsvgUnitaire(svg,xmin,xmax,ymin,ymax);
		}
	}
}

function trace(xmin,xmax,ymin,ymax) {
	if (modeGraph=='courbe') traceCourbe(xmin,xmax,ymin,ymax);
	if (modeGraph=='histo') traceHisto(xmin,xmax,ymin,ymax);
	if (modeGraph=='activite') traceActivite(xmin,xmax,ymin,ymax);
	if (modeGraph=='periode') tracePeriode(xmin,xmax,ymin,ymax);
	if (modeGraph=='distance') traceDistance(xmin,xmax,ymin,ymax);
}

function traceCourbe(xmin,xmax,ymin,ymax) {
	var divG = document.getElementById('divGraph');
	var divP = document.getElementById('divPoints');
	var ratio = parseFloat(divG.getAttribute('ratio'));
	ratio = getBestRatio(divG);
	divG.setAttribute('ratio',ratio);
	var txmin = parseFloat(divP.getAttribute('xmin'));
	var txmax = parseFloat(divP.getAttribute('xmax'));
	var tymin = 0;
	var tymax = parseFloat(divP.getAttribute('nb'));
	if (!xmin) xmin = txmin;
	if (!xmax) xmax = txmax;
	if (!ymin) ymin = tymin;
	if (!ymax) ymax = tymax;
	memoBornes(xmin,xmax);
	if (modeZoom=='x') {
		var b = getBornesY(divP,xmin,xmax);
		if (b) {
			ymin = b.ymin-1;
			ymax = b.ymax;
		}
	}
	var w = (xmax-xmin);
	var coeff = Math.pow(10,parseInt(Math.log10(100/w)));
	w = (xmax-xmin)*coeff;
	var h = (ymax-ymin);
	var zoom = w/(ratio*h);
	var ep = w/(divG.getBoundingClientRect().width/2);
	if (ep<0.01) ep=0.01;

	divG.setAttribute('zoom',zoom);
	divG.setAttribute('coeff',coeff);
	divG.setAttribute('x0',xmin);
	divG.setAttribute('ep',ep);
	divG.setAttribute('ratio',ratio);
	divG.setAttribute('ymax',ymax);
	actuCoeff();
	var svg = initSVG();
	setVBsvg(xmin,xmax,ymin,ymax);
	var svgg = initCPg(svg);		
			
	var d = "";
	var df = "";
	var point = divP.firstChild;
	while (point) {
		var nb = parseInt(point.getAttribute('nb'));
		var ind = parseFloat(point.getAttribute('ind'));
		if (!isNaN(nb)) {
			var nbY = getAnimY(-nb*coefficient.y);
			if (d!='') d += " L "+ (ind-xmin)*coefficient.x+","+memoNbY;
			else d += (ind-xmin)*coefficient.x+",0";
			d += " L "+ (ind-xmin)*coefficient.x+","+nbY;
		}
		memoInd = ind;
		memoNbY = nbY;
		point = point.nextSibling;
	}
	if (d!="") {		
		dp = (ind-xmin)*coefficient.x+","+nbY+' L '+(txmax-xmin)*coefficient.x+","+nbY;
		d1 = "M "+(txmin-xmin)*coefficient.x+",0 L "+ d + " L " + dp + " L " +(txmax-xmin)*coefficient.x + ",0";
		d2 = "M " + d;
		d3 = "M " + dp
		var path = document.createElementNS(ns,'path');
			path.setAttribute('fill',colorFill);
			path.setAttribute('d',d1);
			path.setAttribute('opacity',0.5);
			path.setAttribute('stroke','none');
			svgg.appendChild(path);
		var path = document.createElementNS(ns,'path');
			path.setAttribute('fill','none');
			path.setAttribute('d',d2);
			path.setAttribute('stroke-width',coefficient.ep);
			path.setAttribute('stroke',colorStroke);
			svgg.appendChild(path);
		var path = document.createElementNS(ns,'path');
			path.setAttribute('fill','none');
			path.setAttribute('d',d3);
			path.setAttribute('stroke-width',coefficient.ep);
			path.setAttribute('stroke',colorStroke);
			path.setAttribute('stroke-dasharray',coefficient.ep+' '+coefficient.ep);
			svgg.appendChild(path);		
	}
	traceAxes(xmin,xmax,ymin,ymax);
	finishGraph();
}
function traceHisto(xmin,xmax,ymin,ymax) {
	modeGraph = 'histo';
	var divG = document.getElementById('divGraph');
	var divP = document.getElementById('divHistos');
	var ratio = parseFloat(divG.getAttribute('ratio'));
	ratio = getBestRatio(divG);
	divG.setAttribute('ratio',ratio);
	var txmin = parseFloat(divP.getAttribute('xmin'));
	var txmax = parseFloat(divP.getAttribute('xmax'));
	var tymin = 0;
	var tymax = parseFloat(divP.getAttribute('nb'));
	if (!xmin) xmin = txmin;
	if (!xmax) xmax = txmax;
	if (!ymin) ymin = tymin;
	if (!ymax) ymax = tymax;
	memoBornes(xmin,xmax);
	if (modeZoom=='x') {
		ymin = 0;
		var b = getBornesY(divP,xmin,xmax);
		if (b) ymax = b.ymax+1;
		else ymax = 2;
	}
	var w = (xmax-xmin);
	var coeff = Math.pow(10,parseInt(Math.log10(100/w)));
	w = (xmax-xmin)*coeff;
	var h = (ymax-ymin);
	var zoom = w/(ratio*h);
	var ep = w/(divG.getBoundingClientRect().width/2);
	if (ep<0.01) ep=0.01;
	divG.setAttribute('zoom',zoom);
	divG.setAttribute('coeff',coeff);
	divG.setAttribute('x0',xmin);
	divG.setAttribute('ep',ep);
	divG.setAttribute('ymax',ymax);
	actuCoeff();
	var svg = initSVG();
	setVBsvg(xmin,xmax,ymin,ymax);
	var svgg = initCPg(svg);	
	
	var point = divP.firstChild;
	while (point) {
		var nb = parseInt(point.getAttribute('nb'));
		var ind = parseFloat(point.getAttribute('ind'));
		var l = parseFloat(point.getAttribute('l'));
		if (!isNaN(nb)) {
			var y = getAnimY(-nb*coefficient.y);
			var rect = document.createElementNS(ns,'rect');
				rect.setAttribute('fill',colorFill);
				rect.setAttribute('opacity',0.5);
				rect.setAttribute('x',(ind-xmin)*coefficient.x);		
				rect.setAttribute('y',y);
				rect.setAttribute('width',l*coefficient.x);
				rect.setAttribute('height',-y);
				svgg.appendChild(rect);
			var rect2 = rect.cloneNode();
				rect2.setAttribute('fill','none');
				rect2.setAttribute('opacity',1);
				rect2.setAttribute('stroke',colorStroke);
				rect2.setAttribute('stroke-width',coefficient.ep);
				svgg.appendChild(rect2);
		}
		point = point.nextSibling;
	}
	traceAxes(xmin,xmax,ymin,ymax);
	finishGraph();
}
function traceActivite(xmin,xmax,ymin,ymax) {
	modeGraph = 'activite';
	var divG = document.getElementById('divGraph');
	var divP = document.getElementById('divPoints');
	var ratio = parseFloat(divG.getAttribute('ratio'));
	ratio = getBestRatio(divG);
	divG.setAttribute('ratio',ratio);
	var txmin = parseFloat(divP.getAttribute('xmin'));
	var txmax = parseFloat(divP.getAttribute('xmax'));
	var tymin = 0;
	var tymax = parseFloat(divP.getAttribute('nb'));
	if (!xmin) xmin = txmin;
	if (!xmax) xmax = txmax;
	if (!ymin) ymin = tymin;
	if (!ymax) ymax = tymax;
	memoBornes(xmin,xmax);
	if (modeZoom=='x') {
		ymin = 0;
		var b = getBornesY(divP,xmin,xmax);
		if (b) ymax = b.ymax;
		else ymax = 2;
	}
	var w = (xmax-xmin);
	var coeff = Math.pow(10,parseInt(Math.log10(100/w)));
	w = (xmax-xmin)*coeff;
	var h = (ymax-ymin);
	var zoom = w/(ratio*h);
	var ep = w/(divG.getBoundingClientRect().width/2);
	if (ep<0.01) ep=0.01;

	divG.setAttribute('zoom',zoom);
	divG.setAttribute('coeff',coeff);
	divG.setAttribute('x0',xmin);
	divG.setAttribute('ep',ep);
	divG.setAttribute('ymax',ymax);
	actuCoeff();
	var svg = initSVG();
	setVBsvg(xmin,xmax,ymin,ymax);
	var svgg = initCPg(svg);	
	
	var sens = 1;	
	var deb = null;
	var prec = null;
	var l = null;
	var ll = 0.5;
	var rect = null;
	var point = divP.firstChild;
	while (point) {
		var ind = parseFloat(point.getAttribute('ind'));
		if (point.tagName=='CATCH') {
			var ss = [-1,1];
			for (var s=0; s<ss.length; s++) {
				var c = document.createElementNS(ns,'ellipse');
				c.setAttribute('fill','#5B1D73');
				c.setAttribute('stroke','none');
				c.setAttribute('opacity',0.5);
				c.setAttribute('cx',(ind-xmin)*coefficient.x);		
				c.setAttribute('cy',-coefficient.y-ss[s]*6*coefficient.ep);
				c.setAttribute('rx',coefficient.ep);
				c.setAttribute('ry',coefficient.ep*3);
				svgg.appendChild(c);
			}
		}
		if (point.tagName=='FAP') {
			var c = document.createElementNS(ns,'circle');
			c.setAttribute('fill','#BF0026');
			c.setAttribute('stroke','none');
			c.setAttribute('opacity',0.5);
			c.setAttribute('cx',(ind-xmin)*coefficient.x);		
			c.setAttribute('cy',-coefficient.y);
			c.setAttribute('r',coefficient.ep*2);
			svgg.appendChild(c);
			if (point.hasAttribute('declare')) {
				var declare = parseFloat(point.getAttribute('declare'));
				var p = document.createElementNS(ns,'path');
				p.setAttribute('stroke-width',coefficient.ep/2);
				p.setAttribute('stroke','#BF0026');
				p.setAttribute('fill','none');
				var d = 'M '+((ind-xmin)*coefficient.x)+','+(-coefficient.y-sens*2*coefficient.ep);
				d += ' L '+((ind-xmin)*coefficient.x)+','+(-coefficient.y-sens*3*coefficient.ep);
				d += ' L '+((declare-xmin)*coefficient.x)+','+(-coefficient.y-sens*3*coefficient.ep);
				d += ' L '+((declare-xmin)*coefficient.x)+','+(-coefficient.y-sens*5*coefficient.ep);
				p.setAttribute('d',d);
				svgg.appendChild(p);
			}
			if (point.hasAttribute('catched')) {
				if (point.hasAttribute('declare')) var indd = parseFloat(point.getAttribute('declare'));
				else indd = ind;
				var pc = point.firstChild;
				while (pc) {
					var catched = parseFloat(pc.getAttribute('catched'));
					var p = document.createElementNS(ns,'path');
					p.setAttribute('stroke-width',coefficient.ep/2);
					p.setAttribute('stroke','#5B1D73');
					p.setAttribute('fill','none');
					var d = 'M '+((indd-xmin)*coefficient.x)+','+(-coefficient.y-sens*1.5*coefficient.ep);
					d += ' L '+((indd-xmin)*coefficient.x)+','+(-coefficient.y-sens*13*coefficient.ep);
					d += ' L '+((catched-xmin)*coefficient.x)+','+(-coefficient.y-sens*13*coefficient.ep);
					d += ' L '+((catched-xmin)*coefficient.x)+','+(-coefficient.y-sens*8*coefficient.ep);
					p.setAttribute('d',d);
					svgg.appendChild(p);
					pc = pc.nextSibling;
				}					
			}
			sens = -1*sens;
		}
		if (point.tagName=='CNX') {
			var fin = (parseFloat(point.getAttribute('fin'))-xmin)*coefficient.x+coefficient.ep*ll;
			var i = (ind-xmin)*coefficient.x-coefficient.ep*ll;
			if (!prec || !deb || prec<i) {
				deb = i;
				rect = null;
			}
			l = fin-deb;
			if (!rect) {
				rect = document.createElementNS(ns,'rect');
				rect.setAttribute('fill','#FF78DE');
				rect.setAttribute('stroke','none');
				rect.setAttribute('opacity',0.5);
				rect.setAttribute('y',-1.5*coefficient.y + coefficient.y*(1-coefficient.anim)/2);
				rect.setAttribute('height',coefficient.y*coefficient.anim);
				rect.setAttribute('x',deb);	
				svgg.appendChild(rect);
			}										
			if (!rect.hasAttribute('width') || l>parseFloat(rect.getAttribute('width'))) rect.setAttribute('width',l);
			prec = parseFloat(rect.getAttribute('x')) + parseFloat(rect.getAttribute('width'));
		}
		point = point.nextSibling;
	}
	traceAxes(xmin,xmax,ymin,ymax);
	finishGraph();
}
function tracePeriode(xmin,xmax,ymin,ymax) {
	modeGraph = 'periode';
	var divG = document.getElementById('divGraph');
	var divP = document.getElementById('divPoints');
	var ratio = parseFloat(divG.getAttribute('ratio'));
	ratio = getBestRatio(divG);
	divG.setAttribute('ratio',ratio);
	var txmin = 0;
	var txmax = parseFloat(divP.getAttribute('xmax'));
	var tymin = 0;
	var tymax = 2;
	if (!xmin) xmin = txmin;
	if (!xmax) xmax = txmax;
	if (!ymin) ymin = tymin;
	if (!ymax) ymax = tymax;
	memoBornes(xmin,xmax);
	var b = getBornesY(divP,xmin,xmax);
	if (b) ymax = b.ymax;
	else ymax = 2;
	var w = (xmax-xmin);
	var coeff = Math.pow(10,parseInt(Math.log10(100/w)));
	w = (xmax-xmin)*coeff;
	var h = (ymax-ymin);
	var zoom = w/(ratio*h);
	var ep = w/(divG.getBoundingClientRect().width/2);
	if (ep<0.01) ep=0.01;

	divG.setAttribute('zoom',zoom);
	divG.setAttribute('coeff',coeff);
	divG.setAttribute('x0',xmin);
	divG.setAttribute('ep',ep);
	divG.setAttribute('ymax',ymax);
	deltaX = txmax;
	actuCoeff();
	var svg = initSVG();
	setVBsvg(xmin,xmax,ymin,ymax);
	var svgg = initCPg(svg);		
	
	var d = "";
	var memoInd = null;
	var memoNb = null;
	var g = document.createElementNS(ns,'g');
	var point = divP.firstChild;
	var prec = parseFloat(divP.getAttribute('prec'));
	while (point) {
		var nb = parseFloat(point.getAttribute('nb'));
		var ind = parseFloat(point.getAttribute('ind'));
		if (!isNaN(nb)) {
			var nbY = getAnimY(-nb*coefficient.y);
			if (d!='') {
				d += " S " + (memoInd-xmin+0.8*prec)*coefficient.x+","+memoNbY;
				d += " "+ ((ind+memoInd)/2-xmin+0.4*prec)*coefficient.x+","+(memoNbY+nbY)/2;
				d += " S ";
			} else {
				var fin = (parseFloat(divP.getAttribute('fin'))+nb)/2;
				var finY = getAnimY(-fin*coefficient.y);
				d = (-nbfPeriode*txmax-xmin)*coefficient.x+ ","+ finY + " S ";
			}	
			d += (ind-xmin+0.2*prec)*coefficient.x+","+nbY; 
			d += " "+ (ind-xmin+0.4*prec)*coefficient.x+","+nbY;
			d += " L " + (ind-xmin+0.6*prec)*coefficient.x+","+nbY;
			
			memoInd = ind;
			memoNbY = nbY;
			
			
			var c = document.createElementNS(ns,'circle');
				c.setAttribute('fill',colorStroke);
				c.setAttribute('stroke','none');
				c.setAttribute('opacity',0.8);
				c.setAttribute('cx',(ind-xmin+0.5*prec)*coefficient.x);		
				c.setAttribute('cy',nbY);
				c.setAttribute('r',coefficient.ep*2);
				if (point.hasAttribute('last')) {
					c.setAttribute('fill','#BF0026');
					c.setAttribute('r',coefficient.ep*3);
				}
				g.appendChild(c);
		}
		point = point.nextSibling;
	}
	
	if (d!="") {	
		d += " S " + (memoInd-xmin+0.8*prec)*coefficient.x+","+memoNbY;
		d += " "+(txmax*(nbfPeriode+1)-xmin)*coefficient.x+","+finY;
		d1 = "M "+(-nbfPeriode*txmax-xmin)*coefficient.x+",0 L " + d + " L " + (txmax*(nbfPeriode+1)-xmin)*coefficient.x+ ",0";
		d2 = "M " + d;
		var path = document.createElementNS(ns,'path');
			path.setAttribute('fill',colorFill);
			path.setAttribute('d',d1);
			path.setAttribute('opacity',0.5);
			path.setAttribute('stroke','none');
			svgg.appendChild(path);
		var path = document.createElementNS(ns,'path');
			path.setAttribute('fill','none');
			path.setAttribute('d',d2);
			path.setAttribute('stroke-width',coefficient.ep);
			path.setAttribute('stroke',colorStroke);
			svgg.appendChild(path);
		svgg.appendChild(g);	
	}
	traceAxes(xmin,xmax,ymin,ymax);
	finishGraph();
}

function traceDistance(xmin,xmax,ymin,ymax) {
	modeGraph = 'distance';
	var divG = document.getElementById('divGraph');
	var divP = document.getElementById('divPoints');
	var ratio = parseFloat(divG.getAttribute('ratio'));
	ratio = getBestRatio(divG);
	divG.setAttribute('ratio',ratio);
	var txmin = 0;
	var txmax = parseFloat(divP.getAttribute('xmax'));
	var tymin = 0;
	var tymax = 2;
	if (!xmin) xmin = txmin;
	if (!xmax) xmax = txmax;
	if (!ymin) ymin = tymin;
	if (!ymax) ymax = tymax;
	memoBornes(xmin,xmax);
	var b = getBornesY(divP,xmin,xmax);
	if (b) ymax = b.ymax;
	else ymax = 2;
	var w = (xmax-xmin);
	var coeff = Math.pow(10,parseInt(Math.log10(100/w)));
	w = (xmax-xmin)*coeff;
	var h = (ymax-ymin);
	var zoom = w/(ratio*h);
	var ep = w/(divG.getBoundingClientRect().width/2);
	if (ep<0.01) ep=0.01;

	divG.setAttribute('zoom',zoom);
	divG.setAttribute('coeff',coeff);
	divG.setAttribute('x0',xmin);
	divG.setAttribute('ep',ep);
	divG.setAttribute('ymax',ymax);
	deltaX = 0;
	actuCoeff();
	var svg = initSVG();
	setVBsvg(xmin,xmax,ymin,ymax);
	var svgg = initCPg(svg);		
	
	var d = "";
	var memoInd = null;
	var memoNb = null;
	var g = document.createElementNS(ns,'g');
	var point = divP.firstChild;
	var prec = parseFloat(divP.getAttribute('prec'));
	while (point) {
		var nb = parseFloat(point.getAttribute('nb'));
		var ind = parseFloat(point.getAttribute('ind'));
		if (!isNaN(nb)) {
			var y = getAnimY(-nb*coefficient.y);
			var rect = document.createElementNS(ns,'rect');
				rect.setAttribute('fill',colorFill);
				rect.setAttribute('opacity',0.5);
				rect.setAttribute('x',(ind-xmin)*coefficient.x);		
				rect.setAttribute('y',y);
				rect.setAttribute('width',prec*coefficient.x);
				rect.setAttribute('height',-y);
				svgg.appendChild(rect);
			var rect2 = rect.cloneNode();
				rect2.setAttribute('fill','none');
				rect2.setAttribute('opacity',1);
				rect2.setAttribute('stroke',colorStroke);
				rect2.setAttribute('stroke-width',coefficient.ep);
				svgg.appendChild(rect2);
			if (point.hasAttribute('last')) {	
				var c = document.createElementNS(ns,'circle');
					c.setAttribute('fill','#BF0026');
					c.setAttribute('stroke','none');
					c.setAttribute('opacity',0.8);
					c.setAttribute('cx',(ind-xmin+0.5*prec)*coefficient.x);		
					c.setAttribute('cy',y);
					c.setAttribute('r',coefficient.ep*3);
					svgg.appendChild(c);
			}	
		}
		point = point.nextSibling;
	}
	traceAxes(xmin,xmax,ymin,ymax);
	finishGraph();
}

function getBornesY(divP,xmin,xmax) {
	var ymin = null;
	var ymax = null;
	var memo = {};
	var point = divP.firstChild;
	while (point) {
		var nb = parseFloat(point.getAttribute('nb'));
		
		var ind = parseFloat(point.getAttribute('ind'));
		if (!isNaN(nb) && ind>=xmin && ind<=xmax) {
			if (!ymin) ymin = nb;
			if (!ymax) ymax = nb;
			ymin = Math.min(ymin,nb);
			ymax = Math.max(ymax,nb);
		}
		if (ind<xmin) memo.inf = nb;
		if(ind>xmax && !memo.sup) memo.sup = nb;
		point = point.nextSibling;
	}
	if (ymin!=null) return {'ymin':ymin, 'ymax':ymax};
	else {
		if (!memo.sup) memo.sup = memo.inf;
		if (!memo.inf) memo.inf = memo.sup;
		return {'ymin':Math.min(memo.inf,memo.sup), 'ymax':Math.max(memo.inf,memo.sup)};
	}
}

function gAxe(id,cp) {
	var svg = document.getElementById(id);
	var axe = document.getElementById(id+'_axe');
	if (!axe) axe = document.createElementNS(ns,'g');
		axe.setAttribute('id',id+'_axe');
		axe.setAttribute('stroke-width',coefficient.ep);
		axe.setAttribute('stroke','#000000');
		axe.setAttribute('fill','none');
		if (cp) axe.setAttribute('clip-path','url(#svgVisuGraph_'+id+')');
		svg.appendChild(axe);
	return axe;
}
function traceAxes(xmin,xmax,ymin,ymax) {
	var svg = document.getElementById('svgFap');
	var axe = gAxe('svgFapXa');	
	var path = document.createElementNS(ns,'path');
		var l = 'M '+(xmin-coefficient.x0)*coefficient.x+','+(-ymin*coefficient.y);
		l += ' L '+((xmax-coefficient.x0)*coefficient.x+coefficient.ep*10)+','+(-ymin*coefficient.y);
		path.setAttribute('d',l)
		axe.appendChild(path);
	var path = document.createElementNS(ns,'path');
		var l = 'M '+((xmax-coefficient.x0)*coefficient.x+coefficient.ep*10)+','+(-ymin*coefficient.y);
		l += ' L '+((xmax-coefficient.x0)*coefficient.x+coefficient.ep*5)+','+(-ymin*coefficient.y-coefficient.ep*5);
		path.setAttribute('d',l);
		axe.appendChild(path);
	var path = document.createElementNS(ns,'path');
		var l = 'M '+((xmax-coefficient.x0)*coefficient.x+coefficient.ep*10)+','+(-ymin*coefficient.y);
		l += ' L '+((xmax-coefficient.x0)*coefficient.x+coefficient.ep*5)+','+(-ymin*coefficient.y+coefficient.ep*5);
		path.setAttribute('d',l);
		axe.appendChild(path);
	var axe = gAxe('svgFapX',true);
		axe.setAttribute('barre',-ymin*coefficient.y);
	if (modeGraph=='periode') makeBarreauXP(axe,xmin,xmax);
	else if (modeGraph=='distance') makeBarreauXD(axe,xmin,xmax);
	else makeBarreauX(axe,xmin,xmax);
	
	var axe = gAxe('svgFapYa');	
	var path = document.createElementNS(ns,'path');
		var l = 'M '+(xmin-coefficient.x0)*coefficient.x+','+(-ymin*coefficient.y);
		l += ' L '+((xmin-coefficient.x0)*coefficient.x)+','+(-ymax*coefficient.y-coefficient.ep*10);
		path.setAttribute('d',l);
		axe.appendChild(path);
	var path = document.createElementNS(ns,'path');
		var l = 'M '+(xmin-coefficient.x0)*coefficient.x+','+(-ymax*coefficient.y-coefficient.ep*10);
		l += ' L '+((xmin-coefficient.x0)*coefficient.x-coefficient.ep*5)+','+(-ymax*coefficient.y-coefficient.ep*5);
		path.setAttribute('d',l);
		axe.appendChild(path);
	var path = document.createElementNS(ns,'path');
		var l = 'M '+(xmin-coefficient.x0)*coefficient.x+','+(-ymax*coefficient.y-coefficient.ep*10);
		l += ' L '+((xmin-coefficient.x0)*coefficient.x+coefficient.ep*5)+','+(-ymax*coefficient.y-coefficient.ep*5);
		path.setAttribute('d',l);
		axe.appendChild(path);
	var axe = gAxe('svgFapY',true);	
		axe.setAttribute('barre',(xmin-coefficient.x0)*coefficient.x);
	makeBarreauY(axe,ymin,ymax);
}
function up2(i) {
	var s = i+'';
	if (s.length<2) s = '0'+s;
	return s;
}
function dateJ(d,pasJ,zero) {
	var dateDef =  up2(d.getDate())+'/'+up2(d.getMonth()+1) + "/" + d.getFullYear() ;
	if (pasJ=='seconde10') date = up2(Math.round(d.getSeconds()/10)*10) + "''";
	if (pasJ=='seconde') date = up2(d.getSeconds()) + "''";
	if (d.getSeconds()==0 && !zero) date = up2(d.getMinutes()) + "'";
	if (pasJ=='minute5') date = up2(Math.round(d.getMinutes()/5)*5) + "'";
	if (pasJ=='minute') date = up2(d.getMinutes()) + "'";
	if (d.getMinutes()==0 && d.getSeconds()==0 && !zero) date = up2(d.getHours()) + "h";
	if (pasJ=='heure') date = up2(d.getHours()) + "h";
	if (d.getHours()==0 && d.getMinutes()==0 && d.getSeconds()==0 && !zero) date = dateDef;
	if (pasJ=='jour') date = dateDef;
	if (pasJ=='mois') date =  up2(d.getMonth()+1) + "/" + d.getFullYear() ;
	if (pasJ=='an') date =  d.getFullYear() ;
	if (pasJ=='hm') date = dateDef + " " + up2(d.getHours()) + "h" + up2(d.getMinutes()) ;
	return date	;
}

function makebarreauUnitX(axe,ech,lib) {
	var barre = parseFloat(axe.getAttribute('barre'));
	var path = document.createElementNS(ns,'path');
		path.setAttribute('d','M '+(ech-coefficient.x0)*coefficient.x+','+barre+' L '+(ech-coefficient.x0)*coefficient.x+','+(barre-coefficient.ep*3)+' Z');				
		axe.appendChild(path);
	var text = document.createElementNS(ns,'text');
		text.setAttribute('x',(ech-coefficient.x0)*coefficient.x);
		text.setAttribute('y',barre+coefficient.ep*8);
		text.setAttribute('text-anchor','middle');					
		text.setAttribute('font-family','Verdana');
		text.setAttribute('font-size',coefficient.ep*6);
		lib = lib + "";
		if (lib.indexOf("''")>0) {
			text.setAttribute('y',barre+coefficient.ep*6);
			text.setAttribute('font-size',coefficient.ep*4);
		} else if (lib.indexOf("'")>0) {
			text.setAttribute('y',barre+coefficient.ep*7);
			text.setAttribute('font-size',coefficient.ep*5);
		}
		text.setAttribute('stroke-width',coefficient.ep/2);
		text.setAttribute('stroke','#000000');
		text.setAttribute('fill','#000000');
		text.innerHTML = lib;
		axe.appendChild(text);
}	
function makeBarreauX(axe,min,max) {
	
	var nbj = max-min;
	var pasJ = 'jour';
	var pas = 1;
	var w = axe.parentNode.parentNode.getBoundingClientRect().width;
	if (100000000*nbj>w) {
		pasJ = 'seconde';
		var c = parseInt(10000000*nbj/w);
		var tpas = [1,2,5,10,20,30,60];
		for (var h=0; h<tpas.length; h++) {
			if (c>=tpas[h]) pas = tpas[h];
		}
	}
	if (200000*nbj>w) {
		pasJ = 'minute';
		var c = parseInt(200000*nbj/w);
		var tpas = [1,2,5,10,20,30,60];
		for (var h=0; h<tpas.length; h++) {
			if (c>=tpas[h]) pas = tpas[h];
		}
	}
	if (2000*nbj>w) {
		pasJ = 'heure';
		var c = parseInt(5000*nbj/w);
		var tpas = [1,3,6,12,24];
		for (var h=0; h<tpas.length; h++) {
			if (c>=tpas[h]) pas = tpas[h];
		}
	}
	if (150*nbj>w) {
		pasJ = 'jour';
		pas = parseInt(150*nbj/w);
	}
	if (5*nbj>w) {
		pasJ = 'mois';
		pas = parseInt(5*nbj/w);
	}
	if (nbj>w*2) {
		pasJ = 'an';
		pas = parseInt(nbj/(w*2));
	}
	axe.setAttribute('pas',pas);
	axe.setAttribute('pasJ',pasJ);
	var d = new Date(min*zx);
	d.setMilliseconds(0);
	if (pasJ=='seconde') {
		var v = 0;
		var k = 0;
		while (k*pas<61) {
			if (d.getSeconds()>=k*pas) v = k*pas;
			k++;
		}
		d.setSeconds(v);	
	}
	if (pasJ=='minute') {
		d.setSeconds(0);
		var v = 0;
		var k = 0;
		while (k*pas<61) {
			if (d.getMinutes()>=k*pas) v = k*pas;
			k++;
		}
		d.setMinutes(v);	
	}
	if (pasJ=='heure') {
		d.setSeconds(0);
		d.setMinutes(0);
		var v = 0;
		var k = 0;
		while (k*pas<25) {
			if (d.getHours()>=k*pas) v = k*pas;
			k++;
		}
		d.setHours(v);	
	}
	if (pasJ=='jour') {	
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		d.setDate(d.getDate()+pas);	
	}
	if (pasJ=='mois') {
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		d.setDate(1);
		d.setMonth(d.getMonth()+pas);
	}
	if (pasJ=='an') {
		d.setSeconds(0);
		d.setMinutes(0);
		d.setHours(0);
		d.setDate(1);
		d.setMonth(0);
		d.setFullYear(d.getFullYear()+pas);
	}
	axe.setAttribute('min',d/zx);
	var dmax = new Date(max*zx);
	while (d<dmax) {
		axe.setAttribute('max',d/zx);
		var ech = d/zx;
		var lib = dateJ(d,pasJ);
		makebarreauUnitX(axe,ech,lib);	
		if (pasJ=='seconde') d.setSeconds(d.getSeconds()+pas);
		if (pasJ=='minute') d.setMinutes(d.getMinutes()+pas);
		if (pasJ=='heure') d.setHours(d.getHours()+pas);
		if (pasJ=='jour') d.setDate(d.getDate()+pas);
		if (pasJ=='mois') d.setMonth(d.getMonth()+pas);
		if (pasJ=='an') d.setFullYear(d.getFullYear()+pas);
	}	
}
function addBarreauX(axe,min,max) {
	var axemin = parseFloat(axe.getAttribute('min'));
	var axemax = parseFloat(axe.getAttribute('max'));
	var pas = parseInt(axe.getAttribute('pas'));
	var pasJ = axe.getAttribute('pasJ');
	var d = new Date(axemin*zx);
	var dmin = new Date(min*zx);
	while (d>dmin) {
		if (pasJ=='seconde') d.setSeconds(d.getSeconds()-pas);
		if (pasJ=='minute') d.setMinutes(d.getMinutes()-pas);
		if (pasJ=='heure') d.setHours(d.getHours()-pas);
		if (pasJ=='jour') d.setDate(d.getDate()-pas);
		if (pasJ=='mois') d.setMonth(d.getMonth()-pas);
		if (pasJ=='an') d.setFullYear(d.getFullYear()-pas);
		if (d>dmin) {
			axe.setAttribute('min',d/zx);
			var ech = d/zx;
			var lib = dateJ(d,pasJ);
			makebarreauUnitX(axe,ech,lib);
		}
	}
	var d = new Date(axemax*zx);
	var dmax = new Date(max*zx);	
	while (d<dmax) {
		if (pasJ=='seconde') d.setSeconds(d.getSeconds()+pas);
		if (pasJ=='minute') d.setMinutes(d.getMinutes()+pas);
		if (pasJ=='heure') d.setHours(d.getHours()+pas);
		if (pasJ=='jour') d.setDate(d.getDate()+pas);
		if (pasJ=='mois') d.setMonth(d.getMonth()+pas);
		if (pasJ=='an') d.setFullYear(d.getFullYear()+pas);
		if (d<dmax) {
			axe.setAttribute('max',d/zx);
			var ech = d/zx;
			var lib = dateJ(d,pasJ);
			makebarreauUnitX(axe,ech,lib);
		}
	}
}

function makeBarreauXP(axe,min,max) {
	var w = axe.parentNode.parentNode.getBoundingClientRect().width;
	var barre = parseFloat(axe.getAttribute('barre'));
	for (var k=-nbfPeriode; k<nbfPeriode+1; k++) {
		for (var l=0; l<lstPeriode.length; l++) {
			var ech = (l+1)*pasPeriode + k*lstPeriode.length*pasPeriode;
			var path = document.createElementNS(ns,'path');
				path.setAttribute('d','M '+(ech-coefficient.x0)*coefficient.x+','+barre+' L '+(ech-coefficient.x0)*coefficient.x+','+(barre+coefficient.ep*3)+' Z');				
				axe.appendChild(path);
			var text = document.createElementNS(ns,'text');
				text.setAttribute('x',(ech-pasPeriode/2-coefficient.x0)*coefficient.x);
				text.setAttribute('y',barre+coefficient.ep*8);
				text.setAttribute('text-anchor','middle');					
				text.setAttribute('font-family','Verdana');
				text.setAttribute('font-size',coefficient.ep*6);
				lib = lstPeriode[l];
				if (w<1000 && miniPeriode) lib = lstPeriode[l].substr(0,2);
				text.setAttribute('stroke-width',coefficient.ep/2);
				text.setAttribute('stroke','#000000');
				text.setAttribute('fill','#000000');
				text.innerHTML = lib;
				axe.appendChild(text);
		}	
	}	
}	
function makeBarreauXD(axe,min,max) {
	var w = axe.parentNode.parentNode.getBoundingClientRect().width;
	var barre = parseFloat(axe.getAttribute('barre'));
	for (var k=0; k<max; k++) {
		if (t_distleg[k]!==undefined) {
			var ech = k;
			var tlong = coefficient.ep*3;
			var lib = '';
			if (t_dist[k]) lib = t_dist[k];
			if (lib=='') tlong = tlong/2;
			var path = document.createElementNS(ns,'path');
				path.setAttribute('d','M '+(ech-coefficient.x0)*coefficient.x+','+barre+' L '+(ech-coefficient.x0)*coefficient.x+','+(barre+tlong)+' Z');				
				axe.appendChild(path);
			var text = document.createElementNS(ns,'text');
				text.setAttribute('x',(ech+0.5-coefficient.x0)*coefficient.x);
				text.setAttribute('y',barre+coefficient.ep*8);
				text.setAttribute('text-anchor','middle');					
				text.setAttribute('font-family','Verdana');
				text.setAttribute('font-size',coefficient.ep*6);
				text.setAttribute('stroke-width',coefficient.ep/2);
				text.setAttribute('stroke','#000000');
				text.setAttribute('fill','#000000');
				text.innerHTML = lib;
				axe.appendChild(text);
		}	
	}	
}


function affLeg(x,pas) {
	var txt = x;
	if (modeGraph=='periode' || modeGraph=='distance') return Math.round(x*10)/10 + "%";
	if (pas>0) {
		var sigle = [[7,'Z'],[6,'E'],[5,'P'],[4,'T'],[3,'G'],[2,'M'],[1,'K']];
		for (var i=0; i<sigle.length; i++) {
			var n = sigle[i][0];
			var s = sigle[i][1];
			if (pas>=Math.pow(10,n*3-1)) return parseInt(x/Math.pow(10,n*3-1))/10+s;
		}
		return Math.round(x);
	}	
	return x;
}
function makebarreauUnitY(axe,ech,lib) {
	var barre = parseFloat(axe.getAttribute('barre'));
	var path = document.createElementNS(ns,'path');
		path.setAttribute('d','M '+barre+','+(-ech*coefficient.y)+' L '+(barre+coefficient.ep*3)+','+(-ech*coefficient.y)+' Z');				
		axe.appendChild(path);
	var text = document.createElementNS(ns,'text');
		text.setAttribute('x',barre-coefficient.ep*3);
		text.setAttribute('y',-ech*coefficient.y+coefficient.ep*2);
		text.setAttribute('text-anchor','end');					
		text.setAttribute('font-family','Verdana');
		text.setAttribute('font-size',coefficient.ep*6);
		text.setAttribute('stroke-width',coefficient.ep/2);
		text.setAttribute('stroke','');
		text.setAttribute('fill','');
		text.innerHTML = lib;
		axe.appendChild(text);	
}
function makeBarreauY(axe,min,max,barre) {
	var nbf = max-min;
	var p = parseInt(Math.log10(nbf))-1;
	var a = Math.pow(10,p);
	var h = axe.parentNode.parentNode.getBoundingClientRect().height;
	var pas = parseFloat(100*nbf/h);
	if (pas>10) {
		p = parseInt(Math.log10(pas));
		a = Math.pow(10,p);
	}
	if (pas>=1) {
		pas = parseInt(pas/a)*a;
	} else {
		if (pas<0.1) pas = 0.1;
		else {
			if (pas<0.2) pas = 0.2;
			else {
				if (pas<0.5) pas = 0.5;
				else pas = 1;
			}
		}
	}
	axe.setAttribute('pas',pas);
	var ech = Math.floor(min/pas)*pas + pas;
	axe.setAttribute('min',ech);
	while (ech<max) {
		axe.setAttribute('max',ech);
		var lib = affLeg(ech,pas);
		makebarreauUnitY(axe,ech,lib);
		ech = ech + pas;
	}
}
function addBarreauY(axe,min,max) {
	var axemin = parseFloat(axe.getAttribute('min'));
	var axemax = parseFloat(axe.getAttribute('max'));
	var pas = parseFloat(axe.getAttribute('pas'));
	var ech = axemin;
	while (ech>min) {
		ech = ech - pas;
		if (ech>min) {
			axe.setAttribute('min',ech);
			var lib = affLeg(ech,pas);
			makebarreauUnitY(axe,ech,lib);
		}
	}
	var ech = axemax;
	while (ech<max) {
		ech = ech + pas;
		if (ech<max) {
			axe.setAttribute('max',ech);
			var lib = affLeg(ech,pas);
			makebarreauUnitY(axe,ech,lib);
		}
	}
}



// fonction de zoom
var resizeTimer;
function resizeGraph(ev) {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function() {
		recharge_viewbox();
	}, 250);
}
function finishGraph() {
	actuPixel();
	var svg = document.getElementById('svgFapMove');
	if (svg) {
		svg.addEventListener('mousemove', mouseMove, false);
		window.addEventListener('resize', resizeGraph, false);
	}
	if (animationInitiale<100) {
		animationInitiale = animationInitiale + animationInitialeSpeed;
		if (animationInitiale>100) animationInitiale = 100;
		setTimeout(function() {
			if (bornes) trace(bornes.xmin,bornes.xmax);
			else trace();
		}, 1);	
	}	
	if (document.getElementById('fleche')) {
		switch (aff_curs) {
			case 'select': 
				affiche_select();
				break;
			case 'main': 
				affiche_main();
				break;
			default: 
				affiche_fleche();
		}
	}	
}
var aff_curs = 'fleche';
var dragObject = null;
var selObject = null;
var zoomObject = null;
var coordCentre = null;
var pixel = null;
function actuPixel() {
	var divG = document.getElementById('divGraph');
	var svg = document.getElementById('svgFap');
	var rect = divG.getBoundingClientRect();
	var xmin = parseFloat(svg.getAttribute('xmin'));
	var xmax = parseFloat(svg.getAttribute('xmax'));
	var ymin = parseFloat(svg.getAttribute('ymin'));
	var ymax = parseFloat(svg.getAttribute('ymax'));
	var vb = svg.getAttribute("viewBox").split(' ');
	var ratio = rect.width/rect.height - vb[2]/vb[3];
	if (ratio>0) {
		svgW = rect.height*vb[2]/vb[3];
		svgH = rect.height;
	} else {
		svgW = rect.width;
		svgH = rect.width*vb[3]/vb[2];	
	}
	pixel = {};
	pixel.x = (vb[2]/1)/rect.width;
	pixel.y = (vb[3]/1)/rect.height;
	pixel.px = (xmax-xmin)/rect.width;
	pixel.py = (ymax-ymin)/rect.height;
	coordCentre = {};
	coordCentre.x = (vb[0]/1+vb[2]/2)/coefficient.x + coefficient.x0;
	coordCentre.y = -(vb[1]/1+vb[3]/2)/coefficient.y;
	coordCentre.w = vb[2]/coefficient.x;
	coordCentre.h = vb[3]/coefficient.y;
	coordCentre.px = (xmin+xmax)/2;
	coordCentre.py = (ymax+ymin)/2;
	coordCentre.pw = (xmax-xmin);
	coordCentre.ph = (ymax-ymin);
}
function affichePos(pos) {
	var txt = "";
	var div = document.getElementById('divPos');
	if (pos) {
 		if (modeGraph=='periode') {
			var p = parseInt(pos.x/pasPeriode);
			p = Math.min(p,lstPeriode.length-1);
			lib = lstPeriode[p];
		} else if (modeGraph=='distance') {
			var p = parseInt(pos.x);
			if (t_distleg[p]!==undefined) lib = t_distleg[p];
			else lib = "["+p+"]";
		} else {
			var d = new Date(pos.x*zx);
			var lib = dateJ(d,'jour');
			if (coordCentre.pw<4) lib += " "+dateJ(d,'heure',true);
			if (coordCentre.pw<0.05) lib += dateJ(d,'minute',true);
			else if (coordCentre.pw<0.3) lib += dateJ(d,'minute5',true);
			if (coordCentre.pw<0.01) lib += dateJ(d,'seconde10',true);
			if (coordCentre.pw>180) lib = " "+dateJ(d,'mois');
		}	
		txt = lib+" , "+affLeg(pos.y,1);
	}
	div.innerHTML = txt;
}
function affiche_fleche() {
	aff_curs = 'fleche';
	document.getElementById('fleche').style.backgroundColor='#BBBBBB';
	document.getElementById('select').style.backgroundColor='#FFFFFF';
	document.getElementById('main').style.backgroundColor='#FFFFFF';
	remove_moveObject();
}
function affiche_select() {
	animationInitiale = 100;
	aff_curs = 'select';
	document.getElementById('fleche').style.backgroundColor='#FFFFFF';
	document.getElementById('select').style.backgroundColor='#BBBBBB';
	document.getElementById('main').style.backgroundColor='#FFFFFF';
	remove_moveObject();
	actuPixel();
	var svg = document.getElementById('svgFapMove');
	if (svg) {
		svg.style.cursor = 'crosshair';
		svg.addEventListener('mousemove', selectMove, false);
		svg.addEventListener('mousedown', selectDown, false);
		svg.addEventListener('mouseup', selectUp, false);
		svg.addEventListener("touchstart",selectTouchInit,false);
		svg.addEventListener("touchmove",selectTouchMove,false);
		svg.addEventListener("touchend",selectTouchEnd,false);
	}
}
function affiche_main() {
	animationInitiale = 100;
	aff_curs = 'main';
	document.getElementById('fleche').style.backgroundColor='#FFFFFF';
	document.getElementById('select').style.backgroundColor='#FFFFFF';
	document.getElementById('main').style.backgroundColor='#BBBBBB';
	remove_moveObject();
	actuPixel();
	var svg = document.getElementById('svgFapMove');
	if (svg) {
		svg.setAttribute('class','main_ouverte');
		svg.style.cursor = 'grab';
		svg.style.cursor = '-moz-grab';
		svg.style.cursor = '-webkit-grab';
		svg.addEventListener('mousewheel',zoomScrolling, false);
		svg.addEventListener('DOMMouseScroll', zoomScrolling, false);
		svg.addEventListener('mousemove', zoomMove, false);
		svg.addEventListener('mousedown', zoomDown, false);
		svg.addEventListener('mouseup', zoomUp, false);
		svg.addEventListener("touchstart",zoomTouchInit,false);
		svg.addEventListener("touchmove",zoomTouchMove,false);
		svg.addEventListener("touchend",zoomTouchEnd,false);
	}
}
function remove_moveObject() {
	var svg = document.getElementById('svgFapMove');
	if (svg) {
		svg.style.cursor = 'default';
		svg.removeEventListener('DOMMouseScroll', zoomScrolling, false);
		svg.removeEventListener('mousewheel', zoomScrolling, false);
		svg.removeEventListener("touchstart",zoomTouchInit,false);
		svg.removeEventListener("touchmove",zoomTouchMove,false);
		svg.removeEventListener("touchend",zoomTouchEnd,false);
		svg.removeEventListener('mousemove', zoomMove, false);
		svg.removeEventListener('mousedown', zoomDown, false);
		svg.removeEventListener('mouseup', zoomUp, false);
		svg.removeEventListener('mousemove', selectMove, false);
		svg.removeEventListener('mousedown', selectDown, false);
		svg.removeEventListener('mouseup', selectUp, false);
		svg.removeEventListener("touchstart",selectTouchInit,false);
		svg.removeEventListener("touchmove",selectTouchMove,false);
		svg.removeEventListener("touchend",selectTouchEnd,false);
	}
}
function mouseCoords(ev){ 
	if(ev.pageX || ev.pageY){ 
		return {x:ev.pageX, y:ev.pageY}; 
	}
	var offsetX = window.pageXOffset || document.documentElement.scrollLeft;	
	var offsetY = window.pageYOffset || document.documentElement.scrollTop;
	return { 
		x:ev.clientX + offsetX, 
		y:ev.clientY + offsetY
	}; 
	// return { 
		// x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
		// y:ev.clientY + document.body.scrollTop  - document.body.clientTop 
	// }; 
}
function getXY(pos) {
	var divG = document.getElementById('divGraph');
	var rect = divG.getBoundingClientRect();
	var offsetX = window.pageXOffset || document.documentElement.scrollLeft;	
	var offsetY = window.pageYOffset || document.documentElement.scrollTop;
	var dxc = pos.x - rect.left - offsetX - rect.width/2;
	var dyc = pos.y - rect.top - offsetY - rect.height/2;
	x = coordCentre.x + dxc*pixel.x/coefficient.x;
	y = coordCentre.y - dyc*pixel.y/coefficient.y;
	return {x:x,y:y};
}
function fingerCoords(ev,f) {
	ev.preventDefault();
	tt = ev.targetTouches;
	return {x:parseInt(tt[f].pageX), y:parseInt(tt[f].pageY)}; 
}
function nbFingers(ev) {
	return ev.targetTouches.length;
}
function getEcartFinger(ev) {
	f0 = fingerCoords(ev,0);
	f1 = fingerCoords(ev,1);
	var svg = document.getElementById('svgFap');
	var w = svg.parentNode.getBoundingClientRect().width;
	var h = svg.parentNode.getBoundingClientRect().height;
	var dx = Math.abs(f0.x - f1.x)/(20000/w);
	var dy = Math.abs(f0.y - f1.y)/(20000/w);
	return {dx:dx, dy:dy};
}

function mouseMove(ev) {
	var pos = getXY(mouseCoords(ev));
	affichePos(pos);
}
function zoomScrolling(ev) {	
	if (ev.wheelDelta) {
		d = ev.wheelDelta / 120;
		ev.wheelDelta = 0;
	} else if (ev.detail) {
		d = -ev.detail / 3;
		ev.detail = 0;
	}
	if (!zoomObject) zoomObject = {dx:0, dy:0};
	zoomObject.dx = zoomObject.dx + d;
	zoomObject.dy = zoomObject.dy + d;
	zoom_viewbox(zoomObject.dx,zoomObject.dy);
	setTimeout(function(){endZoomGraph()},1000);
	ev.preventDefault();
}
function zoomMove(ev) {
	var pos = getXY(ev);
	moveGraph(mouseCoords(ev));
	ev.preventDefault();
}
function zoomDown(ev) {
	var svg = document.getElementById('svgFap');
	svg.style.cursor = 'grabbing';
	svg.style.cursor = '-moz-grabbing';
	svg.style.cursor = '-webkit-grabbing';
	var curs = mouseCoords(ev);
	dragObject = {x1:curs.x, y1:curs.y, x2:curs.x, y2:curs.y};
	ev.preventDefault();
}
function zoomUp(ev) {
	var svg = document.getElementById('svgFap');
	svg.style.cursor = 'grab';
	svg.style.cursor = '-moz-grab';
	svg.style.cursor = '-webkit-grab';
	if (dragObject) {
		recharge_viewbox();	
		dragObject = null;
	}
	ev.preventDefault();
}
function zoomTouchInit(ev) {	
	var nb = nbFingers(ev);
	if (nb==2) {	
		zoomObject = getEcartFinger(ev);			
	}
	if (nb==1) {
		var curs = fingerCoords(ev,0);
		dragObject = {x1:curs.x, y1:curs.y, x2:curs.x, y2:curs.y};	
	}
	ev.preventDefault();
}
function zoomTouchMove(ev) {
	ev.preventDefault();
	var nb = nbFingers(ev);
	if (nb==2) {
		if (zoomObject) {		
			var ecart = getEcartFinger(ev);	
			zoom_viewbox(ecart.dx-zoomObject.dx,ecart.dy-zoomObject.dy);
		}
	}
	if (nb==1) {	
		f0 = fingerCoords(ev,0);
		if (dragObject) {
			moveGraph(fingerCoords(ev,0));			
		}
	}
	ev.preventDefault();
}
function zoomTouchEnd(ev) {
	var nb = nbFingers(ev);
	if (nb==2) {
		endZoomGraph();
	}	
	if (dragObject) {
		recharge_viewbox();	
		dragObject = null;
	}
	ev.preventDefault();
}
function endZoomGraph() {
	recharge_viewbox();
	if (zoomObject) zoomObject = null;
}
function moveGraph(pos) {
	if (dragObject) {
		dragObject.x2 = pos.x;
		dragObject.y2 = pos.y;
		move_viewbox(dragObject.x1-dragObject.x2,dragObject.y1-dragObject.y2);
	}
}

function selectMove(ev) {
	var pos = getXY(mouseCoords(ev));
	moveSelection(pos);
	ev.preventDefault();
}
function selectDown(ev) {
	var pos = getXY(mouseCoords(ev));
	startSelection(pos);
	ev.preventDefault();
}
function selectUp(ev) {
	endSelection();
	ev.preventDefault();
}
function selectTouchInit(ev) {
	var pos = getXY(fingerCoords(ev,0));
	startSelection(pos);
	ev.preventDefault();
}
function selectTouchMove(ev) {
	var pos = getXY(fingerCoords(ev,0));
	moveSelection(pos);
	ev.preventDefault();
}
function selectTouchEnd(ev) {
	endSelection();
	ev.preventDefault();
}

function startSelection(pos) {
	var svg = document.getElementById('svgFap');
	var g = document.getElementById('gSelection');
	if (!g) {
		var g = document.createElementNS(ns,'g');
			g.setAttribute('id','gSelection');
		svg.appendChild(g);
	}
	selObject = document.createElementNS(ns,'rect');
	selObject.setAttribute('fill','#FFFFFF');
	selObject.setAttribute('opacity','0.5');
	selObject.setAttribute('stroke','#888888');	
	selObject.setAttribute('stroke-width',coefficient.ep);
	selObject.setAttribute('x',(pos.x-coefficient.x0)*coefficient.x);
	if (modeZoom=='x') selObject.setAttribute('y',-(coordCentre.py+coordCentre.ph/2)*coefficient.y);
	else selObject.setAttribute('y',-pos.y*coefficient.y);
	g.appendChild(selObject);
}
function moveSelection(pos) {
	var svg = document.getElementById('svgFap');
	if (selObject) {
		var x = parseFloat(selObject.getAttribute('x'))/coefficient.x + coefficient.x0;
		var y = -parseFloat(selObject.getAttribute('y'))/coefficient.y;
		if (pos.x>=x && pos.y<=y) {
			selObject.setAttribute('width',(pos.x-x)*coefficient.x);
			if (modeZoom=='x') selObject.setAttribute('height',coordCentre.ph*coefficient.y);
			else selObject.setAttribute('height',-(pos.y-y)*coefficient.y);		
		} else {
			selObject.removeAttribute('width');
			selObject.removeAttribute('height');
		}
	}
}
function endSelection() {
	var svg = document.getElementById('svgFap');
	if (selObject) {
		var x = parseFloat(selObject.getAttribute('x'))/coefficient.x + coefficient.x0;
		var y = -parseFloat(selObject.getAttribute('y'))/coefficient.y;
		var w = parseFloat(selObject.getAttribute('width'))/coefficient.x;
		var h = parseFloat(selObject.getAttribute('height'))/coefficient.y;
		if (w>=0.002 && (h>=0.1 || modeZoom=='x')) trace(x,x+w,y-h,y);
		else removeSelection();
	}
}
function removeSelection() {
	var g = document.getElementById('gSelection');
	while (g.firstChild) g.removeChild(g.firstChild);
	if (selObject) selObject = null;
}
function move_viewbox(dx,dy) {	
	var svg = document.getElementById('svgFap');
	var nx = coordCentre.px + dx*pixel.x/coefficient.x;
	var ny = coordCentre.py - dy*pixel.y/coefficient.y;
	var xmin = nx - coordCentre.pw/2;
	var ymax = ny + coordCentre.ph/2;
	
	var divP = document.getElementById('divPoints');
	var txmin = parseFloat(divP.getAttribute('xmin'));
	var txmax = parseFloat(divP.getAttribute('xmax'));
	if (txmin-deltaX>xmin) xmin = txmin-deltaX;
	if (txmax+deltaX<xmin+coordCentre.pw) xmin = txmax+deltaX-coordCentre.pw;
	var tymax = parseFloat(divP.getAttribute('nb'));
	if (tymax*(1+deltaYc)<ymax) ymax = tymax*(1+deltaYc);
	if (-tymax*deltaYc>ymax-coordCentre.ph) ymax = coordCentre.ph-tymax*deltaYc;
	
	if (modeZoom=='x') ymax = coordCentre.py + coordCentre.ph/2;
	setVBsvgUnitaire(svg,xmin,xmin+coordCentre.pw,ymax-coordCentre.ph,ymax);

	var svgX = document.getElementById('svgFapX');
	setVBsvgUnitaire(svgX,xmin,xmin+coordCentre.pw,coordCentre.py-coordCentre.ph/2,coordCentre.py+coordCentre.ph/2);
	addBarreauX(gAxe('svgFapX'),xmin,xmin+coordCentre.pw);

	var svgY = document.getElementById('svgFapY');
	setVBsvgUnitaire(svgY,coordCentre.px-coordCentre.pw/2,coordCentre.px+coordCentre.pw/2,ymax-coordCentre.ph,ymax);
	addBarreauY(gAxe('svgFapY'),ymax-coordCentre.ph,ymax);
}
function recharge_viewbox() {
	var svg = document.getElementById('svgFap');
	var xmin = parseFloat(svg.getAttribute('xmin'));
	var xmax = parseFloat(svg.getAttribute('xmax'));
	var ymin = parseFloat(svg.getAttribute('ymin'));
	var ymax = parseFloat(svg.getAttribute('ymax'));
	trace(xmin,xmax,ymin,ymax);
}
function zoom_viewbox(dx,dy) {	
	var svg = document.getElementById('svgFap');	
	var base = 1;
	var nw = coordCentre.pw;
	if (dx>0) base=0.99; else base=1.01;
	nw = nw*Math.pow(base,Math.abs(dx)*10);
	if (nw<0.002) nw = 0.002;
	var nh = coordCentre.ph;
	if (dy>0) base=0.99; else base=1.01;
	nh = nh*Math.pow(base,Math.abs(dy)*10);
	if (nh<0.1) nh = 0.1;
	
	var xmin = coordCentre.px - nw/2;
	var ymax = coordCentre.py + nh/2;
	
	var divP = document.getElementById('divPoints');
	var txmin = parseFloat(divP.getAttribute('xmin'));
	var txmax = parseFloat(divP.getAttribute('xmax'));
	if (txmin-deltaX>xmin) {
		xmin = txmin-deltaX;
		nw = txmax-txmin+deltaX*2;
	}
	var tymax = parseFloat(divP.getAttribute('nb'));
	if (tymax*(1+deltaYc)<ymax) {
		ymax = tymax*(1+deltaYc);
		nh = tymax*(1+deltaYc*2);
	}
	
	if (modeZoom=='x') {
		// ymax = (coordCentre.py - coordCentre.ph/2 +nh);
		ymax = (coordCentre.py + coordCentre.ph/2);
		nh = coordCentre.ph;
	}
	
	var cx = nw/coordCentre.pw;
	var cy = nh/coordCentre.ph;
	setVBsvgUnitaire(svg,xmin,xmin+nw,ymax-nh,ymax,{x:cx,y:cy});
	var svgX = document.getElementById('svgFapX');
	setVBsvgUnitaire(svgX,xmin,xmin+nw,coordCentre.py-coordCentre.ph/2,coordCentre.py+coordCentre.ph/2,{x:cx,y:1});
	addBarreauX(gAxe('svgFapX'),xmin,xmin+nw);
	var svgY = document.getElementById('svgFapY');
	setVBsvgUnitaire(svgY,coordCentre.px-coordCentre.pw/2,coordCentre.px+coordCentre.pw/2,ymax-nh,ymax,{x:1,y:cy});
	addBarreauY(gAxe('svgFapY'),ymax-nh,ymax);
}



