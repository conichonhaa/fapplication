
function recupLocal() {
	var xmlDoc = param.serverData.xmlDoc;
	if (!xmlDoc) {
		console.warn('XML non chargé');
		return;
	}
	param.serverData.data = param.serverData.data || {};
	var dataNodes = xmlDoc.getElementsByTagName('data')[0].children;
	for(var i=0; i<dataNodes.length; i++){
		var node = dataNodes[i];
		var name = node.nodeName;
		var cdata = node.textContent || node.firstChild.nodeValue;
		try {
			param.serverData.data[name] = JSON.parse(cdata);
		} catch(e){
			console.error("Erreur parsing JSON pour", name, e);
			}
		}
	if(param.serverData.data.local && param.serverData.data.local.params){
		var params = param.serverData.data.local.params;
		for (code in params) {
			if (code in localStorage) {
				var val = localStorage.getItem(code);
				if (params[code].boolean) val = (val=='true');
				if (params[code].bornes) val = parseInt(val);
				params[code].value = val;
				}
			}
		}
	console.log('Données locales chargées:', param.serverData.data);
}
function setLocalParam(code, value) {
	getParam('data', function(){
		var params = param.serverData.data.local.params;
		params[code].value = value;
		localStorage.setItem(code,value);
	}, param.serverData, 'setLocal');
}

function AffInfosMenu(code, callback) {
	getDOM('divSessionMenu', function(div){
		var d = div.content;
		while (d.firstChild) d.removeChild(d.firstChild);
		if (code && (!div.open || div.open!=code)) {
			div.open = code;
			d.style.display = '';
			callback(d);
		} else {
			d.style.display = 'none';
			div.open = null;
		}
	});
}
function AffInfosDev() {
	AffInfosMenu('dev', function(d){
		d.innerHTML = "Hello, le jeu du CryptoZooShow commence à prendre une belle tournure<br>N'hésitez pas à aller voir les règles en détail <img style='height:2em;vertical-align:middle;' src='"+param.serverData.data.global.actions.rules.src+"' /> ou les mémos <img style='height:2em;vertical-align:middle;' src='"+param.serverData.data.global.actions['rules-surge'].src+"' /> et <img style='height:2em;vertical-align:middle;' src='"+param.serverData.data.global.actions['rules-cave'].src+"' /> <br>pour comprendre et assimiler toutes les finesses de ce jeu passionnant et très vite addictif !";
	});
}
function AffParamMenu() {
	AffInfosMenu('game', function(d){
		getGameParam();
	});
}
async function paramAffGameParam(data, callback) {
	getDOM('divSessionMenu', function(div){
		var dd = document.createElement('div');
			dd.setAttribute('class','paramTitle');
			dd.innerHTML = "Paramètres de la partie (commun à tous) :";
		div.content.appendChild(dd);
		var d = document.createElement('div');
		div.content.appendChild(d);
		makeBoardButton(d, 'global', 'lock', null, function(f, res){
			var s = res.launch;
			s.srcLock = param.serverData.data.global.actions.lock['lock-src'];
			s.srcUnlock = param.serverData.data.global.actions.lock['unlock-src'];
			s.id = 'inputParamMaster';
			s.send = true;
			s.addEventListener('click',function(){
				getGameParamMaster(this.send);
			});	
			makeParamMemorizeRestitute(s, d, function(m,r){
				s.memorize = m;
				s.restitute = r;
				var d = document.createElement('div');
					d.setAttribute('class','loadComment');
				div.content.appendChild(d);
				s.div = d;	
				affParamList(div.content, data.params, function(inputs){
					s.inputs = inputs;
					setMasteredParam(s, data.master);
					callback(inputs);
				});
			
			});
		});
	});
}
function makeParamMemorizeRestitute(s, d, callback) {
	makeBoardButton(d, 'global', 'save', null, function(f, res){
		var m = res.launch;
		m.img.style.marginLeft = '1em';
		m.lock = s;
		m.addEventListener('click', function(){
			var json = {}
			this.lock.inputs.forEach(function(input){
				var value = input.value;
				if (input.type=='checkbox') value = input.checked;
				json[input.code] = value;
			});
			localStorage.setItem('global',JSON.stringify(json));
			this.restitute.dispo = true;
			if (!this.lock.disabled) activeBoardButton(this.restitute, true);
		});
		makeBoardButton(d, 'global', 'restore', null, function(f, res){
			var r = res.launch;
			r.img.style.marginLeft = '1em';
			r.lock = s;
			if ('global' in localStorage) r.dispo = true;
			r.addEventListener('click', function(){
				var json = JSON.parse(localStorage.getItem('global'));
				this.lock.inputs.forEach(function(input){
					var val = json[input.code];
					if (!isNaN(parseInt(val))) val = parseInt(val);
					input.value = val;
					if (input.type=='checkbox') input.checked = input.value;
					input.dispatchEvent(new Event('change'));
				});
			});
			activeBoardButton(r, false);
			m.restitute = r;
			callback(m,r);
		});
	});
}
function AffParamPersoMenu() {
	AffInfosMenu('perso', function(d){
		var dd = document.createElement('div');
			dd.setAttribute('class','paramTitle');
			dd.innerHTML = "Paramètres de jeu (personnel) :";
		d.appendChild(dd);
		getParam('data', function(){
			affParamList(d, param.serverData.data.local.params, function(inputs) {
				inputs.forEach(function(input){
					input.addEventListener('change',function(){
						var value = this.value;
						if (input.type=='checkbox') value = this.checked;
						setLocalParam(this.code, value);
					});
				});
			});
		}, param.serverData, 'perso');
	});
}


function affParamList(div, params, callback) {
	var d = document.createElement('div');
		d.setAttribute('class','paramContainer');
	div.appendChild(d);
	var inputs = [];
	for (var p in params) {
		var dd = document.createElement('div');
			dd.setAttribute('class','paramElt');
		d.appendChild(dd);
		var sl = document.createElement('label');
			sl.setAttribute('class','paramEltDescription');
			sl.innerHTML = params[p].description;
		dd.appendChild(sl);
		var aff = false;
		if (params[p].bornes) {
			aff = true;
			var s = document.createElement('input');
				s.setAttribute('class','paramEltModifie');
				s.type = 'range';
				s.min = params[p].bornes[0];
				s.max = params[p].bornes[1];
				s.value = params[p].value;
				s.step = 1;
			dd.appendChild(s);
			var ss = document.createElement('div');
				ss.setAttribute('class','paramEltValue');
				ss.innerHTML = params[p].value;
			dd.appendChild(ss);
			s.span = ss;
			s.addEventListener('input', function(){
				this.span.innerHTML = this.value;
			});
		}
		if (params[p].options) {
			aff = true;
			var s = document.createElement('select');
				s.setAttribute('class','paramEltModifie');
			dd.appendChild(s);
			params[p].options.forEach(function(o){
				var lib = o;
				if (o=='first') lib = "Premier arrivé";
				if (o=='order') lib = "Sens du jeu";
				if (o=='yes') lib = "Oui";
				if (o=='no') lib = "Non";
				var ss = document.createElement('option');
					ss.value = o;
					ss.innerHTML = lib;
					if (o==params[p].value) ss.selected = true;
				s.appendChild(ss);
			});
		}
		if (params[p].boolean) {
			aff = true;
			var s = document.createElement('input');
				s.setAttribute('class','paramEltModifie');
				s.type = 'checkbox';
				sl.setAttribute('for','inputParam_'+p);
				if (params[p].value) s.checked = true;
			dd.appendChild(s);
		}
		if (!aff) {
			var s = document.createElement('input');
				s.setAttribute('class','paramEltModifie');
				s.value = params[p].value;
			dd.appendChild(s);
		}
		if (params[p].disabled) {
			s.disabled = true;
			s.keepDisabled = true;
		}
		s.id = 'inputParam_'+p;
		s.code = p;
		inputs.push(s);
		if (params[p].unit) {
			var s = document.createElement('div');
				s.setAttribute('class','paramEltUnit');
				s.innerHTML = params[p].unit;
			dd.appendChild(s);
		}
	}
	callback(inputs)
}
function majParam(data) {
	if ('master' in data) {
		getDOM('inputParamMaster', function(s){
			setMasteredParam(s, data.master);
		});
	} else {
		getDOM('inputParam_'+data.code, function(s){
			s.value = data.value;
			if (s.type=='checkbox') s.checked = data.value;
			if (s.span) s.span.innerHTML = data.value;
		});
	}
}
function setMasteredParam(s, master) {
	if (master) {
		s.send = false;
		s.img.img.src = s.srcLock;
		s.img.title = "Dévérouiller";
		if (master.user==param.user) {
			s.div.innerHTML = "Tu es le seul maître à bord";
			if (s.restitute.dispo) activeBoardButton(s.restitute, true);
		} else {
			activeBoardButton(s, false);
			s.img.title = "Dévérouillage impossible";
			s.div.innerHTML = master.name+" a pris la main";
			s.inputs.forEach(function(input){
				input.disabled = true;
			});
			activeBoardButton(s.restitute, false);
		}
	} else {
		activeBoardButton(s, true);
		s.send = true;
		s.img.title = "Vérouiller";
		s.img.img.src = s.srcUnlock;
		s.div.innerHTML = "";
		s.inputs.forEach(function(input){
			if (!input.keepDisabled) input.disabled = false;
		});
		if (s.restitute.dispo) activeBoardButton(s.restitute, true);
	}
}


function AffBoxContent(nb) {
	AffInfosMenu('box', function(d){
		getGameContent();
	});
}
function paramAffGameContent(data) {
	getDOM('divSessionMenu', function(div){
		var dd = document.createElement('div');
			dd.setAttribute('class','paramTitle');
			dd.innerHTML = "Contenu de la boîte de jeu :";
		div.content.appendChild(dd);
		var dd = document.createElement('div');
			dd.setAttribute('class','loadComment');
			dd.innerHTML = data.nb+" joueur"+(data.nb>1?"s":"");
			dd.id = "BoxNbPlayers";
		div.content.appendChild(dd);
		getParam('data', function(){
			var all = param.serverData.data;
			
			// dice
			for (var org in all.dice.items) {
				var d = document.createElement('div');
				div.content.appendChild(d);
				var l = all.dice.litteral+" "+all[org].litteral+" ("+all.dice.items[org].nb+")";
				var src = all.dice.items[org].src;
				makeCardVisuElt(d, {o:all.dice.items[org].nb+"x"});
				makeCardVisuElt(d, {src:src, o:org, lit:l, taille:'3em'});
				makeCardVisuElt(d, {o:": "});
				data.possible[org].forEach(function(o){
					var l = "";
					var src = all[org].items[o]['dice-src'];
					makeCardVisuElt(d, {src:src, o:o.code, lit:l, taille:'3em'});
				});
			}
			
			// dose
			var d = document.createElement('div');
				div.content.appendChild(d);
			makeCardVisuElt(d, {o:"Les doses disponibles: "});
			var l = all.dose.litteral;
			var src = all.dose.src;
			var frame = all.dose['frame-src'];
			makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
			var item = makeCardVisuElt(d, {o:"x"+all.dose.stock*data.nb});
			item.id = "BoxDoseNb";
			
			// organ
			var d = document.createElement('div');
				div.content.appendChild(d);
			makeCardVisuElt(d, {o:"Les organes possibles: "});
			for (var o in all.organ.items) {
				var t = all.organ.items[o];
				makeCardVisuElt(d, {src:t.src, o:o, lit:o, taille:'3em'});
			};
			var d = document.createElement('div');
				div.content.appendChild(d);
			var lit = "Pour chaque organe ";
			lit += ":";
			makeCardVisuElt(d, {o:lit});
			for (var o in all.organ.frames) {
				var t = all.organ.frames[o];
				makeCardVisuElt(d, {src:t.src, o:o, lit:o, taille:'3em', margin:'0.5em'});
				var item = makeCardVisuElt(d, {o:"x"+t.nb*data.nb});
				item.id = "BoxOrganNb"+o;
			}

			// trick
			var d = document.createElement('div');
				d.id = "BoxTrick";
				if (!data.trick) d.style.display = 'none';
			div.content.appendChild(d);
			var l = all.trick.litteral;
			var src = all.trick.src;
			var frame = all.trick['frame-src'];
			makeCardVisuElt(d, {src:src, lit:l, frame:frame, taille:'3em'});
			makeCardVisuElt(d, {o:": "});
			for (var o in all.trick.items) {
				var t = all.trick.items[o];
				var l = o + "\n" + t.description;
				makeCardVisuElt(d, {src:t.src, o:o, lit:l, frame:frame, taille:'3em'});
				makeCardVisuElt(d, {o:"x"+t.nb});
			}
		}, param.serverData, 'box');
	});
}
function paramMajBoxContent(data) {
	var all = param.serverData.data;
	var item =  document.getElementById("BoxNbPlayers");
	if (item) item.innerHTML = data.nb+" joueur"+(data.nb>1?"s":"");
	var item =  document.getElementById("BoxDoseNb");
	if (item) item.innerHTML = "&nbsp;x"+all.dose.stock*data.nb+"&nbsp;";
	for (var o in all.organ.frames) {
		var t = all.organ.frames[o];
		var item =  document.getElementById("BoxOrganNb"+o);
		if (item) item.innerHTML = "&nbsp;x"+t.nb*data.nb+"&nbsp;";
	};
	var item =  document.getElementById("BoxTrick");
	if (item) {
		if (data.trick) item.style.display = '';
		else item.style.display = 'none';
	}
}

function AffMemo(url) {
	AffInfosMenu('memo'+url, function(d){
		var img = document.createElement('img');
			img.src = url;
			img.style.width = '500px';
			img.style.maxWidth = '95%';
		d.appendChild(img);
	});
}


function AffBotParam() {
	AffInfosMenu('bot', function(d){
		getGameBot();
	});
}
function paramAffBot(data) {
	getDOM('divSessionMenu', function(div){
		var d = div.content;
		var dd = document.createElement('div');
			dd.setAttribute('class','paramTitle');
			dd.innerHTML = "Personnalisation des robots :";
		d.appendChild(dd);
		var dd = document.createElement('div');
			dd.setAttribute('class','loadComment');
			dd.innerHTML = "Le poids des critères influence la volonté du robot dans ses choix<br>Mais ça reste une tendance, les actions étant en priorité conditionnées par le jeu<br>(Pour augmenter un critère, il faut au préalable diminuer un autre critère du même bloc)";
		d.appendChild(dd);
		
		var all = param.serverData.data;
		
		var dd = document.createElement('div');
		dd.style.marginTop = '1em';
		d.appendChild(dd);
			var s = document.createElement('div');
				s.setAttribute('class','paramRangeDiv');
				s.innerHTML = "Afficher les paramètres de ";
			dd.appendChild(s);
			var s = document.createElement('select');
				s.style.marginLeft = '0.5em';
				s.addEventListener('change', function(){
					var obj = {target:this.value};
					getGameBotUnit(obj);
				});
			d.selAff = s;
			dd.appendChild(s);
				var o = document.createElement('option');
				s.appendChild(o);
				for (var bot in data.bots) {
					var o = document.createElement('option');
						o.innerHTML = data.bots[bot];
						o.value = bot;
					s.appendChild(o);
				}
				
		d.pBot = {};
		for (var p in all.bot.ai) {
			var ai = all.bot.ai[p];
			var coll = {};
			for (var o in all[ai.code][ai.coll]) {
				var src = all[ai.code][ai.coll][o].src;
				var frame = ai.frame;
				if (ai.frames) frame = all[ai.code].frames['frame-'+all[ai.code][ai.coll][o][ai.frames]].src
				coll[o] = {src:src, frame:frame};
			}
			var data1 = {coll:coll, div:d, title:ai.litteral};
			d.pBot[p] = makeBlocRangeBot(data1);
		}

		var dd = document.createElement('div');
		dd.style.marginTop = '1em';
		d.appendChild(dd);
			var s = document.createElement('div');
				s.setAttribute('class','paramRangeDiv');
				s.innerHTML = "Appliquer à";
			dd.appendChild(s);
			var s = document.createElement('select');
				s.style.marginLeft = '0.5em';	
			dd.appendChild(s);
			d.selSet = s;
				if (data.nbBots>0) {
					var o = document.createElement('option');
						o.innerHTML = "Tous";
						o.value = 'all';
					s.appendChild(o);
				}
				for (var i=0; i<data.nbBots; i++) {
					var o = document.createElement('option');
						o.innerHTML = "Robot "+(i+1);
						o.value = i;
					s.appendChild(o);
				}
			makeBoardButton(dd, 'global', 'validate', null, function(f, res){
				res.launch.select = s;
				res.launch.parent = d;
				res.launch.img.style.marginLeft = '1em';
				res.launch.addEventListener('click', function(){
					var obj = {ind:this.select.value};
					obj.param = {}
					for (var p in this.parent.pBot) {
						obj.param[p] = {};
						var inputs = this.parent.pBot[p].getElementsByTagName('input');
						for (let item of inputs){
							if (item.inStat) obj.param[p][item.code] = item.value;
						}
					}
					setGameBot(obj);
				});
			}, {taille:'2em'});
	});
}
function makeBlocRangeBot(data) {
	var ddi = document.createElement('div');
		ddi.style.marginTop = '1em';
	data.div.appendChild(ddi);
	ddi.stats = {moy:0, nb:0};
		var ddd = document.createElement('div');
			ddi.appendChild(ddd);
			var dd = document.createElement('div');
				dd.setAttribute('class','paramEltUnit');
				dd.innerHTML = data.title+" :";
			ddd.appendChild(dd);
			makeBoardButton(ddd, 'global', 'reset', null, function(f, res){
				res.launch.img.style.marginLeft = '0.5em';
				res.launch.parent = ddi;
				res.launch.addEventListener('click', function(){
					var sel = this.parent.parentNode.selAff;
					if (sel && sel.value!='') {
						sel.value = '';
					}
					var inputs = this.parent.getElementsByTagName('input');
					for (let item of inputs){
						if (item.inStat) item.value = 50;
					}
				});
			}, {taille:'1em'});
		for (var o in data.coll) {
			var ddd = document.createElement('div');
			ddi.appendChild(ddd);
			var dd = document.createElement('div');
				dd.setAttribute('class','paramContainer');
			ddd.appendChild(dd);
			var src = data.coll[o].src;
			var frame = data.coll[o].frame;
			if (src) makeCardVisuElt(dd, {src:src, lit:o, frame:frame, taille:'2em'});
			else {
				var d = document.createElement('div');
					d.setAttribute('class','paramRangeCaption');
					d.innerHTML = o;
				dd.appendChild(d);
			}
			var data2 = {div:dd, code:o, parent:ddi};
			makeRangeBot(data2);
			ddi.stats.nb++;
			ddi.stats.moy += 50;
		}
	return ddi;
}
function makeRangeBot(data) {
	var d = document.createElement('div');
		d.setAttribute('class','paramRangeDiv');
	data.div.appendChild(d);
	var s = document.createElement('div');
		s.setAttribute('class','paramRangeM');
		s.innerHTML = "-";
	d.appendChild(s);
	var s = document.createElement('div');
		s.setAttribute('class','paramRangeP');
		s.innerHTML = "+";
	d.appendChild(s);
	var s = document.createElement('input');
		s.setAttribute('class','paramEltModifie');
		s.type = 'range';
		s.min = 0;
		s.max = 100;
		s.value = 50;
		s.step = 1;
		s.parent = data.parent;
		s.inStat = true;
		s.code = data.code;
	d.appendChild(s);
	s.addEventListener('input', function(){
		var sel = this.parent.parentNode.selAff;
		if (sel && sel.value!='') {
			sel.value = '';
		}
		var inputs = this.parent.getElementsByTagName('input');
		var val = parseInt(this.value);
		var v = 0;
		for (let item of inputs){
			if (item.inStat && item!=this) v += parseInt(item.value);
		}
		if (v+val>this.parent.stats.moy) this.value = this.parent.stats.moy-v;
	});
}
function paramAffBotUnit(data) {
	getDOM('divSessionMenu', function(div){
		div.content.bot = data.id;
		paramMajBotUnit(data);
	});
}
function paramMajBotUnit(data) {
	getDOM('divSessionMenu', function(div){
		var d = div.content;
		if (data.id==d.bot) {
			for (var p in d.pBot) {
				var par = null;
				if (data && data.param) par = data.param[p];
				var inputs = d.pBot[p].getElementsByTagName('input');
				for (let item of inputs){
					if (item.inStat) {
						if (par && par[item.code]) item.value = par[item.code];
						else item.value = 50;
					}
				}
			}
		}
	});
}
function paramMajBot(data) {
	getDOM('divSessionMenu', function(div){
		if (div.open=='bot') {
			if (data.param) paramMajBotUnit(data.param);
			if (data.nbBots) {
				var sel = div.content.selSet;
				if (sel) {
					var val = sel.value;
					while (sel.firstChild) sel.removeChild(sel.firstChild);
					if (data.nbBots>0) {
						var o = document.createElement('option');
							o.innerHTML = "Tous";
							o.value = 'all';
							if (val==o.value) o.selected = true;
						sel.appendChild(o);
					}
					for (var i=0; i<data.nbBots; i++) {
						var o = document.createElement('option');
							o.innerHTML = "Robot "+(i+1);
							o.value = i;
							if (val==o.value) o.selected = true;
						sel.appendChild(o);
					}
				}
			}
			if (data.bots) {
				var sel = div.content.selAff;
				if (sel) {
					var val = sel.value;
					while (sel.firstChild) sel.removeChild(sel.firstChild);
					var o = document.createElement('option');
					sel.appendChild(o);
					for (var bot in data.bots) {
						var o = document.createElement('option');
							o.innerHTML = data.bots[bot];
							o.value = bot;
							if (val==o.value) o.selected = true;
						sel.appendChild(o);
					}
				}
			}
		}
	});
}

