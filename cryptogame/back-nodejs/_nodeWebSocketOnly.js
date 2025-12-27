"use strict";
var wsPort = 1664;
var server = require("./server");
var webSocket = require("./webSocket");

global.wsPort = wsPort;

var s = server.start(wsPort);
webSocket.start(s);



