var ns = "http://www.w3.org/2000/svg";

var lst = [];

lst.push({x:1,y:3});
lst.push({x:2,y:3});
lst.push({x:2,y:8});
lst.push({x:4,y:8});
lst.push({x:4,y:9});
lst.push({x:5,y:2});
lst.push({x:5,y:5});
lst.push({x:6,y:1});
lst.push({x:8,y:7});
lst.push({x:2,y:9});
lst.push({x:9,y:4});
lst.push({x:10,y:1});
lst.push({x:11,y:3});
lst.push({x:11,y:6});
lst.push({x:12,y:3});
lst.push({x:12,y:7});
lst.push({x:2,y:2});
lst.push({x:9,y:8});
lst.push({x:3,y:1});


var env = [];
var aire = 0;

function enveloppe() {
	dessine();
	axe();
	setTimeout(function(){enveloppeSuivante();},1000);
	// var nb = 0;
	// var c = 0
	// while (lst.length>0 && nb!=lst.length && c<100) {
		// nb = lst.length;
		// contour();
		// c++;
	// }
}
function enveloppeSuivante() {
	var nb = lst.length;
	contour();
	if (lst.length>0 && nb!=lst.length) {
		setTimeout(function(){enveloppeSuivante();},1000);
	}
}
function dessine() {
	var svg = document.getElementById('svg');
	for (var i=0; i<lst.length; i++) {
		var c = document.createElementNS(ns,'circle');
			c.setAttribute('cx',lst[i].x);
			c.setAttribute('cy',lst[i].y);
			c.setAttribute('r',0.1);
			c.setAttribute('fill','#000000');
		svg.appendChild(c);
	}
}
function trace(env3) {
	var cont = document.getElementById('contour');
	var d = '';
	for (var i=0; i<env3.length; i++) {
		if (d!='') d += ' L ';
		else d = 'M ';
		d += env3[i].x+','+env3[i].y;
	}
	cont.setAttribute('d',d);
}
function markPoint(pt,color) {
	if (!color) color = '#00ff00';
	var c = document.createElementNS(ns,'circle');
		c.setAttribute('cx',pt.x);
		c.setAttribute('cy',pt.y);
		c.setAttribute('r',0.05);
		c.setAttribute('fill',color);
	svg.appendChild(c);
}
function suppPoint(pt) {
	var lst2 = [];
	for (var i=0; i<lst.length; i++) {
		if (lst[i].x!=pt.x || lst[i].y!=pt.y) {
			lst2.push(lst[i]);
		} else {
			var c = document.createElementNS(ns,'circle');
				c.setAttribute('cx',lst[i].x);
				c.setAttribute('cy',lst[i].y);
				c.setAttribute('r',0.05);
				c.setAttribute('fill','#ff0000');
			svg.appendChild(c);
		}
	}
	lst = lst2;
}
function axe() {
	var min = lst[0];
	var max = lst[0];
	for (var i=1; i<lst.length; i++) {
		if (lst[i].x<min.x || lst[i].x==min.x && lst[i].y<min.y) min = lst[i];
		if (lst[i].x>max.x || lst[i].x==max.x && lst[i].y>max.y) max = lst[i];
	}
	suppPoint(min);
	suppPoint(max);
	markPoint(min,'#ff0000');
	markPoint(max,'#ff0000');
	min.s = 1;
	max.s = -1;
	env.push(min);
	env.push(max);
	env.push(min);
	trace(env);
}
function triangle(k1,k2) {
	var pt1 = env[k1];
	var pt2 = env[k2];
	var s = pt1.s;
	var sup = null;
	var m = (pt2.y-pt1.y)/(pt2.x-pt1.x);
	var p = pt1.y - m*pt1.x;
	var lst2 = [];
	for (var i=0; i<lst.length; i++) {
		var d = (m*lst[i].x-lst[i].y+p)/Math.sqrt(1+m*m);
		if (d*s>0) {
			var pt = lst[i];
			pt.d = d;
			lst2.push(lst[i]);
			if (sup) {
				if (Math.abs(d)>Math.abs(sup.d)) {
					sup = lst[i];
					sup.d = d;
				}
			} else {
				sup = lst[i];
				sup.d = d;
			}
		}
		
	}
	if (sup) {
		calcAire(pt1,pt2,sup);
		sup.s = s;
		suppPoint(sup);
		markPoint(sup,'#ff0000');
		var m2 = (pt2.y-sup.y)/(pt2.x-sup.x);
		var p2 = sup.y - m2*sup.x;
		var m1 = (sup.y-pt1.y)/(sup.x-pt1.x);
		var p1 = pt1.y - m1*pt1.x;
		var dp1 = (m1*pt2.x-pt2.y+p1)/Math.sqrt(1+m1*m1);
		var dp2 = (m2*pt1.x-pt1.y+p2)/Math.sqrt(1+m2*m2);;
		for (var i=0; i<lst2.length; i++) {
			if (lst2[i].x!=sup.x || lst2[i].y!=sup.y) {
				var d1 = (m1*lst2[i].x-lst2[i].y+p1)/Math.sqrt(1+m1*m1);
				var d2 = (m2*lst2[i].x-lst2[i].y+p2)/Math.sqrt(1+m2*m2);
				if ((lst2[i].d*sup.d>=0 || isNaN(sup.d)) && (d1*dp1>=0 || isNaN(d1)) && (d2*dp2>=0 || isNaN(d2))) {
					suppPoint(lst2[i]);
					markPoint(lst2[i]);
				}
			}
		}
	}
	return sup;
}
function calcAire(p1,p2,p3) {
	var a = Math.abs(p1.x*p3.y - p1.x*p2.y + p2.x*p1.y - p2.x*p3.y + p3.x*p2.y - p3.x*p1.y)/2;
	aire += a;
}
function contour() {
	var env2 = [];
	env2.push(env[0]);
	for (var i=1; i<env.length; i++) {
		sup = triangle(i-1,i);
		if (sup) env2.push(sup);
		env2.push(env[i]);
	}
	env = env2;
	trace(env);
	console.log(lst.length, aire);
}


