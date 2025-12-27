
function makeBoardAff(callback) {
	var div = document.createElement('div');
		div.id = "divReconnexion";
		div.setAttribute('class','boardAffContainerParent');
	document.body.appendChild(div);
	var div2 = document.createElement('div');
		div2.setAttribute('class','boardAffContainer');
	div.appendChild(div2);
	var div3 = document.createElement('div');
		div3.setAttribute('class','boardAffContainerModifie');
	div2.appendChild(div3);
	callback(div3, div);	
}
function boardAffReconnect() {
	makeBoardAff(function(cont, div) {
		var d = document.createElement('div');
			d.innerHTML = "Connexion perdue";
		cont.appendChild(d);
		var d = document.createElement('div');
		cont.appendChild(d);
			var input = document.createElement('input');
				input.type = 'button';
				input.value = "se reconnecter";
				input.style.margin = '1em';
				input.addEventListener('click',function(){
					loadServer();
				});
			d.appendChild(input);	
	});
		
}
function boardAffParam() {
	makeBoardAff(function(cont, div) {
		var d = document.createElement('div');
			d.innerHTML = "Que veux tu faire ?";
		cont.appendChild(d);
		var d = document.createElement('div');
			d.setAttribute('class','boardAffContainerModifieList');
		cont.appendChild(d);
		var dd = document.createElement('div');
			dd.setAttribute('class','boardAffContainerModifieElt');
		d.appendChild(dd);
			makeBoardButton(dd, 'global', 'back', null, function(f, res){
				res.launch.div = div;
				res.launch.addEventListener('click',function(){
					document.body.removeChild(this.div);
				});
				addBoardButtonCaption(res.launch, "Revenir");
			});
		var dd = document.createElement('div');
			dd.setAttribute('class','boardAffContainerModifieElt');
		d.appendChild(dd);
			var ddd = document.createElement('div');
				ddd.setAttribute('class','boardAffContainerModifieCaption');
				ddd.innerHTML = "Voir les mémos :";
			dd.appendChild(ddd);
			makeBoardButton(dd, 'global', 'rules-surge', null, function(f, res){
				res.launch.img.style.marginLeft = '1em';
				res.launch.addEventListener('click',function(){
					window.open('images/memo.jpg', 'help1');
				});
			});
			makeBoardButton(dd, 'global', 'rules-cave', null, function(f, res){
				res.launch.img.style.marginLeft = '1em';
				res.launch.addEventListener('click',function(){
					window.open('images/memo2.jpg', 'help2');
				});
			});
		var dd = document.createElement('div');
			dd.setAttribute('class','boardAffContainerModifieElt');
		d.appendChild(dd);
			var ddd = document.createElement('div');
				ddd.setAttribute('class','boardAffContainerModifieCaption');
				ddd.innerHTML = "Paramétrer :";
			dd.appendChild(ddd);
			makeBoardButton(dd, 'local', 'sounds', null, function(f, res){
				res.launch.img.style.marginLeft = '1em';
				res.launch.addEventListener('click',function(){
					setTimeout(function(){
						if (param.serverData.data.local.params.sounds.value) audioPlay(linearArbo(['local','params','sounds']));
						else audioStopAll();
					}, 20);
				});
			});
			makeBoardButton(dd, 'local', 'infos', null, function(f, res){
				res.launch.img.style.marginLeft = '1em';
			});
		var dd = document.createElement('div');
			dd.innerHTML = "<hr>";
		d.appendChild(dd);
		var dd = document.createElement('div');
			dd.setAttribute('class','boardAffContainerModifieElt');
		d.appendChild(dd);
			makeBoardButton(dd, 'global', 'home', null, function(f, res){
				res.launch.addEventListener('click',function(){
					if (param.serverData.data.local.params.alertQuit.value) {
						var confirmationMessage = confirm("Voulez-vous vraiment quitter la partie ?");
						if (confirmationMessage) {
							cancelAllRunning();
							gameQuit();	
						}
					} else {
						cancelAllRunning();
						gameQuit();	
					}						
				});
				addBoardButtonCaption(res.launch, "Quitter");
			});
	});
}


function boardConstruction(data, callback) {
	getDOM('divMain', function(divM){
		while (divM.firstChild) divM.removeChild(divM.firstChild);
		
		var div = document.createElement('div');
			div.setAttribute('id','divBoard');
		divM.appendChild(div);
			var divT = document.createElement('div');
				divT.setAttribute('id','divBoardTop');
				divT.setAttribute('class','board');
			div.appendChild(divT);
			var divB = document.createElement('div');
				divB.setAttribute('id','divBoardBottom');
				divB.setAttribute('class','board');
			div.appendChild(divB);
			var dd = document.createElement('div');
				dd.setAttribute('class','margeEnd');
				dd.innerHTML = "&nbsp;";
			div.appendChild(dd);

		var dBeast = document.createElement('div');
			dBeast.setAttribute('id','divBeast');
			dBeast.setAttribute('class','divBeast');
			dBeast.style.display = 'none';
		divM.appendChild(dBeast);
		getParam('data',function(){
			if (param.serverData.data.local.params.splitBoard.value) {
				divT.setAttribute('class','board boardSplit');
				divB.setAttribute('class','board boardSplit');
			}
			if (!param.serverData.data.local.params.dynamicBeast.value) {
				dBeast.setAttribute('class','divBeastNone');
			}
		}, param.serverData, 'board');
		
		
		
		var div = document.createElement('div');
			div.setAttribute('id','divLogs');
		divM.appendChild(div);
		var divI = document.createElement('div');
			divI.setAttribute('id','divLogsImg');
		div.appendChild(divI);
		var img = document.createElement('img');
			img.setAttribute('id','imgLogs');
			img.src = "images/fleche-ouvrir.png";
			img.state = 'closed';
			img.close = "images/fleche-fermer.png";
			img.open = "images/fleche-ouvrir.png";
			img.addEventListener('click', function(){
				if (this.state=='opened') {
					this.state = 'closed';
					this.src = this.open;
					this.div.style.display = 'none';
					this.parentNode.style.width = '';
				} else {
					this.state = 'opened';
					this.src = this.close;
					this.div.style.display = '';
					this.parentNode.style.width = '200px';
				}
			});
		divI.appendChild(img);
		var divC = document.createElement('div');
			divC.setAttribute('id','divLogsContent');
			divC.style.display = 'none';
		div.appendChild(divC);
		img.div = divC;

		boardElements(divT, divB, function(res){
			param.serverData.board = res;
			param.serverData.boardReady = true;
			if (!param.serverData.player) {
				var inputs = divM.getElementsByTagName('input');
				for (let item of inputs){
					item.disabled = true;
				}
			}
			callback(res);
		});
	});
}

async function boardElements(divT, divB, callback) {
	window.addEventListener("beforeunload", loadAlertBeforeQuit, false);
		var df = document.createElement('div');
			df.setAttribute('class','frontMessage');
			df.id = 'divFrontMessage';
			df.style.display = 'none';
			df.addEventListener('click',function(){
				while (this.firstChild) this.removeChild(this.firstChild);
				hideFrontMessage();
			});
		document.body.appendChild(df);
		
		var d = document.createElement('div');
			d.setAttribute('class','boardTop');
			d.innerHTML = "CryptoZooGame";
		divT.appendChild(d);
		var d = document.createElement('div');
			d.setAttribute('class','boardDeck');
			d.style.minHeight = '3em';
			d.addEventListener('resize', function() {
				console.log('ok');
			});
		divT.appendChild(d);
		
			var img = document.createElement('img');
				img.src = param.serverData.data.global.items.hand.src;
				img.setAttribute('class','boardMyDeckImg');
				img.style.float = 'left';
			d.appendChild(img);
			
			var dd = document.createElement('div');
				dd.setAttribute('class','boardMyDeckElt');
				dd.style.float = 'right';
				dd.style.textAlign = 'center';
				dd.style.visibility = 'hidden';
				dd.id = 'divTimer';
				dd.audio = {ind:linearArbo(['global','events','timerUrge']), timer:param.serverData.data.global.events.timerUrge.timer};
			d.appendChild(dd);
				var ddd = document.createElement('div');
				dd.appendChild(ddd);
					var img = document.createElement('img');
						img.src = param.serverData.data.global.items.timer.src;
						img.style.height = '2em';
					ddd.appendChild(img);
				var ddd = document.createElement('div');
					ddd.style.fontSize = '75%';
				dd.appendChild(ddd);
			dd.info = ddd;
			
			
		
			var dd = document.createElement('div');
				dd.style.textAlign = 'center';
				dd.id = "divMyDeckButton";
			d.appendChild(dd);
				var divDice = document.createElement('div');
					divDice.setAttribute('class','boardMyDeckElt');
				dd.appendChild(divDice);
				var ddd = document.createElement('div');
					ddd.setAttribute('class','boardMyDeckElt boardSeparator');
				dd.appendChild(ddd);
				var divWheel = document.createElement('div');
					divWheel.setAttribute('class','boardMyDeckElt');
				dd.appendChild(divWheel);	
				
			
			var dd = document.createElement('div');
				dd.id = 'divMyHand';
			d.appendChild(dd);
			
			
			var divActDice = document.createElement('div');
			d.appendChild(divActDice);	
			var divActWheel = document.createElement('div');
			d.appendChild(divActWheel);
			var divSolveWheel = document.createElement('div');
			d.appendChild(divSolveWheel);
			var divTrick = document.createElement('div');
			d.appendChild(divTrick);
			var divDiscard = document.createElement('div');
			d.appendChild(divDiscard);


		var divDeckMe = document.createElement('div');
			divDeckMe.setAttribute('class','boardAllDeck');
		divT.appendChild(divDeckMe);
		var divDeckAll = document.createElement('div');
			divDeckAll.setAttribute('class','boardAllDeck');
		divB.appendChild(divDeckAll);

		
		var divDeckEnd = document.createElement('div');
			divDeckEnd.setAttribute('class','boardAllDeck');
		divB.appendChild(divDeckEnd);
			
			
	var as = {};
		as['stock'] = function(callback){
			makeBoardStock(divT, callback);
		};
		as['info'] = function(callback){
			makeBoardInfo(divT, callback);
		};
		as['dice'] = function(callback){
			makeBoardButton(divDice, 'dice', 'take', divActDice, callback);
		};
		as['wheel'] = function(callback){
			makeBoardButton(divWheel, 'wheel', 'take', divActWheel, callback);
		};
		as['all'] = function(callback){
			makeBoardAllDeck(divDeckMe, divDeckAll, callback);
		};
		as['end'] = function(callback){
			makeBoardEnd(divDeckEnd, callback);
		};
		as['beast'] = function(callback){
			makeBoardBeast(callback);
		};
		if (param.cheatMode) {
			as['see'] = ['end',function(result, callback){
				var dsee = document.createElement('div');
				divDeckEnd.insertBefore(dsee, divDeckEnd.firstChild)
				var divSee = document.createElement('div');
					divSee.style.display = 'inline-block';
					divSee.style.float = 'right';
				result.end.appendChild(divSee);
				makeBoardButton(divSee, 'cheat', 'take', dsee, callback, {taille:'1em'});
			}];
		}
	async.auto(as, function (err, res) {
		activeBoardButton(res.dice.launch, false);
		activeBoardButton(res.wheel.launch, false);
		res.solve = divSolveWheel;
		res.trick = divTrick;
		res.discard = divDiscard;
		callback(res);
	});
	
}
async function makeBoardAction(div, p, callback) {
	var object = null;
	var possible = [];
	var all = param.serverData.data;
	var lit = "";
	if (p.code) {
		object = all[p.code];
		possible = [p.code];
		lit = object.litteral;
	}
	if (p.possible) {
		possible = p.possible;
	}
	var d = document.createElement('div');
		d.style.display = 'inline-block';
		d.style.marginTop = '0.5em';
		d.clicked = false;
	div.appendChild(d);
		var memoOrigin = null;
		var input = document.createElement('input');
			input.type = 'button';
			input.style.display = 'none';
		d.appendChild(input);
		possible.forEach(function(o){
			
			if (o.origin && o.origin!=memoOrigin) {
				var m = (memoOrigin?'1em':null);
				memoOrigin = o.origin;
				var code = o.origin;
				var src = null;
				if (code in all.global.items) src = all.global.items[code].src;
				if (o.originType in all) {
					var item = all[o.originType].items[o.origin];
					if (!item) item = all[o.originType].ids[o.origin];
					if (item) {
						src = item.src;
						if (item.name) code = item.name;
					}
				}
				item = makeCardVisuElt(d, {o:code, src:src, taille:'2em', margin:m});
				item.style.verticalAlign = 'bottom';
			}
			
			
			var l = lit;
			if (p.self) var code = o.code;
			else var code = o;	
			if (p.possible) l = code;
			var obj = object;
			if (obj && p.possible) obj = object.items[code];
			var src = (obj && obj.src)?obj.src:null;
			if (!src) console.log(possible, p.code);
			var frame  = p.frame;
			if (p.frames) {
				frame = object.frames['frame-'+object.items[code][p.frames]].src
			}
			if (p.self) {
				frame = object.frames[o[p.self]].src;
			}
			var id = null;
			if (obj && p.getId) {
				id = obj[p.getId];
			}
			var item = makeCardActionElt(d, {input:input, src:src, o:o, lit:l, frame:frame, id:id});
			if (id && id==param.serverData.playerId) d.insertBefore(item, d.firstChild);
			
		});
	callback(null,{launch:input});
}

async function makeBoardStock(div, callback) {
	var d = document.createElement('div');
		d.setAttribute('class','boardInfo boardInfoStock');
		d.addEventListener('click',function(){
			this.view.style.display = (window.getComputedStyle(this.view).display=='none'?'inline-block':'none');
			this.hide.style.display = (window.getComputedStyle(this.hide).display=='none'?'inline-block':'none');
		});
	div.appendChild(d);
		var inp = document.createElement('div');
			inp.setAttribute('class','boardInfoStockHide');
		d.appendChild(inp);
		d.hide = inp;
			var img = document.createElement('img');
				img.src = param.serverData.data.beast.src;
				img.setAttribute('class','boardInfoStockCard');
			inp.appendChild(img);
		var inp = document.createElement('div');
			inp.setAttribute('class','boardInfoStockView');
		d.appendChild(inp);
		d.view = inp;
	callback(null,{result:inp});
}
async function makeBoardInfo(div, callback) {
	var d = document.createElement('div');
		d.setAttribute('class','boardInfo boardInfoUser');
		d.addEventListener('click',function(){
			boardAffParam();
		});
	div.appendChild(d);
		var src = (param.serverData.info.userAvatarSrc?param.serverData.info.userAvatarSrc:param.serverData.data.beast.src);
		var frame = param.serverData.data.beast['frame-src'];
			var img = document.createElement('img');
				img.src = frame;
				img.style.zIndex = 2;
				img.setAttribute('class','boardInfoUserAvatar');
				img.style.position = 'absolute';
				img.style.top = '-0.2em';
				img.style.left = '0.4em';
			d.appendChild(img);
			var img = document.createElement('img');
				img.src = src;
				img.id = 'imgUserAvatar';
				img.style.zIndex = 1;
				img.setAttribute('class','boardInfoUserAvatar');
				img.style.position = 'absolute';
			d.appendChild(img);
		var img = document.createElement('img');
			img.src = src;
			img.setAttribute('class','boardInfoUserAvatar');
			img.style.opacity = 0;
		d.appendChild(img);
	callback(null,{result:d});
}


async function makeBoardButton(caller, code, action, result, callback, p) {	
	var take = param.serverData.data[code].actions[action];
	if (take.param) take.params = param.serverData.data[code].params[take.param];
	var barre = param.serverData.data.global.items.barre;
	var input = document.createElement('input');
		input.type = 'button';
		input.value = take.description;
		input.addEventListener('click',function(){
			var bd = null;
			if (action=='take' && param.serverData.board) bd = param.serverData.board[code];
			if (!bd || bd.result.code!=code) {
				audioPlay(linearArbo([code,'actions',action]));
			}
		});
	caller.appendChild(input);
	if (take.src && take.src!="") {
		var div = document.createElement('div');
			div.setAttribute('class','imgTakeObject');
			div.input = input;
			div.title = take.description;
			div.addEventListener('click',function(){
				this.input.click();
				if (take.param) {
					take.params.value = !take.params.value;
					if (code=='local') setLocalParam(take.param, take.params.value);
					this.toggle.style.display = (take.params.value?'none':'');
				}
			});
			if (p && p.taille) div.style.height = p.taille;
		caller.appendChild(div);
		input.img = div;
		input.style.display = 'none';
			var img = document.createElement('img');
				img.src = take.src;
				img.style.verticalAlign = 'middle';
				img.style.position = 'relative';
				img.style.height = '100%';
			div.appendChild(img);
			div.img = img;
			if (take.param) {
				var imgT = document.createElement('img');
					imgT.src = barre.src;
					imgT.style.position = 'absolute';
					imgT.style.left = '0.1em';
					imgT.style.top = '0.1em';
					imgT.style.height = '100%';
					if (take.params.value) imgT.style.display = 'none';
				div.appendChild(imgT);
				div.toggle = imgT;
			}
		if (p && p.span) {
			var s = document.createElement('div');
				s.style.margin = '0.5em';
				s.style.display = 'inline-block';
				s.style.verticalAlign = 'middle';
				s.style.color = '#000000';
				s.innerHTML = p.span;
			div.appendChild(s);
		}
	}
	callback(null,{launch:input, result:result});
}
function activeBoardButton(elt, active) {
	if (active) {
		elt.img.setAttribute('class','imgTakeObject');
		elt.disabled = false;
	} else {
		elt.img.setAttribute('class','imgTakeObjectDisabled');
		elt.disabled = true;
	}
}
function addBoardButtonCaption(butt, caption, p) {	
	butt.img.style.verticalAlign = 'middle';
	var s = document.createElement('div');
		s.style.margin = '0.5em';
		s.style.display = 'inline-block';
		s.style.verticalAlign = 'middle';
		s.innerHTML = caption;
		if (p && p.size) s.style.fontSize = p.size;
	butt.img.parentNode.appendChild(s);
}



// construction de tous les decks visibles
async function makeBoardAllDeck(divT, divB, callback) {
	var decks = {};
	getParam('data',function(p){
		var all = param.serverData.data;
		for (var player in all.players.items) {
			var p = param.serverData.data.players.items[player];
			var div = document.createElement('div');
				div.setAttribute('class','boardDeck');
			if (p.id==param.serverData.playerId) divT.appendChild(div);
			else divB.appendChild(div);
				decks[p.id] = {};
				decks[p.id].div = div;
				decks[p.id].name = player;
				//bandeau haut
				var d = document.createElement('div');
				div.appendChild(d);
					if (p.team) {
						var s = document.createElement('div');
							s.style.height = '0.8em';
							s.style.width = '0.8em';
							s.style.display = 'inline-block';
							// s.style.height = '0.2em';
							s.style.verticalAlign = 'top';
							s.style.backgroundColor =  param.serverData.data.teams[p.team].color;
							s.style.borderRadius = '0.4em';
						d.appendChild(s);
					}
					var s = document.createElement('img');
						s.src = param.serverData.data.beast['bot-src'];
						s.style.height = '0.8em';
						s.style.verticalAlign = 'top';
					d.appendChild(s);
					if (!p.bot) s.style.display = 'none';
					decks[p.id].imgBot = s;

					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt');
						s.innerHTML = player;
						s.style.maxWidth = '80%';
						s.style.whiteSpace = 'nowrap';
						s.style.textOverflow = 'ellipsis'; 
					d.appendChild(s);
					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt');
					d.appendChild(s);
					decks[p.id].score = s;

					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt');
						s.style.float = 'right';
					d.appendChild(s);
						var dd = document.createElement('div');
						s.appendChild(dd);
						decks[p.id].icon = {};	
							var img = document.createElement('img');
								img.src = all.dice.src;
								img.srcDef = all.dice.src;
								img.srcOn = all.dice.items.dose.src;
								img.setAttribute('class','boardAllDeckIcon');
								img.style.opacity = '0';
							dd.appendChild(img);
							decks[p.id].icon.dice = img;
							var img = document.createElement('img');
								img.src = all.wheel.src;
								img.srcDef = all.wheel.src;
								img.srcSurge = all.wheel.actions.surge.src;
								img.srcFold = all.wheel.actions.fold.src;
								img.setAttribute('class','boardAllDeckIcon');
								img.style.opacity = '0';
							dd.appendChild(img);
							decks[p.id].icon.wheel = img;
							var ss = document.createElement('div');
								ss.setAttribute('class','boardAllDeckIcon boardAllDeckIconText');
								ss.innerHTML = "";
							dd.appendChild(ss);
							decks[p.id].icon.order = ss;
					
						var dd = document.createElement('div');
						s.appendChild(dd);
						decks[p.id].publi = dd;
					
					
				//bandeau bas
				var d = document.createElement('div');
				div.appendChild(d);	
					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt');
					d.appendChild(s);
						var img = document.createElement('img');
							img.src = p.src;
							img.target = p.id;
							img.setAttribute('class','boardAllDeckImg');
							img.addEventListener('click', function(){
								var div = document.getElementById('divBeast');
								if (div) {
									div.target = this.target;
									div.style.display = '';
								}
								majDynamicBeast();
							});
							img.style.cursor = 'pointer';
						s.appendChild(img);
						decks[p.id].avatar = img;
						var img = document.createElement('img');
							img.src = param.serverData.data.global.items.beast.src;
							img.setAttribute('class','boardAllDeckImg');
						s.appendChild(img);

					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt');
					d.appendChild(s);
					decks[p.id].beast = s;

					var s = document.createElement('div');
						s.setAttribute('class','boardDeckElt boardInfosBeast');
					d.appendChild(s);
					decks[p.id].info = s;

		}
		callback(null,decks);
	}, param.serverData, 'all');
}
async function makeBoardEnd(caller, callback) {
	var div = document.createElement('div');
		div.id = 'divBoardEnd';
		div.setAttribute('class','boardDeck boardEnd');
	caller.appendChild(div);
		
		var img = document.createElement('img');
			img.style.float = 'right';
			img.style.height = '1em';
			img.src = 'images/info.png';
		div.appendChild(img);
		
		var imgHelp = document.createElement('img');
			imgHelp.style.height = '1.5em';
			imgHelp.style.cursor = 'pointer';
			imgHelp.src = 'images/logo_brenat_interrogation.png';
		div.appendChild(imgHelp);
		var d = document.createElement('div');
			d.style.display = 'inline-block';
			d.style.marginLeft = '0.5em';
			d.style.whiteSpace = 'nowrap';
			d.style.textOverflow = 'ellipsis'; 
			d.style.overflow = 'hidden';
			d.style.maxWidth = '90%';
		div.appendChild(d);
		div.spectator = d;
		
		var d = document.createElement('div');
			d.style.display = 'none';
			d.innerHTML = "<hr>";
		div.appendChild(d);
			var dd = document.createElement('div');
				dd.id = 'divBotAvailable';
				dd.style.marginLeft = '0.5em';
			d.appendChild(dd);
		imgHelp.target = d;
		imgHelp.addEventListener('click',function(){
			if (this.target.style.display=='none') {
				this.target.style.display = '';
				askForBot();
			} else {
				this.target.style.display = 'none';
			}
		});
		
		
		var d = document.createElement('div');
			d.style.display = 'none';
			d.innerHTML = "<hr>";
		div.appendChild(d);
		getDOM('divInfoServer', function(div){
			d.appendChild(div);
			div.style.position = 'relative';
			div.style.display = 'inline-block';
		});
		img.target = d;
		img.addEventListener('click',function(){
			if (this.target.style.display=='none') {
				this.target.style.display = '';
			} else {
				this.target.style.display = 'none';
			}
		});
	callback(null, div);
}
function makeBoardBeast(callback) {
	getParam('data',function(p){
		getDOM('divBeast', function(div){
			var all = param.serverData.data;
			var img = document.createElement('img');
				img.setAttribute('class', 'imgBeastSpace');
				img.src = all.beast.dynamic.background.src;
			div.appendChild(img);
			var img = document.createElement('img');
				img.setAttribute('class', 'imgBeast');
				img.src = all.beast.dynamic.background.src;
				img.style.zIndex = all.beast.dynamic.background.zIndex;
			div.appendChild(img);
			div.target = param.serverData.playerId;
			div.organ = {};
			for (var o in all.organ.items) {
				var img = document.createElement('img');
					img.setAttribute('class', 'imgBeast');
					img.id = 'dynamicBeast_'+o;
					img.style.zIndex = all.beast.dynamic[o].zIndex;
					img.style.display = 'none';
				div.appendChild(img);
				div.organ[o] = img;
			}
			var dd = document.createElement('div');
				dd.setAttribute('class', 'nameBeastBloc');
			div.appendChild(dd);
			var dp = document.createElement('div');
				dp.setAttribute('class', 'nameBeastBlocElt');
			dd.appendChild(dp);
				var p = param.serverData.data.players.ids[param.serverData.playerId];
				var s = document.createElement('img');
					if (p) s.src = p.src;
					s.setAttribute('class','nameBeastImg');
				dp.appendChild(s);	
				div.img = s;
				var s = document.createElement('div');
					if (p) s.innerHTML = p.name;
					s.setAttribute('class','nameBeastText');
				dp.appendChild(s);
				div.name = s;
				var s = document.createElement('img');
					s.src = "images/close.png";
					s.setAttribute('class','nameBeastClose');
					s.div = div;
					s.addEventListener('click', function(){
						this.div.style.display = 'none';
					});
				dp.appendChild(s);
			callback(null);
		});
	}, param.serverData, 'beast');
}


function boardSwitchPlayer(data) {
	if (data.user==param.user) param.serverData.playerId = data.id;
	getParam('board',function(p){
		var decks = param.serverData.board.all;
		var deck = decks[data.id];
		deck.imgBot.style.display = (data.bot?'':'none');
	}, param.serverData, 'switch');
}

//mises a jour
function majMyDeck(data) {
	if (param.serverData.boardReady) {
		getDOM('divMyHand', function(div){
			var margin = '1em';
			while (div.firstChild) div.removeChild(div.firstChild);
			var all = param.serverData.data;
			var memoHand = param.serverData.memo.hand;
			var appear = param.serverData.memo.appear;
			var hand = data.deck.hand;
			var d = document.createElement('div');
				d.innerHTML = "&nbsp;";
				d.setAttribute('class','boardMarginDesktop');
			div.appendChild(d);
			var item = null;
			if (hand.dose) {
				var l = all.dose.litteral;
				var src = all.dose.src;
				var frame = all.dose['frame-src'];
				var decM = '-1.5em';
				if (hand.dose>2) decM = '-1.8em';
				if (hand.dose>3) decM = '-2em';
				if (hand.dose>5) decM = '-2.2em';
				if (hand.dose>8) decM = '-2.3em';
				if (hand.dose>15) decM = '-2.4em';
				for (var i=0; i<hand.dose; i++) {
					var m = (i>0?decM:null);
					var diff = ((memoHand.dose && i<memoHand.dose)?null:true);
					item = makeCardVisuElt(div, {src:src, frame:frame, o:l, lit:l, taille:'2.5em', margin:m, diff:diff, inc:i});
					if (diff) appear.push(item);
				}
				item = makeCardVisuElt(div, {o:""});
				var min = Math.min(memoHand.dose,hand.dose);
				if (min>1) item.innerHTML = "x"+min;
				memoHand.info = item;
			}
			if (hand.organ) {
				var i = 0;
				hand.organ.forEach(function(o){
					var m = (i>0?null:margin);
					var l = all.organ.litteral+": "+o.code+" ("+o.effect+")";
					var frame = all.organ.frames[o.effect].src;
					var src = all.organ.items[o.code].src;
					var diff = ((memoHand.organ && i<memoHand.organ.length)?null:true);
					item = makeCardVisuElt(div, {src:src, o:o.code, lit:l, frame:frame, taille:'3em', margin:m, diff:diff});
					if (diff) appear.push(item);
					i++;
				});
			}
			if (hand.trick) {
				var i = 0;
				hand.trick.forEach(function(o){
					var m = (i>0?null:margin);
					var l = all.trick.litteral+": "+o.code;
					l += "\n"+ all.trick.items[o.code].description;
					var frame = all.trick['frame-src'];
					var src = all.trick.items[o.code].src;
					var diff = ((memoHand.trick && i<memoHand.trick.length)?null:true);
					item = makeCardVisuElt(div, {src:src, o:o.code, lit:l, frame:frame, taille:'3em', margin:m, diff:diff});
					if (diff) appear.push(item);
					i++;
				});
				if (hand.trick.length>0) {
					var frame = all.trick['frame-src'];
					var src = all.trick.src;
					var lit = "Jouer une carte Magouille";
					var d = document.createElement('div');
						d.style.position = 'absolute';
						d.style.right = '0';
						d.style.bottom = '0';
					div.appendChild(d);
					item = makeCardActionElt(d, {src:src, o:'trick', lit:lit, frame:frame, taille:'2em'});
					item.style.display = 'none';
					item.id = 'imgPlayTrick';
					playAffTrickButton();
				}
			}
			param.serverData.memo.wait = hand;
		});
	}
}
function affBoardStock(data) {
	if (param.serverData.boardReady) {
		var div = param.serverData.board.stock.result;
		if (data) {
			while (div.firstChild) div.removeChild(div.firstChild);
			data.stock.forEach(function(s){
				var d = document.createElement('div');
					d.style.display = 'inline-block';
					d.style.verticalAlign = 'middle';
					d.style.textAlign = 'center';
					d.style.fontSize = '80%';
				div.appendChild(d);
				var dd = document.createElement('div');
				d.appendChild(dd);
				var object = param.serverData.data[s.code];
				var lit = object.litteral;
				if (s.item) {
					object = object.items[s.item];
					lit = object.description;
					if (!lit || lit=="") lit = s.item;
				}
				var src = object.src;
				if (src && src!="") {
					var item = makeCardVisuElt(dd, {src:src, o:s.item, lit:lit, frame:s.frame, classe:'imgStock'});
					if (s.val===0) item.style.opacity = '0.4';
				} else {
					console.log(s, object);
					dd.innerHTML = lit;
				}
				var dd = document.createElement('div');
					dd.innerHTML = s.val;
					dd.style.marginTop = '-0.5em';
				d.appendChild(dd);
				
			});
		}
	}
}
function majAllDeck(data) {
	if (param.serverData.boardReady) {
		var all = param.serverData.data;
		var decks = param.serverData.board.all;
		for (var id in data.publi) {
			if (decks[id]) {
				var div = decks[id].publi;
				while (div.firstChild) div.removeChild(div.firstChild);
				for (var code in data.publi[id]) {
					var l = all[code].litteral;
					var src = all[code].src;
					var frame = all[code]['frame-src'];
					var dc = document.createElement('div');
						dc.style.display = 'inline-block';
					div.appendChild(dc);
					var d = document.createElement('div');
						d.style.textAlign = 'center';
					dc.appendChild(d);
						makeCardVisuElt(d, {src:src, o:l, lit:l, frame:frame, taille:'1.8em'});
					var d = document.createElement('div');
						d.style.textAlign = 'center';
						d.style.fontSize = '90%';
						d.innerHTML = data.publi[id][code]
					dc.appendChild(d);	
				}
				var div = decks[id].beast;

				decks[id].organs = data.beast[id];
				var stealth = false;
				data.tags[id].forEach(function(tag) {
					if (tag.code=='stealth') stealth = true;
				});
				if (stealth && id!=param.serverData.playerId) decks[id].organs = {stealth:1};
				while (div.firstChild) div.removeChild(div.firstChild);
				for (var o in all.organ.items) {
					var tag = null;
					var l = o;
					var src = all.organ.items[o].src;
					var frame = all.organ.frames['neutral'].src;
					var op = '0.3';
					
					if (!stealth || id==param.serverData.playerId) {
						if (data.beast[id][o]) {
							var card = data.beast[id][o];
							l += card.effect;
							src = all.organ.items[card.code].src;
							frame = all.organ.frames[card.effect].src;
							op = false;
							if (card.tag) tag = all.organ.tags[card.tag.code].src;
						} 
					} else {
						op = 0.5;
					}
					if (stealth && !tag) tag = all.organ.tags.stealth.src;
					makeCardVisuElt(div, {src:src, o:l, lit:l, frame:frame, taille:'3em', opacity:op, tag:tag});
				}
			}
		}
		majDynamicBeast();
	}
}
function majDynamicBeast() {
	getDOM('divBeast', function(div){
		var all = param.serverData.data;
		var deck = param.serverData.board.all[divBeast.target];
		for (var o in all.organ.items) {
			if (deck.organs[o]) {
				divBeast.organ[o].style.display = '';
				divBeast.organ[o].src = all.beast.dynamic[o][deck.organs[o].effect].src;
			} else {
				divBeast.organ[o].style.display = 'none';
				divBeast.organ[o].src = '';
			}
		}
		var p = all.players.ids[divBeast.target];
		div.img.src = p.src;
		div.name.innerHTML = p.name;
	});
}


function boardBotAvailable(data) {
	getDOM('divBotAvailable', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);
		var d = document.createElement('div');
			d.style.display = 'inline-block';
		div.appendChild(d);
		if (data.forbidden) {
			d.innerHTML = "Cete partie n'autorise pas le remplacement d'un robot";
		} else {
			var s = (data.nbBots>1?"s":"");
			d.innerHTML = "Il y a "+data.nbBots+" robot"+s+" disponible"+s;
			if (param.serverData.player) {
				d.innerHTML += "... et tu es déjà joueur !";
			} else {
				if (data.nbBots>0) {
					var input = document.createElement('input');
						input.type = 'button';
						input.value = "Prendre la place d'un robot";
						input.style.marginLeft = '1em';
						input.addEventListener('click', function(){
							getBot();
						});
					div.appendChild(input);
				}
			}
		}
	});
}





// debugguage
async function makeBoardSeeDeck(caller, result, callback) {

	var input = document.createElement('input');
		input.type = 'button';
		input.value = 'Voir les pioches';
	caller.appendChild(input);
	var inputOff = document.createElement('input');
		inputOff.type = 'button';
		inputOff.value = 'Masquer les pioches';
		inputOff.style.display = 'none';
	caller.appendChild(inputOff);
	input.next = inputOff;
	inputOff.next = input;
	input.addEventListener('click',function(){
		this.style.display = 'none';
		this.next.style.display = '';
	});
	inputOff.addEventListener('click',function(){
		this.style.display = 'none';
		this.next.style.display = '';
	});
	callback(null,{launch:input, hide:inputOff, result:result});
}
function affGetSeeDeck(data) {
	if (param.cheatMode) {
		var div = param.serverData.board.see.result;
		while (div.firstChild) div.removeChild(div.firstChild);
		if (data.stock) {
			
			var all = param.serverData.data;
			
			//dice
			for (var org in all.dice.items) {
				var d = document.createElement('div');
				div.appendChild(d);
				var l = all.dice.litteral+" "+all[org].litteral+" ("+all.dice.items[org].nb+")";
				var src = all.dice.items[org].src;
				makeCardVisuElt(d, {src:src, o:org, lit:l, taille:'2em'});
				makeCardVisuElt(d, {o:": "});
				data.possible[org].forEach(function(o){
					var l = "";
					var src = all[org].items[o]['dice-src'];
					makeCardVisuElt(d, {src:src, o:o.code, lit:l, taille:'2em'});
				});
			}
			// dose stock
			var d = document.createElement('div');
			div.appendChild(d);
			var l = all.dose.litteral;
			var src = all.dose.src;
			var frame = all.dose['frame-src'];
			makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
			makeCardVisuElt(d, {o:": "});
			makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
			makeCardVisuElt(d, {o:"x"+data.stock.dose});
			
			
			// organ stock
			for (var org in data.stock.organ) {
				var d = document.createElement('div');
				div.appendChild(d);
				var l = all.organ.litteral+": "+org;
				var src = all.organ.items[org].src;
				var frame = all.organ.frames.neutral.src;
				makeCardVisuElt(d, {src:src, o:org, lit:l, frame:frame, taille:'2em'});
				makeCardVisuElt(d, {o:": "});
				data.stock.organ[org].forEach(function(o){
					var l = all.organ.litteral+": "+o.code+" ("+o.effect+")";
					var frame = all.organ.frames[o.effect].src;
					var src = all.organ.items[o.code].src;
					makeCardVisuElt(d, {src:src, o:o.code, lit:l, frame:frame, taille:'2em'});
				});
			}
			// garbage stock 
			var d = document.createElement('div');
			div.appendChild(d);
			var l = all.global.items.garbage.description;
			var src = all.global.items.garbage.src;
			var frame = all.organ.frames.neutral.src;
			makeCardVisuElt(d, {src:src, o:org, lit:l, frame:frame, taille:'2em'});
			makeCardVisuElt(d, {o:": "});
			data.stock.garbage.forEach(function(o){
				var l = all.organ.litteral+": "+o.code+" ("+o.effect+")";
				var frame = all.organ.frames[o.effect].src;
				var src = all.organ.items[o.code].src;
				makeCardVisuElt(d, {src:src, o:o, lit:l, frame:frame, taille:'2em'});
			});
			// trick stock
			var d = document.createElement('div');
			div.appendChild(d);
			var l = all.trick.litteral;
			var src = all.trick.src;
			var frame = all.trick['frame-src'];
			makeCardVisuElt(d, {src:src, o:org, lit:l, frame:frame, taille:'2em'});
			makeCardVisuElt(d, {o:": "});
			data.stock.trick.forEach(function(o){
				var l = all.trick.litteral+": "+o.code;
				var frame = all.trick['frame-src'];
				var src = all.trick.items[o.code].src;
				makeCardVisuElt(d, {src:src, o:o.code, lit:l, frame:frame, taille:'2em'});
			});
			
			// players
			var board = param.serverData.board.all;
			for (var id in data.deck) {
				var hand = data.deck[id].hand;
				var d = document.createElement('div');
				div.appendChild(d);
				var player = board[id].name;
				var src = all.players.items[player].src;
				makeCardVisuElt(d, {src:src, taille: '2em'});
				makeCardVisuElt(d, {o:": "});
				if (hand.dose) {
					var l = all.dose.litteral;
					var src = all.dose.src;
					var frame = all.dose['frame-src'];
					makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
					makeCardVisuElt(d, {o:"x"+hand.dose});
				}
				if (hand.organ) {
					hand.organ.forEach(function(o){
						var l = o.code+':'+o.effect;
						var src = all.organ.items[o.code].src;
						var frame = all.organ.frames[o.effect].src;
						makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
					});
				}
				if (hand.trick) {
					hand.trick.forEach(function(o){
						var l = o.code;
						var src = all.trick.items[o.code].src;
						var frame = all.trick['frame-src'];
						makeCardVisuElt(d, {src:src, frame:frame, o:l, lit:l, taille:'2em'});
					});
				}
			}
		}
	}
}


	
