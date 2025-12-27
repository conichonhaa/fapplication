"use strict";
var webSocketsServerPort = 1664;
var webSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response){});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
var wsServer = new webSocketServer({
    httpServer: server
});

var refreshIntervalId = null;
var refreshIntervalDelay = 5000;

var clients = {};
clients.list = {};
clients.pid = 0;
clients.dateBegin = new Date();

function makeConnected(appli,attr) {
    if (!attr) attr = 'usr';
	var users = [ ];
	for (var i in clients.list) {
		if (clients.list[i].appli==appli) users.push(clients.list[i][attr]);
	}
	return users;
}
function sendConnected(appli, type, data) {
	var json = JSON.stringify({ type: type, data: data });
	for (var i in clients.list) {
		if (!appli || clients.list[i].appli==appli || 
		(type=='chatMessage' && clients.list[i].chatWorld && getWorldApp(appli)==getWorldApp(clients.list[i].appli))) 
			clients.list[i].send(json);
	}
}
function shuffle(a) {
    for (let i=a.length; i; i--) {
        let j = Math.floor(Math.random()*i);
		let ok = Math.random()-0.5;
        if (ok>0) [a[i-1], a[j]] = [a[j], a[i-1]];
    }
}
var colorsDefaut = ['#A3080B','#831D99','#07910D','#252CA1','#4ECCCC','#F59107','#F5EC67','#8BF0A3','#020302','#838F18','#FF0349','#C2C2C2','#F5A9A9'];
function makeColor(list,tcolors) {
	if (!tcolors) tcolors = colorsDefaut.slice();
	var colors = tcolors.slice();
	var l = [];
	for (var p=0; p<list.length; p++) {
		var a = Math.floor(Math.random()*colors.length);
		l.push(colors[a]);
		colors.splice(a,1);
		if (colors.length==0) colors = tcolors.slice();
	}
	return l;
}


// DEBUG
function countObj(obj) {
	var nb = 0;
	for (var i in obj) {
		nb++;
	}
	return nb;
}
function getDelai(obj) {
	var d = (new Date()).getTime();
	var t = 0;
	if (obj.length>0 && obj[0].time) t = d-obj[0].time;
	return t;
}
function getVar(conn) {
    var obj = {};
	obj.history = {tot:history.list.length, time:getDelai(history.list), pid:history.pid};
	obj.game = {tot:countObj(game.list), app:game.appli, pid:game.pid};
	obj.game.list = "";
	for (var i in game.list) {
		obj.game.list += "<br>-"+game.list[i].ng+" : "
			+makeConnected(game.list[i].ng,'playerpid').length+"/"
			+makeConnected(game.list[i].ng).length;
		if (game.list[i].started) obj.game.list += " (started)";
	}
	
	var json = JSON.stringify({ type: 'debugVar', data: obj });
	conn.send(json);
}
function getNbConn(conn) {
    var d = (new Date()).getTime();
	var nb = {tot:0, date:clients.dateBegin, time:d-clients.dateBegin.getTime(), conns:{} };
	var tot = 0;
	for (var i in clients.list) {
		if (clients.list[i].appli) var appli = clients.list[i].appli;
		else var appli = clients.list[i].origin + "/inconnu";
		if (!(appli in nb.conns)) {
			nb.conns[appli] = {tot:0, list:[]};
		}
		nb.conns[appli].tot++;
		var obj = {usr:clients.list[i].usr, actu:d-clients.list[i].actu, time:d-clients.list[i].time};
		if (clients.list[i].fap) obj.fap = true;
		nb.conns[appli].list.push(obj);
		nb.tot++;
	}
	var json = JSON.stringify({ type: 'debug', data: nb });
	conn.send(json);
}


// CHAT
var history = {};
history.list = [];
history.delay = 1000*60*60*24;
history.pid = 0;
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function getWorldApp(appli) {
	var t = appli.split('/');
	var world = "";
	for (var i=0; i<t.length-1; i++) {
		world += t[i]+"/";
	}
	return world;
}


// GAME
var game = {};
game.list = {};
game.pid = 0;
function delGame(pid) {
	sendConnected(game.list[pid].appli, 'gameOff', game.list[pid]);
	game.list[pid].started = true;
	if (makeConnected(game.list[pid].ng).length==0) {
		delete game.list[pid];
		clearTimeout(timerNextPlayer[pid]);
		delete timerNextPlayer[pid];
	}
}
function setDataGame(pid,lib,value) {
	if (game.list[pid]) {
		game.list[pid].datapid++;
		var data = {lib:lib, value:value, pid:game.list[pid].datapid};
		game.list[pid].data.push(data);
		return data;
	}
}
function getDataGame(pid,conn,datapid) {
	if (game.list[pid]) {
		for (var d=0; d<game.list[pid].data.length; d++) {
			if (!datapid || game.list[pid].data[d].pid>datapid) {
				var json = JSON.stringify({type:'gameData', data:game.list[pid].data[d]});
				conn.send(json);
			}	
		}
	}
}
function makeConnectedGame(pid) {
	var list = [];
	for (var i in clients.list) {
		if (clients.list[i].ownerGame==pid) {
			var data = {usr:clients.list[i].usr, pid:clients.list[i].playerpid};
			list.push(data);
		}
	}
	return list;
}
var timerNextPlayer = {};
function nextPlayerGame(pid,init) {
	if (game.list[pid]) {
		clearTimeout(timerNextPlayer[pid]);
		if (init) game.list[pid].playerActif = -1;
		game.list[pid].playerActif++;
		if (game.list[pid].playerActif>=game.list[pid].listPlayer.length) game.list[pid].playerActif = 0;
		var data = {lib:'activePlayer', value:game.list[pid].playerActif, timer:game.list[pid].timerDelay};
		sendConnected(game.list[pid].ng,'gameData',data);
		timerNextPlayer[pid] = setTimeout(function(){nextPlayerGame(pid);},game.list[pid].timerDelay);
	}
}
function tempoGame(pid) {
	if (game.list[pid]) {
		clearTimeout(timerNextPlayer[pid]);
		var data = {lib:'activePlayer', value:-1, all:1, time:new Date().getTime()};
		sendConnected(game.list[pid].ng,'gameData',data);
		timerNextPlayer[pid] = setTimeout(function(){tempoGame(pid);},game.list[pid].timerTempo);
	}
}

wsServer.on('request', function(request) {
    // console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
	
	var connection = request.accept(null, request.origin);
	connection.send(JSON.stringify({ type: 'serverActivity', data: refreshIntervalDelay }));
	clients.pid++;
	var index = clients.pid;
	clients.list[index] = connection;
	var d = (new Date()).getTime();
	clients.list[index].actu = d;
	clients.list[index].time = d;
	clients.list[index].origin = request.origin;

	connection.on('message', function(message) {
		if (message.type=='utf8') {
			try {
				var obj = JSON.parse(message.utf8Data);
			} catch (e) {
				console.log("'This doesn't look like a valid JSON: ", message.utf8Data);
				return;
			}
			var d = (new Date()).getTime();
			clients.list[index].actu = d;

			if (obj.type=='user') {
				clients.list[index].appli = obj.appli;
				clients.list[index].usr = obj.usr;
				if (obj.fap) clients.list[index].fap = true;
				var users = makeConnected(obj.appli);
				sendConnected(obj.appli, 'users', users);
			}
			
			//DEBUG
			if (obj.type=='debug') {
				getNbConn(connection);
				getVar(connection);
			}
			
			// CHAT
			if (obj.type=='chatDelai') {
				while (history.list.length>0 && d-history.list[0].time>history.delay) {
					history.list.shift();
				}
				clients.list[index].chatWorld = obj.chatWorld;
				for (var i=0; i<history.list.length; i++) {
					if (d-history.list[i].time<obj.delai 
							&& (history.list[i].appli==clients.list[index].appli 
								|| (clients.list[index].chatWorld && getWorldApp(history.list[i].appli)==getWorldApp(clients.list[index].appli))
								)
							&& (!obj.pid || obj.pid<history.list[i].pid)) {
						var json = JSON.stringify({ type: 'chatMessage', data: history.list[i] });
						clients.list[index].send(json);
					}
				}
			}
			if (obj.type=='chatMessage') {
				history.pid++;
				var data = {usr:clients.list[index].usr, message:htmlEntities(obj.data), time:d, pid:history.pid};
				if (obj.ia) data.ia = true;
				sendConnected(clients.list[index].appli, 'chatMessage', data);
				data.appli = clients.list[index].appli;
				history.list.push(data);
			}
			if (obj.type=='chatWriting') {
				var data = {usr: clients.list[index].usr, on: obj.data };
				sendConnected(clients.list[index].appli, 'chatWriting', data);
			}
			
			// GAME
			if (obj.type=='gameInit') {
				for (var i in game.list) {
					if (game.list[i].appli==clients.list[index].appli && (!obj.pid || obj.pid<game.list[i].pid) && !game.list[i].started) {
						var json = JSON.stringify({ type:'gameDispo', data:game.list[i], list:makeConnected(game.list[i].ng) });
						clients.list[index].send(json);
					}
				}
			}
			if (obj.type=='gameNew') {
				game.pid++;
				var ng = clients.list[index].appli+'_'+game.pid;
				var data = {usr:clients.list[index].usr, ng:ng, pid:game.pid};
				sendConnected(clients.list[index].appli, 'gameDispo', data);
				data.appli = clients.list[index].appli;
				data.data = [];
				data.datapid = 0;
				data.playerpid = 0;
				game.list[game.pid] = data;
				var json = JSON.stringify({ type:'gameNew', game:ng, pid:game.pid });
				clients.list[index].send(json);
				clients.list[index].ownerGame = game.pid;
			}	
			if (obj.type=='gameJoin') {
				if (game.list[obj.pid]) {
					var appliGame = obj.appli+"_"+obj.pid;
					var isConn = false;
					if (!obj.multiple) {
						for (var c in clients.list) {
							if (clients.list[c].appli==appliGame && clients.list[c].usr==clients.list[index].usr) {
								isConn = true;
								break;
							}
						}
					}
					if (isConn) {
						var json = JSON.stringify({ type:'gameRefuse', motif:"Déjà dans la partie" });
						clients.list[index].send(json);
					} else {
						var playerpid = null;
						if (!obj.playerpid) {
							game.list[obj.pid].playerpid++;
							playerpid = game.list[obj.pid].playerpid;
						} else 
							playerpid = obj.playerpid;
						clients.list[index].playerpid = playerpid;
						var appli = clients.list[index].appli;
						clients.list[index].appli = appliGame;
						var json = JSON.stringify({ type:'gameJoin', appli:appliGame, pid:obj.pid, playerpid:playerpid });
						clients.list[index].send(json);				
						sendConnected(appli, 'users', makeConnected(appli));
						sendConnected(appliGame, 'users', makeConnected(appliGame));
						clients.list[index].quitMessage = 'a quitté la partie';
						clients.list[index].ownerGame = obj.pid;
						getDataGame(obj.pid,clients.list[index],obj.datapid);
						var data = {pid:obj.pid,list:makeConnected(appliGame)};
						sendConnected(game.list[obj.pid].appli, 'gamePlayer', data);
						if (obj.multiple) {
							var data = {usr:clients.list[index].usr};
							sendConnected(appliGame, 'gameNoScore', data);
						}
					}
				} else {
					var json = JSON.stringify({ type:'gameRefuse', motif:"La partie n'existe plus" });
					clients.list[index].send(json);
				}
			}
			if (obj.type=='gameStart') {
				var pid = clients.list[index].ownerGame;
				var list = makeConnectedGame(pid);
				shuffle(list);	
				shuffle(obj.pos);
				var colors = makeColor(list,obj.colors);
				for (var l=0; l<list.length; l++) {
					list[l].color = colors[l];
					list[l].pos = obj.pos[l];
				}
				var data = {list:list};
				sendConnected(clients.list[index].appli, 'gameStart', data);
				delGame(pid);	
				game.list[pid].listPlayer = list;
				game.list[pid].started = true;
				if (obj.timerDelay) {
					game.list[pid].timerDelay = obj.timerDelay;
					timerNextPlayer[pid] = setTimeout(function(){nextPlayerGame(pid,true);},obj.timerStart);	
				}
				if (obj.timerTempo) {
					game.list[pid].timerTempo = obj.timerTempo;
					timerNextPlayer[pid] = setTimeout(function(){tempoGame(pid);},obj.timerStart);	
				}
				if (obj.gameServer) {
					game.list[pid].gameServer = require('./fap_modules/'+obj.gameServer);
					game.list[pid].gameBoard = game.list[pid].gameServer.start(obj.board,list);					
				}
			}
			if (obj.type=='gameNextPlayer') {
				var pid = clients.list[index].ownerGame;
				if (obj.timerDelay) {
					clearTimeout(timerNextPlayer[pid]);
					clients.list[index].nextPlayer = true;
				} else {
					nextPlayerGame(pid);
					clients.list[index].nextPlayer = false;
				}
			}
			if (obj.type=='gameGet') {
				var pid = clients.list[index].ownerGame;
				if (game.list[pid].gameServer) {
					var data = game.list[pid].gameServer.getData(game.list[pid].gameBoard,clients.list[index].playerpid);
					var json = JSON.stringify({ type: 'gameTempo', data: data });
					clients.list[index].send(json);
				}
			}
			if (obj.type=='gameData') {
				var data = setDataGame(clients.list[index].ownerGame, obj.data.lib, obj.data.value);
				sendConnected(clients.list[index].appli, 'gameData', data);
				var pid = clients.list[index].ownerGame;
				if (obj.data.lib=='capture' && game.list[pid].gameServer) {
					game.list[pid].gameServer.setData(game.list[pid].gameBoard,obj.data.value);
				}
			}
			if (obj.type=='gameEnd') {
				var pid = clients.list[index].ownerGame;
				clearTimeout(timerNextPlayer[pid]);
				if (game.list[pid].gameServer) {
					game.list[pid].gameServer.end(game.list[pid].gameBoard);
				}
			}
			
			
		}
	});
	connection.on('close', function() {
		if (index>=0) {
            var appli = clients.list[index].appli;
			var memo = {};
			if (clients.list[index].ownerGame) 
				memo.game = clients.list[index].ownerGame;
			if (clients.list[index].nextPlayer) 
				memo.nextPlayer = clients.list[index].ownerGame;
			if (clients.list[index].quitMessage)
				memo.data = {usr:clients.list[index].usr, message: clients.list[index].quitMessage, type:'chatMessage', ia:true};
			delete clients.list[index];
			
			var users = makeConnected(appli);
			sendConnected(appli, 'users', users);
			//if (memo.nextPlayer) delGame(memo.nextPlayer);
			if (memo.game) delGame(memo.game);
			if (memo.data) sendConnected(appli, memo.data.type, memo.data);
        }
    });
	
	clearInterval(refreshIntervalId);
	refreshIntervalId = setInterval(function() {
		sendConnected(null, 'serverActivity', refreshIntervalDelay);
	}, refreshIntervalDelay);	
});

