"use strict";
function loadServer() {
	getParam('wsPort', function(rep){
		var span = document.getElementById('spanWebSocket');
		if (!rep) {
			if (span) span.innerHTML = "off";
			return;
		}
		param.wsTry = 5;
		initWebSocket();
	});
}
function initNewSession() {
	getParam('wsPort', function(rep){
		param.user = false;
		param.wsRecup = false;
		param.wsTry = 5;
		initWebSocket();
	});
}
function initWebSocket() {
	var span = document.getElementById('spanWebSocket');
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	if (!window.WebSocket) {
		if (span) span.innerHTML = "not supported";
		return;
	}
	if (param.wsTry>0) {
		//var url = 'ws'+(document.location.protocol=='https:'?'s':'')+'://'+document.location.hostname.replace('php.','')+':'+param.wsPort;
		//if (param.wsServer) url = 'ws'+(document.location.protocol=='https:'?'s':'')+'://'+param.wsServer+':'+param.wsPort;
		var url = 'ws'+(document.location.protocol=='https:'?'s':'')+'://'+document.location.hostname.replace('php.','')+'/wss';
		if (param.wsServer) url = 'ws'+(document.location.protocol=='https:'?'s':'')+'://'+param.wsServer+'/wss';
		// console.log(url);
		param.wsConnection = new WebSocket(url);
		param.wsConnection.onopen = function () {
			if (span) span.innerHTML = "on";
			param.wsState = "on";
			param.wsTry = 5;
			param.wsConnection.send(makeJson('recupSession', {user:param.user, online:param.wsRecup}));
			var div = document.getElementById("divReconnexion");
			if (div) {
				document.body.removeChild(div);
			}
		};
		param.wsConnection.onerror = function (error) {
			if (span) span.innerHTML = "off";
			param.wsState = "off";
		};
		param.wsConnection.onclose = function () {
			if (span) span.innerHTML = "off";
			param.wsState = "off";
			param.wsTry--;
			setTimeout(function(){
				initWebSocket();
			},1000);
		};
		param.wsConnection.onmessage = function (message) {
			try {
				var json = JSON.parse(message.data);
				try {
					eval(json.type)(json.data);
				} catch(e) {
					console.log(json);
					console.log(e);
				}
			} catch (e) {
				console.log("This doesn't look like a valid JSON: ", message.data);
				return;
			}
		};
	} else {
		boardAffReconnect();
	}
}
function serverActivity(data) {
	
}
function recupSession(data) {
	// console.log(data);
}
function gameUser(data) {
	loadUser(data, function(res){
		
	});
}
function gameQuit(data) {
	param.wsConnection.send(makeJson('gameQuit', {}));
}

function users(data) {
	console.log('Users connectés:', data);
}

function makeJson(type, data) {
	return JSON.stringify({ type: type, data: data });
}
function gameInit(data) {
	param.wsRecup = true;
	if (param.userName) {
		recupUserName();
		param.wsConnection.send(makeJson('userSet', {name:param.userName}));
	}
	loadInit(data, function(res){
		res.user.addEventListener('change',function(){
			param.wsConnection.send(makeJson('userSet', {name:this.value}));
		});
		res.new.addEventListener('click',function(){
			param.wsConnection.send(makeJson('gameNew'));
		});
	});
}
function gameCreate(data) {
	loadGameCreate(data);
}
function gameAvailable(data) {
	loadAvailable(data, function(inputs){
		inputs.forEach(function(input){
			input.addEventListener('click',function(){
				param.wsConnection.send(makeJson('gameJoin', {game:this.game}));
			});
		});
	});
}
function gameAvatar(data) {
	loadAvatar(data, function(imgs){
		imgs.forEach(function(img){
			img.addEventListener('click',function(){
				param.wsConnection.send(makeJson('avatarSet', {avatar:this.avatar}));
			});
		});
	});
}
function userConnected(data) {
	loadUserConnected(data, function(res){
		
	},function(res){
		
	});
}
function switchPlayer(data) {
	boardSwitchPlayer(data);
}
function gameJoin(data) {
	loadJoin(data, function(res){
		if (data.ready) gameReady(data);
	});
}
function gameReady(data) {
	loadReady(data, function(input){
		input.addEventListener('click',function(){
			param.wsConnection.send(makeJson('gameStart'));
		});
	});
}
function gameLaunching(data) {
	loadLaunching(data, function(div){
		
	});
}
function gameLaunch(data) {
	loadLaunching(data, function(div){
		if (data.started) gameInitBoard(data);
		else gameTeam(data);
	});
}
function gameInitBoard(data) {
	boardConstruction(data, function(res){
		if (param.serverData.player) {
			res.dice.launch.addEventListener('click',function(){
				playRemoveAction('dice', function(open){
					var obj = {open:open};
					param.wsConnection.send(makeJson('takeDice',obj));
				});
			});
			res.wheel.launch.addEventListener('click',function(){
				playRemoveAction('wheel', function(open){
					var obj = {open:open};
					param.wsConnection.send(makeJson('takeWheel',obj));
				});
			});
			if (res.see) {
				res.see.launch.addEventListener('click',function(){
					if (res.see.launch.clicked) {
						res.see.launch.clicked = false;
						param.wsConnection.send(makeJson('hideSeeDeck',{}));
					} else {
						res.see.launch.clicked = true;
						param.wsConnection.send(makeJson('getSeeDeck',{}));
					}
				});
			}
		}
		if (data.recup) {
			param.wsConnection.send(makeJson('gameRecup',{}));
		}
	});
}
function gameTeam(data) {
	teamBuilding(function(res){
		if (param.serverData.player) {
			
		}
	});
}
function setTeam(data) {
	param.wsConnection.send(makeJson('setTeam',data));
}
function majTeam(data) {
	loadLaunching(data, function(div){
		teamUpdating();
	});
}
function launchTeam() {
	param.wsConnection.send(makeJson('gameStartTeam',{}));
}

function userData(data) {
	loadUserData(data, function(){
		param.wsConnection.send(makeJson('userReady'));
	});
}

function seeHand(data) {
	majMyDeck(data);
}
function seeHandInit(data) {
	playAppearWaiting();
}
function sendStock(data) {
	affBoardStock(data);
	majAllDeck(data);
}



function setOrder(data) {
	drawSetOrder(data, function(){
		
	});
}


function startCave(data) {
	playStartCave(data, function(){
		
	});
}
function objectThrowed(data) {
	playObjectThrowed(data, function(){
		
	});
}
function endCave(data) {
	playEndCave(data, function(){
		
	});
}
function objectTaking(data) {
	drawObjectTaking(data, function() {
		
	});
}
function setTimer(data) {
	drawSetTimer(data.timer);
}


function startDiscard(data) {
	playStartDiscard(data, function(res){
		
	});
}
function endDiscard(data) {
	playEndDiscard(true);
}


function takeDice(data) {
	playTakeDice(data, function(res){
		res.launch.addEventListener('click',function(){
			if (res.dices.ready) {
				var dice = param.serverData.data.dice;
				var obj = {res:"dice", force:res.force.checked};
				for (var code in dice.items) {
					obj[code] = res.dices[code].value;
				}
				param.wsConnection.send(makeJson('throwDice',obj));
				res.div.parentNode.removeChild(res.div);
			} else {
				// console.log('3 des');
			}
		});
	});
}
function throwDice(data) {
	playDice(data, function(res){
		if (res) {
			res.launch.addEventListener('click',function(){
				param.wsConnection.send(makeJson('getTrick',{}));
			});
		} else {
			param.wsConnection.send(makeJson('getTrick',{}));
		}
	},function(res){
		res.launch.addEventListener('click',function(){
			param.wsConnection.send(makeJson('getOrgan',{card:this.value, }));
		});
	},function(res){
		
	});
}
function getTrick(data) {
	playTrick(data, function(res){
		
	});
}
function getOrgan(data) {
	playOrgan(data, function(res){
		
	});
}
function takeWheel(data) {
	playTakeWheel(data, function(res){
		res.launch.addEventListener('click',function(){
			affWheelBoard(data);
		});
	},function(res){
		res.launch.addEventListener('click',function(){
			affWheelBoard(data);
		});
	},function(res){
		affWheelBoard(data);
	});
}
function affWheelBoard(data) {
	playChooseWheel(data, function(res, wheel){
		res.launch.addEventListener('click',function(){
			var obj = {action:wheel.action, player:wheel.player, playerId:wheel.playerId};
			param.wsConnection.send(makeJson('throwWheel',obj));
		});
	},function(res){
		res.launch.addEventListener('click',function(){
			var obj = {fold:1};
			param.wsConnection.send(makeJson('throwWheel',obj));
		});
	});
}
function chooseWheelDefault(data) {
	var obj = {fold:1};
	param.wsConnection.send(makeJson('throwWheel',obj));
}
function throwWheel(data) {
	playThrowWheel(data, function(res){
		res.launch.addEventListener('click',function(){
			var obj = Object.assign(data,{card:this.code});
			param.wsConnection.send(makeJson('solveWheel',obj));
		});
	});
}
function solveWheel(data) {
	playSolveWheel(data, function(res){
		
	});
}
function endSolve(data) {
	drawSetTimer(0);
	setTimeout(function(){
		playEndSolve(true);
	},2000);
}


function askTrick(data) {
	param.wsConnection.send(makeJson('takeTrick',data));
}
function takeTrick(data) {
	playTakeTrick(data, function(res){
		res.launch.addEventListener('click',function(){
			var obj = Object.assign(data,{code:this.code});
			param.wsConnection.send(makeJson('throwTrick',obj));
		});
		
	});
}
function throwTrick(data) {
	playThrowTrick(data, function(res){
		if (res) {
			res.launch.addEventListener('click',function(){
				var obj = Object.assign(data,{target:this.code});
				if (this.codeId) obj.targetId = this.codeId;
				param.wsConnection.send(makeJson('solveTrick',obj));
			});
		} else {
			param.wsConnection.send(makeJson('solveTrick',data));
		}
	});
}
function solveTrick(data) {
	playWaitTrick(data);
}

function seeTrickAction(data) {
	drawSeeTrickAction(data);
}
function endTrick(data) {
	playHideTrickButton();
}







function askDiscard(data) {
	playAskDiscard(data, function(res){
		res.launch.addEventListener('click',function(){
			var obj = {card:this.code};
			param.wsConnection.send(makeJson('cardDiscard',obj));
		});
		res.launch2.addEventListener('click',function(){
			var obj = {hasard:true};
			param.wsConnection.send(makeJson('cardDiscard',obj));
		});
	});
}



function frontMessage(data) {
	drawFrontMessage(data, function(){
		
	});
}
function gameScore(data) {
	drawGameScore(data, function(input){
		input.addEventListener('click',function(){
			param.wsConnection.send(makeJson('gameReset',{}));
		});
	});
}




function getGameParam() {
	param.wsConnection.send(makeJson('getGameParam',{}));
}
function affGameParam(data) {
	paramAffGameParam(data, function(inputs){
		inputs.forEach(function(input){
			input.addEventListener('change',function(){
				var value = this.value;
				if (input.type=='checkbox') value = this.checked;
				var obj = {code:this.code, value:value};
				param.wsConnection.send(makeJson('setGameParam',obj));
			});
		});
	});
}
function majGameParam(data) {
	majParam(data);
}
function getGameParamMaster(bool) {
	param.wsConnection.send(makeJson('getGameParamMaster',{master:bool}));
}
function getGameContent() {
	param.wsConnection.send(makeJson('getGameContent',{}));
}
function affGameContent(data) {
	paramAffGameContent(data);
}
function majGameContent(data) {
	paramMajBoxContent(data);
}
function getGameBot() {
	param.wsConnection.send(makeJson('getGameBot',{}));
}
function affGameBot(data) {
	paramAffBot(data);
}
function setGameBot(data) {
	param.wsConnection.send(makeJson('setGameBot',data));
}
function majGameBot(data) {
	paramMajBot(data);
}
function getGameBotUnit(data) {
	param.wsConnection.send(makeJson('getGameBotUnit',data));
}
function affGameBotUnit(data) {
	paramAffBotUnit(data);
}



function askForBot() {
	param.wsConnection.send(makeJson('askForBot',{}));
}
function hasBot(data) {
	boardBotAvailable(data);
}
function getBot() {
	param.wsConnection.send(makeJson('getBot',{}));
}
function setBot(data) {
	
	document.location.reload();
}



// debugguage
function getSeeDeck(data) {
	affGetSeeDeck(data);
}

	
	
