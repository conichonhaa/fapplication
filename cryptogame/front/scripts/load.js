function initialisePage() {
	handlePage();		
	try {
		initConnexion();
	} catch(e) {
		span.innerHTML = 'Standalone';
	}
}
function initConnexion() {
	getRequest("back-php/index.php", function(doc){
		var span = document.getElementById('spanExecution');
		if (doc) {
			param.moteur = getEltNodeValue(doc,'moteur');
			if (span) span.innerHTML = param.moteur;
			param.wsPort = getEltNodeValue(doc,'wsPort');
			param.wsServer = getEltNodeValue(doc,'wsServer');
			param.userName = getEltNodeValue(doc,'username');
			param.user = getEltNodeValue(doc,'user');
			param.actions = {};
			var actions = doc.getElementsByTagName('actions');
			for (var a=0; a<actions.length; a++) {
				param.actions[actions[a].getAttribute('name')] = actions[a].firstChild.nodeValue;
			}
			getData();
		} else {
			if (span) span.innerHTML = "Standalone";
		}
	});
}
function getData() {
	getRequest(param.actions['getData']+"?test=toto&test2=tata", function(doc){
		if (doc) {
			param.serverData.xmlDoc = doc;
			recupLocal();
		}
	});
}
function handlePage() {
	document.body.innerHTML = "";
	window.removeEventListener("beforeunload", loadAlertBeforeQuit);
	
	var divM = document.createElement('div');
		divM.setAttribute('id','divMain');
	document.body.appendChild(divM);
	
	
	// titre
	var div = document.createElement('div');
		div.setAttribute('id','divTitle');
	divM.appendChild(div);
		var d = document.createElement('div');
			d.style.fontFamily = 'Chopin';
			d.style.display = 'inline-Block';
			d.innerHTML = "Bienvenue au ";
		div.appendChild(d);
		var d = document.createElement('div');
			d.style.fontFamily = 'shlop';
			d.style.display = 'inline-Block';
			d.innerHTML = "&nbsp;&nbsp;CryptoZooShow&nbsp;&nbsp;";
		div.appendChild(d);
		var d = document.createElement('div');
			d.style.fontFamily = 'Chopin';
			d.style.display = 'inline-Block';
			d.innerHTML = " ... le jeu !";
		div.appendChild(d);
	// session
	var div = document.createElement('div');
		div.id = 'divSession';
	divM.appendChild(div);
		var d = document.createElement('div');
			d.style.textAlign = 'center';
			d.style.margin = '2em';
			d.innerHTML = "<img src='images/roue.gif' style='height:3em;' />";
		div.appendChild(d);
	
	// infos server
	var div = document.createElement('div');
		div.setAttribute('id','divInfoServer');
	document.body.appendChild(div);
		var d = document.createElement('div');
			d.innerHTML = "Moteur exécution : ";
		div.appendChild(d);
			var span = document.createElement('span');
				span.setAttribute('id','spanExecution');
				span.innerHTML = (param.moteur?param.moteur:"<img src='images/roue.gif' style='height:0.8em;' />");
			d.appendChild(span);
		var d = document.createElement('div');
			d.innerHTML = "Etat webSocket : ";
		div.appendChild(d);
			var span = document.createElement('span');
				span.setAttribute('id','spanWebSocket');
				span.innerHTML = (param.wsState?param.wsState:"<img src='images/roue.gif' style='height:0.8em;vertical-align:middle;' />");
			d.appendChild(span);
}
function handleSession() {
	getDOM('divSession', function(div){			
		while (div.firstChild) div.removeChild(div.firstChild);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionMenu';
		div.appendChild(d);
			var dd = document.createElement('div');	
				dd.setAttribute('class', 'divSession loadComment blocContainer');
				dd.style.display = 'none';
			div.appendChild(dd);
			d.content = dd;
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionLaunch';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionMe';
		div.appendChild(d);
			var dd = document.createElement('div');	
			d.appendChild(dd);
				var img = document.createElement('img');
					img.style.height = '6em';
					img.id = "imgUserAvatar";
					img.style.display = 'none';
				dd.appendChild(img);
			var dd = document.createElement('div');	
			d.appendChild(dd);
				var input = document.createElement('input');
					input.value = "";
					input.style.textAlign = 'center';
					input.id = "inputUserName";
					input.style.display = 'none';
				dd.appendChild(input);	
				var spanU = document.createElement('span');
					spanU.id = "spanUserName";
					spanU.style.cursor = 'pointer';
					spanU.addEventListener('click',function(){
						this.style.display = 'none';
						this.input.style.display = '';
						this.input.select();
					});
				dd.appendChild(spanU);
				input.span = spanU;
				spanU.input = input;
			var dd = document.createElement('div');	
				dd.setAttribute('class', 'loadComment loadAlert');
				dd.style.display = 'none';
				dd.innerHTML = "Si tu écris un nom trop long on risque de ne pas le voir en entier... mais c'est ton choix !";
			d.appendChild(dd);
				input.dumb = dd;
			var dd = document.createElement('div');	
			d.appendChild(dd);
				var span = document.createElement('span');
					span.setAttribute('class', 'loadComment');
					span.style.marginTop = '0.5em';
					span.target = spanU;
					span.style.cursor = 'pointer';
					span.addEventListener('click',function(){
						this.target.click();
					});
				dd.appendChild(span);
				spanU.span = span;
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionJoin';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionNew';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionAvatar';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionUsers';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession');
			d.id = 'divSessionTeam';
		div.appendChild(d);
		var d = document.createElement('div');	
			d.setAttribute('class', 'divSession margeEnd');
			d.innerHTML = "&nbsp;";
		div.appendChild(d);
	});
}

async function loadUser(data, callback) {
	if (data.user) {
		handlePage();
		handleSession();
		param.user = data.user;
		var fd = new FormData();
			fd.append('user', data.user);
		postRequest(param.actions['setData'], fd);
		getParam('data', function() {
			param.serverData.user = data.user;
			param.serverData.info.userName = data.username;
		}, param.serverData, 'user');
	}
	getDOM('spanUserName', function(span){
		span.innerHTML = data.username;
		span.span.innerHTML = "(clique sur ton nom pour modifier)";
		span.input.value = data.username;
	});
	getParam('data', function() {
		param.serverData.info.userName = data.username;
	}, param.serverData, 'userMaj');
}
function recupUserName() {
	var fd = new FormData();
		fd.append('username',param.userName);
	postRequest(param.actions['setData'], fd);
}
async function loadInit(data, callbackG) {
	getParam('async', function() {
		var as = {};
			as['user'] = function(callback){
				getDOM('inputUserName', function(input){
					input.value = data.name;
					input.addEventListener('change',function(){
						var fd = new FormData();
							fd.append('username',this.value);
						postRequest(param.actions['setData'], fd);
						this.blur();
					});
					input.addEventListener('blur',function(){
						this.style.display = 'none';
						this.span.style.display = '';
					});
					input.addEventListener('input',function(){
						if (this.value.length>30) this.dumb.style.display = '';
						else this.dumb.style.display = 'none';
					});
					callback(null,input);
				});
			};
			as['new'] = function(callback){
				getDOM('divSessionNew', function(div){
					getParam('data', function(p){
						while (div.firstChild) div.removeChild(div.firstChild);
						var d = document.createElement('div');
							d.innerHTML = "Créer une nouvelle partie : ";
						div.appendChild(d);
						
						makeBoardButton(div, 'global', 'init', null, function(f, res){
							callback(null, res.launch);
						}, {taille:'3.5em'});
					}, param.serverData, 'init');
				});
			};
		async.auto(as, function (err, res) {
			callbackG(res);
		});
	});
	getDOM('divSessionMenu', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);	
	});
	getParam('data', function() {
		getDOM('divSessionMenu', function(div){
			while (div.firstChild) div.removeChild(div.firstChild);	
			var d = document.createElement('div');	
				d.style.marginTop = '-1.5em';
			div.appendChild(d);	
				makeBoardButton(d, 'global', 'news', null, function(f, res){
					res.launch.addEventListener('click',function(){
						AffInfosDev();
					});
				});
				makeBoardButton(d, 'global', 'localSetting', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffParamPersoMenu();
					});
				});
				makeBoardButton(d, 'global', 'rules', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						//window.open('https://gesicht.fr/brenat/cryptogame/co/100_module_CryptoGame.html', 'story')
						window.open('rules/co/100_module_CryptoGame.html', 'story');
					});
				});
				makeBoardButton(d, 'global', 'rules-surge', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffMemo('images/memo.jpg');
					});
				});
				makeBoardButton(d, 'global', 'rules-cave', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffMemo('images/memo2.jpg');
					});
				});
				makeBoardButton(d, 'global', 'site', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						window.open('http://www.brenat-production.fr', 'help');
					});
				});
		});
	}, param.serverData, 'init2');
}
function loadGameCreate(data) {
	getDOM('divSessionJoin', function(div){
		audioPlay(linearArbo(['global','events','gameCreate']));
	});
	
}
async function loadAvailable(data, callbackG) {
	getParam('data', function() {
		getDOM('divSessionJoin', function(div){
			while (div.firstChild) div.removeChild(div.firstChild);
			var d1 = document.createElement('div');
				d1.style.margin = '1em';
			var d2 = document.createElement('div');
				d2.style.margin = '1em';
				
			div.appendChild(d2);
			var as = {};
			var inputs = [];
			for (var game in data) {
				var d = document.createElement('div');
					d.style.margin = '0.5em';
					d.style.display = 'inline-block';
				if (data[game].waiting) d1.appendChild(d);
				else d2.appendChild(d);	
				(function(game, d){
					var code = 'see';
					if (data[game].waiting) code = 'join';
					as['game_'+game] = function(callback){
						getParam('data', function(p){
							makeBoardButton(d, 'global', code, null, function(f, res){
								res.launch.game = game;
								res.launch.img.title += " avec\n"+""+data[game].players.join(", ")+"";
								var span = document.createElement('div');
									span.style.fontStyle = 'italic';
									span.style.fontSize = '75%';
								d.appendChild(span);
								var nb = data[game].players.length;
								var s = (nb>1?"s":"");
								span.innerHTML = "("+nb+" joueur"+s+")";
								callback(null, res.launch);
							}, {taille:'2.5em'});
						}, param.serverData, 'join'+game);
					};
				})(game, d);		
			}		
			async.auto(as, function (err, res) {
				if (d1.childNodes.length>0) {
					var s = d1.childNodes.length>1?"s":"";
					var d = document.createElement('div');
						d.innerHTML = "Rejoindre une partie : ";
					d1.insertBefore(d, d1.firstChild);
					div.appendChild(d1);
				}
				if (d2.childNodes.length>0) {
					var s = d2.childNodes.length>1?"s":"";
					var d = document.createElement('div');
						d.innerHTML = "Regarder une partie :";
					d2.insertBefore(d, d2.firstChild);
					div.appendChild(d2);
				}
				for (var id in res) {
					inputs.push(res[id]);
				}
				callbackG(inputs);
			});
		});
	}, param.serverData, 'join');
}
async function loadUserConnected(data, callback1, callback2) {
	getParam('data', function() {
		param.serverData.info.userAvatar = data.users[param.user].avatar;
		param.serverData.info.userAvatarSrc =data.users[param.user].avatarSrc;
		getDOM('imgUserAvatar', function(img){
			if (param.serverData.info.userAvatarSrc) {
				img.src = param.serverData.info.userAvatarSrc;
				img.title = param.serverData.info.userAvatar;
			}
		});
	}, param.serverData, 'userConnected');
	getDOM('inputReady', function(input){
		var nb = Object.keys(data.users).length;
		var s = (nb>1?"s":"");
		input.info.innerHTML = "("+nb+" joueur"+s+")";
	});
	getDOM('divSessionUsers', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);
		var d = document.createElement('div');
			var nb = Object.keys(data.users).length;
			d.innerHTML = data.text+(data.game?"":" ("+(nb-1)+"/"+(data.tot-1)+")")+" : ";
		div.appendChild(d);
		var d = document.createElement('div');
			d.style.display = 'inline-block';
			d.style.textAlign = 'left';
		div.appendChild(d);
		for (var user in data.users) {
			if (user!=param.user) {
				var dd = document.createElement('div');
				d.appendChild(dd);
					if (data.users[user].avatarSrc) {
						var img = document.createElement('img');
							img.style.height = '2em';
							img.src =  data.users[user].avatarSrc;
							img.style.verticalAlign = 'middle';
						dd.appendChild(img);
					}
					var span = document.createElement('div');
						span.style.marginLeft = '0.5em';
						span.style.display = 'inline-block';
						span.style.verticalAlign = 'middle';
						span.innerHTML = data.users[user].name;
					dd.appendChild(span);
			}
		}
		callback1(null);
	});
	getDOM('divGamePlayers', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);
		var players = [];
		var spectators = [];
		for (var user in data.users) {
			var name = data.users[user].name;
			if (user==param.user) {
				name = "<b>"+name+"</b>";
			}
			if (data.users[user].player) players.push(name);
			else spectators.push(name);
		}
		div.innerHTML = "Joueurs : "+players.join(', ');
		div.innerHTML += "<br>Spectateurs : "+spectators.join(', ');
		callback2(null);
		getDOM('divBoardEnd', function(div){
			div.spectator.innerHTML = "Spectateurs : "+spectators.join(', ');
		});
	});
}
async function loadJoin(data, callback) {
	getParam('data', function() {
		param.serverData.game = data.game;
		getDOM('divSessionJoin', function(div){
			div.parentNode.removeChild(div);
		});
		getDOM('divSessionMenu', function(div){
			while (div.firstChild) div.removeChild(div.firstChild);	
			var d = document.createElement('div');	
				d.style.marginTop = '-1.5em';
			div.appendChild(d);	
				makeBoardButton(d, 'global', 'setting', null, function(f, res){
					res.launch.addEventListener('click',function(){
						AffParamMenu();
					});
				});
				makeBoardButton(d, 'global', 'localSetting', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffParamPersoMenu();
					});
				});
				makeBoardButton(d, 'global', 'bot', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffBotParam();
					});
				});
				makeBoardButton(d, 'global', 'box', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffBoxContent();
					});
				});
				makeBoardButton(d, 'global', 'rules-surge', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffMemo('images/memo.jpg');
					});
				});
				makeBoardButton(d, 'global', 'rules-cave', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						AffMemo('images/memo2.jpg');
					});
				});
				makeBoardButton(d, 'global', 'home', null, function(f, res){
					res.launch.img.style.marginLeft = '1em';
					res.launch.addEventListener('click',function(){
						gameQuit();
					});
				});
			AffInfosMenu();
		});
		getDOM('divSessionLaunch', function(div){
			while (div.firstChild) div.removeChild(div.firstChild);
			makeBoardButton(div, 'global', 'launch', null, function(f, res){
				res.launch.id = 'inputReady';
				res.launch.img.style.verticalAlign = 'middle';
				activeBoardButton(res.launch, false);
				var d = document.createElement('div');
					d.style.margin = '0.5em';
					d.style.display = 'inline-block';
					d.style.verticalAlign = 'middle';
					d.style.textAlign = 'left';
				div.appendChild(d);
					var dd = document.createElement('div');
						dd.innerHTML = 'Démarrer';
						dd.style.fontSize = '150%';
					d.appendChild(dd);
					var dd = document.createElement('div');
						dd.style.fontSize = '80%';
						dd.style.fontStyle = 'italic';
						var s = (data.nb>1?"s":"");
						dd.innerHTML = "("+data.nb+" joueur"+s+")";
					d.appendChild(dd);
					res.launch.info = dd;
				callback();
			}, {taille:'4.5em'});
			
		});
		getDOM('divSessionNew', function(div){
			div.parentNode.removeChild(div);
		});
	}, param.serverData, 'join');
}
async function loadAvatar(data, callback) {
	getParam('data', function() {
		getDOM('imgUserAvatar', function(img){
			img.style.display = "";
			if (!img.src) img.src = data.def;
		});
		getDOM('divSessionAvatar', function(div){
			while (div.firstChild) div.removeChild(div.firstChild);
			var d = document.createElement('div');
			div.appendChild(d);	
				var dd = document.createElement('div');
					dd.innerHTML = "Avatars disponibles : ";
				d.appendChild(dd);
				var dd = document.createElement('div');
					dd.style.fontSize = '80%';
					dd.style.fontSize = 'italic';
					dd.innerHTML = "(clique sur l'image pour la choisir)";
					dd.style.marginBottom = '0.5em';
				d.appendChild(dd);
			var imgs = [];
			for (var a in data.list) {
				var dd = document.createElement('div');
					dd.style.display = 'inline-block';
					dd.style.margin = '0.5em';
				d.appendChild(dd);
					var img = document.createElement('img');
						img.style.height = '5em';
						img.src = param.serverData.data.beast.items[a].src;
						img.title = a;
						img.avatar = a;
						img.style.cursor = 'pointer';
					dd.appendChild(img);
					imgs.push(img);
					// var s = document.createElement('div');
						// s.style.fontSize = '80%';
						// s.innerHTML = a;
					// dd.appendChild(s);
			}
			callback(imgs);
		});
	}, param.serverData, 'avatar');
}
function getImgFromObject(obj) {
	if (obj) {
		Object.keys(obj).forEach(function(i){
			if (typeof(obj[i])!=='string') {
				getImgFromObject(obj[i]);
			} else {
				if ((i=='src' || i.indexOf('-src')>0) && obj[i]!="") {
					addImage(obj[i]);
				}
			}
		});
	}
}
async function loadUserData(data, callback){
	param.serverData.data = data.data;
	recupLocal();
	getImgFromObject(data.data);
	checkReady(function(){
		callback();
	});
}
async function loadReady(data, callback) {
	getDOM('inputReady', function(input){
		activeBoardButton(input, true);
		callback(input);
	});
}
async function loadLaunching(data, callback) {
	getParam('data', function() {
		if ('player' in data) param.serverData.player = data.player;
		if ('pids' in data) param.serverData.playerId = data.pids[param.user];
		if ('playerId' in data) param.serverData.playerId = data.playerId;
		if ('players' in data) param.serverData.data.players = data.players;
		if ('teams' in data) param.serverData.data.teams = data.teams;
		if (callback) callback();
		if (!document.getElementById('divGamePlayers')) {
			getDOM('divInfoServer', function(div) {
				var d = document.createElement('div');
					d.id = 'divGamePlayers';
				div.appendChild(d);
			});
		}
	}, param.serverData, 'launching');
}


function loadAlertBeforeQuit(e) {
	if (param.serverData.data.local.params.alertQuit.value) {
		var confirmationMessage = "\o/";
		e.returnValue = confirmationMessage;
		return confirmationMessage;
	}
}






