/* MAIN SERVER which performs images computation */

'use strict';

/* Required External Modules */
const express = require('express');

const fs = require('fs');
const chokidar = require('chokidar');
const { createCanvas, loadImage } = require('canvas');

const webserver = require('./server_web.js');
const dao = require('./dao.js');
const facerecognition = require('./face-recognition.js');

/* App Variables */
const app = express();

/* Initialize */
activateServers();
const watcherOptions = {depth: 0, awaitWriteFinish: true};
const watcherFaces = chokidar.watch('./faces/**/*.png', watcherOptions);
const watcherProfiles = chokidar.watch('./faces/profiles/**/*.png', watcherOptions);

/* App Configuration */
watcherFaces
  .on('add', path => newImage(path))
  .on('unlink', path => console.log(`File ${path} has been removed`));

watcherProfiles
  .on('add', path => newProfileImage(path))
  .on('unlink', path => console.log(`File ${path} has been removed`));

// called when a new image is added to 'faces' folder
async function newImage(path) {
  console.log(`new image: ${path}`);
  let profileIds;
  let recents = webserver.getRecents();
  if(!recents) recents = [];
  const image = await loadImage(`${__dirname}/${path}`);
  const results = await facerecognition.identifyMultiple(image);
  results.forEach(async (result) => {
    if(result.name == 'unknown'){
      console.log('unknown');
      await unknown(result, image);
    } else if((result.isStranger && (!recents || (recents && !recents.includes(result.name))))){
      console.log('known stranger');
      if(recents && recents?.length > 4) recents.pop();
      recents.push(result.name);
      await stranger(result);
    } else if(!recents || (recents && !recents.includes(result.name))){
      console.log('known profile');
      if(recents && recents?.length > 4) recents.pop();
      recents.push(result.name);
      await known(result);
    }
    profileIds.push({profileId: result.name, stranger: result.isStranger});
    fs.unlink(path, (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
  });
  webserver.setRecents(recents);
}

async function unknown(result, image){
  result.name = await dao.createStranger();
  const newPath = `${__dirname}/faces/strangers/${result.name}.png`;
  const canvas = createCanvas(parseInt(result.width), parseInt(result.height));
  canvas.getContext('2d').drawImage(image, result.x, result.y, result.width, result.height, 0, 0, result.width, result.height);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(newPath, buffer, (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
  await facerecognition.updateFaceMatcher(true);
}

async function stranger(result){
  const stranger = await dao.getStrangerById(result.name);
  console.log(stranger);
  stranger.detections++;
  await dao.updateStranger(stranger);
}

async function known(result){
  const profileStatistics = await dao.getProfileStatisticsById(result.name);
  profileStatistics.faces++;
  await dao.updateProfileStatistics(profileStatistics);
}

// called when a new image is added to 'profile' folder
async function newProfileImage(path) {
  loadImage(req.body.imageBase64)
    .then( image => {
      facerecognition.identifySingle(image)
        .then(result => {
        if(!result) return undefined;
        let profileId;
        if(result.name != 'unknown' && !result.isStranger && req.body.profileId == result.name){
          profileId = result.name;
          const canvas = createCanvas(parseInt(result.width), parseInt(result.height));
          canvas.getContext('2d').drawImage(image, 0, 0);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(`${__dirname}/faces/profiles/${req.body.profileId}.png`, buffer);
        }
        return profileId;
      })
      .then( profileId => {
        if(profileId) dao.getProfiles()
          .then(profiles => {return updateFaceMatcher(profiles, false);}).then( result => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ status: 'success', profileId: profileId}));
          })
          .catch( (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
        else{
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ status: 'success', profileId: profileId}));
        }
      })
      ;
    })
    .catch( (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
}

/* Server Activation */
async function activateServers() {
  console.time(`...Servers started in`);
  //console.time(`Models loaded in`);
  await facerecognition.loadModels(__dirname+process.env.MODELS_URL);
  //console.timeEnd(`Models loaded in`);
  //console.time(`Face Matchers computed in`);
  await facerecognition.updateFaceMatcher(false).then(facerecognition.updateFaceMatcher(true));
  //console.timeEnd(`Face Matchers computed in`);
  const address = await webserver.activateServer();
  console.timeEnd(`...Servers started in`);
  console.log(`\nListening to requests on ${address} or http://localhost:${address.split(':')[address.split(':').length-1]}`);
}

// Handling Promise Rejection Warning
process.on('unhandledRejection', (err) => {if(err) console.log({errors: [{'param': 'Main Server', 'msg': err}]});} );
