'use strict';

const mainServer = require('./server_main.js');
const webServer = require('./server_web.js');

/* Servers Activation */
mainServer.activateServer().then(mainAddress => webServer.activateServer(mainAddress));