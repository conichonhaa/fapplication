
async function closeWithDisappear(elt, callback) {
	if (elt) {
		if (!elt.opacity) elt.opacity = 1;
		if (elt.opacity<=0) {
			if (elt.parentNode) elt.parentNode.removeChild(elt);
			if (callback) callback();
		} else {
			elt.opacity = elt.opacity - 0.01;
			if (elt.style) elt.style.opacity = elt.opacity;
			setTimeout(function(){closeWithDisappear(elt, callback);},20);
		}
	} else {
		if (callback) callback();
	}
}
async function affWithAppear(elt, callback) {
	if (elt) {
		if (!elt.opacity) {
			elt.opacity = 0;
			elt.style.display = elt.defDisplay;
		}
		if (elt.opacity>=1) {
			if (callback) callback();
		} else {
			elt.opacity = elt.opacity + 0.01;
			if (elt.style) elt.style.opacity = elt.opacity;
			setTimeout(function(){affWithAppear(elt, callback);},20);
		}
	} else {
		if (callback) callback();
	}
}
function playAppearWaiting() {
	param.serverData.memo.appear.forEach(function(item){
		affWithAppear(item);
	});
	if (param.serverData.memo.hand.info && param.serverData.memo.wait.dose>1) param.serverData.memo.hand.info.innerHTML = "x"+param.serverData.memo.wait.dose;
	param.serverData.memo.appear = [];
	param.serverData.memo.hand = param.serverData.memo.wait;
}


function makeCardActionElt(d, p) {
	var item = document.createElement('div');
		item.setAttribute('class','boardActionElt');
		if (p.taille) item.style.height = p.taille;
		item.code = p.o;
		if (p.id) item.codeId = p.id;
		if (p.lit) item.title = p.lit;
		item.input = p.input;
		item.parent = d;
		if (p.opacity) item.style.opacity = p.opacity;
		if (p.input) {
			item.addEventListener('click',function(){
				this.input.value = this.code;
				this.input.code = this.code;
				this.input.codeId = this.codeId;
				this.input.click();
				if (this.parent.clicked) {
					this.parent.clicked.setAttribute('class','boardActionElt');
					if (this.parent.clicked.img) this.parent.clicked.img.style.borderStyle = '';
				}
				this.setAttribute('class',"boardActionElt boardActionSelected");
				if (this.img) this.img.style.borderStyle = 'inset';
				this.parent.clicked = this;
				
			});
		}
	if (d) d.appendChild(item);
	if (p.src) {
		if (p.frame) {
			var imgf = document.createElement('img');
				imgf.src = p.frame;
				imgf.setAttribute('class','boardActionImgP');
				imgf.style.zIndex = 0;
			item.appendChild(imgf);
			var img = document.createElement('img');
				img.src = p.src;
				img.setAttribute('class','boardActionImgP');
				img.style.zIndex = 1;
				img.frame = imgf;
				item.img = img;
			item.appendChild(img);
		}
		var imgl = document.createElement('img');
			imgl.src = p.src;
			imgl.setAttribute('class','boardActionImgA');
			if (p.frame) {
				imgl.style.opacity = 0;
			} else {
				item.img = imgl;
			}
		item.appendChild(imgl);
	} else {
		var inp = document.createElement('input');
			inp.type = 'button';
			inp.value = p.o;
		item.appendChild(inp);
		item.img = inp;
	}
	return item;
}

function makeCardVisuElt(d, p) {
	var item = document.createElement('div');
		if (p.lit) item.title = p.lit;
		item.style.position = 'relative';
		item.style.display = 'inline-block';
		item.style.verticalAlign = 'middle';
		if (p.margin) item.style.marginLeft = p.margin;
		if (p.opacity) item.style.opacity = p.opacity;
		if (p.diff) {
			item.style.opacity = 0;
			item.style.display = 'none';
			item.defDisplay = 'inline-block';
		}
	if (d) d.appendChild(item);
	if (p.src) {
		if (p.frame) {
			var img = document.createElement('img');
				img.src = p.frame;
				img.style.zIndex = 0;
				if (p.inc) img.style.zIndex = 2*p.inc;
				if (p.taille) img.style.height = p.taille;
				if (p.classe) img.setAttribute('class',p.classe);
				img.style.position = 'absolute';
			item.appendChild(img);
			var img = document.createElement('img');
				img.src = p.src;
				img.style.zIndex = 1;
				if (p.inc) img.style.zIndex = 2*p.inc+1;
				if (p.taille) img.style.height = p.taille;
				if (p.classe) img.setAttribute('class',p.classe);
				img.style.position = 'absolute';
			item.appendChild(img);
			if (p.tag) {
				var img = document.createElement('img');
					img.src = p.tag;
					img.style.zIndex = 2;
					if (p.inc) img.style.zIndex = 2*p.inc+2;
					if (p.taille) img.style.height = p.taille;
					if (p.classe) img.setAttribute('class',p.classe);
					img.style.position = 'absolute';
				item.appendChild(img);
			}
		}
		var img = document.createElement('img');
			img.src = p.src;
			if (p.taille) img.style.height = p.taille;
			if (p.classe) img.setAttribute('class',p.classe);
			if (p.frame) img.style.opacity = 0;
		item.appendChild(img);
	} else {
		item.innerHTML = "&nbsp"+p.o+"&nbsp;";
	}
	return item;
}


async function drawSetOrder(data, callback) {
	if (param.serverData.boardReady) {
		if (data.list) {
			var numero = 1;
			data.list.forEach(function(id){
				var div = param.serverData.board.all[id].icon.order;
				div.innerHTML = numero;
				numero++;
			});
		}
		if (data.init && (!data.list || data.list.length==0)) {
			var decks = param.serverData.board.all;
			for (var id in decks) {
				var div = decks[id].icon.order;
				div.innerHTML = "";
			}
		}
	}
}


function drawSetTimer(timer) {
	getDOM('divTimer', function(div){
		if (timer) div.style.visibility = '';
		actuTimer(div, timer);
	});
}
async function drawObjectTaking(data, callback) {
	if (param.serverData.boardReady) {
		var p = {};
		if (data.take) p.blink = true;
		if (data.state) p.opacity = '1';
		if (data.hide) p.opacity = '0';
		if (data.action) p.src = 'src'+data.action;
		if (data.code) setObjectTaking(data.user, data.code, p);
		if (data.phase=='cave') {
			if (data.dice) {
				var div = param.serverData.board.all[data.user].info;
				while (div.firstChild) div.removeChild(div.firstChild);
				var dd = document.createElement('div');
				div.appendChild(dd);	
				data.dice.forEach(function(d){
					var src = param.serverData.data[d.code].items[d.val]['dice-src'];
					var p = {o:d.val, src:src, lit:d.val, taille:'2em'};
					makeCardVisuElt(dd, p);
				});
				clearTimeout(div.timeout);
				div.timeout = setTimeout(function() {
					closeWithDisappear(dd);
				},10000);
			}
		}
		if (data.phase=='solve') {
			var all = param.serverData.data;
			var div = param.serverData.board.all[data.user].info;
			clearTimeout(div.timeout);
			if (data.wheel) {
				while (div.firstChild) div.removeChild(div.firstChild);
				var dd = document.createElement('div');
				div.appendChild(dd);	
					['surge',null,'target'].forEach(function(d) {
						var o = null;
						if (d) {
							if (d=='surge') {
								var coll = 'wheel';
								var prop = d;
								var frame = 'cost';
							}
							if (d=='target') {
								var coll = 'players';
								var prop = 'id';
								var frame = null;
							}
							for (var it in all[coll].items) {
								if (all[coll].items[it][prop]==data.wheel[d]) o = it;
							}
						}
						if (o) {
							if (frame) frame = all[coll].frames['frame-'+all[coll].items[o][frame]].src;
							var src = all[coll].items[o].src;
							var p = {o:o, src:src, frame:frame, lit:o, taille:'3em', margin:'0.1em'};
							makeCardVisuElt(dd, p);
						} else {
							makeCardVisuElt(dd, {o:"→", margin:'0.1em'});
						}
					});
				var res = makeCardVisuElt(dd, {o:""});
				div.res = res;
				var trick = makeCardVisuElt(dd, {o:""});
				div.trick = trick;
				var timer = makeCardVisuElt(dd, {o:"", src:param.serverData.data.global.items.timer.src, taille:'2em', margin:'1em'});
				timer.style.visibility = 'hidden';
				var info = makeCardVisuElt(dd, {o:""});
				timer.info = info;
				div.timer = timer;	
					
			}
			if (data.trick) {
				var frame = all.trick['frame-src'];
				var src = all.trick.src;
				var p = {o:'trick', src:src, frame:frame, taille:'1.5em', margin:'-0.5em'};
				var img = makeCardVisuElt(div.trick, p);
				img.style.display = 'none';
				param.serverData.board.all[data.user].icon.trick = img;
				playAffTrickButton(data.surge, data.timer);
			}
			if (data.timer) {
				if (div.timer) {
					div.timer.style.visibility = '';
					actuTimer(div.timer, data.timer);
				}
			} else {
				if (div.trick) {
					div.trick.innerHTML = "";
				}
				playHideTrickButton();
				if (div.timer) {
					actuTimer(div.timer,0);
					if (div.timer.info.parentNode) div.timer.info.parentNode.removeChild(div.timer.info);
					if (div.timer.parentNode) div.timer.parentNode.removeChild(div.timer);
				}
				clearTimeout(div.timeout);
				div.timeout = setTimeout(function() {
					closeWithDisappear(div.firstChild);
				},2000);
			}
		}
	}
}
function setObjectTaking(id, code, p) {
	var decks = param.serverData.board.all;
	var img = decks[id].icon[code];
	if (p.opacity) img.style.opacity = p.opacity;
	if (p.src) img.src = img[p.src];
	if (p.blink) {
		if (img.style.display=='none') img.style.display = '';
		(function(img) {
		img.blink = setInterval(function(){
			if (img.style.visibility=='hidden') img.style.visibility = '';
			else img.style.visibility = 'hidden';
		},200);
		})(img);
	} else {
		clearInterval(img.blink);
		img.style.visibility = '';
	}
}
function getObjectState(id, code) {
	var decks = param.serverData.board.all;
	var img = decks[id].icon[code];
	return img.style.opacity=='1';
}
function resetObjectTakingAll() {
	var decks = param.serverData.board.all;
	for (var id in decks) {
		setObjectTaking(id, 'dice', {opacity:'0.6', src:'srcDef'});
		setObjectTaking(id, 'wheel', {opacity:'0.4', src:'srcDef'});
		var div = param.serverData.board.all[id].info;
		while (div.firstChild) div.removeChild(div.firstChild);
	}
}

function actuTimer(elt, timer) {
	if (timer!==undefined) {
		elt.timer = timer;
		elt.time = (new Date()).getTime();
		if (elt.audio && elt.audio.played) delete elt.audio.played;
	}
	var d = (new Date()).getTime();
	var diff = Math.floor((d - elt.time)/1000);
	if (elt.timer>diff) {
		elt.info.innerHTML = (elt.timer-diff) + "s";
		clearTimeout(elt.timeout);
		elt.timeout = setTimeout(function(){
			actuTimer(elt);
		}, 100);
		if (elt.audio && !elt.audio.played) {
			if (elt.timer-diff<=elt.audio.timer) {
				audioPlay(elt.audio.ind);
				elt.audio.played = true; 
			}
		}
	} else {
		if (elt.audio) {
			audioStop(elt.audio.ind);
			if (elt.audio.played) delete elt.audio.played;
		}
		clearTimeout(elt.timeout);
		elt.style.visibility = 'hidden';
	}
}
function cancelAllRunning() {
	getDOM('divTimer', function(div){
		actuTimer(div, 0);
	});
	audioStopAll();
}

function drawSeeTrickAction(data) {
	if (data.tricked && data.tricked.ok) {
		drawFrontMessage({code:'trick', user:data.tricked.user, trick:data.tricked.code, pcard:data.tricked.pcard});
		if (data.tricked.info) {
			drawFrontMessage({code:'message', message:data.tricked.info});
		}
		if (data.tricked.user) {
			var dd = param.serverData.board.all[data.tricked.user].info;
			dd.res.innerHTML = "";
			var src = param.serverData.data.wheel.actions.fail.src;
			makeCardVisuElt(dd.res, {o:"=", margin:'0.5em'});
			makeCardVisuElt(dd.res, {src:src, taille: '3em', margin:'0.5em'});
		}
	}
}


function hideFrontMessage() {
	getDOM('divFrontMessage', function(div) {
		if (!div.firstChild) div.style.display = 'none';
	});
}
function makeFrontMessage(callback) {
	getDOM('divFrontMessage', function(div) {
		div.style.display = '';
		var d = document.createElement('div');
		div.appendChild(d);
		var s = document.createElement('div');
			s.setAttribute('class','frontMessageElt');
		d.appendChild(s);
		callback(s);
		var delay = param.serverData.data.local.params.timingInfo.value;
		setTimeout(function(){
			closeWithDisappear(d, function(){
				hideFrontMessage();
			});
		}, delay*1000);		
	});
}
async function drawFrontMessage(data, callback) {
	// console.log(data);
	getParam('board',function(p){
		if (!p) return;
		var div = document.createElement('div');
		var all = param.serverData.data;
		var board = param.serverData.board.all;
		if (data.code=='recup') {
			div.innerHTML = "Récupération du jeu en cours...<br>Tu pourras bientôt à nouveau jouer<br><i>(phase suivante ou tour suivant)</i>";
		}
		if (data.code=='newTurn') {
			makeCardVisuElt(div, {o:"Début du tour "+data.round+" :"});
			audioPlay(linearArbo(['global','events','newRound']));
		}
		if (data.code=='caving') {
			makeCardVisuElt(div, {o:"Joue les"});
			var src = all.dice.items.dose.src;
			makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
			var src = all.dice.items.organ.src;
			makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'-0.7em'});
			makeCardVisuElt(div, {o:"&", margin:'0.5em'});
			var src = all.wheel.actions.surge.src;
			makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
		}
		if (data.code=='doubleOrgan') {
			var src = all.organ.items[data.organ].src;
			makeCardVisuElt(div, {o:"Double organe !! Les"});
			makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
			makeCardVisuElt(div, {o:"tournent...", margin:'0.5em'});
			audioPlay(linearArbo(['global','events','doubleOrgan']));
		}
		if (data.code=='solving') {
			var player = board[data.user].name;
			var src = all.players.items[player].src;
			makeCardVisuElt(div, {src:src, taille: '2.5em'});
			makeCardVisuElt(div, {o:":", margin:'0.5em'});
			if (data.wheel) {
				var src = all.wheel.items[data.wheel.surgeName].src;
				var frame = all.wheel.frames['frame-'+data.wheel.cost].src;
				makeCardVisuElt(div, {src:src, frame:frame, taille: '2.5em', margin:'0.5em'});
				makeCardVisuElt(div, {o:"→", margin:'0.5em'});
				var player = board[data.wheel.target].name;
				var src = all.players.items[player].src;
				makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
				makeCardVisuElt(div, {o:"=", margin:'0.5em'});
				if (data.pcard) {
					var obj = all[data.pcard.type];
					var src = obj.src;
					if (data.pcard.code) src = obj.items[data.pcard.code].src;
					makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
					if (playHasTrick(data.wheel.surge)) {
						var frame = all.trick['frame-src'];
						var src2 = all.trick.src;
						var lit = "Jouer une carte Magouille";
						var item = makeCardVisuElt(div, {src:src2, frame:frame, lit:lit, taille: '2.5em', margin:'0.5em'});
						item.addEventListener('click', function(){
							askTrick({surge:data.wheel.surge});
						});
					}
				} else {
					var src = all.wheel.actions.fail.src;
					makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
				}
			} else {
				var src = all.wheel.actions.fold.src;
				makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
			}
			var dd = board[data.user].info;
			makeCardVisuElt(dd.res, {o:"=", margin:'0.1em'});
			makeCardVisuElt(dd.res, {src:src, taille: '3em', margin:'0.1em'});
		}
		if (data.code=='trick') {
			audioPlay(linearArbo(['global','events','trick']));
			var player = board[data.user].name;
			var src = all.players.items[player].src;
			makeCardVisuElt(div, {src:src, taille: '2.5em'});
			makeCardVisuElt(div, {o:":", margin:'0.5em'});
			var src = all.trick.items[data.trick].src;
			var frame = all.trick['frame-src'];
			makeCardVisuElt(div, {src:src, frame:frame, taille: '2.5em', margin:'0.5em'});
			if (data.pcard) {
				var src = all.organ.items[data.pcard.code].src;
				makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'1em'});
			}
		}
		if (data.code=='finish') {
			var winMess = "le vainqueur est";
			if (data.winners.length>1) winMess = "les vainqueurs sont";
			makeCardVisuElt(div, {o:"Fin de la partie, "+winMess+" :"});
			var first = null;
			data.winners.forEach(function(w){
				if (first) {
					makeCardVisuElt(div, {o:"&", margin:'0.5em'});
				}
				var src = all.players.items[w].src;
				makeCardVisuElt(div, {src:src, taille: '2.5em', margin:'0.5em'});
				makeCardVisuElt(div, {o:w, margin:'0.5em'});
				first = true;
			});
		}
		if (data.code=='message') {
			div.innerHTML = data.message;
		}
		if (callback) callback();
		
		if (param.serverData.data.local.params.infosPopup.value) {
			var d = div.cloneNode(true);
			makeFrontMessage(function(div) {
				div.appendChild(d);
			});
		}
		if (1) {
			var d = div.cloneNode(true);
			getDOM('divLogsContent', function(div) {
				var dd = document.createElement('div');
				div.appendChild(dd);
				var s = document.createElement('div');
					s.setAttribute('class','frontMessageElt');
				dd.appendChild(s);
				s.appendChild(d);
				div.scrollTop = div.scrollHeight;
			});
		}
	}, param.serverData, 'front');
}
async function drawGameScore(data, callback) {
	var winners = [];
	if (param.serverData.boardReady) {
		for (var id in data.score) {
			var deck = param.serverData.board.all[id];
			var div = deck.info;
				clearTimeout(div.timeout);
				div.innerHTML = "Score: "+data.score[id];
			if (id in data.winners) {
				div.style.fontWeight = 'bold';
				div.innerHTML += " (vainqueur)";
				winners.push(deck.name);
				deck.div.style.backgroundColor = "#E3E36D";
				if (id==param.serverData.playerId) audioPlay(linearArbo(['global','events','gameWin']));
			} else {
				if (id==param.serverData.playerId) audioPlay(linearArbo(['global','events','gameLoose']));
			}
			if (id in data.loosers) {
				div.innerHTML = "Il a pas d'organe !";
			}
			deck.score.innerHTML = "&nbsp;<b>("+data.score[id]+")</b>";
		}
	}
	var data = {code:'finish', winners:winners};
	drawFrontMessage(data);
	getDOM("divMyDeckButton", function(div) {
		while (div.firstChild) div.removeChild(div.firstChild);
		// makeBoardButton(div, 'global', 'back', null, function(f, res){
			// res.launch.div = div;
			// res.launch.addEventListener('click',function(){
				
			// });
			// addBoardButtonCaption(res.launch, "Rejouer");
			// callback(res.launch);
		// });
		var ddd = document.createElement('div');
			ddd.setAttribute('class','boardMyDeckElt boardSeparator');
		div.appendChild(ddd);
		makeBoardButton(div, 'global', 'home', null, function(f, res){
			res.launch.div = div;
			res.launch.addEventListener('click',function(){
				gameQuit();
			});
			addBoardButtonCaption(res.launch, "Quitter");
		});
	});
}
	
	
	
