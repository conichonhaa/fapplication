"use strict";
var fs = require('fs');
var async = require('async');

module.exports = {
	loadData: loadData,
	setData: setData,
	getData: getData,
	setTeam: setTeam,
	swithPlayer: swithPlayer,
	gameRoundStart: gameRoundStart,
	gameRoundEnd: gameRoundEnd,
	gameCave: gameCave,
	getOrderCaved: getOrderCaved,
	gameTrick: gameTrick,
	gameResolve: gameResolve,
	gameResolveUser: gameResolveUser,
	gameTrickPostSolve: gameTrickPostSolve,
	takeTrick: takeTrick,
	throwTrick: throwTrick,
	throwTrickWait: throwTrickWait,
	solveTrick: solveTrick,
	gameDiscard: gameDiscard,
	gameFinish: gameFinish,
	gameKill: gameKill,
	gameGet: gameGet,
	takeDice: takeWheel,
	throwDice: throwDice,
	getTrick: getTrick,
	getOrgan: getOrgan,
	getDose: getDose,
	organDispo: organDispo,
	takeWheel: takeWheel,
	throwWheel: throwWheel,
	throwWheelWait: throwWheelWait,
	solveWheel: solveWheel,
	askDiscard: askDiscard,
	cardDiscard: cardDiscard,
	shuffle: shuffle
};	

function loadData(callback) {
	var as = {};
	var list = ['global','trick','beast','wheel','organ','dose','dice','local','bot','cheat'];
	list.forEach(function(code){
		as[code] = function(callback){
			readJSONFile(code, function(json){
				callback(null, json);
			});	
		};
	});
	async.auto(as, function (err, res) {
		callback(res, list);
	});
}
function loadDataGame(nb, callback) {
	var gameData = {};
	loadData(function(res, list){
		gameData.listColor = listColor();
		gameData.all = res;
		gameData.possible = {};
		gameData.stock = {};	
		gameData.deck = {};
		list.forEach(function(code){
			if (res[code] && res[code].items) {
				gameData.possible[code] = [];
				for (var o in res[code].items) {
					if ('nb' in res[code].items[o]) {
						for (var i=0; i<res[code].items[o].nb; i++) {
							gameData.possible[code].push(o);
						}
					} else {
						gameData.possible[code].push(o);
					}
				}
				if (res[code].shuffle) shuffle(gameData.possible[code]);
			}
		});
		gameData.stock.dose = res.dose.stock*nb;
		gameData.stock.organ = {};
		for (var o in res.organ.items) {
			gameData.stock.organ[o] = [];
			for (var f in res.organ.frames) {
				var max = nb;
				if ('nb' in res.organ) max = max*res.organ.nb;
				if ('nb' in res.organ.frames[f]) max = max*res.organ.frames[f].nb;
				for (var i=0; i<max; i++) {
					gameData.stock.organ[o].push({'type':'organ', 'code':o, 'effect':f});
				}
			}
			shuffle(gameData.stock.organ[o]);
		}
		gameData.stock.trick = [];
		gameData.possible.trick.forEach(function(o){
			gameData.stock.trick.push({'type':'trick', 'code':o});
		});
		// mode try
		if (gameData.all.global.hidedParams.try) {
			gameData.stock.trick = [];
			for (var o in res.trick.items) {
				if ('try' in res.trick.items[o]) {
					for (var i=0; i<res.trick.items[o].try; i++) {
						gameData.stock.trick.push({'type':'trick', 'code':o});
					}
				}
			}
		}
		shuffle(gameData.stock.trick);
		gameData.stock.garbage = [];
		gameData.round = {};
		gameData.resolutionMode = 'order';
		callback(gameData);
	});
}	
	

var gameDatas = {};
	gameDatas.list = {};
	gameDatas.pid = 0;
function setData(game, nb, callback, p) {
	loadDataGame(nb, function(gameData){
		if (p) {
			if (p.deck) gameData.deck = p.deck;
			if (p.players) gameData.players = p.players;
			if (p.teams) gameData.teams = p.teams;
			if (p.possiblePlayer) gameData.possible.player = p.possiblePlayer;
			if (p.params) {
				for (var code in p.params) {
					gameData.all.global.params[code].value = p.params[code];
				}
			}
		}
		if (!gameData.all.global.params.tricked.value) gameData.stock.trick = [];
		gameDatas.list[game] = gameData;
		callback();
	});
}
function getData(game, callback) {
	callback(gameDatas.list[game]);
}
function setTeam(game, data, callback) {
	var gameData = gameDatas.list[game];
	if (data.player) gameData.players.items[data.playerName].team = data.team;
	if (data.player) gameData.players.ids[data.player].team = data.team;
	if (data.color) gameData.teams[data.team].color = data.color;
	callback({players:gameData.players, teams:gameData.teams});
}
function swithPlayer(game, data, callback) {
	var gameData = gameDatas.list[game];
	if (data.id in gameData.deck) {
		var player = gameData.players.ids[data.id].name;
		gameData.players.items[player].bot = data.bot;
	}
	callback({players:gameData.players});
}



function State() {
    this.state = false;
	this.change = function(s) {
		if (typeof this.onChange === "function") {
			if (s!=this.state) setTimeout(this.onChange, 1);
        }
		this.state = s;
        return this.state;
    }
}
function waitForResponse(game, check, delay, callback) {
	var waiting = new State();
	waiting.onChange = function() {
		clearTimeout(waiting.autoTimeout);
		clearTimeout(waiting.checkTimeout);
		callback();
	}
	var isReady = function(game, check, callback) {
		try {
			if (check(game)) {
				callback();
			} else {
				clearTimeout(waiting.checkTimeout);
				waiting.checkTimeout = setTimeout(function(){
					isReady(game, check, callback);
				}, 2000);
			}
		} catch (e) {
			console.log(e);
			callback();
		}
	}
	isReady(game, check, function(){
		waiting.change(true);
	});
	waiting.autoTimeout = setTimeout(function(){
		waiting.change(true);
	},delay*1000);
}


// debut et fin de tour
function gameRoundStart(game, callback) {
	var gameData = gameDatas.list[game];
	if (!gameData.round.count) {
		gameData.round.count = 0;
		gameData.round.order = Object.keys(gameData.deck);
		gameData.round.nbFinish = gameData.possible.organ.length;
		gameData.round.finish = false;
	}
	gameData.round.cave = {players:{}};
	gameData.round.first = [];
	gameData.round.solve = {list:null};
	gameData.round.discard = {players:{}};
	gameData.round.tricks = [];
	gameData.round.tricking = null;
	gameData.round.count++;
	gameData.round.phase = 'caving';
	for (var id in gameData.deck) {
		delete gameData.deck[id].wheel;
		delete gameData.deck[id].solve;
		delete gameData.deck[id].pcard;
		var list = [];
		gameData.deck[id].tags.forEach(function(tag){
			tag.life--;
			if (tag.life>0) list.push(tag);
		});
		gameData.deck[id].tags = list;
		var infect = false;
		var poss = [];
		gameData.possible.organ.forEach(function(o){
			var card = gameData.deck[id].beast[o];
			if (card) {
				if (card.tag) {
					if (card.tag.infect) infect = card.tag;
					card.tag.life--;
					if (card.tag.life<=0) {
						sendGarbage(game, card);
						gameData.deck[id].beast[o] = null;
					}
				} else {
					poss.push(o);
				}
			}
		});
		if (infect && poss.length>0) {
			var rand = Math.floor(Math.random()*poss.length);
			gameData.deck[id].beast[poss[rand]].tag = infect;
		}
	}
	getResolutionList(game, function(list) {
		callback({list:list, round:gameData.round.count});
	});
}
function gameRoundEnd(game, callback) {
	var gameData = gameDatas.list[game];
	gameData.round.phase = '';
	callback();
}


// phase cave
function gameCave(game, callback) {
	var gameData = gameDatas.list[game];
	var delay = gameData.all.global.params.dureeCave.value;
	waitForResponse(game, testEndCave, delay, function(){
		callback();
	});
}
function testEndCave(game) {
	var gameData = gameDatas.list[game];
	var ended = true;
	if (gameData) {
		for (var id in gameData.deck) {
			if (gameData.round.cave.players[id]) {
				ended = ended && gameData.round.cave.players[id].dice;
				ended = ended && gameData.round.cave.players[id].wheel;
			} else {
				ended = false;
			}
		}
	}
	return ended;
}
function setCaved(game, user, code, callback) {
	var gameData = gameDatas.list[game];
	if(gameData.round.phase=='caving') {
		var players = gameData.round.cave.players;
		if (!players[user]) players[user] = {};
		if (code=='wheel') {
			gameData.round.first.push(user);
		}
		if (!players[user][code]) {
			players[user][code] = true;
			callback();
		}
	}
}
function getOrderCaved(game, callback) {
	var gameData = gameDatas.list[game];
	if(gameData.round.phase=='caving') {
		getResolutionList(game, function(list){
			callback({list:list});
		});
	}
}



// phase trick
function gameTrick(game, callback1, callback2) {
	var gameData = gameDatas.list[game];
	gameData.round.phase = 'tricking';
	if (gameData.round.tricks.length>0) {
		gameData.round.tricking = gameData.round.tricks.shift();
		var tt = gameData.round.tricking;
		var timer = gameData.all.global.params.dureeTrick.value;
		callback1(tt.user, tt.code, timer);
		waitForResponse(game, testEndTrick, timer, function(){
			if (!gameData.round.tricking.done) {
				var data = {code:tt.code};
				var trick = gameData.all.trick.items[tt.code];
				if (tt.res && trick.target in tt.res) {
					var rand = Math.floor(Math.random()*tt.res[trick.target].length);
					var target = tt.res[trick.target][rand];
					data.target = target;
				}
				solveTrick(game, tt.user, data, function(res){
					callback2(res);
				});
			} else {
				callback2(tt.res);
			}
		});
	} else {
		callback2();
	}
}
function testEndTrick(game) {
	var gameData = gameDatas.list[game];
	var ended = true;
	if (gameData) {
		if (!gameData.round.tricking.done) ended = false;
	}
	return ended;
}




// phase solve
function gameResolve(game, callback) {
	var gameData = gameDatas.list[game];
	gameData.round.phase = 'solving';
	getResolutionUser(game, function(user){
		gameData.round.solve.ended = {};
		gameData.round.solve.wheel = null;
		gameData.round.solve.pcard = null;
		gameData.round.solve.tricked = null;
		gameData.round.solve.trick = {};
		if (user) {
			gameData.round.solve.user = user;
			var wheel = gameData.deck[user].wheel;
			gameData.round.solve.wheel = wheel;
			var timer1 = gameData.all.global.params.dureeSolve.value;
			var timer2 = gameData.all.global.params.dureeTrick.value;
			callback(user, wheel, timer1, timer2);
		} else {
			callback();
		}
	});
}
function gameResolveUser(game, user, callback) {
	var gameData = gameDatas.list[game];
	var c = gameData.round.solve.list.length;
	var delay = gameData.all.global.params.dureeSolve.value;
	waitForResponse(game, testEndResolve, delay, function(){
		var deck = gameData.deck[user];
		var debilos = false;
		var ok = true;
		if (deck.wheel && deck.wheel.surge && deck.solve && deck.solve.length>0 && deck.pcard===undefined) {
			var rand = Math.floor(Math.random()*deck.solve.length);
			var card = deck.solve[rand];
			solveWheel(game, user, {card:card}, function(res){});
			var debilos = true;
		}
		gameData.round.solve.pcard = deck.pcard;
		if (deck.wheel && !deck.pcard) ok = false;
		gameFinish(game, function(score, winners){
			callback(debilos, deck.pcard, ok);
		});
	});
}
function getResolutionUser(game, callback) {
	var gameData = gameDatas.list[game];
	if (!gameData.round.finish) {
		if (gameData.round.solve.list) {
			callback(gameData.round.solve.list.shift());
		} else {
			getResolutionList(game, function(list){
				gameData.round.solve.list = JSON.parse(JSON.stringify(list));
				callback(gameData.round.solve.list.shift());
			}, true);
		}
	} else {
		callback();
	}
}
function getResolutionList(game, callback, altern) {
	var gameData = gameDatas.list[game];
	switch (gameData.all.global.params.resolutionMode.value) {
		case "order":
			callback(gameData.round.order);
			if (altern) gameData.round.order.push(gameData.round.order.shift());
			break;
		case "first":
			callback(gameData.round.first);
			break;
		default:
			callback([]);
			break;
	}
}
function testEndResolve(game) {
	var gameData = gameDatas.list[game];
	var ended = false;
	if (gameData) {
		if (gameData.round.solve.ended) {
			if (gameData.round.solve.ended.throw && gameData.round.solve.ended.solve) {
				ended = true;
			}
		}
	} else {
		ended = true;
	}
	return ended;
}
function setSolved(game, user, code, callback) {
	var gameData = gameDatas.list[game];
	if(gameData.round.phase=='solving') {
		if (user==gameData.round.solve.user && !gameData.round.solve.ended[code]) {
			gameData.round.solve.ended[code] = true;
			callback();
		}
	}
}





// phase magouille post solve
function gameTrickPostSolve(game, callback) {
	var gameData = gameDatas.list[game];
	var delay = gameData.all.global.params.dureeTrick.value;
	waitForResponse(game, testEndTrickPostSolve, delay, function() {
		for (var id in gameData.round.solve.trick) {
			var tt = gameData.round.solve.trick[id];
			if (tt.wait && !tt.done) {
				var data = {code:tt.code};
				var trick = gameData.all.trick.items[tt.code];
				if (tt.res && trick.target in tt.res) {
					var rand = Math.floor(Math.random()*tt.res[trick.target].length);
					var target = tt.res[trick.target][rand];
					data.target = target;
				}
				solveTrick(game, id, data, function(res){});
			}
		}
		gameFinish(game, function(score, winners){
			callback(gameData.round.solve.tricked);
		});
	});
}
function hasTrickPostSolve(game, id, surge) {
	var gameData = gameDatas.list[game];
	var has = false;
	if (surge) {
		var tricks = gameData.deck[id].hand.trick;
		if (tricks) {
			tricks.forEach(function(o){
				var trick = gameData.all.trick.items[o.code];
				if (trick.action=='cancel' && trick.surge==surge) has = true;
			});
		}
	}
	return has;
}
function testEndTrickPostSolve(game) {
	var gameData = gameDatas.list[game];
	var ended = true;
	if (gameData) {
		var wheel = gameData.round.solve.wheel;
		var pcard = gameData.round.solve.pcard;
		if (pcard && wheel.surge && !gameData.round.solve.tricked) {
			for (var id in gameData.deck) {
				var tt = gameData.round.solve.trick[id];
				if (!tt) {
					if (hasTrickPostSolve(game, id, wheel.surge)) ended = false;
				} else {
					if (tt.wait && !tt.done) ended = false;
				}
			}
		}
	}
	return ended;
}
function setTricked(game, user, code, callback) {
	var gameData = gameDatas.list[game];
	if(gameData.round.phase=='solving') {
		if (code=='fold') {
			gameData.round.solve.trick[user] = {wait:false};
		} else {
			gameData.round.solve.trick[user] = {wait:true};
			if (gameData.round.solve.trick[user].code) {
				gameData.round.solve.trick[user].done = true;
			}
			gameData.round.solve.trick[user].code = code;
			callback();
		}
	}
	if (gameData.round.phase=='caving') {
		callback();
	}
	if (gameData.round.phase=='tricking') {
		if (gameData.round.tricking.user==user && gameData.round.tricking.code==code) {
			gameData.round.tricking.done = true;
		}
		callback();
	}
}







// phase discard
function gameDiscard(game, callback) {
	var gameData = gameDatas.list[game];
	gameData.round.phase = 'discarding';
	var delay = gameData.all.global.params.dureeDiscard.value;
	waitForResponse(game, testEndDiscard, delay, function(){
		var debilos = [];
		for (var id in gameData.deck) {
			askDiscard(game, id, function(res){
				if (res.list) {
					debilos.push(id);
					while (res.list.length>res.max) {
						var rand = Math.floor(Math.random()*res.list.length);
						cardDiscard(game, id, {card:res.list[rand]});
						res.list.splice(rand,1);
					}
				}
			});
		}
		callback({debilos:debilos});
	});
	
}
function testEndDiscard(game) {
	var gameData = gameDatas.list[game];
	var ended = true;
	if (gameData) {
		if (!gameData.round.finish) {
			for (var id in gameData.deck) {
				var nb = 0;
				if (gameData.deck[id].hand.organ) nb += gameData.deck[id].hand.organ.length;
				if (gameData.deck[id].hand.trick) nb += gameData.deck[id].hand.trick.length;
				if (!gameData.round.discard.players[id] && nb>gameData.all.global.params.maxCard.value) {
					ended = false;
				}
			}
		}
	}
	return ended;
}
function hasardDiscard(game, user) {
	var gameData = gameDatas.list[game];
	gameData.round.discard.players[user] = true;
}



// boucle globale
function userScore(game, user) {
	var gameData = gameDatas.list[game];
	var score = 0;
	var nb = 0;
	for (var o in gameData.deck[user].beast) {
		var card = gameData.deck[user].beast[o];
		if (card) {
			nb++;
			var coeff = gameData.all.organ.frames[card.effect].value;
			if (card.tag && card.tag.code=='gangrene') coeff = -1;
			score += coeff;
		}
	}
	return [score, nb];
}
function gameFinish(game, callback) {
	var gameData = gameDatas.list[game];
	var end = false;
	var score = {};
	var st = {};
	var winners = {};
	var loosers = {};
	var best = 0;
	for (var id in gameData.deck) {
		var nbOrgan = 0;
		var [s, nb] = userScore(game, id);
		score[id] = s;
		if (nb>=gameData.round.nbFinish) {
			score[id] += 3;
			end = true;
		}
		if (nb<=0) {
			score[id] = -10;
			loosers[id] = true;
		}
		var team = gameData.players.ids[id].team;
		if (team) {
			if (!st[team]) st[team] = 0;
			st[team] += score[id];
		}
	}
	gameData.round.finish = end;
	if (end) {
		end = score;
		for (var id in gameData.deck) {
			var team = gameData.players.ids[id].team;
			if (team) score[id] = st[team];
			if (score[id]>best) best = score[id];
		}
		for (var id in gameData.deck) {
			if (score[id]==best) winners[id] = true;
		} 
	}
	if (callback) callback(end, winners, loosers);
}
function gameKill(game, callback) {
	delete gameDatas.list[game];
}
function gameGet() {
	return Object.keys(gameDatas.list);
}





// les actions de jeu
function takeDice(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	var obj = {};
	obj.organ = gameData.possible.organ;
	return obj;
}
function throwDice(game, user, data, callback) {
	setCaved(game, user, 'dice', function(){
		var gameData = gameDatas.list[game];
		var list = [];
		var jet = {};
		var obj = {};
		var as = {};
		var recup = {};
		var nbTot = 0;
		var possible = possible;
		// jeter les des
		for (var code in gameData.all.dice.items) {
			var dice = gameData.all.dice.items[code];
			var nb = Math.min(dice.nb, data[code]);
			var tentative = nbTot + nb;
			if (tentative>gameData.all.dice.nb) nb = gameData.all.dice.nb-nbTot;
			nbTot += nb;
			for (var i=0; i<nb; i++) {
				var rand = Math.floor(Math.random()*gameData.possible[code].length);
				// if (data.force) rand = 0;
				var o = gameData.possible[code][rand];
				var it = gameData.all[code].items[o];
				list.push({code:code, val:o});
				if (it.value!==undefined) {
					if (!jet[code]) jet[code] = 0;
					jet[code] += it.value;
					recup[code] = 'value';
				} else {
					if (!jet[code]) jet[code] = {};
					if (!jet[code][o]) jet[code][o] = 0;
					jet[code][o]++;	
					recup[code] = 'card';
				}
				if (code=='organ') {
					if (jet.organ[o]==2) obj.stock = o;
					if (jet.organ[o]==3) obj.trick = 1;
					obj.organ = gameData.possible.organ;
				}
			}
		}
		// traitements speciaux
		if (obj.stock) {
			jet.organ[obj.stock] -= 2;
			if (jet.organ[obj.stock]==0) delete jet.organ[obj.stock];
			setTimeout(function(){
				organRotation(game, obj.stock);
			}, 1000);
		}
		// recuperation des objets
		jet.rec = {};
		for (var code in gameData.all.dice.items) {
			if (recup[code]=='value') {
				(function(code){
					var action = gameData.all.dice.items[code].action;
					as[code] = function(callback){
						tryFunction("get"+action, [game, user, jet[code]], function(res){
							callback(null, res);
						});
					};
				})(code);
			}
			if (recup[code]=='card') {
				for (o in jet[code]) {
					(function(code, o){
						var action = gameData.all.dice.items[code].action;
						as[code+'_'+o] = function(callback){
							tryFunction("get"+action, [game, user, o], function(res){
								callback(null, res);
							});
						};
					})(code, o);
				}	
			}		
		}
		async.auto(as, function (err, res) {
			for (var code in gameData.all.dice.items) {
				if (recup[code]=='value') {
					jet.rec[code] = res[code];
				}
				if (recup[code]=='card') {
					jet.rec[code] = [];
					for (o in jet[code]) {
						
						if (res[code+'_'+o]) jet.rec[code].push(res[code+'_'+o]);
						else jet.rec[code].push();
					}
				}
			}
			obj.dice = list;
			obj.jet = jet;
			callback(obj);
		});
	});
}


function sendGarbage(game, card) {
	var gameData = gameDatas.list[game];
	if (card.tag) delete card.tag;
	gameData.stock.garbage.push(card);
}
function getGarbage(game, user, callback, ind) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var s = getStock(gameData.stock.garbage, ind);
	if (s) {
		if (!deck.hand.organ) deck.hand.organ = [];
		deck.hand.organ.push(s);
	}
	callback(s);
}
function getTrick(game, user, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var s = getStock(gameData.stock.trick);
	if (s) {
		if (!deck.hand.trick) deck.hand.trick = [];
		deck.hand.trick.push(s);
	} else {
		s = {type:'trick', code:null, empty:true};
	}
	callback(s);
}
function getOrgan(game, user, o, callback) {
	var gameData = gameDatas.list[game];
	var s = getStock(gameData.stock.organ[o]);
	var deck = gameData.deck[user];
	if (s) {
		if (!deck.hand.organ) deck.hand.organ = [];
		deck.hand.organ.push(s);
	} else {
		s = {type:'organ', code:o, effect:'neutral', empty:true};
	}
	callback(s);
}
function getStock(stock, ind) {
	var res = null;
	if (ind) {
		if (stock.length>ind) res = stock.splice(ind,1)[0];
	} else {
		if (stock.length>0) res = stock.pop();
	}
	return res;
}
function getDose(game, user, dose, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var d = Math.min(gameData.stock.dose,dose);
	if (!deck.hand.dose) deck.hand.dose = 0;
	deck.hand.dose += d;
	gameData.stock.dose = gameData.stock.dose-d;
	callback(d);
}
function spendDose(game, user, dose, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var ok = false;
	if (deck.hand.dose>=dose) {
		ok = true;
		deck.hand.dose -= dose;
		gameData.stock.dose += dose;
	}
	callback(ok);
}
function organDispo(game, user, o) {
	var dispo = false;
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var card = deck.beast[o];
	if (card) {
		dispo = true;
		if (card.tag) {
			if (card.tag.code=='lock') dispo = false;
		}
	}
	return dispo;
}
function organReady(game, user, o) {
	var ready = true;
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var card = deck.beast[o];
	if (card) {
		if (card.tag) {
			if (card.tag.code=='lock') ready = false;
		}
	}
	return ready;
}





function takeWheel(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	var obj = {};
	obj.wheel = gameData.possible.wheel;
	obj.player = gameData.possible.player;
	callback(obj);
}
function throwWheel(game, user, data, callback) {
	setCaved(game, user, 'wheel', function(){
		var gameData = gameDatas.list[game];
		var rep = "";
		var fold = false;
		if (data.action && data.player) {
			var id = gameData.players.items[data.player].id;
			if (id!=data.playerId) {
				console.log('Achtung: erreur de reconnaissance du joueur',id, data.playerId, data.player);
			}
			var surge = gameData.all.wheel.items[data.action].surge;
			var cost = gameData.all.wheel.items[data.action].cost;
			gameData.deck[user].wheel = {surge:surge, cost:cost, target:id, surgeName:data.action};
			callback({rep:rep, fold:false});	
		}
		if (data.fold) {
			gameData.deck[user].wheel = false;
			callback({rep:rep, fold:true});
		}
		
	});
}
function throwWheelWait(game, user, callback) {
	setSolved(game, user, 'throw', function(){
		var gameData = gameDatas.list[game];
		if (gameData.deck[user].wheel) {
			var id = gameData.deck[user].wheel.target;
			var surge = gameData.deck[user].wheel.surge;
			var cost = gameData.deck[user].wheel.cost;
			spendDose(game, user, cost, function(ok){
				if (ok) {
					tryFunction("throwWheel"+surge, [game, user, id], function(res){
						res.surge = surge;
						callback(res);
						gameData.deck[user].solve = res.solve;
						if (!res.solve || res.solve.length==0) setSolved(game, user, 'solve', function(){});
					});
				} else {
					callback({rep:"Tu n'as pas assez de doses", fold:true});
					setSolved(game, user, 'solve', function(){});
				}
			});
		} else {
			callback({rep:"Tu t'es couché", solve:false});
			setSolved(game, user, 'solve', function(){});
		}
	});
}
function solveWheel(game, user, data, callback) {
	setSolved(game, user, 'solve', function(){
		var gameData = gameDatas.list[game];
		if (data.card) {
			var id = gameData.deck[user].wheel.target;
			var surge = gameData.deck[user].wheel.surge;
			var cost = gameData.deck[user].wheel.cost;
			tryFunction("solveWheel"+surge, [game, user, data.card], function(res){
				gameData.deck[user].pcard = res.pcard;
				var ids = {wheel:gameData.deck[user].wheel};
				var obj = Object.assign(ids, res);
				callback(obj);
			});
		}
	});
}


function throwWheelGraft(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var solve = false;
	var rep = "";
	if (user==id) {
		rep = "Quel organe veux tu te greffer ?";
		solve = [];
		var deck = gameData.deck[user];
		if (deck.hand.organ && deck.hand.organ.length>0) {
			deck.hand.organ.forEach(function(o){
				if (!deck.beast[o.code]) {
					var no = JSON.parse(JSON.stringify(o));
					no.origin = 'hand';
					solve.push(no);
				}
			});
		} else {
			rep = "Tu n'as aucun organe à greffer";
		}
	} else {
		rep = "Tu ne peux pas greffer sur un autre joueur";
	}
	callback({rep:rep, solve:solve});
}
function throwWheelRemoval(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var solve = false;
	var rep = "";
	if (user==id) {
		rep = "Quel organe veux tu jeter à la poubelle ?";
		var deck = gameData.deck[user];
		deck.wheel.benefit = user;
		solve = [];
		gameData.possible.organ.forEach(function(o) {
			if (organDispo(game, user, o)) {
				var no = JSON.parse(JSON.stringify(deck.beast[o]));
				no.origin = 'beast';
				solve.push(no);
			}
		});
		if (solve.length==0) {
			rep = "Tu n'as aucun organe sur ta créature";
		}
	} else {
		rep = "Tu ne peux pas faire ablation sur un autre joueur";
	}
	callback({rep:rep, solve:solve});
}
function throwWheelPrelevment(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var solve = false;
	var rep = "";
	if (user==id) {
		rep = "Que veux tu prélever ?";
		solve = [];
		var max = Math.min(gameData.stock.garbage.length, gameData.all.global.params.garbageCollect.value);
		for (var i=0; i<max; i++) {
			var ind = gameData.stock.garbage.length-1-i;
			var no = JSON.parse(JSON.stringify(gameData.stock.garbage[ind]));
			no.ind = ind;
			no.origin = 'garbage';
			solve.push(no);
		}
		var card = {type:'trick', origin:'trick'};
		if (gameData.stock.trick.length>0) solve.push(card);
		if (solve.length==0) {
			rep = "Tu ne peux rien récupérer";
		}
	} else {
		rep = "Tu ne peux pas faire prélèvement pour un autre joueur";
	}
	callback({rep:rep, solve:solve});
}
function throwWheelGift(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var solve = false;
	var rep = "";
	if (user!=id) {
		rep = "Quel organe veux tu donner ?";
		var deck = gameData.deck[user];
		var targetDeck = gameData.deck[deck.wheel.target];
		solve = [];
		if (deck.hand.organ && deck.hand.organ.length>0) {
			deck.hand.organ.forEach(function(o){
				if (!targetDeck.beast[o.code]) {
					var no = JSON.parse(JSON.stringify(o));
					no.origin = 'hand';
					solve.push(no);
				}
			});
		} 
		gameData.possible.organ.forEach(function(o) {
			if (organDispo(game, user, o)) {
				if (!targetDeck.beast[o]) {
					var no = JSON.parse(JSON.stringify(deck.beast[o]));
					no.origin = 'beast';
					solve.push(no);
				}
			}
		});
		if (solve.length==0) {
			rep = "Tu n'as aucun organe à donner";
		}
	} else {
		rep = "Tu dois donner sur un autre joueur";
	}
	callback({rep:rep, solve:solve});
}
function throwWheelTransplant(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var solve = false;
	var rep = "";
	if (user!=id) {
		rep = "Quel organe veux tu te transplanter ?";
		var deck = gameData.deck[user];
		var targetDeck = gameData.deck[deck.wheel.target];
		solve = [];
		gameData.possible.organ.forEach(function(o) {
			if (organDispo(game, deck.wheel.target, o) && !deck.beast[o]) {
				var no = JSON.parse(JSON.stringify(targetDeck.beast[o]));
				no.origin = 'beast';
				solve.push(no);
			}
		});
		if (solve.length==0) {
			rep = "Tu n'as aucun organe à récupérer";
		}
	} else {
		rep = "Tu dois récupérer sur un autre joueur";
	}
	callback({rep:rep, solve:solve});
}
function throwWheelSubstitute(game, user, id, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var solve = false;
	var rep = "Quel organe veux tu échanger ?";
	solve = [];
	if (user==id) {
		if (deck.hand.organ && deck.hand.organ.length>0) {
			deck.hand.organ.forEach(function(o){
				if (organDispo(game, user, o.code)) {
					var no = JSON.parse(JSON.stringify(o));
					no.origin = 'hand';
					solve.push(no);
				}
			});
		} 
	} else {
		var targetDeck = gameData.deck[deck.wheel.target];
		gameData.possible.organ.forEach(function(o) {
			if (organDispo(game, user, o) && organDispo(game, deck.wheel.target, o)) {
				var no = {type:'organ', code:deck.beast[o].code, effect:'neutral'};
				no.origin = 'beast';
				solve.push(no);
			}
		});
	}
	if (solve.length==0) {
		rep = "Tu n'as aucun organe à échanger";
	}
	callback({rep:rep, solve:solve});
}
function solveWheelGraft(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var list = [];
	var pcard = null;
	var rep = "Hum... il semblerait que cette carte ne soit pas dans ta main...";
	if (deck.beast[card.code]) {
		rep = "L'organe "+card.code+" est déjà sur ta créature";
	} else {
		var found = false;
		deck.hand.organ.forEach(function(o){
			if (o.code==card.code && o.effect==card.effect && !found) {
				found = true;
				rep = "Greffe réussie";
				pcard = {type:'organ', code:card.code};
				deck.beast[card.code] = o;
			} else {
				list.push(o);
			}
		});
		deck.hand.organ = list;
	}
	callback({rep:rep, pcard:pcard});
}
function solveWheelRemoval(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var pcard = null;
	var rep = "Hum... il semblerait que cette carte ne soit pas sur ta créature...";
	if (organDispo(game, user, card.code)) {
		rep = "Ablation réussie";
		pcard = {type:'organ', code:card.code};
		sendGarbage(game, deck.beast[card.code])
		deck.beast[card.code] = null;
	}
	callback({rep:rep, pcard:pcard});
}
function solveWheelPrelevment(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var pcard = null;
	var rep = "Tu as choisi une pioche vide... dommage !";
	if (card.origin=='garbage') {
		getGarbage(game, user, function(res){
			if (res) {
				rep = "Prélèvement réussi dans la poubelle à organes";
				pcard = {type:'global', code:'garbage'};
			}
			callback({rep:rep, card:res, pcard:pcard});
		}, card.ind);
	}
	if (card.origin=='trick') {
		getTrick(game, user, function(res){
			if (res) {
				rep = "Prélèvement réussi dans les cartes magouilles";
				pcard = {type:'trick', code:null};
			}
			callback({rep:rep, card:res, pcard:pcard});
		});
	}
}
function solveWheelGift(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var targetDeck = gameData.deck[deck.wheel.target];
	var pcard = null;
	var rep = "Hum... il semblerait que cette carte ne soit pas disponible...";
	if (targetDeck.beast[card.code]) {
		rep = "L'organe "+card.code+" est déjà sur la créature visée";
	} else {
		if (card.origin=='hand') {
			var list = [];
			var found = false;
			deck.hand.organ.forEach(function(o){
				if (o.code==card.code && o.effect==card.effect && !found) {
					found = true;
					rep = "Don réussi";
					pcard = {type:'organ', code:card.code};
					targetDeck.beast[card.code] = o;
				} else {
					list.push(o);
				}
			});
			deck.hand.organ = list;
		}
		if (card.origin=='beast') {
			if (organDispo(game, user, card.code)) {
				rep = "Don réussie";
				pcard = {type:'organ', code:card.code};
				targetDeck.beast[card.code] = JSON.parse(JSON.stringify(deck.beast[card.code]));
				deck.beast[card.code] = null;
			}
		}
	}
	callback({rep:rep, pcard:pcard});
}
function solveWheelTransplant(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var targetDeck = gameData.deck[deck.wheel.target];
	var pcard = null;
	var rep = "Hum... il semblerait que cette carte ne soit pas disponible...";
	if (deck.beast[card.code]) {
		rep = "L'organe "+card.code+" est déjà sur ta créature";
	} else {
		if (organDispo(game, deck.wheel.target, card.code)) {
			rep = "Transplantation réussie";
			pcard = {type:'organ', code:card.code};
			deck.beast[card.code] = JSON.parse(JSON.stringify(targetDeck.beast[card.code]));
			targetDeck.beast[card.code] = null;
		}
	}
	callback({rep:rep, pcard:pcard});
}
function solveWheelSubstitute(game, user, card, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var targetDeck = gameData.deck[deck.wheel.target];
	var pcard = null;
	var rep = "Hum... il semblerait que cette carte ne soit pas disponible...";
	if (card.origin=='hand') {
		if (deck.hand.organ && deck.hand.organ.length>0) {
			var list = [];
			var found = false;
			deck.hand.organ.forEach(function(o){
				if (o.code==card.code && o.effect==card.effect && organDispo(game, user, card.code) && !found) {
					found = true;
					rep = "Substitution réussie";
					pcard = {type:'organ', code:card.code};
					list.push(JSON.parse(JSON.stringify(deck.beast[card.code])));
					deck.beast[card.code] = o;
				} else {
					list.push(o);
				}
			});
			deck.hand.organ = list;
		} 
	} else {
		if (organDispo(game, user, card.code) && organDispo(game, deck.wheel.target, card.code)) {
			rep = "Substitution réussie";
			pcard = {type:'organ', code:card.code};
			var o = JSON.parse(JSON.stringify(deck.beast[card.code]));
			deck.beast[card.code] = JSON.parse(JSON.stringify(targetDeck.beast[card.code]));
			targetDeck.beast[card.code] = o;
		}
	}
	callback({rep:rep, pcard:pcard});
}




function takeTrick(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	if (data.fold) {
		setTricked(game, user, 'fold', function(){});
		callback({});
	} else {
		var res = {};
		res.trick = [];
		var tricks = gameData.deck[user].hand.trick;
		if (tricks) {
			tricks.forEach(function(o) {
				var trick = gameData.all.trick.items[o.code];
				if (gameData.round.phase=='solving') {
					if (trick.when.solve && trick.surge==data.surge) res.trick.push(o.code);
					res.user = gameData.round.solve.user;
				}
				if (gameData.round.phase=='caving') {
					if (trick.when.cave) res.trick.push(o.code);
				}
			});
		}
		callback(res);
	}
}
function throwTrick(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	var trick = gameData.all.trick.items[data.code];
	var has = false;
	var tricks = gameData.deck[user].hand.trick;
	if (tricks && tricks.length>0) {
		var list = [];
		tricks.forEach(function(o){
			if (o.code==data.code && !has) {
				has = true;
			} else {
				list.push(o);
			}
		});
		gameData.deck[user].hand.trick = list;
	}
	if (has) {
		setTricked(game, user, data.code, function(){
			if (gameData.round.phase=='solving') {
				callback({immediate:1, code:data.code});
			}
			if (gameData.round.phase=='caving') {
				gameData.round.tricks.push({user:user, code:data.code});
				callback({});
			}
		});
	}
}
function throwTrickWait(game, user, code, callback) {
	var gameData = gameDatas.list[game];
	var trick = gameData.all.trick.items[code];
	var res = {};
	var linear = true;
	if (trick.target=='player') {
		res.player = gameData.possible.player;
		if (trick.surge && gameData.round.solve.pcard) {
			var list = [];
			res.player.forEach(function(o){
				var p = gameData.players.items[o];
				if (!gameData.deck[p.id].beast[gameData.round.solve.pcard.code]) list.push(o);
			});
			if (list.length>0) res.player = list;
		}
	}
	if (trick.target=='organ') res.organ = gameData.possible.organ;
	if (trick.action=='stock' && trick.target=='garbage') {
		var list = [];
		var max = Math.min(gameData.stock.garbage.length, gameData.all.global.params.garbageCollect.value);
		max = gameData.stock.garbage.length;
		for (var i=0; i<max; i++) {
			var ind = gameData.stock.garbage.length-1-i;
			var no = JSON.parse(JSON.stringify(gameData.stock.garbage[ind]));
			no.ind = ind;
			list.push(no);
		}
		if (list.length>0) res.garbage = list;
	}
	if (trick.action=='surge') {
		linear = false;
		tryFunction("throwWheel"+trick.surge, [game, user, user], function(res2){
			callback(res2);
			res.solve = res2.solve;
		});
	}
	if (trick.target=='beast') {
		var list = [];
		for (var id in gameData.deck) {
			var deck = gameData.deck[id];
			gameData.possible.organ.forEach(function(o) {
				if (organDispo(game, id, o)) {
					var no = JSON.parse(JSON.stringify(deck.beast[o]));
					no.origin = id;
					no.originType = 'players';
					list.push(no);
				}
			});
		}
		if (list.length>0) res.beast = list;
	}
	if (gameData.round.phase=='solving') {
		if (!gameData.round.solve.trick[user]) console.log(user, gameData.round.solve.trick);
		gameData.round.solve.trick[user].res = res;
	}
	if (gameData.round.phase=='tricking') {
		if (gameData.round.tricking.code==code && gameData.round.tricking.user==user) {
			gameData.round.tricking.res = res;
		}
	}
	if (linear) callback(res);
}
function solveTrick(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	var trick = gameData.all.trick.items[data.code];
	setTricked(game, user, data.code, function(){
		var res = {action:trick.action, code:data.code, user:user};
		var linear = true;
		if (trick.when.solve) {
			var wheel = gameData.round.solve.wheel;
			var pcard = gameData.round.solve.pcard;
			var surge = gameData.all.wheel.items[wheel.surgeName];
			if (!surge) console.log('error surge',gameData.round.solve);
			if (surge) {
				if (surge.benefit.player=='target') var id = wheel.target;
				if (surge.benefit.player=='me') var id = gameData.round.solve.user;
				var deckOri = gameData.deck[id];
				if (wheel.surge==trick.surge && pcard) {
					res.target = wheel.target;
					res.ok = true;
					var card = JSON.parse(JSON.stringify(deckOri.beast[pcard.code]));
					if (trick.action=='cancel') {
						deckOri.beast[pcard.code] = null;
					}
					if (trick.target=='garbage') {
						if (card) sendGarbage(game, card);
					}
					if (trick.target=='player' && data.target) {
						var id = gameData.players.items[data.target].id;
						if (data.targetId) id = data.targetId;
						var deckDest = gameData.deck[id];
						if (!deckDest.beast[pcard.code]) deckDest.beast[pcard.code] = card;
					}
					gameData.round.solve.tricked = res;
				}
			}
		}
		if (trick.when.cave) {
			res.ok = true;
			if (!trick.action) {
				res.info = data.code+" : "+trick.description;
			}
			if (trick.action=='rotate') {
				var memo = null;
				var first = null;
				for (var id in gameData.deck) {
					var hand = JSON.parse(JSON.stringify(gameData.deck[id].hand));
					if (memo) gameData.deck[id].hand = memo;
					else first = id;
					memo = hand;
				}
				gameData.deck[first].hand = memo;
			}
			if (trick.action=='delete') {
				if (trick.target=='organ' && data.target) {
					res.pcard = {code:data.target};
					for (var id in gameData.deck) {
						var deck = gameData.deck[id];
						if (organDispo(game, id, data.target)) {
							var card = JSON.parse(JSON.stringify(deck.beast[data.target]));
							sendGarbage(game, card);
							deck.beast[data.target] = null;
						}
						
					}
				}
			}
			if (trick.action=='stock' && data.target) {
				getGarbage(game, user, function(res2){}, data.target.ind);
			}
			if (trick.action=='surge' && data.target) {
				linear = false;
				tryFunction("solveWheel"+trick.surge, [game, user, data.target], function(res){
					callback(res);
				});
			}
			if (trick.action=='tag') {
				var tag = {code:trick.code, life:trick.life};
				if (trick.infect) tag.infect = 1;
				if (trick.target=='me') {
					gameData.deck[user].tags.push(tag);
				}
				if (trick.target=='beast' && data.target) {
					var deck = gameData.deck[data.target.origin];
					var o = data.target.code;
					if (deck.beast[o]) deck.beast[o].tag = tag;
				}
			}
			gameData.round.tricking.res = res;
		}
		if (linear) callback(res);
	});
}
function aleaTrick(game, code, res, callback) {
	
}




function askDiscard(game, user, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	var max = gameData.all.global.params.maxCard.value;
	var nb = 0;
	if (deck.hand.organ) nb += deck.hand.organ.length;
	if (deck.hand.trick) nb += deck.hand.trick.length;
	if (nb>max) {
		var list = [];
		if (deck.hand.organ) {
			deck.hand.organ.forEach(function(o){
				list.push(o);
			});
		}
		if (deck.hand.trick) {
			deck.hand.trick.forEach(function(o){
				list.push(o);
			});
		}
		callback({list:list, max:max});
	} else {
		callback({});
	}
}
function cardDiscard(game, user, data, callback) {
	var gameData = gameDatas.list[game];
	var deck = gameData.deck[user];
	if (data.card) {
		var list = [];
		var found = false;
		if (data.card.type=='organ') {
			deck.hand.organ.forEach(function(o){
				if (o.code==data.card.code && o.effect==data.card.effect && !found) {
					found = true;
					sendGarbage(game, o);
				} else {
					list.push(o);
				}
			});
			deck.hand.organ = list;
		}
		if (data.card.type=='trick') {
			deck.hand.trick.forEach(function(o){
				if (o.code==data.card.code && !found) {
					found = true;
				} else {
					list.push(o);
				}
			});
			deck.hand.trick = list;
		}
		if (!found) {
			console.log('error card not found', data.card, deck.hand);
		}
		if (callback) callback();
	} else {
		hasardDiscard(game, user);
	}
}


// les actions speciales
function organRotation(game, o, callback) {
	var gameData = gameDatas.list[game];
	var list = Object.keys(gameData.deck);
	var memo = null;
	var first = null;
	list.forEach(function(id){
		var beast = gameData.deck[id].beast;
		if (organReady(game, id, o)) {
			if (!first) first = beast;
			var card = beast[o];
			beast[o] = memo;
			memo = card;
		}
	});
	if (first) first[o] = memo;
	if (callback) callback();
}





// sous fonction internes
function shuffle(list) {
	let ctr = list.length;
	let temp;
	let index;
	while (ctr > 0) {
		index = Math.floor(Math.random() * ctr);
		ctr--;
		temp = list[ctr];
		list[ctr] = list[index];
		list[index] = temp;
	}
}
function readTXTFile(file, callback, p) {
	var list = [];
	fs.readFile(global.__data+"/"+file, 'utf8', function(err, contents) {
		if (contents) {
			contents.split('\n').forEach(function(l){
				var o = null;
				var t = l.trim().split('|||');
				if (t.length>1) {
					var k = 0;
					if (p && p.assoc) {
						var o = {};
						t.forEach(function(item){
							if (k<p.assoc.length) o[p.assoc[k]] = item;
							else o[k+""] = item;
							k++;
						});
					} else {
						o = t;	
					}
				} else {
					o = t[0];
					if (p && p.number && !isNaN(o)) o = parseInt(o);
				}
				if (o) list.push(o);
			});
			callback(list);
		} else {
			
		}
	});
}
function readJSONFile(code, callback) {
	var file = global.__data+"/"+code+".json";
	fs.readFile(file, 'utf8', function(err, contents) {
		var json = null;
		try {
			json = JSON.parse(contents);
		} catch(e) {
			console.log("The file is not a valid JSON: ", code);
			console.log(e);
		}
		callback(json);
	});
}
function tryFunction(func, args, callback) {
	try {
		switch (args.length) {
			case 0:
				eval(func)(function(res){
					callback(res);
				});
				break;
			case 1:
				eval(func)(args[0], function(res){
					callback(res);
				});
				break;
			case 2:
				eval(func)(args[0], args[1], function(res){
					callback(res);
				});
				break;	
			case 3:
				eval(func)(args[0], args[1], args[2], function(res){
					callback(res);
				});
				break;
			case 4:
				eval(func)(args[0], args[1], args[2], args[3], function(res){
					callback(res);
				});
				break;
			default:
				console.log('too much arguments for ',func);
		}
	} catch(e) {
		console.log('no function for ',func);
		console.log(e);
	}
}

function listColor() {
	var list = [];
	list.push('#ff0000');
	list.push('#00ff00');
	list.push('#0000ff');
	list.push('#ffff00');
	list.push('#ff00ff');
	list.push('#00ff00');
	return list;
}
