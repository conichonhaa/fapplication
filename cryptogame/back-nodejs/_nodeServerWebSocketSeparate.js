"use strict";
var serverPort = 8080;
var wsPort = 1664;
var server = require("./server");
var router = require("./router");
var webSocket = require("./webSocket");

global.wsPort = wsPort;

var s1 = server.start(serverPort, router.route);
var s2 = server.start(wsPort);
webSocket.start(s2);




