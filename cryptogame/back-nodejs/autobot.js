"use strict";
var play = require("./play");
var async = require('async');


class Autobot {
	constructor(game, id) {
		this.id = id;
		this.game = game;
	}
	
	// les fonctions publiques à utiliser
	setPlayer(pid) {
		this.pid = pid;
	}
	setAI(param) {
		this.initAI(param, () => {
			this.smart = this.ai.behaviour["Intelligence"]/1;
			this.speed = this.ai.behaviour["Rapidité"]/1;
			this.fierce = this.ai.behaviour["Combativité"]/1;
			this.teamSpirit = this.ai.behaviour["Esprit d'équipe"]/1;
			this.initDelay();
		});
		
	}
	cave(callback1, callback2) {
		var as = {};
		as['dice'] = (callback) => {
			this.setDelay();
			this.exec('Dice', (res) => {
				callback(null);
				callback1(res, this.id);
			});
		};
		as['wheel'] = ['dice', (results, callback) => {
			this.setDelay();
			this.exec('Wheel', (res) => {
				callback(null);
				callback2(res, this.id);
			});
		}];
		as['trick'] = (callback) => {
			this.setDelay();
			this.exec('Trick', (res) => {
				callback(null);
			}, {});
		};
		async.auto(as, (err, res) => {
			
		});
	}
	solve(callback) {
		this.setDelay(500);
		this.exec('WheelWait', (res) => {
			callback(res);
		});
	}
	discard(callback) {
		this.setDelay(500);
		this.exec('Discard', (res) => {
			callback(res);
		});
	}
	trickPick(surge, callback) {
		this.setDelay(3000);
		this.exec('Trick', (res) => {
			callback(res, this.id);
		}, {surge:surge});
	}
	trickPlay(code, callback) {
		this.setDelay(500);
		this.exec('TrickWait', (res) => {
			callback(res);
		}, code);
	}



	// les fonction internes
	setDelay(value) {
		this.delay = (this.delayInt.min + Math.random()*(this.delayInt.max-this.delayInt.min))*1000;
		if (value!==undefined) this.delay = value;
	}
	exec(action, callback, p) {
		setTimeout(() => {
			try {
				if (p!==undefined) eval('this._exec'+action).call(this, p, callback);
				else eval('this._exec'+action).call(this, callback);
			} catch (e) {
				console.log('no action for ', action);
				console.log(e);
			}
		}, this.delay);
	}
	initAI(param, callback) {
		if (param) {
			this.ai = param;
			callback();
		} else {
			this.ai = {};
			play.getData(this.game, (gameData) => {
				for (var p in gameData.all.bot.ai) {
					this.ai[p] = {};
					var ai = gameData.all.bot.ai[p];
					for (var o in gameData.all[ai.code][ai.coll]) {
						this.ai[p][o] = 50;
					}
				}
				callback();
			});
		}
	}
	initDelay() {
		var a = (100-this.speed)/10;
		this.delayInt = {min:a, max:2*a+1};
		this.setDelay();
	}
	
	
	// les fonctions pour interagir avec "play"
	_execDice(callback) {
		this._chooseNbDice( (data) => {
			play.throwDice(this.game, this.pid, data, (res) => {
				var obj = res;
				var as = {};
				if (obj.stock) {
					as['organ'] = (callback) => {
						this._chooseStockOrgan( (o) => {
							play.getOrgan(this.game, this.pid, o, (res) => {
								callback(null, res);
							});
						});
					};
				}
				if (obj.trick) {
					as['trick'] = (callback) => {
						play.getTrick(this.game, this.pid, (res) => {
							callback(null, res);
						});
					};
				}
				async.auto(as, (err, res) => {
					callback(obj);
				});
			});
		});
	}
	_execWheel(callback) {
		this._chooseWheel( (data) => {
			play.throwWheel(this.game, this.pid, data, (res) => {
				callback(res);
			});
		});
	}
	_execWheelWait(callback) {
		play.throwWheelWait(this.game, this.pid, (res) => {
			if (res.solve) {
				this._chooseWheelSolve(res, (data) => {
					play.solveWheel(this.game, this.pid, data, (res) => {
						callback(res);
					});
				});
			} else {
				play.solveWheel(this.game, this.pid, {}, (res) => {});
				callback(res);
			}
		});
	}
	_execDiscard(callback) {
		play.askDiscard(this.game, this.pid, (res) => {
			if (res.list) {
				while (res.list.length>res.max) {
					var rand = Math.floor(Math.random()*res.list.length);
					var data = {card:JSON.parse(JSON.stringify(res.list[rand]))};
					play.cardDiscard(this.game, this.pid, data);
					res.list.splice(rand,1);
				}
				callback(res);
			} else {
				callback(res);
			}
		});
	}
	_execTrick(data, callback) {
		play.takeTrick(this.game, this.pid, data, (res) => {
			this._chooseTrickPick(res, (res) => {
				callback(res);
			});
		});
		
	}
	_execTrickWait(code, callback) {
		play.throwTrickWait(this.game, this.pid, code, (res) => {
			this._chooseTrickSolve(code, res, (data) => {
				play.solveTrick(this.game, this.pid, data, (res) => {
					callback(res);
				});
			});
			
		});
	}
	
	
	// Choix du robot selon le mode IA
	_chooseNbDice(callback) {
		play.getData(this.game, (gameData) => {
			if (gameData) {
				var hand = gameData.deck[this.pid].hand;
				var beast = gameData.deck[this.pid].beast;
				var nb = gameData.all.dice.nb;
				var max = nb;
				var min = 0;
				if (this.smart>30 && hand.dose<1) min = 2;
				if (this.smart>40 && hand.dose<3) min = 1;
				if (this.smart>50 && hand.dose>10) max=2;
				if (this.smart>30 && hand.dose>15) max=1;
				
				if (this.smart>50 && (!hand.organ || hand.organ.length==0)) max=2;
				
				
				var data = {dose:min, organ:nb-max};
				for (var i=min; i<max; i++) {
					var poss = [];
					for (var d in this.ai.dice) {
						var v = this.ai.dice[d]/1;
						for (var k=0; k<v; k++) {
							poss.push(d);
						}
					}
					var rand = Math.floor(Math.random()*poss.length);
					data[poss[rand]]++;
				}
				callback(data);
			}
		});
	}
	_chooseStockOrgan(callback) {
		play.getData(this.game, (gameData) => {
			if (gameData) {
				var poss = JSON.parse(JSON.stringify(gameData.possible.organ));
				if (this.smart>40) {
					var list = [];
					poss.forEach( (o) => {
						if (gameData.stock.organ[o].length>0) list.push(o);
					});
					poss = list;
				}
				if (this.smart>60) {
					var list = [];
					poss.forEach( (o) => {
						if (!gameData.deck[this.pid].beast[o]) list.push(o);
					});
					poss = list;
				}
				if (poss.length==0) poss = JSON.parse(JSON.stringify(gameData.possible.organ));
				var rand = Math.floor(Math.random()*poss.length);
				var o = poss[rand];
				callback(o);
			}
		});
	}
	_chooseWheel(callback) {
		play.getData(this.game, (gameData) => {	
			if (gameData) {
				var hand = gameData.deck[this.pid].hand;
				var beast = gameData.deck[this.pid].beast;
				var nbOrgan = {tot:0, h:{}, b:{}};
				for (var o in gameData.all.organ.frames) {
					nbOrgan.h[o] = 0;
					nbOrgan.b[o] = 0;
				}
				for (var o in beast) {
					if (beast[o]) {
						nbOrgan.b[beast[o].effect]++;
						nbOrgan.tot++;
					}
				}
				if (hand.organ) {
					hand.organ.forEach( (o) => {
						nbOrgan.h[o.effect]++;
					});
				}
				var poss = JSON.parse(JSON.stringify(gameData.possible.wheel));
				if (this.smart>20) {
					var list = [];;
					poss.forEach( (s) => {
						var w = gameData.all.wheel.items[s];
						if (w.cost<=hand.dose) list.push(s);
					});
					poss = list;
				}
				
				var intell = {};
				var list = [];
				poss.forEach( (s) => {
					var w = gameData.all.wheel.items[s];
					if (w.surge=='Graft') {
						if (this.smart>45) {
							var free = false;
							if (hand.organ) {
								hand.organ.forEach( (o) => {
									if (!beast[o]) free = true;
								});
							}
							if (free) list.push(s);
						} else if (this.smart>30) {
							if (hand.organ && hand.organ.length>0) list.push(s);
						} else {
							list.push(s);
						}
						intell[s] = this.smart*2*nbOrgan.h.bonus;
					}
					if (w.surge=='Removal') {
						if (this.smart>40) {
							if (nbOrgan.b.malus>0) list.push(s);
						} else if (this.smart>30) {
							if (nbOrgan.tot>0) list.push(s);
						} else {
							list.push(s);
						}
						for (var o in beast) {
							if (beast[o] && beast[o].tag && beast[o].tag.code=='gangrene') {
								list.push(s);
								intell[s] = this.smart*10;
							}
						}
					}
					if (w.surge=='Prelevment') {
						list.push(s);
					}
					if (w.surge=='Gift') {
						if (this.smart>60) {
							var nb = nbOrgan.h.malus+nbOrgan.b.malus;
							if (nb>0) list.push(s);
						} else if (this.smart>50) {
							var nb = nbOrgan.b.malus;
							if (hand.organ) nb += hand.organ.length;
							if (nb>0) list.push(s);
						} else if (this.smart>30) {
							var nb = nbOrgan.tot;
							if (hand.organ) nb += hand.organ.length;
							if (nb>0) list.push(s);
						} else {
							list.push(s);
						}
						for (var o in beast) {
							if (beast[o] && beast[o].tag && beast[o].tag.code=='gangrene') {
								list.push(s);
								intell[s] = this.smart*20;
							}
						}
					}
					if (w.surge=='Transplant') {
						if (this.smart>50) {
							var free = false;
							for (var id in gameData.deck) {
								if (this.pid!=id) {
									for (var o in gameData.all.organ.items) {
										if (!beast[o] && play.organDispo(this.game, id,o)) {
											if (gameData.deck[id].beast[o].effect=='bonus') free = true;
										}
									}
								}
							}
							if (free) list.push(s);
						} else if (this.smart>30) {
							var free = false;
							for (var id in gameData.deck) {
								if (this.pid!=id) {
									for (var o in gameData.all.organ.items) {
										if (!beast[o] && play.organDispo(this.game, id,o)) {
											free = true;
										}
									}
								}
							}
							if (free) list.push(s);
						} else {
							list.push(s);
						}
					}
					if (w.surge=='Substitute') {
						if (this.smart>70 && this.fierce>60) {
							var free = false;
							if (hand.organ) {
								hand.organ.forEach( (o) => {
									if (play.organDispo(this.game, this.pid, o.code)) {
										if (o.effect=='bonus' && beast[o.code].effect=='malus') free = true;
									}
								});
							}
							for (var id in gameData.deck) {
								if (this.pid!=id) {
									for (var o in gameData.all.organ.items) {
										if (play.organDispo(this.game, this.pid,o) && play.organDispo(this.game, id,o)) {
											if (beast[o].effect=='malus' && gameData.deck[id].beast[o].effect=='bonus') free = true;
										}
									}
								}
							}
							if (free) list.push(s);
						} else if (this.smart>45) {
							var free = false;
							if (hand.organ) {
								hand.organ.forEach( (o) => {
									if (play.organDispo(this.game, this.pid, o.code)) free = true;
								});
							}
							for (var id in gameData.deck) {
								if (this.pid!=id) {
									for (var o in gameData.all.organ.items) {
										if (play.organDispo(this.game, this.pid,o) && play.organDispo(this.game, id,o)) free = true;
									}
								}
							}
							if (free) list.push(s);
						} else {
							list.push(s);
						}
					}
				});
				poss = list;
				
				var list = [];
				poss.forEach( (s) => {
					var v = this.ai.wheel[s]/1;
					if (s in intell) v += intell[s];
					for (var k=0; k<v; k++) {
						list.push(s);
					}
				});
				poss = list;
				var rand = Math.floor(Math.random()*poss.length);
				var action = poss[rand];
				if (action) {
					var target = gameData.all.wheel.items[action].target;
					if (target=='me') {
						var playerId = this.pid;
					} else {
						var poss = [];
						for (var p in gameData.players.items) {
							var id = gameData.players.items[p].id;
							if (target=="" || id!=this.pid) poss.push(id);
						}
						var rand = Math.floor(Math.random()*poss.length);
						var playerId = poss[rand];
					}
					var player = gameData.players.ids[playerId].name;
					var data = {action:action, player:player, playerId:playerId};
				} else {
					data = {fold:true};
					if (this.fierce>60) {
						
					}
				}
				
				
				
				if (this.fierce<45) {
					var rand = Math.floor(Math.random()*50)-5;
					if (rand>this.fierce) data = {fold:true};
				}
				callback(data);
			}
		});
	}
	_chooseWheelSolve(res, callback) {
		play.getData(this.game, (gameData) => {	
			if (gameData) {
				var all = gameData.all;
				var hand = gameData.deck[this.pid].hand;
				var beast = gameData.deck[this.pid].beast;
				var nbOrgan = 0;
				for (var o in beast) {
					if (beast[o]) {
						nbOrgan++;
					}
				}
				
				var poss = res.solve;
				var list = [];
				
				if (res.surge=='Graft') {
					if (this.smart>70) {
						poss.forEach( (s) => {
							s.nb = all.organ.frames[s.effect].value;
							for (var id in gameData.deck) {
								if (this.pid!=id && gameData.deck[id].beast[s.code]) {
									s.nb++;
								}
							}
						});
						poss.forEach( (s) => {
							if (s.nb>0) list.push(s);
						});
					}
					if (list.length==0 && this.smart>40) {
						poss.forEach( (s) => {
							if (s.effect=='bonus') list.push(s);
						});
					}
					if (list.length==0) {
						list = poss;
					}	
				}
				if (res.surge=='Removal') {
					poss.forEach( (s) => {
						if (s.tag && s.tag.code=='gangrene') list.push(s);
					});
					if (list.length==0 && this.smart>70) {
						
					}
					if (list.length==0 && this.smart>30) {
						poss.forEach( (s) => {
							if (s.effect=='malus') list.push(s);
						});
					}
					if (list.length==0) {
						list = poss;
					}	
				}
				if (res.surge=='Prelevment') {
					if (this.smart>60) {
						poss.forEach( (s) => {
							if (s.origin=='garbage') {
								var ok = false;
								var inhand = false;
								if (hand.organ) {
									hand.organ.forEach( (o) => {
										if (o.code==s.code && o.effect==s.effect) {
											inhand = true;
										}
									});
								}
								if (!inhand) {
									if (s.effect=='bonus' && !beast[s.code]) ok = true;
									if (this.smart>80) {
										if (nbOrgan>4 && s.effect=='malus' && !beast[s.code]) ok = true;
									}
								}
							} else {
								list.push(s);
							}
							
						});
					}
					if (list.length==0) {
						list = poss;
					}
				}
				if (res.surge=='Gift') {
					poss.forEach( (s) => {
						if (s.tag && s.tag.code=='gangrene') list.push(s);
					});
					if (list.length==0 && this.smart>70) {
						poss.forEach( (s) => {
							if (s.origin=='hand') {
								if (s.effect=='malus' && beast[s.code]) list.push(s);
							}
							if (s.origin=='beast') {
								if (nbOrgan<4 && s.effect=='malus') list.push(s);
							}
						});
					}
					if (list.length==0 && this.smart>40) {
						poss.forEach( (s) => {
							if (s.effect=='malus') list.push(s);
						});
					}
					if (list.length==0) {
						list = poss;
					}
				}
				if (res.surge=='Transplant') {
					if (list.length==0 && this.smart>40) {
						poss.forEach( (s) => {
							if (s.effect=='bonus') list.push(s);
						});
					}
					if (list.length==0) {
						list = poss;
					}
				}
				if (res.surge=='Substitute') {
					if (this.smart>60) {
						
					}
					if (list.length==0) {
						list = poss;
					}
				}
				
				poss = list;
				if (poss.length==0) poss = res.solve;
				var rand = Math.floor(Math.random()*poss.length);
				var data = {card:poss[rand]};
				callback(data);
			}
		});
	}
	_chooseTrickPick(res, callback) {
		if (res.trick.length>0) {
			var ind = 0;
			var data = {code:res.trick[ind]};
			if (this.fierce<45) {
				var rand = Math.floor(Math.random()*50)-5;
				if (rand>this.fierce) data = {fold:true};
			}
			if (data.fold) {
				play.takeTrick(this.game, this.pid, data, (res) => {
					callback(res);
				});
			} else {
				play.throwTrick(this.game, this.pid, data, (res) => {
					callback(res);
				});
			}
		}
	}
	_chooseTrickSolve(code, res, callback) {
		play.getData(this.game, (gameData) => {	
			if (gameData) {
				var data = {code:code};
				var trick = gameData.all.trick.items[code];
				if (res && trick.target in res) {
					var [card, ind] = this._chooseFromList(res[trick.target]);
					data.target = card
				}
				callback(data);
			}
		});
	}
	_getEltList(list) {
		var card = null;
		if (list.length>0) {
			var rand = Math.floor(Math.random()*list.length);
			card = list[rand];
		}
		return [card, rand];
	}
	_chooseFromList(list, context) {
		var poss = JSON.parse(JSON.stringify(list));
		if (context) {
			
		}
		return this._getEltList(poss);
	}
	
}
module.exports = Autobot;	