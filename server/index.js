'use strict';

const mainServer = require('./server_main.js');
const webServer = require('./server_web.js');

/* Servers Activation */
startServers();

async function startServers(){
    const main = await mainServer.activateServer();
    const web = await webServer.activateServer(main);
    console.log(`\n\nListening to requests on ${web} or http://localhost:${web.split(':')[web.split(':').length-1]}`);
}