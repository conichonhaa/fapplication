
function playRemoveAction(code, callback) {
	var div = param.serverData.board[code].result;
	while (div.firstChild) div.removeChild(div.firstChild);
	if (div.code!=code) {
		div.code = code;
		var alternate = {dice:'wheel', wheel:'dice'};
		param.serverData.board[alternate[code]].result.code = alternate[code];
		if (param.serverData.board[alternate[code]].launch.disabled) {
			playRemoveAction(alternate[code]);
		} else {
			param.serverData.board[alternate[code]].launch.click();
		}
	} else {
		div.code = null;
	}
	if (callback) callback(div.code==code);
	playAppearWaiting();
}



async function playStartCave(data, callback) {
	param.serverData.caving = true;
	drawSetTimer(data.timer);
	activeBoardButton(param.serverData.board.dice.launch, true);
	activeBoardButton(param.serverData.board.wheel.launch, true);
	callback();
	resetObjectTakingAll();
	playAffTrickButton();
}
async function playObjectThrowed(data, callback) {
	if (param.serverData.board[data.code]) activeBoardButton(param.serverData.board[data.code].launch, false);
	callback();
	var decks = param.serverData.board.all;
	for (var id in decks) {
		setObjectTaking(id, data.code, {opacity:'1'});
	}
}
async function playEndCave(data, callback) {
	param.serverData.caving = false;
	drawSetTimer(0);
	playEndDice(true);
	playEndWheel(true);
	activeBoardButton(param.serverData.board.dice.launch, false);
	activeBoardButton(param.serverData.board.wheel.launch, false);
	
	callback();
	var decks = param.serverData.board.all;
	for (var id in decks) {
		setObjectTaking(id, 'dice', {});
		setObjectTaking(id, 'wheel', {});
		var div = param.serverData.board.all[id].info;
		while (div.firstChild) div.removeChild(div.firstChild);
	}
	playHideTrickButton();
}



async function playTakeDice(data, callback) {
	var div = param.serverData.board.dice.result;
	while (div.firstChild) div.removeChild(div.firstChild);
	var d = document.createElement('div');
		d.setAttribute('class','boardAction');
	div.appendChild(d);
	
	var ask = document.createElement('div');
		ask.style.display = 'inline-block';
	d.appendChild(ask);	
	
		var dd = document.createElement('div');
			dd.setAttribute('class','boardDicesThrowDisabled');
		var cadre = document.createElement('div');
			cadre.tot = 0;
			cadre.ready = false;
			cadre.addEventListener('click',function(){
				if (this.ready) {
					audioPlay(linearArbo(['dice','actions','launch']));
				}
			});
		dd.appendChild(cadre);
		var input = document.createElement('div');
			input.style.fontWeight = 'bold';
			input.innerHTML = "Lancer";
			input.setAttribute('class','boardDicesThrowLaunchDisabled');
		dd.appendChild(input);
		var dice = param.serverData.data.dice;
		
		var memo = null;
		var first = null;
		for (var code in dice.items) {
			var inp = document.createElement('img');
				inp.value = 0;	
				inp.cadre = cadre;
				inp.input = input;
				inp.max = dice.items[code].nb;
				inp.src = dice.items[code].src;
				inp.setAttribute('class','boardDicesChoose');
				inp.addEventListener('click', function(){
					this.value++;
					if (this.value>this.max) this.value = this.max;
					else this.cadre.tot++;
					if (this.cadre.tot>dice.nb) {
						var prec = this.prec;
						while (prec.value<1 && prec!=this) prec = prec.prec;
						prec.value--;
						this.cadre.tot--;
					}
					if (this.cadre.tot==dice.nb) {
						this.cadre.ready = true;
						this.input.parentNode.setAttribute('class','boardDicesThrow');
						this.input.setAttribute('class','');
					}
					actuBoardDices(this.cadre);
				});
			ask.appendChild(inp);
			cadre[code] = inp;
			if (memo) inp.prec = memo;
			else first = inp;
			memo = inp;
		}
		if (first) first.prec = inp;
		ask.appendChild(dd);
		actuBoardDices(cadre);
		
		// a enlever test pour les magouilles
		var force = document.createElement('input');
			force.type = 'checkbox';
			force.style.display = 'none';
		ask.appendChild(force);
		// fin a enlever
		
		var res = document.createElement('div');
		ask.appendChild(res);
	callback({launch:dd, dices:cadre, div:ask, force:force});
}
function actuBoardDices(div) {
	while (div.firstChild) div.removeChild(div.firstChild);
	var dice = param.serverData.data.dice;
	var first = true;
	var nb = 0;
	function makeIconDice(src, op) {
		var inp = document.createElement('img');
			inp.src = src;
			inp.style.height = '2em';
			inp.style.position = 'relative';
			if (op) inp.style.opacity = op;
			if (!first) inp.style.marginLeft = '-0.8em';
		div.appendChild(inp);
		first = false;
		nb++;
	}
	for (var code in dice.items) {
		for (var i=0; i<div[code].value; i++) {
			makeIconDice(dice.items[code].src);
		}
	}
	for (var i=nb; i<dice.nb; i++) {
		makeIconDice(dice.src, '0.3');
	}
}
async function playDice(data, callback1, callback2, callbackG) {
	param.serverData.object.dice = data.jet;
	var jet = param.serverData.object.dice;
	
	var div = param.serverData.board.dice.result;
	while (div.firstChild) div.removeChild(div.firstChild);
	var d = document.createElement('div');
		d.setAttribute('class','boardAction');
	div.appendChild(d);
	var dd = document.createElement('div');
		dd.style.display = 'inline-block';
	d.appendChild(dd);	
	var ask = document.createElement('div');
	dd.appendChild(ask);	
	jet.ask = ask;
	var aff = document.createElement('div');
	dd.appendChild(aff);
	jet.aff = aff;
	
	var d = document.createElement('div');
	ask.appendChild(d);
	data.dice.forEach(function(d){
		var src = param.serverData.data[d.code].items[d.val]['dice-src'];
		var p = {o:d.val, src:src, lit:d.val, taille:'3em'};
		makeCardVisuElt(ask, p);
	});	
	
	jet.delay = 2000;
	var delay = jet.delay;
	if (data.trick) {
		// var frame = param.serverData.data.trick['frame-src'];
		// makeBoardAction(ask, {code:'trick', frame:frame}, function(f,res){
			// res.launch.addEventListener('click',function(){
				// this.parentNode.parentNode.removeChild(this.parentNode);
			// });
			// callback1(res);
		// });
		callback1();
		var d = document.createElement('div');
			d.innerHTML = "Triple "+data.stock+", tu obtiens une carte Magouille";
		ask.appendChild(d);
	}
	if (data.stock) {
		delay = delay + 10000;
		
		var st = document.createElement('div');
		ask.appendChild(st);
		
		var d = document.createElement('div');
			d.innerHTML = "Double "+data.stock+", choisis l'organe de ton choix :";
		st.appendChild(d);
		var d = document.createElement('div');
		st.appendChild(d);
		
		var frame = param.serverData.data.organ.frames.neutral.src;
		makeBoardAction(d, {code:'organ', possible:data.organ, frame:frame}, function(f,res){
			res.launch.addEventListener('click',function(){
				st.parentNode.removeChild(st);
			});
			callback2(res);
		});
	}
	affJetBoard(data);
	callbackG();
	clearTimeout(jet.timeout);
	jet.timeout = setTimeout(function(){playEndDice()},delay);
}
async function playTrick(data, callback) {
	var jet = param.serverData.object.dice;
	jet.trick = data.card;
	affJetBoard(data);
	callback();
}
async function playOrgan(data, callback) {
	var jet = param.serverData.object.dice;
	if (data.card) {
		if (!jet.organ) jet.organ = {};
		if (!jet.organ[data.card.code]) jet.organ[data.card.code] = 0;
		jet.organ[data.card.code]++;
		jet.rec.organ.push(data.card);
	}
	affJetBoard(data);
	callback();
	clearTimeout(jet.timeout);
	clearTimeout(jet.timeout);
	jet.timeout = setTimeout(function(){playEndDice()},jet.delay);
}
function affJetBoard(data) {
	var jet = param.serverData.object.dice;
	var aff = jet.aff;
	while (aff.firstChild) aff.removeChild(aff.firstChild);
	var margin = '1em';
	var all = param.serverData.data;
	var empty = false;
	if (jet.dose) {
		if (jet.dose>jet.rec.dose) empty = true;
		var l = all.dose.litteral;
		var src = all.dose.src;
		var frame = all.dose['frame-src'];
		for (var i=0; i<jet.dose; i++) {
			var m = (i>0?'-2em':margin);
			var op = (i<jet.rec.dose?null:'0.2');
			item = makeCardVisuElt(aff, {src:src, frame:frame, o:l, lit:l, taille:'3em', margin:m, inc:i, opacity:op});
		}
		if (jet.rec.dose>1) {
			var d = document.createElement('div');
				d.style.display = 'inline-block';
				d.style.verticalAlign = 'middle';
				d.innerHTML = "(&nbsp;x"+jet.rec.dose+")";
			aff.appendChild(d);
		}
	}
	var i=0;
	if (jet.rec.organ) {
		jet.rec.organ.forEach(function(s){
			var m = (i>0?null:margin);
			var op = null;
			var l = all.organ.litteral+": "+s.code+" ("+s.effect+")";
			var frame = all.organ.frames[s.effect].src;
			var src = all.organ.items[s.code].src;
			if (s.empty) {
				empty = true;
				frame = all.organ.frames.neutral.src;
				op = '0.2';
			}
			makeCardVisuElt(aff, {src:src, o:s.code, lit:l, frame:frame, taille:'3em', margin:m, opacity:op});
			i++
		});
	}
	if (jet.trick) {
		console.log(jet.trick);
		var m = (i>0?null:margin);
		var op = null;
		var l = all.trick.litteral;
		var frame = all.trick['frame-src'];
		if (!jet.trick.code) {
			empty = true;
			op = '0.2';
			var src = all.trick.src;
		} else {
			var src = all.trick.items[jet.trick.code].src;
			l += ": "+jet.trick.code;
		}
		makeCardVisuElt(aff, {src:src, o:jet.trick.code, lit:l, frame:frame, taille:'3em', margin:margin, opacity:op});
	}
	if (empty) {
		var d = document.createElement('div');
			d.style.fontStyle = 'italic';
			d.innerHTML = "La pioche est vide, tu n'as pas pu tout récupérer..."
		aff.appendChild(d);
	}
}
function playEndDice(end) {
	var div = param.serverData.board.dice.result;
	if (end) {
		var inputs = div.getElementsByTagName('input');
		for (let item of inputs){
			item.disabled = true;
		}
	}
	closeWithDisappear(div.firstChild, function(res){
		delete param.serverData.board.dice.result.code;
	});
	setTimeout(function(){
		playAppearWaiting();
	}, 1000);
}


async function playTakeWheel(data, callback1, callback2, callbackG) {
	param.serverData.object.wheel = data.wheel;
	var wheel = param.serverData.object.wheel;
	var div = param.serverData.board.wheel.result;
	while (div.firstChild) div.removeChild(div.firstChild);
	var d = document.createElement('div');
		d.setAttribute('class','boardAction');
	div.appendChild(d);	
		
		var ask = document.createElement('div');
		d.appendChild(ask);
		var dd = document.createElement('div');
		ask.appendChild(dd);
		makeBoardAction(dd, {code:'wheel', possible:data.wheel, frames:'cost'} , function(f,res){
			res.launch.addEventListener('click',function(){
				wheel.action = this.value;
				// this.parentNode.parentNode.removeChild(this.parentNode);
			});
			callback1(res);
		});
		var dd = document.createElement('div');
		ask.appendChild(dd);
		makeBoardAction(dd, {code:'players', possible:data.player, getId:'id'}, function(f,res){
			res.launch.addEventListener('click',function(){
				wheel.player = this.value;
				wheel.playerId = this.codeId;
				// this.parentNode.parentNode.removeChild(this.parentNode);
			});
			callback2(res);
		});
		
		var aff = document.createElement('div');
		d.appendChild(aff);
		
		var memo = document.createElement('div');
			memo.style.fontStyle = 'italic';
		d.appendChild(memo);
		
		wheel.aff = aff;
		wheel.ask = ask;
		wheel.memo = memo;
		callbackG();
}
async function playChooseWheel(data, callback1, callback2) {
	var wheel = param.serverData.object.wheel;
	while (wheel.aff.firstChild) wheel.aff.removeChild(wheel.aff.firstChild);
	
	makeBoardButton(wheel.aff, 'wheel', 'fold', null, function(f,res){
		callback2(res);
		res.launch.addEventListener('click',function(){
			wheel.ask.innerHTML = "";
			wheel.aff.innerHTML = "";
			wheel.memo.innerHTML = "Tu t'es couché... ";
		});
	})	
	wheel.aff.style.marginTop = '0.5em';
	var d = document.createElement('div');
		d.style.display = 'inline-block';
		d.style.width = '2em';
	wheel.aff.appendChild(d);	
	
	var all = param.serverData.data;
	var txt = (wheel.action?wheel.action:"???")+" &nbsp; sur  &nbsp; "+(wheel.player?wheel.player:"???");
	
	makeBoardButton(wheel.aff, 'wheel', 'surge', null, function(f,res){
		var ok = false;
		if (wheel.action) {
			var dose = param.serverData.memo.hand.dose;
			if (!dose) dose = 0;
			if (all.wheel.items[wheel.action].cost>dose) {
				txt = "Tu n'as pas assez de doses pour : "+wheel.action;
			} else {
				ok = true;
			}
		}
		if (ok && wheel.player) {
			if (all.wheel.items[wheel.action].target=="me") {
				if (wheel.playerId!=param.serverData.playerId) {
					txt = "Tu dois faire "+wheel.action+" sur toi-même";
					ok = false;
				}
			}
			if (all.wheel.items[wheel.action].target=="others") {
				if (wheel.playerId==param.serverData.playerId) {
					txt = "Tu dois faire "+wheel.action+" sur un autre joueur";
					ok = false;
				}
			}
		} else {
			ok = false;
		}
		if (ok) {
			callback1(res, wheel);
			res.launch.addEventListener('click',function(){
				wheel.ask.innerHTML = "";
				wheel.aff.innerHTML = "";
				wheel.memo.innerHTML += "... <img src='images/roue.gif' style='height:0.8em;' />";
			});			
		} else {
			activeBoardButton(res.launch, false);
		}
	})
	wheel.memo.innerHTML = txt;	
}
function playEndWheel(end) {
	var div = param.serverData.board.wheel.result;
	if (end) {
		var inputs = div.getElementsByTagName('input');
		for (let item of inputs){
			item.disabled = true;
		}
	}
	closeWithDisappear(div.firstChild, function(res){
		delete param.serverData.board.wheel.result.code;
	});
}
async function playThrowWheel(data, callback) {
	getParam('board', function(){
		var wheel = param.serverData.object.wheel;
		var delay = 2000;
		var div = param.serverData.board.wheel.result;
		while (div.firstChild) div.removeChild(div.firstChild);
		// console.log(data);
		if (data.solve) {
			var div = param.serverData.board.solve;
			while (div.firstChild) div.removeChild(div.firstChild);
			var dd = document.createElement('div');
				dd.setAttribute('class','boardAction');
			div.appendChild(dd);
			
			var d = document.createElement('div');
			dd.appendChild(d);
			d.innerHTML = data.rep;
			var d = document.createElement('div');
			dd.appendChild(d);
			
			if (data.solve.length>0) {
				drawFrontMessage({code:'message', message:"A toi de jouer : résouds ta chirurgie"});
				audioPlay(linearArbo(['global','events','yourTurn']));
				delay = 120000;
				var memoOrigin = null;
				var all = param.serverData.data;
				var input = document.createElement('input');
					input.type = 'button';
					input.style.display = 'none';
					input.addEventListener('click',function(){
						this.parentNode.parentNode.innerHTML = "";
					});
				d.appendChild(input);
				data.solve.forEach(function(o){
					if (o.origin && o.origin!=memoOrigin) {
						var m = (memoOrigin?'1em':null);
						memoOrigin = o.origin;
						var src = param.serverData.data.global.items[o.origin].src;
						item = makeCardVisuElt(d, {o:o.origin, src:src, taille:'2em', margin:m});
						item.style.verticalAlign = 'bottom';
					}
					var src = all[o.type].src;
					if (o.code) src = all[o.type].items[o.code].src;
					var frame = false;
					var l = "";
					var item = null;
					var op = false;
					if (o.type=='organ') {
						frame = all[o.type].frames[o.effect].src;
						l = o.code + ": "+o.effect;
					}
					if (o.type=='trick') {
						frame = all[o.type]['frame-src'];
						l = all[o.type].litteral;
					}
					makeCardActionElt(d, {input:input, src:src, o:o, lit:l, frame:frame});
				});
				callback({launch:input});
			} else {
				var src = param.serverData.data.wheel.actions.fail.src;
				var l = "Echec de la chirurgie";
				item = makeCardVisuElt(d, {src:src, lit:l, taille:'2em'});
			}
		}
	}, param.serverData, 'throwwheel');
}
async function playSolveWheel(data, callback) {
	var all = param.serverData.data;
	var div = param.serverData.board.solve;
	while (div.firstChild) div.removeChild(div.firstChild);
	var dd = document.createElement('div');
		dd.setAttribute('class','boardAction');
	div.appendChild(dd);
	if (data.card) {
		var src = all[data.card.type].src;
		var l = all[data.card.type].litteral;
		var frame = all[data.card.type].src;
		if ('frame-src' in all[data.card.type]) frame = all[data.card.type]['frame-src'];
		if (data.card.code) {
			src = all[data.card.type].items[data.card.code].src;
			l += ": "+data.card.code;
		}
		if (data.card.effect) {
			frame = all[data.card.type].frames[data.card.effect].src;
			l += ": "+data.card.effetc;
		}
		makeCardVisuElt(dd, {src:src, o:data.card.code, lit:l, frame:frame, taille:'3em'});
	}
	setTimeout(function(){
		playEndSolve();
	},2000);
}
function playEndSolve(end) {
	var div = param.serverData.board.solve;
	if (end) {
		var inputs = div.getElementsByTagName('input');
		for (let item of inputs){
			item.disabled = true;
		}
	}
	closeWithDisappear(div.firstChild, function(res){
		
	});
	setTimeout(function(){
		playAppearWaiting();
	}, 1000);
}



async function playStartDiscard(data, callback) {
	drawSetTimer(data.timer);
}
async function playAskDiscard(data, callback) {
	getParam('board', function(){
		var all = param.serverData.data;
		var div = param.serverData.board.discard;
		while (div.firstChild) div.removeChild(div.firstChild);
		if (data.list) {
			audioPlay(linearArbo(['global','events','yourTurn']));
			var dd = document.createElement('div');
				dd.setAttribute('class','boardAction');
			div.appendChild(dd);
			var d = document.createElement('div');
			dd.appendChild(d);
			d.innerHTML = "Tu ne peux garder que "+data.max+" carte(s) maximum dans ta main<br>Choisi celle(s) que tu veux supprimer";
			var nbToSupp = data.list.length
			var d = document.createElement('div');
			dd.appendChild(d);		
			var input = document.createElement('input');
				input.type = 'button';
				input.style.display = 'none';
				input.toSupp = (data.list.length-data.max);
				input.count = 0;
				input.addEventListener('click',function(){
					this.count++;
					if (this.count>=this.toSupp) {
						this.parentNode.parentNode.innerHTML = "C'est bon";
						setTimeout(function() {
							playEndDiscard();
						}, 2000);
					}
				});
			d.appendChild(input);
			data.list.forEach(function(o) {
				var src = all[o.type].items[o.code].src;
				var frame = null;
				if (o.type=='organ') frame = all.organ.frames[o.effect].src;
				if (o.type=='trick') frame = all.trick['frame-src'];
				var l = o.code + ": "+o.effect;
				var item = makeCardActionElt(d, {input:input, src:src, o:o, lit:l, frame:frame});
				item.addEventListener('click',function(){
					this.style.display = 'none';
				});
			});
			
			var l = all.global.actions.fuck.description;
			var src = all.global.actions.fuck.src;
			var item2 = makeCardActionElt(d, {src:src, o:l, lit:l});
				item2.style.marginLeft = "2em";
			item2.addEventListener('click',function(){
				this.parentNode.parentNode.innerHTML = "Le hasard le fera pour toi...";
				setTimeout(function() {
					playEndDiscard();
				}, 2000);
			});
			callback({launch:input, launch2:item2});
		}
	}, param.serverData, 'discard');
}
function playEndDiscard(end) {
	drawSetTimer(0);
	var div = param.serverData.board.discard;
	if (end) {
		var inputs = div.getElementsByTagName('input');
		for (let item of inputs){
			item.disabled = true;
		}
	}
	closeWithDisappear(div.firstChild, function(res){
		
	});
	setTimeout(function(){
		playAppearWaiting();
	}, 1000);
}



function playHasTrick(surge) {
	var has = false;
	var all = param.serverData.data;
	var tricks = param.serverData.memo.hand.trick;	
	if (tricks && tricks.length>0) {
		tricks.forEach(function(o) {
			var trick = all.trick.items[o.code];
			if (surge && trick.when.solve && trick.surge==surge) has = true;
			if (trick.when.cave && param.serverData.caving) has = true;
		});
	}
	return has
}
function playAffTrickButton(surge, timer) {
	if (playHasTrick(surge)) {
		getDOM('imgPlayTrick', function(img){
			img.style.display = '';
			img.addEventListener('click', function(){
				askTrick({surge:surge});
			});
			clearInterval(img.blink);
			(function(img) {
			img.blink = setInterval(function(){
				if (img.style.opacity=='0.1') img.style.opacity = '1';
				else img.style.opacity = '0.1';
			},200);
			})(img);
			if (timer) drawSetTimer(timer);
		});
		
	}
}
function playHideTrickButton() {
	var div = param.serverData.board.trick;
	while (div.firstChild) div.removeChild(div.firstChild);
	getDOM('imgPlayTrick', function(img){
		img.style.display = 'none';
		clearInterval(img.blink);
	});
	setTimeout(function(){
		playAppearWaiting();
	},1000);
}
function playTakeTrick(data, callback) {
	playHideTrickButton();
	getParam('board', function(){
		var all = param.serverData.data;
		var div = param.serverData.board.trick;
		while (div.firstChild) div.removeChild(div.firstChild);
		if (data.trick && data.trick.length>0) {
			var dd = document.createElement('div');
				dd.setAttribute('class','boardAction');
			div.appendChild(dd);
			var d = document.createElement('div');
			dd.appendChild(d);
			d.innerHTML = "Quelle Magouille veux-tu faire ?";
			var d = document.createElement('div');
			dd.appendChild(d);		
			var ask = {code:'trick', possible:data.trick, frame:all.trick['frame-src']}
			makeBoardAction(d, ask, function(f,res){
				res.launch.addEventListener('click',function(){
					while (div.firstChild) div.removeChild(div.firstChild);
				});
				callback(res);
			});
			var l = all.global.actions.cancel.description;
			var src = all.global.actions.cancel.src;
			var item = makeCardActionElt(d, {src:src, lit:l});
			item.style.marginLeft = '2em';
			item.addEventListener('click',function(){
				askTrick({surge:data.surge, fold:true});
				while (div.firstChild) div.removeChild(div.firstChild);
			});
		}
	}, param.serverData, 'trick');
}
function playThrowTrick(data, callback) {
	getParam('board', function(){
		var all = param.serverData.data;
		var div = param.serverData.board.trick;
		while (div.firstChild) div.removeChild(div.firstChild);
		var trick = all.trick.items[data.code];
		var ask = null;
		if (data.player) {
			ask = {code:'players', possible:data.player, getId:'id'}
		}
		if (data.organ) {
			var frame = param.serverData.data.organ.frames.neutral.src;
			ask = {code:'organ', possible:data.organ, frame:frame};
		}
		if (data.garbage) {
			ask = {code:'organ', possible:data.garbage, self:'effect'};
		}
		if (data.beast) {
			ask = {code:'organ', possible:data.beast, self:'effect'};
		}
		if (data.solve) {
			ask = {code:'organ', possible:data.solve, self:'effect'};
		}
		if (ask && ask.possible.length>0) {
			var dd = document.createElement('div');
				dd.setAttribute('class','boardAction');
			div.appendChild(dd);
			var d = document.createElement('div');
			dd.appendChild(d);
			audioPlay(linearArbo(['global','events','yourTurn']));
			d.innerHTML = "<b>"+data.code+"</b>, choisis ta cible :";
			var d = document.createElement('div');
			dd.appendChild(d);		
			makeBoardAction(d, ask, function(f,res){
				res.launch.addEventListener('click',function(){
					while (div.firstChild) div.removeChild(div.firstChild);
				});
				callback(res);
			});
		} else {
			callback();
		}
	}, param.serverData, 'trick');
}
function playWaitTrick(data, callback) {
	getParam('board', function(){
		var all = param.serverData.data;
		var div = param.serverData.board.trick;
		while (div.firstChild) div.removeChild(div.firstChild);
		if (data.wait) {
			var dd = document.createElement('div');
				dd.setAttribute('class','boardAction');
			div.appendChild(dd);
			var d = document.createElement('div');
			dd.appendChild(d);
			d.innerHTML = data.wait;
			setTimeout(function(){
				closeWithDisappear(div.firstChild, function(res){
					playAffTrickButton();
				});
			},2000);
		}
	}, param.serverData, 'trick');
}


