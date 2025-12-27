"use strict";
var http = require("http");
// var https = require('https');
var fs = require('fs');

function start(port, route) {
	global.__root = __dirname.replace("back-nodejs","front");
	global.__exec = __dirname
	global.__data = __dirname.replace("back-nodejs","back-data");
	
	var options = {};
	// if (global.secure) {
		// options = {
		  // key: fs.readFileSync('/etc/letsencrypt/live/fap.brenat-production.fr/privkey.pem'),
		  // cert: fs.readFileSync('/etc/letsencrypt/live/fap.brenat-production.fr/fullchain.pem')
		// };
		// http = https;
	// }
	if (route) {
		function onRequest(request, response) {
			route(response, request);
		}
		// var server = http.createServer(options, onRequest);
		var server = http.createServer(onRequest);
	} else {
		// var server = http.createServer(options);
		var server = http.createServer();
	}
	server.listen(port);
	console.log((new Date()) + " Server"+(global.secure?" secured":"")+" is listening on port " + port);
	return server;
}

exports.start = start;