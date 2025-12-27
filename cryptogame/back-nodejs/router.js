"use strict";
var url = require("url");
var fs = require('fs');
var mime = require('mime');
var Cookies = require('cookies');
var formidable = require('formidable');

var handle = {}
	handle["/"] = start;
	handle["/back-php/index.php"] = initConnexion;
	handle["/getData"] = getData;
	handle["/setData"] = setData;

function route(response, request) {
	var pathname = url.parse(request.url).pathname;
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, request);
	} else {
		showFile(global.__root+pathname, response);
	}
}
exports.route = route;

function showFile(url, response) {
	fs.readFile(url, (err, data) => {
		if (err) {
			// console.error(err);
			response.writeHead(404, {"Content-Type": "text/html;charset=utf-8"});
			response.write("404 Non trouvé");
			response.end();
			return;
		}
		var body = data;
		response.writeHead(200, {"Content-Type": mime.getType(url)});
		response.write(data);
		response.end();
	});
}

function start(response, request) {
	showFile(global.__root+'/board.htm', response);
}

function sendResponse(response, text) {
	var xml = "<xml>"+text+"</xml>";
	response.writeHead(200, {"Content-Type": "application/xml"});
	response.write(xml);
	response.end();
}
function initConnexion(response, request) {
	var cookies = new Cookies(request, response);
	var user = cookies.get('cryptoUser');
	var userName = cookies.get('cryptoUserName');
	var xml = "<moteur>Node.js</moteur>";
		xml += "<wsPort>"+global.wsPort+"</wsPort>";
		if (user) xml += "<user>"+user+"</user>";
		if (userName) xml += "<username>"+userName+"</username>";
		xml += "<actions name='getData'>getData</actions>";
		xml += "<actions name='setData'>setData</actions>";
	sendResponse(response, xml);
}
function getData(response, request) {
	var xml = "<data>Toutes les données stockées</data>";
		xml += "<variables>";
		var query = url.parse(request.url, true).query;
		Object.keys(query).forEach(function(key){
			xml += "<"+key+">"+query[key]+"</"+key+">";
		});
		xml += "</variables>";
	sendResponse(response, xml);
}
function setData(response, request) {
	var cookies = new Cookies(request, response);
	var delai = 1000 * 24 * 3600 * 1000;
	var date = new Date();
	date.setTime(date.getTime()+delai);
	if (request.method === 'POST') {
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			if (fields.user!==undefined) {
				cookies.set('cryptoUser', fields.user, {expirationDate:date});
			}
			if (fields.username!==undefined) {
				cookies.set('cryptoUserName', fields.username);
			}
			sendResponse(response, null);
		});
	}
}
