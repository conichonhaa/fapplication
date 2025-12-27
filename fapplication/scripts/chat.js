var refreshIntervalId = null;
var refreshIntervalDelay = 5000;
var connection = null;
var delayRetry = {list:[5, 30, 60], index:0};
var pid = null;
var timerActivity = null;
var chatWorld = false;

function loadChat() {
	"use strict";
	var info = document.getElementById('info');
	info.innerHTML = "<img src='images/roue.gif' style='height:20px;' />";
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	if (!window.WebSocket) {
		info.innerHTML = "Désolé, ton navigateur ne supporte pas les WebSockets";
	}
	
	var chatSaisie = document.getElementById('chatSaisie');
	var chatContent = document.getElementById('chatContent');
	var messErr = "Serveur indisponible : <input type='button' value='Retry' onclick='loadChat();' />"
		+ " <span id='affDelayRetry'></span>";
	if (delayRetry.index<delayRetry.list.length) delayRetry.tot = delayRetry.list[delayRetry.index];
	else delayRetry.tot = false;

	var s='';
	if (document.location.protocol=='https:') s = 's';
	connection = new WebSocket('ws'+s+'://'+document.location.hostname+':'+wsPort);
	connection.onopen = function () {
		info.innerHTML = "";
		chatSaisie.disabled = false;
		chatSaisie.focus();
		connection.send(JSON.stringify(wsUserConn));
		var obj = {type:'chatDelai', delai:chatDelai, pid:pid};
		connection.send(JSON.stringify(obj));
		delayRetry.index = 0;
		delayRetry.tot = delayRetry.list[delayRetry.index];
	};
	connection.onerror = function (error) {
		info.innerHTML = messErr;
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
			var c = document.getElementById('chatList').firstChild;
			while (c) {
				var cc = c.firstChild;
				if (c.hasAttribute('id')) c.style.display = 'none';
				c = c.nextSibling;
			}
			var users = json.data;
			for (var u=0; u<users.length; u++) {
				var d = document.getElementById('chat_'+users[u]);
				if (d) d.style.display = 'block';
			}
		}
		if (json.type=='serverActivity') {
			timerActivity = new Date().getTime() + json.data + refreshIntervalDelay;
		}		
		
		if (json.type=='chatMessage') {
			var usr = json.data.usr;
			var d = document.getElementById('chatNom_'+usr);
			var nom = usr;
			if (d) nom = d.innerHTML;
			addMessage(nom, json.data.message, '#000000', new Date(json.data.time));
			pid = json.data.pid;
		}
		if (json.type=='chatWriting') {
			var usr = json.data.usr;
			var d = document.getElementById('chat_'+usr);
			var img = document.getElementById('write_'+usr);
			if (json.data.on) {
				if (d) d.style.fontWeight = 'bold';
				if (img) img.style.display = 'inline';
			} else {
				if (d) d.style.fontWeight = '';
				if (img) img.style.display = 'none';
			}
		}
		
    };
	
	chatSaisie.addEventListener('keydown', saisieDown, false);
	function saisieDown(ev) {
        if (ev.keyCode === 13) {
            var msg = chatSaisie.value;
            if (!msg) {
                return;
            }
			var obj = {type:'chatMessage', data:msg};
			connection.send(JSON.stringify(obj));
            chatSaisie.value = "";
			var obj = {type:'chatWriting', data:false};
			connection.send(JSON.stringify(obj));
			var fd = new FormData();
			fd.append('chatMessage','');
			glbSendForm(fd);
        }
    }
	
	chatSaisie.addEventListener('input', saisieOn, false);
	function saisieOn(ev) {
		var on = (chatSaisie.value!="");
		var obj = {type:'chatWriting', data:on};
		connection.send(JSON.stringify(obj));
    }
	
	function addMessage(author, message, color, dt) {
        var text = "<div class='chatElt'><span style='color:" + color + ";font-weight:bold;'>" + author + "</span> "
             + "<span style='font-size:80%;font-style:italic;' >("
			 + (dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) + ":"
             + (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes())
             + ")</span> : " + message + '</div>';
		chatContent.innerHTML += text;
		chatContent.scrollTop = chatContent.scrollHeight;
		chatRing();
    }
	
	clearInterval(refreshIntervalId);
	refreshIntervalId = setInterval(function() {
		if (connection.readyState!==1 && info.innerHTML=="" || timerActivity && timerActivity<new Date().getTime()) {
			info.innerHTML = messErr;
			clearInterval(refreshIntervalId);
			connection = null;
			chatSaisie.disabled = true;
			delayRetry.time = new Date().getTime();
			setDelayRetry();
		}
		var fd = new FormData();
		fd.append('chatSee','');
		glbSendForm(fd);
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
			loadChat();
			delayRetry.index = delayRetry.index + 1;
		}
	}
}

function changeInteractif(elt) {
	var input = document.getElementById('chatInteractif');
	var check = (elt.style.opacity==0.3);
	if (input) input.checked = check;
	if (check) elt.style.opacity = 1;
	else elt.style.opacity = 0.3;
	glbSendPost(input);
}
var timerBell = null;
function chatRing() {
	clearTimeout(timerBell);
	var img = document.getElementById('chatBell');
	if (img.getAttribute('src')=='images/bell-off.gif') img.setAttribute('src','images/bell.gif');
	timerBell = setTimeout(function(){img.setAttribute('src','images/bell-off.gif');},1500);
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

function callPlayerChat() {
	var fd = new FormData();
	fd.append('networkCall','chat');
	fd.append('type','chat');
	fd.append('page','');
	fd.append('action','getNetworkCall();');
	glbSendForm(fd);
}
