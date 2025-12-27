
function teamBuilding(callback) {
	getDOM('divSessionMenu', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);	
		var d = document.createElement('div');	
			d.style.marginTop = '-1.5em';
		div.appendChild(d);	
			makeBoardButton(d, 'global', 'localSetting', null, function(f, res){
				res.launch.img.style.marginLeft = '1em';
				res.launch.addEventListener('click',function(){
					AffParamPersoMenu();
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
	getDOM('divSessionJoin', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionNew', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionMe', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionLaunch', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionAvatar', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionUsers', function(div){
		div.parentNode.removeChild(div);
	});
	getDOM('divSessionTeam', function(div){
		while (div.firstChild) div.removeChild(div.firstChild);
		var d = document.createElement('div');
			d.innerHTML = "Constitution des équipes :";
		div.appendChild(d);
		var d = document.createElement('div');
			d.setAttribute('class', 'loadComment');
			d.innerHTML = "(Glissez-déposez les joueurs dans l'équipe souhaitée)";
		div.appendChild(d);
		var d = document.createElement('div');
		div.appendChild(d);
		function makeBlocTeam(t, obj, d) {
			var dd = document.createElement('div');
				dd.setAttribute('class', 'teamBloc');
				if (obj.color) dd.style.borderColor = obj.color;
				dd.addEventListener('dragover', function(e){
					e.preventDefault();
					this.style.borderWidth = '5px';
					this.style.padding = 'calc(1em - 3px)';
					this.target.style.pointerEvents = 'none';
				});
				dd.addEventListener('dragleave', function(e){
					e.preventDefault();
					this.style.borderWidth = '';
					this.style.padding = '';
					this.target.style.pointerEvents = '';
				});
				dd.addEventListener('drop', function(e){
					e.preventDefault();
					this.target.style.pointerEvents = '';
					var idPlayer = e.dataTransfer.getData('text');
					var elt = document.getElementById(idPlayer);
					this.style.borderWidth = '';
					this.style.padding = '';
					this.target.appendChild(elt);
					setTeam({player:elt.player, playerName:elt.playerName, team:this.target.team});
				});
			d.appendChild(dd);
				var dt = document.createElement('div');
					dt.setAttribute('class', 'teamBlocTitle');
				dd.appendChild(dt);
					var dtc = document.createElement('span');
						dtc.innerHTML = obj.name;
					dt.appendChild(dtc);
					if (obj.color) {
						var dtci = document.createElement('input');
							dtci.type = 'color';
							dtci.value = obj.color;
							dtci.style.display = 'none';
						dt.appendChild(dtc);
						var dtc = document.createElement('div');
							dtc.style.backgroundColor = obj.color;
							dtc.setAttribute('class','teamBlocColor');
							dtc.innerHTML = "&nbsp;";
							dtc.input = dtci;
						dt.appendChild(dtc);
						dtci.div = dtc;
						if (param.serverData.player) {
							dtc.addEventListener('click', function(){
								this.input.click();
							});
						}
						dtci.addEventListener('change', function(){
							this.div.style.backgroundColor = this.value;
							var bloc = this.div.parentNode.parentNode;
							bloc.style.borderColor = this.value;
							setTeam({color:this.value, team:bloc.target.team});
						});
					}
				var dm = document.createElement('div');
					dm.setAttribute('class', 'teamBlocContent');
					dm.id = 'divTeam_'+t;
					if (obj.color) dm.color = dtc;
					dm.team = t;
					dd.target = dm;
				dd.appendChild(dm);
				var df = document.createElement('div');
					df.setAttribute('class', 'teamBlocTitle');
					df.innerHTML = "...";
				dd.appendChild(df);
		}
		makeBlocTeam(null, {name:'Solo'}, d);
		for (var t in param.serverData.data.teams) {
			makeBlocTeam(t, param.serverData.data.teams[t], d);
		}
		var players = param.serverData.data.players;
		for (var p in players.items) {
			if (players.items[p].team) {
				var dm = document.getElementById('divTeam_'+players.items[p].team);
			} else {
				var dm = document.getElementById('divTeam_null');
			}			
			var dp = document.createElement('div');
				dp.setAttribute('class', 'teamBlocElt');
				dp.id = 'divPlayer_'+players.items[p].id;
				dp.player = players.items[p].id;
				dp.playerName = p;
				if (param.serverData.player) dp.draggable = true;
				dp.addEventListener('dragstart', function(e){
					e.dataTransfer.setData('text', this.id);
				});
			dm.appendChild(dp);
				var s = document.createElement('img');
					s.src = players.items[p].src;
					s.setAttribute('class','teamBlocEltImg');
				dp.appendChild(s);	
				var s = document.createElement('div');
					s.innerHTML = p;
					s.setAttribute('class','teamBlocEltName');
				dp.appendChild(s);
		}
		
		var d = document.createElement('div');
			d.style.marginTop = '2em';
		div.appendChild(d);
		makeBoardButton(d, 'global', 'launch', null, function(f, res){
			res.launch.addEventListener('click',function(){
				launchTeam();
			});
		addBoardButtonCaption(res.launch, "Démarrer", {size:'1.5em'});
		}, {taille:'3em'});
	});
}
function teamUpdating() {
	for (var t in param.serverData.data.teams) {
		getDOM('divTeam_'+t, function(dm){
			dm.parentNode.style.borderColor = param.serverData.data.teams[t].color;
			dm.color.style.backgroundColor = param.serverData.data.teams[t].color;
			dm.color.input.value = param.serverData.data.teams[t].color;
		});
	}
	var players = param.serverData.data.players;
	for (var p in players.items) {
		getDOM('divPlayer_'+players.items[p].id, function(dp){
			if (players.items[p].team) {
				var dm = document.getElementById('divTeam_'+players.items[p].team);
			} else {
				var dm = document.getElementById('divTeam_null');
			}
			dm.appendChild(dp);
		});		
	}		
}
