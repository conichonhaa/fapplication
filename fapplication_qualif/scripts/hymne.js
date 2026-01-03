
var mediaHymne = {};
function initMedia() {
	var audio = document.getElementById('audioHymne');
	audio.addEventListener('play',affKaraoke,false);
	audio.addEventListener('pause',hideKaraoke,false);
	var video = document.getElementById('videoHymne');
	video.addEventListener('play',affKaraoke,false);
	video.addEventListener('pause',hideKaraoke,false);
	mediaHymne.source = audio;
	mediaHymne.decalage = 0;
	mediaHymne.listen = 0;
}
function switchMedia(elt) {
	var audio = document.getElementById('audioHymne');
	var video = document.getElementById('videoHymne');
	if (elt.getAttribute('media')=='audio') {
		mediaHymne.source = video;
		mediaHymne.decalage = 0;
		elt.setAttribute('media','video');
		elt.setAttribute('title','Musique');
		audio.style.display = 'none';
		audio.pause();
		video.style.display = '';
	} else {
		mediaHymne.source = audio;
		mediaHymne.decalage = 0;
		elt.setAttribute('media','audio');
		elt.setAttribute('title','Voir le clip');
		audio.style.display = '';
		video.style.display = 'none';
		video.pause();
	}
	
}

var timerKaraoke = null;
function affKaraoke() {
	clearInterval(timerKaraoke);
	timerKaraoke = setInterval(function(){affBlocKaraoke();},20);
}
function hideKaraoke() {
	clearInterval(timerKaraoke);
	affBlocKaraoke();
}
function affBlocKaraoke() {
	var div = document.getElementById('karaoke');
	var c = div.firstChild;
	var t = mediaHymne.source.currentTime + mediaHymne.decalage;
	var find = false;
	while (c) {
		var deb = c.getAttribute('deb')/1;
		var fin = c.getAttribute('fin')/1;
		c.style.display = 'none';
		c.setAttribute('class','blocKaraoke');
		if (t<=deb-0.2 && !find) {
			find = c.previousSibling;
			find.style.display = 'block';
			affLettreKaraoke(find,t);
			find.setAttribute('class','blocKaraoke b-on');
			c.style.display = 'block';
			affLettreKaraoke(c,t);
			if (find.previousSibling) {
				affLettreKaraoke(find.previousSibling,t);
				find.previousSibling.style.display = 'block';
				find.previousSibling.setAttribute('class','blocKaraoke b-old');
			}
		}
		c = c.nextSibling;
	}
	mediaHymne.listen += 20;
	if (mediaHymne.listen>=60000) {
		mediaHymne.listen = 0;
		tryGainXP(mediaHymne.source,'daily-hymne',3);
	}	
}
function affLettreKaraoke(bloc,t) {
	var c = bloc.firstChild;
	while (c) {
		if (c.getAttribute('aff')/1<t) c.setAttribute('class','lettreKaraoke l-on');
		else c.setAttribute('class','lettreKaraoke');
		c = c.nextSibling
	}	
}


