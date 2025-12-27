module.exports = {
	timerTempo : 20,
	
	start : function(board,list) {
		var arena = new Arena(board,list);
		setTimeout(function(){arena.nextTimeStep();},500);
		return arena;
	},
	setData : function(arena,data) {
		arena.setData(data);
	},
	getData : function(arena,p) {
		var data = {wormHole:arena.physics.wormHole, pions:arena.pions, 
				newtraces:arena.pions[p].newtraces, deltraces:arena.pions[p].deltraces};
		arena.pions[p].newtraces = [];
		arena.pions[p].deltraces = [];
		return data;
	},
	end : function(arena) {
		delete arena;
	}
}

class Arena {
	constructor(board,list) {
		this.H = board.nbPixH;
		this.W = board.nbPixW;
		this.physics = board.physicsGroundArena;
		this.values = board.valueGroundArena;
		this.nb = list.length;
		this.pions = {}
		for (var p=0; p<this.nb; p++) {
			var gl =  list[p];
			this.pions[gl.pid] = {};
			this.pions[gl.pid].x = parseInt(gl.pos*this.W/this.nb + this.W/this.nb/2);
			this.pions[gl.pid].y = parseInt(gl.pos*this.H/this.nb + this.H/this.nb/2);
			this.pions[gl.pid].angle = 0;
			this.pions[gl.pid].speed = this.values.speed;
			this.pions[gl.pid].score = 100;
			this.pions[gl.pid].nbPts = 0;
			this.pions[gl.pid].dim = 10;
			this.pions[gl.pid].player = gl.pid;
			this.pions[gl.pid].newtraces = [];
			this.pions[gl.pid].deltraces = [];
		}
		this.traces = {};
		this.globalpid = 0;
		this.traceReelle = 0;
		this.timerTimeStep = 20;
	}
	setData(data) {
		if (data.pid && this.pions[data.pid]) {
			if (data.x!==undefined) this.pions[data.pid].x = data.x;
			if (data.y!==undefined) this.pions[data.pid].y = data.y;
			if (data.angle!==undefined) this.pions[data.pid].angle = data.angle;
			if (data.speed!==undefined) this.pions[data.pid].speed = data.speed;
			if (data.score!==undefined) this.pions[data.pid].score = data.score;
			if (data.nbPts!==undefined) this.pions[data.pid].nbPts = data.nbPts;
		}
	}
	
	nextTimeStep() {
		this.values.length = this.values.length + 10;
		this.changerWormHole();
		this.bougerPion();
		var that = this;
		setTimeout(function(){that.nextTimeStep();},this.timerTimeStep);
	}

	changerWormHole() {
		var d = {x:this.W, y:this.H};
		for (var dim in this.physics.wormHole) {
			var w = this.physics.wormHole[dim];
			for (var i=0; i<w.length; i++) {
				if (w[i][0]>50) {
					w[i][0] = w[i][0]+1;
					if (w[i][0]+w[i][1]>d[dim]-50) w[i][1] = w[i][1]-1;
					if (w[i][1]<1) w[i][0] = 50;
				} else {
					if (w[i][1]<w[i][2]) w[i][1] = w[i][1]+1;
					else w[i][0] = w[i][0]+1;
				}
			}
		}
	}
	isWormHole(dim,v) {
		var is = false;
		var w = this.physics.wormHole[dim];
		for (var i=0; i<w.length; i++) {
			if (v>w[i][0] && v<w[i][0]+w[i][1]) is = true;
		}
		return is;
	}
	
	bougerPion() {
		this.traceReelle++;
		for (var pid in this.pions) {
			var obj = this.pions[pid];
			if (obj && !obj.dead) {
				var vx = obj.speed*Math.sin(obj.angle*Math.PI/180);
				var vy = obj.speed*Math.cos(obj.angle*Math.PI/180);
				var x = obj.x + vx;
				var y = obj.y + vy;
				if (x<this.physics.bord.xmin) {
					if (this.isWormHole('y',y)) {
						x = this.physics.bord.xmax;
					} else {
						x = this.physics.bord.xmin;
						obj.angle = -obj.angle;
					}
				}
				if (x>this.physics.bord.xmax) {
					if (this.isWormHole('y',y)) {
						x = this.physics.bord.xmin;
					} else {
						x = this.physics.bord.xmax;
						obj.angle = -obj.angle;
					}
				}
				if (y<this.physics.bord.ymin) {
					if (this.isWormHole('x',x)) {
						y = this.physics.bord.ymax;
					} else {
						y = this.physics.bord.ymin;
						obj.angle = 180-obj.angle;
					}
				}
				if (y>this.physics.bord.ymax) {
					if (this.isWormHole('x',x)) {
						y = this.physics.bord.ymin;
					} else {
						y = this.physics.bord.ymax;
						obj.angle = 180-obj.angle;
					}
				}
				if (obj.angle>180) obj.angle = obj.angle-360;
				if (obj.angle<-180) obj.angle = obj.angle+360;
				obj.x = x;
				obj.y = y;
				if (this.traceReelle>15) this.creerTrace(obj);
				this.detectTrace(obj);
			}
		}
		if (this.traceReelle>15) this.traceReelle = 0;
	}
	creerTrace(obj) {
		this.globalpid++;
		var pid = this.globalpid;
		this.traces[pid] = {x:obj.x, y:obj.y, player:obj.player};
		for (var p in this.pions) {
			this.pions[p].newtraces.push({x:obj.x, y:obj.y, pid:pid});
		}
		var that = this;
		setTimeout(function(){that.effaceTrace(pid);},this.values.length);
		setTimeout(function(){that.acideTrace(pid);},1000);
	}
	acideTrace(pid) {
		if (this.traces[pid]) this.traces[pid].acide = true;
	}
	effaceTrace(pid) {
		for (var p in this.pions) {
			this.pions[p].deltraces.push(pid);
		}
		if (this.traces[pid]) delete this.traces[pid];
	}
	detectTrace(pion) {
		var touche = false;
		var trace = null;
		for (var pid in this.traces) {
			var t = this.traces[pid];
			if (t.acide) {
				var dist = Math.sqrt((t.x-pion.x)*(t.x-pion.x)+(t.y-pion.y)*(t.y-pion.y));
				if (dist<pion.dim) touche = true;
				trace = t;
			}
			if (touche) break;
		}
		if (touche) {
			pion.score = pion.score - 1;
			if (pion.score<=0) pion.dead = 1;
			if (t.player!=pion.player) this.pions[t.player].nbPts += 1;
		}
	}

	
}
