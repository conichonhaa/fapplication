var refreshIntervalId = null;
var refreshIntervalDelay = 5000;
var connection = null;
var delayRetry = {list:[5, 30, 60], index:0};
var chatWorld = false;
var chatDelai = 5*60*1000;
var pid = null;
var datapid = null;
var playerpid = null;
var timerActivity = null;
var gameId = null;
var gameListPlayer = {};
var playerActif = null;
var tempoGame = null;


function getNom(usr) {
	var d = document.getElementById('usrNom_'+usr);
	var nom = usr;
	if (d) nom = d.innerHTML;
	return nom;
}

function loadServer() {
	"use strict";
	var info = document.getElementById('info');
	info.innerHTML = "<img src='images/roue.gif' style='height:20px;' />";
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	if (!window.WebSocket) {
		info.innerHTML = "Désolé, ton navigateur ne supporte pas les WebSockets";
	}
	
	var chatSaisie = document.getElementById('chatSaisie');
	var chatContent = document.getElementById('chatContent');
	var newGame = document.getElementById('newGame');
	var dispoGame = document.getElementById('dispoGame');
	var createGame = document.getElementById('createGame');
	var showGame = document.getElementById('showGame');
	var pitchGame = document.getElementById('pitchGame');
	var waitGame = document.getElementById('waitGame');
	var messErr = "Serveur indisponible : <input type='button' value='Retry' onclick='loadServer();' />"
		+ " <span id='affDelayRetry'></span>";
	if (delayRetry.index<delayRetry.list.length) delayRetry.tot = delayRetry.list[delayRetry.index];
	else delayRetry.tot = false;

	var s='';
	if (document.location.protocol=='https:') s = 's';
	//connection = new WebSocket('ws'+s+'://'+document.location.hostname+':'+wsPort);
	connection = new WebSocket('ws'+s+'://'+document.location.hostname+'/wss');
	connection.onopen = function () {
		info.innerHTML = "";
		chatSaisie.disabled = false;
		connection.send(JSON.stringify(wsUserConn));
		if (gameId) {
			joinGame(gameId);
		} else {
			initGame();
		}
		delayRetry.index = 0;
		delayRetry.tot = delayRetry.list[delayRetry.index];
	};
	connection.onerror = function (error) {
		info.innerHTML = messErr;
		chatSaisie.disabled = true;
		newGame.innerHTML = "";
		dispoGame.innerHTML = "";
		delayRetry.time = new Date().getTime();
		setDelayRetry();
	};
	connection.onmessage = function (message) {
		try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log("'This doesn't look like a valid JSON: ", message.data);
            return;
        }
		if (json.type=='users') {
			var users = json.data;
			var txt = "<div><b>Online ("+users.length+"):</b></div>";
			for (var u=0; u<users.length; u++) {
				txt += "<div>"+getNom(users[u])+"</div>";
			}
			if (waitGame) waitGame.innerHTML = txt;
			gameListPlayer.nbPlayers = users.length;
			var jouer = document.getElementById('jouerButton');
			if (jouer) {
				if (users.length>1) {
					jouer.disabled = false;
					jouer.style.opacity = '';
				} else {
					jouer.disabled = true;
					jouer.style.opacity = '0.5';
				}
			}
		}
		if (json.type=='serverActivity') {
			timerActivity = new Date().getTime() + json.data + refreshIntervalDelay;
		}			
		
		if (json.type=='chatMessage') {
			if (chatContent) addMessage(getNom(json.data.usr), json.data.message, '#000000', json.data.ia);
		}
		
		if (json.type=='gameDispo') {
			var usr = json.data.usr;
			var nb = "";
			if (json.list) nb  = json.list.length;
			if (usr!=myUsr || gamePlayerMultiple) {
				var txt = "<div id='gameDispo_"+json.data.pid+"' >"+getNom(json.data.usr);
				txt += ": <input type='button' value='Rejoindre' onclick='joinGame("+json.data.pid+")' />";
				txt += " (<span id='gamePlayer_"+json.data.pid+"'>"+nb+"</span>)</div>";
				dispoGame.innerHTML += txt;
			}
			pid = json.data.pid;
		}
		if (json.type=='gamePlayer') {
			var d = document.getElementById("gamePlayer_"+json.data.pid);
			if (d) d.innerHTML = json.data.list.length;
		}		
		if (json.type=='gameOff') {
			var d = document.getElementById("gameDispo_"+json.data.pid);
			if (d) d.parentNode.removeChild(d);
		}		
		if (json.type=='gameNew') {
			newGame.innerHTML = "";
			dispoGame.innerHTML = "";
			joinGame(json.pid);
			var txt = "<div><input type='button' value='Jouer' onclick='startGame();' id='jouerButton' /></div>";
			// worm
			if (gameSelected=='worm') {
				txt += makeCreateGameWorm();
				genererPhysicWorm();
			}
			//arena
			if (json.gameName=='arena') {
				
			}
			createGame.innerHTML = txt;
				
		}		
		if (json.type=='gameJoin') {
			gameId = json.pid;
			playerpid = json.playerpid;
			if (newGame) newGame.innerHTML = "";
			if (dispoGame) dispoGame.innerHTML = "";
			if (showGame) showGame.innerHTML = "<div id='svgMiniature' style='width:200px;margin:auto;'></div>";
			if (pitchGame) pitchGame.innerHTML = "";
			chatContent.innerHTML = "";
			var obj = {type:'chatDelai', delai:chatDelai};
			connection.send(JSON.stringify(obj));
			var obj = {type:'chatMessage', data:'a rejoint la partie', ia:true };
			connection.send(JSON.stringify(obj));
		}	
		if (json.type=='gameRefuse') {
			if (createGame) createGame.innerHTML = "";
			if (showGame) showGame.innerHTML = "";
			var txt = json.motif + " <img src='images/roue.gif' style='height:20px;' />";
			if (newGame) {
				newGame.innerHTML = txt;
				setTimeout(function(){initGame();},2000);
			} else {
				document.getElementById('divGame').innerHTML = txt;
				setTimeout(function(){document.location.reload();},2000);
			}
		}
		if (json.type=='gameNoScore') {
			if (myUsr=json.data.usr) {
				gameScoring = 0;
				if (dispoGame) dispoGame.innerHTML = "Score désactivé";
			}
		}
		if (json.type=='gameStart') {
			gameListPlayer.list = json.data.list;
			gameListPlayer.actif = json.data.list.length;
			menage('divGame');
		}		
		if (json.type=='gameData') {
			var data = data;
			// console.log(json.data, datapid);
			if (json.data) {
				datapid = json.data.pid;
				if (json.data.lib=='activePlayer') {
					activePlayer(json.data);
				}			
				if (json.data.lib=='function') {
					setTimeout(json.data.value,0);
				}
				// worm
				if (json.data.lib=='valueGroundWorm') {
					valueGroundWorm = json.data.value;
				}
				if (json.data.lib=='affMiniatureWorm') {
					genererTerrainWorm('svgMiniature');
					creerCartoucheWorm('showGame');
				}
			}
		}	
		if (json.type=='gameTempo') {
			tempoGame = null;
			setDataArena(json.data);
		}
		
    };
	
	chatSaisie.addEventListener('keydown', saisieDown, false);
	function saisieDown(ev) {
        if (ev.keyCode === 13) {
			var obj = {type:'chatMessage', data:chatSaisie.value};
			connection.send(JSON.stringify(obj));
            chatSaisie.value = "";
        }
    }
	function addMessage(author, message, color, ia) {
		var italic = "";
		if (ia) italic = 'font-style:italic;';
		var text = "<div class='chatElt' style='"+italic+"' ><span style='color:"+color+";font-weight:bold;font-size:80%;'>"
			+author+":</span> "+message+'</div>';
		chatContent.innerHTML += text;
		chatContent.scrollTop = chatContent.scrollHeight;
    }
	
	clearInterval(refreshIntervalId);
	refreshIntervalId = setInterval(function() {
		if (connection.readyState!==1 && info.innerHTML=="" || timerActivity && timerActivity<new Date().getTime()) {
			info.innerHTML = messErr;
			chatSaisie.disabled = true;
			if (newGame) newGame.innerHTML = "";
			if (dispoGame) dispoGame.innerHTML = "";
			clearInterval(refreshIntervalId);
			connection = null;
			delayRetry.time = new Date().getTime();
			setDelayRetry();
		}
	}, refreshIntervalDelay);
}

function setDelayRetry() {
	if (delayRetry.tot && document.getElementById('affDelayRetry')) {
		var d = new Date().getTime();
		var delai = delayRetry.tot - Math.round((d - delayRetry.time)/1000);
		if (delai>0) {
			document.getElementById('affDelayRetry').innerHTML = delai + "s";
			setTimeout(function(){setDelayRetry();},1000);
		} else {
			loadServer();
			delayRetry.index = delayRetry.index + 1;
		}
	}
}
function changeChatWorld(elt) {
	if (chatWorld) {
		elt.src = "images/local.png";
		chatWorld = false;
	} else {
		elt.src = "images/world.png";
		chatWorld = true;
	}
	if (connection) {
		document.getElementById('chatContent').innerHTML = "";
		var obj = {type:'chatDelai', delai:chatDelai, chatWorld:chatWorld};
		connection.send(JSON.stringify(obj));
	}
}
function callPlayerGame() {
	var fd = new FormData();
	fd.append('networkCall',gameSelected);
	fd.append('type','game');
	fd.append('page','');
	fd.append('action','getNetworkCall();');
	glbSendForm(fd);
}

function initGame() {
	if (connection) {
		document.getElementById('newGame').innerHTML = "";
		document.getElementById('dispoGame').innerHTML = "";
		document.getElementById('createGame').innerHTML = "";
		document.getElementById('showGame').innerHTML = "";	
		var obj = {type:'gameInit'}
		connection.send(JSON.stringify(obj));
		document.getElementById('newGame').innerHTML = "<input type='button' value='créer une partie' onclick='startNewGame()' />";
		document.getElementById('chatContent').innerHTML = "";
		var obj = {type:'chatDelai', delai:chatDelai};
		connection.send(JSON.stringify(obj));
	}
}
function startNewGame() {
	if (connection) {
		var obj = {type:'gameNew'};
		connection.send(JSON.stringify(obj));
	}
}
function joinGame(pid) {
	if (connection) {
		var obj = {type:'gameJoin', appli:wsUserConn.appli, pid:pid, datapid:datapid, playerpid:playerpid, multiple:gamePlayerMultiple};
		connection.send(JSON.stringify(obj));
	}
}
function startGame() {
	if (connection) {
		var obj = {type:'gameStart'};
		var l = [];
		
		for (var i=0; i<gameListPlayer.nbPlayers; i++) {
			// worm
			if (gameSelected=='worm') {
				l.push(i);
			}		
			// arena
			if (gameSelected=='arena') {
				l.push(i);
			}
		}
		obj.pos = l;	
		if (gameSelected=='worm') {
			obj.timerDelay = 30000;
			obj.timerStart = 2000;
		}
		if (gameSelected=='arena') {
			obj.board = {nbPixH:nbPixH, nbPixW:nbPixW, 
					valueGroundArena:valueGroundArena,
					physicsGroundArena:physicsGroundArena				
					}
			// obj.timerStart = 500;
			obj.gameServer = gameSelected;
		}
		connection.send(JSON.stringify(obj));
	}
}
function sendDataGame(lib,value) {
	if (connection) {
		var obj = {type:'gameData', data:{lib:lib, value:value} };
		connection.send(JSON.stringify(obj));	
	}
}
function getGame() {
	if (connection) {
		if (!tempoGame) {
			tempoGame = new Date().getTime();
			var obj = {type:'gameGet'};
			connection.send(JSON.stringify(obj));
		}
	}
}
function endGame() {
	if (connection) {
		var obj = {type:'gameEnd'};
		connection.send(JSON.stringify(obj));
	}
}

function resizeGame() {
	var div = document.getElementById('divGame');
	if (div) {
		var ht = div.parentNode.getBoundingClientRect().height;
		div.style.height = ht + 'px';
	}
	var div = document.getElementById('divChat');
	if (div) {
		var ht = div.parentNode.getBoundingClientRect().height;
		div.style.height = ht + 'px';
	}
}
function resizeChat() {
	var div = document.getElementById('chatContent');
	if (div) {
		var h = document.getElementById('chatSaisie').getBoundingClientRect().height;
		var ht = div.parentNode.getBoundingClientRect().height;
		div.style.height = ht-h + 'px';
	}
}
function affChat(elt) {
	var div = document.getElementById('divChat');
	if (div) {
		if (div.style.display=='none') {
			div.style.display = 'inline-block';
			document.getElementById('divGame').style.width = '';
			elt.innerHTML = '&lt;';
		} else {
			div.style.display = 'none';
			document.getElementById('divGame').style.width = '100%';
			elt.innerHTML = '&gt;';
		}
	}
}
function nextPlayer(end) {
	if (gameListPlayer.list[gameListPlayer.actif].pid==playerpid) {
		var obj = {type:'gameNextPlayer' };
		if (gameSelected=='worm' && !end) {
			obj.timerDelay = 30000;
			sendDataGame('function','creerBullet();');
			clearTimeout(timerDelayNextTurn);
		}
		connection.send(JSON.stringify(obj));
	}
}
function activePlayer(obj) {
	var i = obj.value;
	if (obj.all) {
		for (var c=0; c<gameListPlayer.list.length; c++) {
			if (gameListPlayer.list[c].pid==playerpid) i = c;
		}
	}
	gameListPlayer.actif = i;
	var gl = gameListPlayer.list[i];
	if (gameSelected=='worm') {
		if (sonActive && sons.game_wormPressure && sons.game_wormPressure.actif) {
			if (!sons.game_wormPressure.load.paused) {
				sons.game_wormPressure.load.pause();
				sons.game_wormPressure.load.currentTime = 0;
			}
		}
		deletePower();
		objGame = document.getElementById("pion_"+gl.pid);
		if (objGame.dead) nextPlayer(true);
		else if (gl.pid==playerpid) {
			affectPower();
			document.getElementById('infoTank').innerHTML = 0;
		}
	}
	if (gameSelected=='arena') {
		objGame = document.getElementById("pion_"+gl.pid);
	}
	isStarted = true;
	var d = document.getElementById('infoPlayer');
	if (d) {
		var txt = "<div style='width:20px;background-color:"+gl.color+";display:inline-block'>&nbsp;</div>";
			txt += " "+getNom(gl.usr);
		d.innerHTML = txt;
	}
	var d = document.getElementById('divInfoGame');
	if (d) {
		if (gl.pid==playerpid) d.style.opacity = '';
		else d.style.opacity = '0.3';
	}
	if (gameSelected=='worm') {
		obj.time = new Date().getTime();
		setDelayNextTurn(obj);
	}
}

function shuffle(a) {
    for (let i=a.length; i; i--) {
        let j=Math.floor(Math.random()*i);
        [a[i-1], a[j]] = [a[j], a[i-1]];
    }
}
var timerDelayNextTurn = null;
function setDelayNextTurn(obj) {
	clearTimeout(timerDelayNextTurn);
	var d = document.getElementById('infoTimer');
	if (d && obj.timer) {
		var t = new Date().getTime();
		var delai = Math.round((obj.timer - (t - obj.time))/1000);
		if (delai>0) {
			d.innerHTML = delai + "s";
			timerDelayNextTurn = setTimeout(function(){setDelayNextTurn(obj);},1000);
			if (delai==5) {
				if (sonActive && sons.game_wormPressure && sons.game_wormPressure.actif) {
					if (!sons.game_wormPressure.load.paused) {
						sons.game_wormPressure.load.pause();
						sons.game_wormPressure.load.currentTime = 0;
					}
					sons.game_wormPressure.load.play();
				}
			}
		}
	}
	
}


// worm
function makeCreateGameWorm() {
	var txt = "<div style='font-size:90%;margin-top:10px;'><b>Changer les paramètres : </b><div id='divPhysicsGroundWorm'>";
	for (var phys in physicsGroundWorm) {
		txt += "<div><b>"+physicsGroundWorm[phys].nom+" : </b>";
		for (var i=0; i<physicsGroundWorm[phys].list.length; i++) {
			var c = "";
			if (i==physicsGroundWorm[phys].def) {
				c = "checked";
				physicsGroundWorm[phys].choix = physicsGroundWorm[phys].list[i];
			}
			if (i>2) c += " disabled";
			txt += "<div class='eltBtnRadio'><input type='radio' value='"+physicsGroundWorm[phys].list[i]+"' id='"+phys+i+"' name='"+phys+"' "+c+" />"
					+ "<label for='"+phys+i+"'> &nbsp; "+physicsGroundWorm[phys].list[i]+"</label></div>";
		}
		txt += "</div>";
	}
	txt += "</div><input type='button' value='générer' onclick='genererPhysicWorm();' />"
			+ " &nbsp; <input type='checkbox' id='physAlea' onchange='showPhysicsGroundWorm(this)' /><label for='physAlea'> Aléatoire</label></div>";
	return txt;
}
function showPhysicsGroundWorm(elt) {
	var div = document.getElementById('divPhysicsGroundWorm');
	if (elt.checked) div.style.display = 'none';
	else div.style.display = 'block';
}
function genererPhysicWorm() {
	if (connection) {
		var alea = document.getElementById('physAlea');
		for (var phys in physicsGroundWorm) {
			var radios = document.getElementsByName(phys);
			if (alea && alea.checked) {
				var a = Math.floor(Math.random()*radios.length);
				if (a>2) a = 1;
				radios[a].checked = true;
			}
			for (var i=0; i<radios.length; i++) {
				if (radios[i].checked) physicsGroundWorm[phys].choix = radios[i].value;
			}
		}
		creerAltitudeWorm();
		creerVentWorm();
		creerGraviteWorm();
		sendDataGame('valueGroundWorm',valueGroundWorm);
		sendDataGame('affMiniatureWorm',null);
	}
}


