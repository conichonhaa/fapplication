param.audio = {};

function initAudio() {
	getParam('data', function(){
		getAudioFromObject(param.serverData.data);
		checkReady(function(){
			
		});
	}, param.serverData, 'audio');
}
function getAudioFromObject(obj, parents) {
	if (obj) {
		if (!parents) parents = [];
		Object.keys(obj).forEach(function(i){
			if (typeof(obj[i])!=='string') {
				var p = JSON.parse(JSON.stringify(parents));
				p.push(i);
				getAudioFromObject(obj[i], p);
			} else {
				if ((i=='sound') && obj[i]!="") {
					addAudio(obj[i], parents);
				}
			}
		});
	}
}
function linearArbo(l) {
	return l.join("-");
}
async function addAudio(s, p, callback) {
	param.loading.toLoad++;
	var div = document.getElementById('divLoading');
	if (!div) {
		div = document.createElement('div');
		div.id = 'divLoading';
		div.style.display = 'none';
		document.body.appendChild(div);
	}
	var audio = document.createElement('audio');
		audio.src = s;
		audio.preload = true;
	div.appendChild(audio);
	param.audio[linearArbo(p)] = audio;
	audio.addEventListener('load', function(e){
		param.loading.loaded++;
		if (callback) callback(null,e);
	}, false); 
	audio.addEventListener('error', function(e){
		param.loading.error++;
	}, false); 
}
function audioPlay(ind) {
	if (param.audio[ind] && param.serverData.data.local.params.sounds.value) {
		param.audio[ind].play();
	}
}
function audioStop(ind) {
	if (param.audio[ind]) {
		param.audio[ind].pause();
		param.audio[ind].currentTime = 0;
	}
}
function audioStopAll(ind) {
	for (var a in param.audio) {
		audioStop(a);
	}
}


