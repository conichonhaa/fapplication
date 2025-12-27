"use strict";
var webSocketServer = require('websocket').server;
var async = require('async');
var play = require("./play");
var Autobot = require("./autobot");


function start(server) {
	var wsServer = new webSocketServer({
		httpServer: server
	});
	// console.log('websocket on');
	wsServer.on('request', function(request) {
		initConnection(request, function(connection){
			connection.on('message', function(message) {
				if (message.type=='utf8') {
					try {
						var json = JSON.parse(message.utf8Data);
						try {
							eval(json.type)(connection, json.data);
						} catch(e) {
							console.log('no action for ',json);
							console.log(e);
						}
					} catch (e) {
						console.log("This doesn't look like a valid JSON: ", message.utf8Data);
						return;
					}
				}
				actuConnection(connection);
			});
			connection.on('close', function() {
				closeConnection(connection);
			});		
		});
	});
	
	clearInterval(refreshIntervalId);
	refreshIntervalId = setInterval(function() {
		sendConnected(null, 'serverActivity', refreshIntervalDelay);
	}, refreshIntervalDelay);
}
exports.start = start;

function initConnection(request, callback) {
	var connection = request.accept(null, request.origin);
		connection.origin = request.origin;
	callback(connection);
}
function actuConnection(connection) {
	if (connection.user) {
		actuObject(clients, connection.user);
	}
}
function closeConnection(connection) {
	if (connection.user) {
		var user = connection.user;
		if (user in clients.list) {
			delete clients.list[user].connection;
			var game = clients.list[user].game;
			userConnected(game);
			clients.list[user].timeout = setTimeout(function(){
				playerToBot(game, user, function(){
					delete clients.list[user].game;
					if (game in session.list) delete session.list[game].players[user];
					delete clients.list[user];
					userConnected();
					sessionQuit(game, user);
				});
			}, 10000);
		}
	}
}

// nettoyage periodique des donnees
function cleanSessionAll() {
	var d = new Date();
	// console.log('clean', d);
	// console.log('clients', Object.keys(clients.list));
	// console.log('session', Object.keys(session.list));
	for (var game in session.list) {
		sessionActive(game, function(active) {
			if (!active) sessionStop(game);
			gameAvailable();
		});
	}
}
setInterval(function(){cleanSessionAll();}, 60000);

// Gestion de la connexion des clients
var refreshIntervalId = null;
var refreshIntervalDelay = 30000;
var clients = {};
	clients.list = {};
	clients.token = Math.round((new Date()).getTime()/1000).toString(16);
	clients.pid = 0;
	clients.dateBegin = new Date();
	
function newClient(callback) {
	clients.pid++;
	var user = clients.token+'-'+clients.pid;
	clients.list[user] = {}
	var name = "Joueur "+clients.pid;
	clients.list[user].nameDefault = name;
	clients.list[user].name = name;
	clients.list[user].nameAuto = true;
	callback(user);
}
function recupClient(user, callback) {
	if (user in clients.list && !clients.list[user].connection) {
		clearTimeout(clients.list[user].timeout);
		callback(user);
	} else {
		newClient(function(user){
			callback(user);
		});
	}
}
function recupStateGame(user, callback) {
	var game = clients.list[user].game;
	var jsons = [];
	if (game) {
		var sess = session.list[game];
		if (sess && user in sess.players) {
			play.getData(game, function(gameData){
				if (sess.waiting) {
					var nb = Object.keys(sess.players).length;
					jsons.push(makeJson('gameJoin', {game:game, ready:sess.ready, nb:nb}));
					if (sess.ready) gameAvatar(game);
				} else {
					var player = sess.players[user].player;
					var obj = {game:game, player:player, players:gameData.players, teams:sess.teams, recup:true, started:sess.started};
					if (player) {
						obj.playerId = sess.players[user].data.pid;
					}
					jsons.push(makeJson('gameLaunch', obj));
					jsons.push(makeJson('frontMessage', {user:user, code:'recup'}));
				}
				callback(game, jsons);
			});
		} else {
			callback();
		}
	} else {
		callback();
	}
}
function recupSession(connection, data) {
	recupClient(data.user, function(user){
		clients.list[user].origin = connection.origin;
		clients.list[user].connection = connection;
		connection.user = user;
		actuObject(clients, user);
		if (user==data.user && data.online) {
			connection.send(makeJson('recupSession', {user:user, info:"reconnect"}));
		} else {
			connection.send(makeJson('gameUser', {user:user, username:clients.list[user].name}));
			play.loadData(function(res){
				connection.send(makeJson('userData', {user:user, data:res}));
			});
			recupStateGame(user, function(game, jsons){
				userConnected(game);
				if (jsons) {
					jsons.forEach(function(json){
						connection.send(json);
					});
				} else {
					connection.send(makeJson('gameInit', {user:user, name:clients.list[user].name}));
					gameAvailable();
				}
			});
		}
	});
}



function makeJson(type, data) {
	return JSON.stringify({ type: type, data: data });
}
function actuObject(object, pid) {
	var d = (new Date()).getTime();
	if (pid in object.list) {
		object.list[pid].actuTime = d;
		if (!object.list[pid].startTime) object.list[pid].startTime = d;
	}
}


function sendConnected(game, type, data) {
	var json = makeJson(type, data);
	for (var user in clients.list) {
		if (clients.list[user].connection && (game===null || clients.list[user].game==game)) {
			clients.list[user].connection.send(json);
		}
	}
}


// Gestion des sessions de jeu
var session = {};
	session.list = {};
	session.pid = 0;
	session.token = ((new Date()).getTime()).toString(16);
	
	
function sessionNew(callback) {
	session.pid++;
	var game = session.pid;
	sessionStart(game, function() {
		callback(game);
	});
}
function sessionStart(game, callback) {
	session.list[game] = {};
	session.list[game].players = {};
	session.list[game].bots = {};
	session.list[game].botsParam = {};
	session.list[game].ready = false;
	session.list[game].waiting = true;
	session.list[game].localParams = {};
	play.setData(game, 1, function(){
		session.list[game].ready = true;
		sendConnected(game, 'gameReady', {});
		gameAvatar(game);
		callback(game);
	});
	actuObject(session, game);
}
function sessionJoin(connection, game, callback) {
	session.list[game].players[connection.user] = {player:session.list[game].waiting, data:{}};
	clients.list[connection.user].game = game;
	userConnected(game);
	userConnected();
	if (callback) callback();
}
function sessionActive(game, callback) {
	var active = false;
	var sess = session.list[game];
	if (sess && sess.players) {
		active = true;
		var nbP = 0
		for (var user in sess.players) {
			if (!(user in sess.bots)) {
				if (user in clients.list && clients.list[user].game==game) {
					if (clients.list[user].connection) nbP++;
				} else {
					playerToBot(game, user, function(){
						delete sess.players[user];
					});
				}
			}
		}
		var nbB = Object.keys(sess.bots).length;
		if (nbP<=0) active = false;
	}
	callback(active);
}
function sessionQuit(game, user, callback) {
	sessionActive(game, function(active) {
		if (!active) sessionStop(game);
		gameAvailable();
		if (callback) callback();
	});
}
function sessionStop(game, callback) {
	var sess = session.list[game];
	if (sess) {
		delete sess.ended;
		for (var id in sess.bots) {
			delete sess.bots[id].auto;
		}
		delete session.list[game];
	}
	if (callback) callback();
}
function sessionRestart(game, callback) {
	sessionStop(game, function() {
		sessionStart(game, function() {
			if (callback) callback();
		});
	});
}


// Gestion du jeu
function userReady(connection, data) {
	clients.list[connection.user].ready = true;
}
function userSet(connection, data) {
	var user = connection.user;
	if (data.name!='' && data.name!=clients.list[user].nameDefault) {
		clients.list[user].name = data.name;
		clients.list[user].nameAuto = false;
	} else {
		clients.list[ser].name = clients.list[connection.user].nameDefault;
		clients.list[user].nameAuto = true;
	}
	connection.send(makeJson('gameUser', {username:clients.list[user].name}));
	userConnected(clients.list[connection.user].game);
}
function avatarSet(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	
	getAvatar(game, function(dict) {
		if (data.avatar in dict.dispo) {
			sess.players[user].data.avatar = data.avatar;
		} else {
			sess.players[user].data.avatar = null;
			if (clients.list[user].avatar) delete clients.list[user].avatar;
		}
		userConnected(game);
		gameAvatar(game);
	});
	
	
	
}


function gameQuit(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	playerToBot(game, user, function(){
		delete clients.list[user].game;
		delete sess.players[user];
		sessionQuit(game, user, function(){
			connection.send(makeJson('gameUser', {user:user, username:clients.list[user].name}));
			connection.send(makeJson('gameInit', {user:user, name:clients.list[user].name}));
			userConnected();
			gameAvailable();
			majGameContent(game);
		});
	});
}
function gameNew(connection) {
	sessionNew(function(game){
		gameJoin(connection,  {game:game});
		sendConnected(null, 'gameCreate', {});
		gameAvailable();
	});
}
function gameAvailable() {
	var list = {};
	for (var game in session.list) {
		var sess = session.list[game];
		list[game] = {waiting:sess.waiting, players:[]};
		Object.keys(sess.players).forEach(function(id){
			if (id in clients.list) list[game].players.push(clients.list[id].name);
		});
	}
	sendConnected(null, 'gameAvailable', list);
}
function gameJoin(connection, data) {
	sessionJoin(connection, data.game, function(){
		var user = connection.user;
		var game = data.game;
		var sess = session.list[game];
		if (sess.waiting) {
			var nb = Object.keys(sess.players).length;
			connection.send(makeJson('gameJoin', {game:game, ready:sess.ready, nb:nb}));
			if (clients.list[user].avatar) avatarSet(connection, {avatar:clients.list[user].avatar});
			if (sess.ready) gameAvatar(game);
			majGameContent(game);
		} else {
			play.getData(game, function(gameData){
				connection.send(makeJson('gameLaunch', {game:game, player:false, players:gameData.players, teams:sess.teams, started:sess.started}));
			});
		}
	});
	gameAvailable();
}
function gameStart(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		sess.waiting = false;
		sess.started = false;
		gameAvailable();
		makePlayers(game, function(pl){
			var dataSuppl = {deck:pl.deck, players:pl.players, teams:sess.teams, possiblePlayer:pl.possible, params:sess.localParams};
			sendConnected(game, 'gameLaunching', {game:game, player:true, players:dataSuppl.players, pids:pl.pids});
			play.setData(game, pl.nb, function(){
				if (pl.team>0) {
					sess.dataSuppl = dataSuppl;
					sendConnected(game, 'gameLaunch', {game:game, started:sess.started, teams:sess.teams});
				} else {
					sess.started = true;
					sendConnected(game, 'gameLaunch', {game:game, started:sess.started});
					userConnected(game);
					sendStock(game);
					setTimeout(function(){
						gameRound(game);
					},1000);
				}
			}, dataSuppl);
		});
	}
}
function setTeam(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		play.setTeam(game, data, function(res){
			sendConnected(game, 'majTeam', {game:game, players:res.players, teams:res.teams});
		});
	}
}
function gameStartTeam(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		sess.started = true;
		sendConnected(game, 'gameLaunch', {game:game, started:sess.started});
		userConnected(game);
		sendStock(game);
		setTimeout(function(){
			gameRound(game);
		},1000);
		
	}
}


function gameRound(game) {
	checkActiveSession(game, function() {
		var sess = session.list[game];
		play.gameFinish(game, function(score, winners, loosers){
			if (!score) {
				var as = {};
				as['init'] = function(callback) {
					play.gameRoundStart(game, function(res){
						sendConnected(game, 'setOrder', {game:game, list:res.list, init:true});
						sendConnected(game, 'frontMessage', {game:game, code:'newTurn', round:res.round});
						sendDatasGame(game);
						callback(null);
					});
				};
				as['cave'] =  ['init', function(results, callback) {
					gameCave(game, function(){
						callback(null);
					});
				}];
				as['trick'] =  ['cave', function(results, callback) {
					gameTrick(game, function(){
						play.gameFinish(game);
						callback(null);
					});
				}];
				as['tempo1'] = ['trick', function(results, callback) {
					gameSendDatas(game);
					setTimeout(function(){
						callback(null);
					}, 2000);
				}];
				as['resolve'] = ['tempo1', function(results, callback) {
					gameResolve(game, function(){
						play.gameFinish(game);
						callback(null);
					});
				}];
				as['discard'] = ['resolve', function(results, callback) {
					gameDiscard(game, function(){
						callback(null);
					});
				}];
				as['end'] = ['cave','resolve','discard', function(results, callback) {
					play.gameRoundEnd(game, function(){
						callback(null);
					});
				}];
				as['tempo2'] = ['end', function(results, callback) {
					setTimeout(function(){
						callback(null);
					}, 2000);
				}];
				async.auto(as, function (err, res) {
					gameRound(game);
				});
			} else {
				sendDatasGame(game);
				sendConnected(game, 'gameScore', {game:game, score:score, winners:winners, loosers:loosers});
				sess.ended = true;
			}
		});	
	});
}
function gameCave(game, callback) {
	checkActiveSession(game, function() {
		var sess = session.list[game];
		play.getData(game, function(gameData){
			sendConnected(game, 'startCave', {game:game, timer:gameData.all.global.params.dureeCave.value});
			sendConnected(game, 'frontMessage', {game:game, code:'caving'});
		});
		for (var id in sess.bots) {
			var pid = sess.players[id].data.pid;
			sendConnected(game, 'objectTaking', {game:game, user:pid, code:'dice', take:true});
			if (sess.bots[id].auto) sess.bots[id].auto.cave((res, id) => {
				sendDatasGame(game);
				var pid = sess.players[id].data.pid;
				if (res.stock) {
					sendConnected(game, 'frontMessage', {game:game, user:pid, code:'doubleOrgan', organ:res.stock});
				}
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'dice', dice:res.dice, state:true, action:'On'});
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'wheel', take:true});
			}, function(res, id){
				sendDatasGame(game);
				var pid = sess.players[id].data.pid;
				var action = 'Surge';
				if (res.fold) action = 'Fold'
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'wheel', action:action, state:true});
			});
		}
		play.gameCave(game, function() {
			sendConnected(game, 'endCave', {game:game});
			callback();
		});
	});
}
function gameTrick(game, callback) {
	checkActiveSession(game, function() {
		var sess = session.list[game];
		play.gameTrick(game, function(pid, code, timer) {
			var user = sess.playersId[pid];
			if (user in sess.bots) {
				if (sess.bots[user].auto) sess.bots[user].auto.trickPlay(code, function(res){
					sendDatasGame(game);
				});
			}
			if (user in clients.list) {
				if (clients.list[user].connection) {
					throwTrickWait(clients.list[user].connection, code);
					clients.list[user].connection.send(makeJson('setTimer', {game:game, user:pid, timer:timer}));
				}
			}
		}, function(res){
			if (res) {
				sendConnected(game, 'seeTrickAction', {game:game, tricked:res});
				gameTrick(game, callback);
			}
			else callback();
		});
	});
}
function gameResolve(game, callback) {
	var sess = session.list[game];
	checkActiveSession(game, function() {
		play.gameResolve(game, function(pid, wheel, timer1, timer2){
			if (pid) {
				var user = sess.playersId[pid];
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'solve', code:'order', take:true, wheel:wheel, timer:timer1});
				if (user in sess.bots) {
					if (sess.bots[user].auto) sess.bots[user].auto.solve(function(res){
						sendDatasGame(game);
					});
				}
				if (user in clients.list) {
					if (clients.list[user].connection) {
						throwWheelWait(clients.list[user].connection);
						clients.list[user].connection.send(makeJson('setTimer', {game:game, user:pid, timer:timer1}));
					}
				}
				play.gameResolveUser(game, pid, function(debilos, pcard, ok){
					sendConnected(game, 'frontMessage', {game:game, user:pid, code:'solving', wheel:wheel, pcard:pcard});
					if (user in clients.list) {
						if (clients.list[user].connection) {
							clients.list[user].connection.send(makeJson('endSolve', {}));
							if (debilos) sendHand(clients.list[user].connection);
						}
					}
					sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'solve', code:'order', state:true, timer:timer2, trick:ok, surge:wheel.surge});
					if (pcard) {
						for (var id in sess.bots) {
							if (sess.bots[id].auto) sess.bots[id].auto.trickPick(wheel.surge, function(res, id){
								if (res.immediate && id in sess.bots) {
									if (sess.bots[id].auto) sess.bots[id].auto.trickPlay(res.code, function(res){
										sendDatasGame(game);
									});
								}
							});
						}
					}
					play.gameTrickPostSolve(game, function(tricked){
						sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'solve'});
						sendConnected(game, 'seeTrickAction', {game:game, user:pid, tricked:tricked});
						gameResolve(game, callback);
					});
				});
			} else {
				callback();
			}
		});
	});
}
function gameDiscard(game, callback) {
	checkActiveSession(game, function() {
		var sess = session.list[game];
		play.getData(game, function(gameData){
			if (!gameData.round.finish) {
				sendConnected(game, 'startDiscard', {game:game, timer:gameData.all.global.params.dureeDiscard.value});
				
			}
		});
		for (var id in sess.players) {
			if (sess.players[id].player) {
				if (id in sess.bots) {
					if (sess.bots[id].auto) sess.bots[id].auto.discard(function(res){
						sendDatasGame(game);
					});
				}
				if (id in clients.list) {
					if (clients.list[id].connection) askDiscard(clients.list[id].connection);
				}
			}
		}
		play.gameDiscard(game, function(res) {
			res.debilos.forEach(function(pid){
				var user = sess.playersId[pid];
				if (user in clients.list) {
					if (clients.list[user].connection) sendHand(clients.list[user].connection);
				}
			});
			sendDatasGame(game);
			sendConnected(game, 'endDiscard', {game:game});
			callback();
		});
	});
}
function gameSendDatas(game) {
	checkActiveSession(game, function() {
		var sess = session.list[game];
		for (var id in sess.players) {
			if (sess.players[id].player) {
				if (id in clients.list) {
					if (clients.list[id].connection) sendObjects(clients.list[id].connection);
				}
			}
		}	
	});
}
function checkActiveSession(game, callback) {
	var sess = session.list[game];
	if (sess) {
		callback();
	} else {
		play.gameKill(game);
	}
}



function gameReset(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess) {
		if (sess.waiting) {
			sendRejoin(connection);
		} else {
			if (sess.ended) sessionRestart(game, function() {});
			setTimeout(function(){gameReset(connection)}, 1000);
		}
	} else {
		setTimeout(function(){gameReset(connection)}, 1000);
	}
}
function sendRejoin(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	connection.send(makeJson('gameUser', {user:user, username:clients.list[user].name}));
	gameJoin(connection, {game:game});
}
function gameRecup(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	sendObjects(connection);
}
function setData(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	connection.send(makeJson(data.action, {game:game, user:user, data:data.data}));
}

function takeDice(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		if (data.open) {
			play.takeDice(game, user, data, function(res){
				var ids = {game:game, user:user};
				var obj = Object.assign(ids, res);
				connection.send(makeJson('takeDice', obj));
				sendObjects(connection);
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'dice', take:true});
			});
		} else {
			sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'dice', take:false});
		}
	}
}
function throwDice(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		connection.send(makeJson('objectThrowed', {code:'dice'}));
		play.throwDice(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, res);
			if (res.stock) {
				sendConnected(game, 'frontMessage', {game:game, code:'doubleOrgan', organ:res.stock});
			}
			connection.send(makeJson('throwDice', obj));
			sendObjects(connection);
			sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'dice', dice:res.dice, state:true, action:'On'});
		});
	}
}
function getTrick(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.getTrick(game, pid, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, {card:res});
			connection.send(makeJson('getTrick', obj));
			sendObjects(connection);
		});
	}
}
function getOrgan(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.getOrgan(game, pid, data.card, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, {card:res});
			connection.send(makeJson('getOrgan', obj));
			sendObjects(connection);
		});
	}
}
function takeWheel(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		if (data.open) {
			play.takeWheel(game, pid, data, function(res){
				var ids = {game:game, user:user};
				var obj = Object.assign(ids, res);					
				connection.send(makeJson('takeWheel', obj));
				sendObjects(connection);
				sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'wheel', take:true});
			});
		} else {
			sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'wheel', take:false});
		}
	}
}
function throwWheel(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		connection.send(makeJson('objectThrowed', {code:'wheel'}));
		var pid = sess.players[user].data.pid;
		play.throwWheel(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, data, res);
			var action = 'Surge';
			if (res.fold) action = 'Fold'
			sendConnected(game, 'objectTaking', {game:game, user:pid, phase:'cave', code:'wheel', action:action, take:false, state:true});
			sendObjects(connection);
		});
	}
}
function throwWheelWait(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	checkActiveSession(game, function() {
		var sess = session.list[game];
		if (sess.players[user].player) {
			var pid = sess.players[user].data.pid;
			play.throwWheelWait(game, pid, function(res){
				var ids = {game:game, user:user};
				var obj = Object.assign(ids, res);
				connection.send(makeJson('throwWheel', obj));
				sendObjects(connection);
			});
		}
	});
}
function solveWheel(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.solveWheel(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, res);
			connection.send(makeJson('solveWheel', obj));
			sendObjects(connection);
		});
	}
}


function takeTrick(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.takeTrick(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, res, data);					
			connection.send(makeJson('takeTrick', obj));
			if (res.user) sendConnected(game, 'objectTaking', {game:game, user:res.user, code:'trick', take:true});
		});
	}
}
function throwTrick(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.throwTrick(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, res, data);
			if (res.immediate) {
				throwTrickWait(connection, data.code);
			} else {
				obj.wait = "Magouille lancée...";
				connection.send(makeJson('solveTrick', obj));
			}
			sendObjects(connection);
		});
	}
}
function throwTrickWait(connection, code) {
	var user = connection.user;
	var game = clients.list[user].game;
	checkActiveSession(game, function() {
		var sess = session.list[game];
		if (sess.players[user].player) {
			var pid = sess.players[user].data.pid;
			play.throwTrickWait(game, pid, code, function(res){
				var ids = {game:game, user:user};
				var obj = Object.assign(ids, res, {code:code});
				connection.send(makeJson('throwTrick', obj));
			});
		}
	});
}
function solveTrick(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.solveTrick(game, pid, data, function(res){
			var ids = {game:game, user:user};
			var obj = Object.assign(ids, res, data);					
			connection.send(makeJson('solveTrick', obj));
			sendObjects(connection);
		});
	}
}



function askDiscard(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	checkActiveSession(game, function() {
		var sess = session.list[game];
		if (sess.players[user].player) {
			var pid = sess.players[user].data.pid;
			play.askDiscard(game, pid, function(res){
				var ids = {game:game, user:user};
				var obj = Object.assign(ids, res);
				connection.send(makeJson('askDiscard', obj));
			});
		}
	});
}
function cardDiscard(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.cardDiscard(game, pid, data, function(res){
			sendObjects(connection);
		});
	}
}




function sendObjects(connection) {
	sendHand(connection);
	sendSeeDeck(connection);
	var user = connection.user;
	var game = clients.list[user].game;
	sendDatasGame(game);
}
function sendDatasGame(game) {
	sendStock(game);
	play.getOrderCaved(game, function(res) {
		sendConnected(game, 'setOrder', {game:game, list:res.list});
	});
}

function sendHand(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess.players[user].player) {
		var pid = sess.players[user].data.pid;
		play.getData(game, function(gameData){
			if (gameData) {
				var obj = {game:game, user:user};
				obj.deck = gameData.deck[pid];
				connection.send(makeJson('seeHand', obj));
			}
		});
	}
}




// parametrage partie
function getGameParam(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	play.getData(game, function(gameData){
		var obj = {game:game, user:user};
		obj.params = gameData.all.global.params;
		obj.master = gameData.all.global.paramMaster;
		connection.send(makeJson('affGameParam', obj));
	});
}
function getGameParamMaster(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	play.getData(game, function(gameData){
		if (data.master) {
			if (!gameData.all.global.paramMaster) gameData.all.global.paramMaster = {user:user, name:clients.list[user].name};
		} else {
			gameData.all.global.paramMaster = null;
		}
		sendConnected(game, 'majGameParam', {master:gameData.all.global.paramMaster});
	});
}
function setGameParam(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (sess) sess.localParams[data.code] = data.value;
	play.getData(game, function(gameData){
		if (!gameData.all.global.paramMaster || gameData.all.global.paramMaster.user==user) {
			gameData.all.global.params[data.code].value = data.value;
			sendConnected(game, 'majGameParam', {code:data.code, value:data.value});
			majGameContent(game);
			majGameBot(game);
		}
	});
	
}
function getGameContent(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	play.getData(game, function(gameData){
		var obj = {game:game, user:user};
		obj.possible = gameData.possible;
		if (!sess.waiting) {
			obj.nb = Object.keys(gameData.players.items).length;
			obj.trick = gameData.stock.trick.length;
		} else {
			obj.nb = Object.keys(sess.players).length + parseInt(gameData.all.global.params.nbBots.value);
			obj.trick = gameData.all.global.params.tricked.value;
		}
		connection.send(makeJson('affGameContent', obj));
	});
}
function majGameContent(game) {	
	var sess = session.list[game];
	if (sess && sess.waiting) {
		play.getData(game, function(gameData){
			var obj = {game:game};
			obj.nb = Object.keys(sess.players).length + parseInt(gameData.all.global.params.nbBots.value);
			obj.trick = gameData.all.global.params.tricked.value;
			sendConnected(game, 'majGameContent', obj);
		});
	}
}
function getGameBot(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	play.getData(game, function(gameData){
		var obj = {game:game, user:user};
		obj.nbBots = gameData.all.global.params.nbBots.value;
		obj.bots = {};
		for (var bot in sess.botsParam) {
			obj.bots[bot] = sess.botsParam[bot].name;
		}
		connection.send(makeJson('affGameBot', obj));
	});
}
function setGameBot(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (data.ind=='all') {
		play.getData(game, function(gameData){
			var nbBots = gameData.all.global.params.nbBots.value;
			for (var i=0; i<nbBots; i++) {
				setSessGameBot(game, i, data.param);
			}
			majGameBot(game);
		});
	} else {
		var i = parseInt(data.ind);
		setSessGameBot(game, i, data.param);
		majGameBot(game);
	}
}
function setSessGameBot(game, i, param) {
	var sess = session.list[game];
	var bot = 'b'+i;
	sess.botsParam[bot] = {};
	sess.botsParam[bot].id = bot;
	sess.botsParam[bot].name = "Robot "+(i+1);
	sess.botsParam[bot].param = param;
	var obj = {param:sess.botsParam[bot]};
	sendConnected(game, 'majGameBot', obj);
}
function getGameBotUnit(connection, data) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (data.target in sess.botsParam) {
		connection.send(makeJson('affGameBotUnit', sess.botsParam[data.target]));
	}
}
function majGameBot(game) {	
	var sess = session.list[game];
	if (sess && sess.waiting) {
		play.getData(game, function(gameData){
		var obj = {game:game};
		obj.nbBots = gameData.all.global.params.nbBots.value;
		obj.bots = {};
		for (var bot in sess.botsParam) {
			obj.bots[bot] = sess.botsParam[bot].name;
		}
		sendConnected(game, 'majGameBot', obj);
		});
	}
}



// cheat mode
var cheatMode = false;
function getSeeDeck(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	if (cheatMode) sess.cheatActive = true;
	sendSeeDeck(connection);
}
function sendSeeDeck(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	// var pid = sess.players[user].data.pid;
	play.getData(game, function(gameData){
		var obj = {game:game, user:user};
		if (sess.cheatActive) {
			obj.stock = gameData.stock;	
			obj.possible = gameData.possible;
			obj.deck = gameData.deck;
		}
		connection.send(makeJson('getSeeDeck', obj));
	});
}
function hideSeeDeck(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	sess.cheatActive = false;
	sendSeeDeck(connection)
}




function askForBot(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	play.getData(game, function(gameData) {
		var count = Object.keys(sess.bots).length;
		var obj = {game:game, nbBots:count};
		sess.botToPlayer = gameData.all.global.params.botToPlayer.value;
		if (!sess.botToPlayer) obj.forbidden = true;
		connection.send(makeJson('hasBot', obj));
	});
	
}
function getBot(connection) {
	var user = connection.user;
	var game = clients.list[user].game;
	var sess = session.list[game];
	var poss = Object.keys(sess.bots);
	if (poss.length>0 && sess.botToPlayer) {
		var rand = Math.floor(Math.random()*poss.length);
		var bot = poss[rand];
		botToPlayer(game, user, bot, function(info){
			connection.send(makeJson('setBot', {}));
		});
	}
}
function playerToBot(game, user, callback) {
	var sess = session.list[game];
	if (sess && sess.started && (user in sess.players) && (user in clients.list) && sess.players[user].player) {
		var bot = 'b'+sess.botsCount;
		sess.botsCount++;
		sess.bots[bot] = {nameAuto:true, bot:true};
		sess.players[bot] = JSON.parse(JSON.stringify(sess.players[user]));
		sess.players[user].player = false;
		var pid = sess.players[bot].data.pid;
		switchPlayer(game, {id:pid, bot:true, user:bot}, function(){
			sess.bots[bot].auto = new Autobot(game, bot);	
			sess.bots[bot].auto.setAI();
			sess.bots[bot].auto.setPlayer(pid);
			setTimeout(function(){
				callback();
			},1000);
		});
	} else {
		callback();
	}
}
function botToPlayer(game, user, bot, callback) {
	var sess = session.list[game];
	if ((user in sess.players) && !sess.players[user].player ) {
		sess.players[user] = sess.players[bot];
		var pid = sess.players[user].data.pid;
		switchPlayer(game, {id:pid, bot:false, user:user}, function(){
			delete sess.players[bot];
			delete sess.bots[bot];
			callback();
		});
	} else {
		callback();
	}
}
function switchPlayer(game, data, callback) {
	var sess = session.list[game];
	sess.playersId[data.id] = data.user;
	userConnected(game);
	sendConnected(game, 'switchPlayer', data);
	play.swithPlayer(game, data, function(res){
		sendConnected(game, 'gameLaunching', {players:res.players});
		callback();
	});
}		
function makePlayers(game, callback) {
	var sess = session.list[game];
	play.getData(game, function(gameData){
		getAvatar(game, function(dict) {
			var list = Object.keys(dict.dispo);
			play.shuffle(list);
			sess.botsCount = gameData.all.global.params.nbBots.value;
			for (var k=0; k<sess.botsCount; k++) {
				var bot = 'b'+k;
				sess.bots[bot] = {name:'Robot '+(k+1), nameAuto:true, bot:true};
				sess.players[bot] = {player:true, data:{}};
				sess.bots[bot].auto = new Autobot(game, bot);
				var param = (sess.botsParam[bot]?sess.botsParam[bot].param:null);
				sess.bots[bot].auto.setAI(param);
			}
			var team = gameData.all.global.params.team.value;
			for (var k=0; k<team; k++) {
				if (!sess.teams) sess.teams = {};
				var t = 't'+k;
				var r = k % gameData.listColor.length;
				sess.teams[t] = {name:'Equipe '+(k+1), color:gameData.listColor[r]};
			}
			var deck = {};
			var possible = [];
			var players = {items:{}, litteral:gameData.all.beast.litteral, ids:{}};
			var pids = {}
			sess.playersId = {};
			var k = 1;
			var p = 0;
			for (var id in sess.players) {
				if (sess.players[id].player) {
					p++;
					var pid = 'g'+game+'p'+p;
					var handle = null;
					if (id in clients.list) handle = clients.list[id];
					if (id in sess.bots) {
						handle = sess.bots[id];
						sess.bots[id].auto.setPlayer(pid);
					}
					if (handle) {
						var src = gameData.all.beast.src;
						handle.avatar = sess.players[id].data.avatar;
						if (!handle.avatar) handle.avatar = list.pop();
						if (!handle.avatar) handle.avatar = "Inconnu";
						if (handle.avatar in gameData.all.beast.items) src = gameData.all.beast.items[handle.avatar].src;
						sess.players[id].data.avatar = handle.avatar;
						sess.players[id].data.pid = pid;
						sess.playersId[pid] = id;
						if (handle.nameAuto || handle.name in players.items) {
							handle.name = handle.avatar;
						}
						if (handle.name in players.items) {
							k++;
							handle.name = handle.name + "("+k+")";
						}
						sess.players[id].data.name = handle.name;
						players.items[handle.name] = {
							src: src,
							id: pid,
							bot: handle.bot
						};
						players.ids[pid] = {
							name: handle.name,
							src: src
						};
						pids[id] = pid;
						deck[pid] = {hand:{}, beast:{}, tags:[]};
						possible.push(handle.name);
					}
				}
			}
			var nb = Object.keys(players.items).length;
			callback({deck:deck, players:players, nb:nb, possible:possible, team:team, pids:pids});
		});
	});
}
function userConnected(game) {
	play.getData(game, function(gameData){
		var list = {};
		var tot = 0;
		var txt = "Joueurs disponibles";
		if (game) txt = "Joueurs dans la partie";
		for (var user in clients.list) {
			if (clients.list[user].connection) {
				tot++;
				if (!game && !clients.list[user].game || game==clients.list[user].game) {
					list[user] = {name:clients.list[user].name, ready:clients.list[user].ready, game:clients.list[user].game};
					if (game in session.list) {
						var sess = session.list[game];
						if (sess && sess.players[user]) {
							list[user].player = sess.players[user].player;
							list[user].avatar = sess.players[user].data.avatar;
							if (gameData) {
								var src = gameData.all.beast.src
								if (list[user].avatar) src = gameData.all.beast.items[list[user].avatar].src;
								list[user].avatarSrc = src;
							}
						} else {
							
						}
					}
				}
			}
		}
		if (game in session.list) {
			for (var bot in session.list[game].bots) {
				list[bot] = {name:session.list[game].bots[bot].name, player:true, bot:true};
			}
		}
		sendConnected(game, 'userConnected', {game:game, users:list, text:txt, tot:tot});
	});
}
function sendStock(game) {
	play.getData(game, function(gameData){
		var sess = session.list[game];
		if (sess && gameData) {
			var obj = {};
			var list = [];
			list.push({code:'dose', val:gameData.stock.dose});
			for (var o in gameData.stock.organ) {
				list.push({code:'organ', item:o, val:gameData.stock.organ[o].length});
			}
			list.push({code:'trick', val:gameData.stock.trick.length});
			
			var nb = gameData.stock.garbage.length;
			list.push({code:'global', item:'garbage', val:nb});
			if (nb>0) {
				var last = gameData.stock.garbage[nb-1];
				var frame = gameData.all.organ.frames[last.effect].src;
				list.push({code:'organ', item:last.code, val:"", frame:frame});
			}
			var publi = {};
			var beast = {};
			var tags = {};
			for (var id in gameData.deck) {
				publi[id] = {};
				var deck = gameData.deck[id];
				publi[id].dose = 0;
				publi[id].organ = 0;
				publi[id].trick = 0;
				if (deck) {
					if (deck.hand.dose) publi[id].dose = deck.hand.dose;
					if (deck.hand.organ) publi[id].organ = deck.hand.organ.length;
					if (deck.hand.trick) publi[id].trick = deck.hand.trick.length;
					beast[id] = deck.beast;
					tags[id] = deck.tags;
				}
			}
			sendConnected(game, 'sendStock', {game:game, stock:list, publi:publi, beast:beast, tags:tags});
		}
	});
}


function getAvatar(game, callback) {
	play.getData(game, function(gameData){
		var list = {};
		var sess = session.list[game];
		if (sess && gameData) {
			for (var a in gameData.all.beast.items) {
				list[a] = 1;
			}
			for (var user in sess.players) {
				if (sess.players[user].data.avatar in list) {
					delete list[sess.players[user].data.avatar];
				}
			}
			callback({dispo:list, def:gameData.all.beast.src});
		}
	});
}
function gameAvatar(game) {
	getAvatar(game, function(dict) {
		sendConnected(game, 'gameAvatar', {game:game, def:dict.def, list:dict.dispo});
	});
}
