"use strict";
var serverPort = 6969;
var server = require("./server");
var router = require("./router");
var webSocket = require("./webSocket");

global.wsPort = serverPort;
global.secure = false;

var s = server.start(serverPort, router.route);
webSocket.start(s);



