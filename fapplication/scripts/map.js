
var mapFap = null;
var pOrigin = null;   
var pGoogle = null;
var divFeatClick =  null;
function addScript(path) {
	var s = document.createElement('script');
		s.setAttribute('type','text/javascript');
		s.setAttribute('src','openlayers/'+path);
	document.head.appendChild(s);
}
function chargeEntete() {
	addScript("OpenLayers.js");
	addScript("proj4js-combined.js");
	addScript("load.js");
}
function actuZoom() {
	var divMap = document.getElementById('divMap');
	var ratio = parseFloat(divMap.getAttribute('ratio'));
	ratio = getBestRatio(divMap);
	divMap.setAttribute('ratio',ratio);
	var rect = divMap.parentNode.getBoundingClientRect();
	var w = rect.width - 10;
	divMap.style.width = w + 'px';
	divMap.style.height = w/ratio + 'px';
	if (mapFap) mapFap.updateSize();
}
function init() {
	actuZoom();
	setTimeout(function(){actuZoom();},250);
	var proj='4326'; 
	addScript("defs/EPSG"+proj+".js");
	var zoom = 6;
	var x = 5;
	var y = 47;
	var divP = document.getElementById('divPoints');
	if (divP.hasAttribute('zoom')) zoom = parseInt(divP.getAttribute('zoom'));
	if (divP.hasAttribute('x')) x = parseFloat(divP.getAttribute('x'));
	if (divP.hasAttribute('y')) y = parseFloat(divP.getAttribute('y'));
	pOrigin = new OpenLayers.Projection("EPSG:"+proj);   
	pGoogle = new OpenLayers.Projection("EPSG:900913");
	options = {projection:pOrigin, displayProjection:pOrigin};	
	mapFap = new OpenLayers.Map("divMap",options);
	if (divP.hasAttribute('maxZoom')) {
		var mz = parseInt(divP.getAttribute('maxZoom'));
		mapFap.getNumZoomLevels = function(){
			return mz;
        };
	}
	if (mapLocalRelay) var mapnik = new OpenLayers.Layer.OSM("Mapnik","openlayers/tiles.php?z=${z}&x=${x}&y=${y}&r=mapnik"); 
	else var mapnik = new OpenLayers.Layer.OSM();
	var position = new OpenLayers.LonLat(x, y).transform(pOrigin, pGoogle);	  
	mapFap.addLayer(mapnik, options);
	mapFap.setCenter(position, zoom);
	var liste = ['OpenLayers_Control_Zoom_5','OpenLayers_Control_ArgParser_6','OpenLayers_Control_Attribution_7'];
	for (var i=0; i<liste.length; i++) {
		var div = document.getElementById(liste[i]);
		if (div) div.parentNode.removeChild(div);
	}
	mapFap.events.register("zoomend", mapFap, function(){dessineFap()});
	mapFap.events.register("mousemove", mapFap, affCoords);
	divFeatClick =  document.createElement('div');
	divFeatClick.setAttribute('class','divFeatClick');
	divFeatClick.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
	document.getElementById('divMap').appendChild(divFeatClick);
}
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
function affCoords(ev) {
	var dpos = document.getElementById('divPos');
	if (dpos) {
		var pt = mapFap.getLonLatFromViewPortPx(ev.xy).transform(pGoogle,pOrigin);
		var lib = toDMS(pt.lat,['S','N'])+' &nbsp; '+toDMS(pt.lon,['W','E']);
		dpos.innerHTML = lib;
	}
}
var layerFap = null;
function layerApprox() {
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#FFD0FF",
			fillOpacity: 0.3,
			strokeOpacity: 0.3,
			strokeColor: "#BF0026",
			strokeWidth: 1,
			strokeDashstyle: "dot",
			graphicZIndex: 1
		})
    });
	layerFap.approx = new OpenLayers.Layer.Vector("Points", {styleMap: myStyles});
    mapFap.addLayer(layerFap.approx);
}	
function layerPoint() {
	if (layerFap && layerFap.approx) mapFap.removeLayer(layerFap.approx);
	if (layerFap && layerFap.dot) mapFap.removeLayer(layerFap.dot);
	if (!layerFap) layerFap = {};
	layerApprox();
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#FFD0FF",
			fillOpacity: 0.3,
			strokeColor: "#BF0026",
			strokeWidth: 3,
			graphicZIndex: 2,
			label : "${labelText}",      
			fontColor: "#BF0026",
			fontSize: "20px",
			fontWeight: "bold",
			labelAlign: "c",
			labelXOffset: "0",
			labelYOffset: "0",
			labelOutlineColor: "#FFD0FF",
			labelOutlineWidth: 3
		})
    });
    layerFap.dot = new OpenLayers.Layer.Vector("Points", {styleMap: myStyles, eventListeners: layerListeners});
    mapFap.addLayer(layerFap.dot);
}
function layerPt() {
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#BF0026",
			fillOpacity: 0.8,
			strokeOpacity: 0.8,
			strokeColor: "#BF0026",
			strokeWidth: 1,
			graphicZIndex: 3
		})
    });
    layerFap.pt = new OpenLayers.Layer.Vector("Points", {styleMap: myStyles});
    mapFap.addLayer(layerFap.pt);
}	
function layerChemin() {
	if (layerFap && layerFap.pt) mapFap.removeLayer(layerFap.pt);
	if (layerFap && layerFap.approx) mapFap.removeLayer(layerFap.approx);
	if (layerFap && layerFap.path) mapFap.removeLayer(layerFap.path);
	if (!layerFap) layerFap = {};
	layerApprox();
	layerPt();
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			fillColor: "none",
			fillOpacity: 0.3,
			strokeColor: "#BF0026",
			strokeWidth: 3,
			strokeLinecap: "round",
			graphicZIndex: 3
		})
    });
	layerFap.path = new OpenLayers.Layer.Vector("LineString", {styleMap: myStyles});
    mapFap.addLayer(layerFap.path);	
}
function layerArea() {
	if (layerFap && layerFap.pt) mapFap.removeLayer(layerFap.pt);
	if (layerFap && layerFap.approx) mapFap.removeLayer(layerFap.approx);
	if (layerFap && layerFap.poly) mapFap.removeLayer(layerFap.poly);
	if (!layerFap) layerFap = {};
	layerApprox();
	layerPt();
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			fillColor: "#FFD0FF",
			fillOpacity: 0.5,
			strokeColor: "#BF0026",
			strokeWidth: 3,
			strokeLinecap: "round",
			graphicZIndex: 3
		})
    });
    layerFap.poly = new OpenLayers.Layer.Vector("Polygon", {styleMap: myStyles});
    mapFap.addLayer(layerFap.poly);
}
function layerFlag() {
	if (layerFap && layerFap.pt) mapFap.removeLayer(layerFap.pt);
	if (layerFap && layerFap.markers) mapFap.removeLayer(layerFap.markers);
	if (!layerFap) layerFap = {};
	layerPt();
	layerFap.markers = new OpenLayers.Layer.Markers("Markers");
	mapFap.addLayer(layerFap.markers);
}


function affLeg(x,prec) {
	if (!prec) prec = 0;
	var sigle = [[7,'Z'],[6,'E'],[5,'P'],[4,'T'],[3,'G'],[2,'M'],[1,'K'],[0,'']];
	for (var i=0; i<sigle.length; i++) {
		var n = sigle[i][0];
		var s = sigle[i][1];
		if (x>=Math.pow(10,n*3)) return parseInt(x/Math.pow(10,n*3-prec))/Math.pow(10,prec)+s;
		if (x>=Math.pow(10,n*3-1)) return parseInt(x/Math.pow(10,n*3-1-prec))/Math.pow(10,prec+1)+s;
	}	
	return x;
}
function chargeMap() {
	init();
	dessineFap();
	zoomInitial();
	window.addEventListener('resize', resizeMap, false);
}
function zoomInitial() {
	var divP = document.getElementById('divPoints');
	zoom = 12;
	if (divP.hasAttribute('zoom')) zoom = parseInt(divP.getAttribute('zoom'));
	if (divP.hasAttribute('x')) {
		var p = new OpenLayers.LonLat(divP.getAttribute('x'), divP.getAttribute('y')).transform(pOrigin, pGoogle);	  
		mapFap.setCenter(p, zoom);
		if (divP.hasAttribute('acc')) {		
			var acc = parseFloat(divP.getAttribute('acc'));
			var x = parseFloat(divP.getAttribute('x'));
			var y = parseFloat(divP.getAttribute('y'));
			divP.setAttribute('xmin',x-acc/100000);
			divP.setAttribute('xmax',x+acc/100000);
			divP.setAttribute('ymin',y-acc/100000);
			divP.setAttribute('ymax',y+acc/100000);
		}
	}
	if (divP.hasAttribute('xmin')) {		
		var bbox = new OpenLayers.Bounds(divP.getAttribute('xmin'),divP.getAttribute('ymin'), divP.getAttribute('xmax'), divP.getAttribute('ymax')).transform(pOrigin, pGoogle);
		mapFap.zoomToExtent(bbox);
	}

}
var resizeTimer;
function resizeMap(ev) {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function() {
		resizeReady();
	}, 250);
}
function resizeReady() {
	setTimeout(function(){
		actuZoom();
		dessineFap();
	}, 250);
}
function dessineFap() {
	if (modeMap=='dot') dessineFapDot();
	if (modeMap=='path') dessineFapPath();
	if (modeMap=='loc') dessineFapLoc();
	if (modeMap=='area') dessineFapArea();
	if (modeMap=='flag') dessineFapFlag();
}
function dessineFapDot() {
	var radius = 30;
	layerPoint();
	var divP = document.getElementById('divPoints');
	var l_fap = [];
	var point = divP.firstChild;
	while (point) {
		var x = parseFloat(point.getAttribute('x'));
		var y = parseFloat(point.getAttribute('y'));
		var acc = parseFloat(point.getAttribute('acc'));
		var trouve = false;
		var pt = new OpenLayers.Geometry.Point(x,y).transform(pOrigin,pGoogle);
		var l = 0;
		while (l<l_fap.length && !trouve) {
			var d = pt.distanceTo(l_fap[l].pt);
			if (d<mapFap.resolution*radius*1.5) {
				trouve = true;
				pt.x = (pt.x + l_fap[l].pt.x*l_fap[l].nb)/(l_fap[l].nb+1);
				pt.y = (pt.y + l_fap[l].pt.y*l_fap[l].nb)/(l_fap[l].nb+1);
				l_fap[l].acc = Math.max(acc,l_fap[l].acc);
				l_fap[l].pt = pt;
				l_fap[l].nb = l_fap[l].nb + 1;
				l_fap[l].lstfap.push(point);
			}
			l++;
		}
		if (!trouve) {
			var f = {pt:pt, nb:1, acc:acc, lstfap:[point]};
			l_fap.push(f);
		}
		point = point.nextSibling;
	}
	for (var l=0; l<l_fap.length; l++) {
		var r = radius;		
		layerFap.dot.addFeatures(new OpenLayers.Feature.Vector(l_fap[l].pt,{labelText: affLeg(l_fap[l].nb), radius:radius, lstfap:l_fap[l].lstfap}));
		if (l_fap[l].acc/mapFap.resolution>radius+5 && mapShowAccuracy) {
			var pt = l_fap[l].pt.clone();
			layerFap.approx.addFeatures(new OpenLayers.Feature.Vector(pt,{radius:l_fap[l].acc/mapFap.resolution}));
		}
	}
}
function up2(i) {
	var s = i+'';
	if (s.length<2) s = '0'+s;
	return s;
}
function dateJ(d) {
	return  " &nbsp;~ "+ up2(d.getDate())+'/'+up2(d.getMonth()+1) + "/" + d.getFullYear() +" ~ ";
}
function dateJH(d) {
	return  up2(d.getDate())+'/'+up2(d.getMonth()+1)+ "/"+d.getFullYear() + " " + up2(d.getHours())+"h"+up2(d.getMinutes());
}
var layerListeners = {
    featureclick: function(e) {
		// console.log(e.feature.data);
		while (divFeatClick.firstChild) divFeatClick.removeChild(divFeatClick.firstChild);
		var lst = e.feature.data.lstfap;
		if (lst) {
			var d = document.createElement('div');
				var lib = (lst.length) + " fap";
				if (lst.length>1) lib += "s";
				d.style.textDecoration = 'underline';		
				d.innerHTML = lib;
				divFeatClick.appendChild(d);
			var memo = null;
			for (var k=0; k<lst.length; k++) {
				var d = document.createElement('div');
					var dd = new Date(lst[k].getAttribute('ind')*1000);
					var lib = dateJ(dd);
					if (lst[k].hasAttribute('fap')) {
						d.setAttribute('fap',lst[k].getAttribute('fap'));
						d.setAttribute('onclick','featClick(this)');
						d.setAttribute('class','divFeatClickItem');
						lib = dateJH(dd);
					} else d.setAttribute('class','divFeatNoClickItem');
					d.innerHTML = lib;
					d.dd = dd;
					var c = divFeatClick.firstChild;
					var nt = true;
					while (c && nt) {
						if (c.dd<dd) {
							divFeatClick.insertBefore(d,c);
							nt = false;
						}
						c = c.nextSibling;
					}
					if (nt) divFeatClick.appendChild(d);
				memo = dd;
			}
		}
		divFeatClick.style.display = 'block';
		divFeatClick.setAttribute('wait','');
        return false;
    },
	nofeatureclick: function(e) {
		divFeatClick.style.display = 'none';
		return false;
	},
	featureover: function(e) {
		// console.log(e.feature.data);
		// return false;
	}
};
function featClick(elt) {
	document.location.replace('fSupp-fap.php?fap='+elt.getAttribute('fap'));
}
window.addEventListener('click', hideDivFeatClick, false);
function hideDivFeatClick(e){
	var inDiv = false;
	var c = e.target;
	while (c && c.parentNode) {
		inDiv = inDiv || c==divFeatClick;
		c = c.parentNode;
	}
	if (!inDiv) {
		divFeatClick.style.display = 'none';
	}
	divFeatClick.removeAttribute('wait');
}
var vectorFap = null;
var distFapPath = null;
function dessineFapPath() {
	layerChemin();
	var dist = 0;
	var divP = document.getElementById('divPoints');
	var l_fap = [];
	var point = divP.firstChild;
	while (point) {
		var x = parseFloat(point.getAttribute('x'));
		var y = parseFloat(point.getAttribute('y'));
		var acc = parseFloat(point.getAttribute('acc'));
		var pt = new OpenLayers.Geometry.Point(x,y).transform(pOrigin,pGoogle);
		var r = 5;
		layerFap.pt.addFeatures(new OpenLayers.Feature.Vector(pt,{radius:r}));
		if (mapShowAccuracy) {
			r = acc/mapFap.resolution;
			var pt2 = pt.clone();
			layerFap.approx.addFeatures(new OpenLayers.Feature.Vector(pt2,{radius:r}));
		}	
		l_fap.push(pt);
		point = point.nextSibling;
	}
	if (animationInitiale==100) animationInitiale = l_fap.length;
	nextFapPathAnim(l_fap);
}
function traceFapPath(lst) {
	if (vectorFap) layerFap.path.removeFeatures(vectorFap);
	vectorFap = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(lst));
    layerFap.path.addFeatures(vectorFap);
}
function nextFapPathAnim(l_fap) {
	animationInitiale = animationInitiale + Math.max(1,Math.round(l_fap.length/100));
	var lst = [];
	var dist = 0;
	var memo = null;
	layerFap.path.removeAllFeatures();
	for (var i=0; i<Math.min(animationInitiale,l_fap.length); i++) {
		if (memo) {
			dist += memo.distanceTo(l_fap[i]);
			var v = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([memo,l_fap[i]]));
			layerFap.path.addFeatures(v);
		}	
		memo = l_fap[i];
		lst.push(l_fap[i]);
	}	
	//traceFapPath(lst);
	document.getElementById('infoMapFap').innerHTML = affLeg(Math.round(dist/1000),2);
	if (animationInitiale<l_fap.length) setTimeout(function(){nextFapPathAnim(l_fap);},300/animationInitialeSpeed);
}
	
var lstFapArea = [];
var envFapArea = [];
var polyFapArea = null;
function dessineFapArea() {
	layerArea();
	var divP = document.getElementById('divPoints');
	var l_fap = [];
	var point = divP.firstChild;
	while (point) {
		var x = parseFloat(point.getAttribute('x'));
		var y = parseFloat(point.getAttribute('y'));
		var acc = parseFloat(point.getAttribute('acc'));
		var pt = new OpenLayers.Geometry.Point(x,y).transform(pOrigin,pGoogle);
		var r = 5;
		layerFap.pt.addFeatures(new OpenLayers.Feature.Vector(pt,{radius:r}));
		if (mapShowAccuracy) {
			r = acc/mapFap.resolution;
			var pt2 = pt.clone();
			layerFap.approx.addFeatures(new OpenLayers.Feature.Vector(pt2,{radius:r}));
		}
		l_fap.push(pt);
		point = point.nextSibling;
	}
	if (envFapArea.length==0) {
		lstFapArea = l_fap;
		axeFapArea();
		nextContourFapAreaAnim();
	}
	traceFapArea(envFapArea);
}
function traceFapArea(env) {
	if (vectorFap) layerFap.poly.removeFeatures(vectorFap);
	polyFapArea = new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(env));
	vectorFap = new OpenLayers.Feature.Vector(polyFapArea);
	layerFap.poly.addFeatures(vectorFap);
}
function suppPointFapArea(pt) {
	var lst2 = [];
	for (var i=0; i<lstFapArea.length; i++) {
		if (lstFapArea[i].x!=pt.x || lstFapArea[i].y!=pt.y) lst2.push(lstFapArea[i]);
	}
	lstFapArea = lst2;
}
function axeFapArea() {
	var min = lstFapArea[0];
	var max = lstFapArea[0];
	for (var i=1; i<lstFapArea.length; i++) {
		if (lstFapArea[i].x<min.x || lstFapArea[i].x==min.x && lstFapArea[i].y<min.y) min = lstFapArea[i];
		if (lstFapArea[i].x>max.x || lstFapArea[i].x==max.x && lstFapArea[i].y>max.y) max = lstFapArea[i];
	}
	suppPointFapArea(min);
	suppPointFapArea(max);
	min.s = 1;
	max.s = -1;
	envFapArea.push(min);
	envFapArea.push(max);
	envFapArea.push(min);
	traceFapArea(envFapArea);
}
function triangleFapArea(k1,k2) {
	var pt1 = envFapArea[k1];
	var pt2 = envFapArea[k2];
	var s = pt1.s;
	var sup = null;
	var m = (pt2.y-pt1.y)/(pt2.x-pt1.x);
	var p = pt1.y - m*pt1.x;
	var lst2 = [];
	for (var i=0; i<lstFapArea.length; i++) {
		var d = (m*lstFapArea[i].x-lstFapArea[i].y+p)/Math.sqrt(1+m*m);
		if (d*s>0) {
			var pt = lstFapArea[i];
			pt.d = d;
			lst2.push(lstFapArea[i]);
			if (sup) {
				if (Math.abs(d)>Math.abs(sup.d)) {
					sup = lstFapArea[i];
					sup.d = d;
				}
			} else {
				sup = lstFapArea[i];
				sup.d = d;
			}
		}
		
	}
	if (sup) {
		sup.s = s;
		suppPointFapArea(sup);
	}
	return sup;
}
function dismissPointFapArea() {
	for (var i=0; i<lstFapArea.length; i++) {
		if (polyFapArea.containsPoint(lstFapArea[i])) {
			suppPointFapArea(lstFapArea[i]);
		}	
	}
}
function contourFapArea(k,delai) {
	var nb = lstFapArea.length;
	var env2 = [];
	for (var i=0; i<k; i++) {
		env2.push(envFapArea[i]);
	}
	if (k<envFapArea.length) {
		sup = triangleFapArea(k-1,k);
		if (sup) env2.push(sup);
	}	
	for (var i=k; i<envFapArea.length; i++) {
		env2.push(envFapArea[i]);
	}
	envFapArea = env2;
	traceFapArea(envFapArea);
	dismissPointFapArea();
	document.getElementById('infoMapFap').innerHTML = affLeg(Math.round(polyFapArea.getArea()/1000000),2);
	if (k<envFapArea.length) setTimeout(function(){contourFapArea(k+1,delai);},delai);
	else setTimeout(function(){nextContourFapAreaAnim();},delai);
}
var nbIter = 0;
function nextContourFapAreaAnim() {
	nbIter++;
	var delai = 300/animationInitialeSpeed;
	if (animationInitiale) delai = 0;
	if (lstFapArea.length>0 && nbIter<1000) setTimeout(function(){contourFapArea(1,delai);},delai);
}


// drapeau
function dessineFapFlag() {
	layerFlag();
	var territoire = 64;
	var size = new OpenLayers.Size(64,64);
	var offset = new OpenLayers.Pixel(-(27*size.w/128), -size.h);
	var icons = {};
	var l_fap = [];
	var divP = document.getElementById('divPoints');
	var point = divP.firstChild;
	while (point) {
		var x = parseFloat(point.getAttribute('x'));
		var y = parseFloat(point.getAttribute('y'));
		var acc = parseFloat(point.getAttribute('acc'));
		var fap = parseFloat(point.getAttribute('fap'));
		var usr = parseFloat(point.getAttribute('usr'));
		var pt = new OpenLayers.Geometry.Point(x,y).transform(pOrigin,pGoogle);
		trouve = false;
		var l = 0;
		while (l<l_fap.length && !trouve) {
			if (pt.distanceTo(l_fap[l])<mapFap.resolution*territoire) trouve = true;
			l++;
		}
		if (!trouve) {
			l_fap.push(pt);
			if (!icons[usr]) icons[usr] = new OpenLayers.Icon('_getImg.php?flag='+usr+vGetImg, size, offset);
			// var icon = new OpenLayers.Icon('_getImg.php?fapFlag='+fap+vGetImg, size, offset);
			var marker = new OpenLayers.Marker(new OpenLayers.LonLat(pt.x,pt.y),icons[usr].clone());
			layerFap.markers.addMarker(marker);
			if (t_users && t_users[usr]) {
				marker.fapName = t_users[usr];
				marker.events.register("click", marker, function(e) { affFlagName(e.object.fapName); });
				marker.events.register("touchend", marker, function(e) { affFlagName(e.object.fapName); });
			}	
		}
		point = point.nextSibling;
	}
}
function affFlagName(name) {
	// console.log(name);
	while (divFeatClick.firstChild) divFeatClick.removeChild(divFeatClick.firstChild);
	var d = document.createElement('div');
		d.innerHTML = name;
	divFeatClick.appendChild(d);
	divFeatClick.style.display = 'block';
	// divFeatClick.setAttribute('wait','');
}	


// positionnement manuel
var positionLoc = null;
var positionSet = null;
function initPosition() {
	init();
	mapFap.events.register("click", mapFap, setNewPos);
	mapFap.events.register("touchend", mapFap, setNewPos);
	var divMap = document.getElementById('divMap');
	var input = document.createElement('input');
		input.setAttribute('id','getPositionButt');
		input.setAttribute('class','buttLoc');
		input.setAttribute('type','button');
		input.setAttribute('onclick','getPosition()');
		input.style.left = "0px";
		input.value = 'Re-Positionner';
		divMap.appendChild(input);
	var input = document.createElement('input');
		input.setAttribute('id','fapLocButt');
		input.setAttribute('class','buttLoc');
		input.setAttribute('type','button');
		input.setAttribute('onclick','fapLoc(this)');
		input.disabled = true;
		input.style.color = "#cccccc";
		input.style.right = "0px";
		input.value = 'Fapper ici';
		if (fapInvisible) {
			input.value = " . . . .  "+input.value;
			input.style.backgroundImage = 'url(images/masque.png)';
			input.style.backgroundRepeat = 'no-repeat';
			input.style.backgroundSize = 'contain';
		}
		divMap.appendChild(input);	
	var div = document.createElement('div');
		div.setAttribute('class','messLocDiv');
		div.setAttribute('id','divErrFapOver');
		divMap.appendChild(div);	
	var mess = document.getElementById("divErrFap");
		mess.setAttribute('class','messLoc');
		divMap.appendChild(mess);
	if (getFap) reposFapAuto();
	else getPosition();		
}
function getPosition() {
	logErrFap("Localisation en cours");
	positionLoc = null;
	positionSet = null;
	ptNewPos = {};
	var options = { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 };
	if( navigator.geolocation) {
		navigator.geolocation.getCurrentPosition( gotPosLoc, gotPosApproxLoc, options );
	} else {
		logErrFap("Navigator don't support geolocation", true);
		gotErrLoc();
	}
}
function gotPosLoc(position) {
	var acc = position.coords.accuracy;
	var x = position.coords.longitude;
	var y = position.coords.latitude;
	var mess = "Loc : "+toDMS(y,['S','N'])+' &nbsp; '+toDMS(x,['W','E']) +' &nbsp; (~'+appAcc(acc)+'m)';
	logErrFap(mess , true);
	var divP = document.getElementById('divPoints');
	divP.setAttribute('x',x);
	divP.setAttribute('y',y);
	divP.setAttribute('acc',acc);	
	positionLoc = position;
	zoomInitial();
	dessineFapLoc();
	var input = document.getElementById('fapLocButt');
		input.disabled = false;
		input.style.color = "";
}
function gotPosApproxLoc(error) {
	logErrFap("Localisation approximative en cours");
	var options = { enableHighAccuracy: false, maximumAge: 30000, timeout: 5000 };
	if( navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(gotPosLoc, gotErrLoc, options );
	} else {
		gotErrLoc();
	}
}
function gotErrLoc(error) {

	if (error) {
		var mess = 'Echec localisation : "'+error.message+'"';
		logErrFap(mess, true);
	}
}
var autoPos = {};
function layerPositionne() {
	if (layerFap && layerFap.pos) mapFap.removeLayer(layerFap.pos);
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#EDFCD2",
			fillOpacity: 0.3,
			strokeColor: "#2C4501",
			strokeWidth: 3,
			graphicZIndex: 5
		})
    });
    layerFap.pos = new OpenLayers.Layer.Vector("Points", {styleMap: myStyles});
    mapFap.addLayer(layerFap.pos);
	if (layerFap && layerFap.posApprox) mapFap.removeLayer(layerFap.posApprox);
	var myStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			pointRadius: "${radius}",
			fillColor: "#EDFCD2",
			fillOpacity: 0.4,
			strokeOpacity: 0.5,
			strokeColor: "#2C4501",
			strokeWidth: 2,
			strokeDashstyle: "dot",
			graphicZIndex: 1
		})
    });
	layerFap.posApprox = new OpenLayers.Layer.Vector("Points", {styleMap: myStyles});
    mapFap.addLayer(layerFap.posApprox);
}
function dessineFapLoc() {
	layerPoint();
	layerPositionne();
	var myPos = positionLoc;
	if (positionOld) myPos = positionOld;
	if (myPos) {
		var acc = myPos.coords.accuracy;
		var x = myPos.coords.longitude;
		var y = myPos.coords.latitude;
		var pt = new OpenLayers.Geometry.Point(x,y).transform(pOrigin,pGoogle);	
		autoPos.pt = pt;
		autoPos.acc = acc;
		layerFap.dot.addFeatures(new OpenLayers.Feature.Vector(pt,{radius:3, labelText:""}));
		var pt2 = pt.clone();
		layerFap.approx.addFeatures(new OpenLayers.Feature.Vector(pt2,{radius:acc/mapFap.resolution}));
		var dist = mapMaxPosCorrect;
		if (positionOld) dist += positionOld.reloc*1000;
		if (acc>dist) {
			var pt3 = pt.clone();
			layerFap.approx.addFeatures(new OpenLayers.Feature.Vector(pt3,{radius:dist/mapFap.resolution}));
		}
		if (ptNewPos && ptNewPos.pt) {
			setNewPosPt(ptNewPos.pt);
		}
	}
}
function fapLoc(elt) {
	var myPos = null;
	if (positionLoc) myPos = positionLoc;
	if (positionSet) myPos = positionSet;
	if (myPos) {
		elt.parentNode.removeChild(elt);
		var div = document.createElement('div');
			div.setAttribute('class','buttLoc');
			div.style.right = "0px";
			div.style.height = "50px";
			divMap.appendChild(div);
		var div2 = document.createElement('div');
			div2.setAttribute('id','aFappe');
			div2.setAttribute('class','buttFappe');
			div2.innerHTML = "<img src='images/roue.gif' class='imgFap' />";
			div.appendChild(div2);	
		if (chtouille && !positionSet) {
			document.location.replace("fFap-fap.php");
		} else {
			fapWaitting = true;		
			fdFap = new FormData();
			fdFap.append('aFappe', '');
			gotPos(myPos);
		}
	}
}	
var featNewPos = null;
var ptNewPos = {};
function setNewPos(ev) {
	var p = mapFap.getLonLatFromViewPortPx(ev.xy);
	var pt = new OpenLayers.Geometry.Point(p.lon,p.lat);
	setNewPosPt(pt);
}
function setNewPosPt(pt) {
	var dist = pt.distanceTo(autoPos.pt);
	if (dist<autoPos.acc-5 && (dist<mapMaxPosCorrect || (positionOld && dist<positionOld.reloc*1000+mapMaxPosCorrect))) {
		var pO = pt.clone().transform(pGoogle,pOrigin);
		var acc = Math.min(mapFap.resolution*20,autoPos.acc-dist);
		ptNewPos.acc = acc;
		positionSet = {coords:{}};
		positionSet.coords.accuracy = acc;
		positionSet.coords.longitude = pO.x;
		positionSet.coords.latitude = pO.y;
		var mess = "Loc : "+toDMS(pO.y,['S','N'])+' &nbsp; '+toDMS(pO.x,['W','E']) +' &nbsp; (~'+appAcc(acc)+'m)';
		logErrFap(mess , true);
		ptNewPos.pt = pt;
		if (ptNewPos.feat) layerFap.pos.removeFeatures(ptNewPos.feat);
		ptNewPos.feat = new OpenLayers.Feature.Vector(pt,{radius:3});
		layerFap.pos.addFeatures(ptNewPos.feat);
		var pt2 = pt.clone();
		if (ptNewPos.featapp) layerFap.pos.removeFeatures(ptNewPos.featapp);
		ptNewPos.featapp = new OpenLayers.Feature.Vector(pt2,{radius:acc/mapFap.resolution});
		layerFap.posApprox.addFeatures(ptNewPos.featapp);
	}
}
//ancien fap
function setToOldFap() {
	var butt = document.getElementById('getPositionButt');
	if (butt) {
		butt.style.opacity = '0.3';
		butt.disabled = true;
	}
	var butt = document.getElementById('fapLocButt');
	if (butt) {
		butt.setAttribute('onclick','saveOldFap();');
		butt.style.backgroundImage = '';
		butt.value = 'Enregistrer';
		butt.disabled = false;
		butt.style.color = "";
	}
}
var positionOld = null;
function reposFap(elt) {
	var acc = elt.getAttribute('acc')/1;
	var x = elt.getAttribute('lon')/1;
	var y = elt.getAttribute('lat')/1;
	var reloc = elt.getAttribute('reloc')/1;
	var mess = "Loc : "+toDMS(y,['S','N'])+' &nbsp; '+toDMS(x,['W','E']) +' &nbsp; (~'+appAcc(acc)+'m)';
	logErrFap(mess , true);
	var divP = document.getElementById('divPoints');
	divP.setAttribute('x',x);
	divP.setAttribute('y',y);
	divP.setAttribute('acc',acc);
	positionOld = {coords:{}, fap:elt.getAttribute('fap'), reloc:reloc};
	positionOld.coords.accuracy = acc;
	positionOld.coords.longitude = x;
	positionOld.coords.latitude = y;
	zoomInitial();
	dessineFapLoc();
	var div = document.getElementById('fapActif')
	if (div) {
		var dist = Math.floor(Math.min(acc,mapMaxPosCorrect+reloc*1000)/1000);
		div.innerHTML = "n°"+elt.getAttribute('fap')+" , Reloc~"+dist+"km";
		div.setAttribute('fap',elt.getAttribute('fap'));
	}
	var div = document.getElementById('addAccuracy');
	if (div) {
		var pow = div.getAttribute('pow')/1;
		var niv = div.getAttribute('niv')/1;
		div.setAttribute('max',Math.min(pow,niv*10-reloc));
	}
}
function reposFapAuto() {
	setToOldFap();
	var div = document.getElementById('divGetOldFap');
	if (div) reposFap(div);
	var div = document.getElementById('divSetOldFap');
	if (div) initPosFap(div);
}
function saveOldFap() {
	var fd = new FormData();
	fd.append('reposFap',positionOld.fap);
	var myPos = positionOld;
	if (positionSet) myPos = positionSet;
	fd.append('lon',myPos.coords.longitude);
	fd.append('lat',myPos.coords.latitude);
	fd.append('acc',myPos.coords.accuracy);
	glbSendForm(fd);
}
function showOldFap() {
	document.location.replace("?fap="+positionOld.fap);
}
function buyAccuracy() {
	var acc = document.getElementById('addAccuracy').value;
	if (acc>0) {
		var rep = confirm("Dépenser "+acc+"pv pour obtenir "+acc+"km ?");
		if (rep) {
			var fd = new FormData();
			fd.append('incAccFap',positionOld.fap);
			fd.append('acc',acc);
			fd.append('reloc',positionOld.reloc);
			glbSendForm(fd);
		}
	}
}
function initPosFap(elt) {
	var defautLocFap = document.getElementById('defautLocFap');
	if (defautLocFap) {
		var lat = defautLocFap.getAttribute('lat');
		var lon = defautLocFap.getAttribute('lon');
		var pow = defautLocFap.getAttribute('pow')/1;
		var nb = defautLocFap.getAttribute('nb')/1;
		if (nb<100) {
			if (pow<10) {
				alert('Tu n\'as pas assez de pouvoir');
			} else {
				var rep = confirm("Dépenser 10pv pour localiser ce fap au lat:"+lat+", lon:"+lon+" ?");
				if (rep) {
					positionOld = {coords:{}, fap:elt.getAttribute('fap'), reloc:0};
					var fd = new FormData();
					fd.append('initPosFap',elt.getAttribute('fap'));
					fd.append('lon',lon);
					fd.append('lat',lat);
					fd.append('acc',10000);
					glbSendForm(fd);
				}
			}
		} else {
			alert('Tu n\'as pas encore assez fappé pour avoir une position par défaut');
		}
	} else {
		alert('Tu n\'as aucun fap localisé');
	}
}



