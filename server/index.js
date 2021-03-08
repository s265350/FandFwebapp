/* MAIN SERVER */
/* here image operations are performed */

'use strict';

/* Required External Modules */
const express = require('express');

const fs = require('fs');
const chokidar = require('chokidar');
const { createCanvas, loadImage } = require('canvas');

const webserver = require('./webserver.js');
const dao = require('./dao.js');
const facerecognition = require('./face-recognition.js');

/* App Variables */
const app = express();

/* App Configuration */
const watcherOptions = {depth: 0, awaitWriteFinish: true};
const watcherFaces = chokidar.watch('./faces/**/*.png', watcherOptions);
watcherFaces.on('add', path => newImage(path));
const watcherProfiles = chokidar.watch('./faces/profiles/**/*.png', watcherOptions);
watcherProfiles.on('add', path => newProfileImage(path));

// called when a new image is added to 'faces' folder
async function newImage(path) {
  const clientId = path.split('_')[1];
  let stranger = false;
  const recents = (webserver.getRecents(clientId))? webserver.getRecents(clientId) : [];
  const image = await loadImage(`${__dirname}/${path}`);
  const results = await facerecognition.identifyMultiple(image);
  console.time("result computation took");
  if(results)
    results.forEach(async (result) => {
      if(result.name == 'unknown'){
        stranger = true;
        await unknownResult(result, image);
        if(recents && recents?.length > 5) recents.pop();
        recents.push(result.name);
      } else if((result.isStranger && (!recents || (recents && !recents.includes(result.name))))){
        stranger = true;
        if(recents && recents?.length > 5) recents.pop();
        recents.push(result.name);
        await strangerResult(result);
      } else if(!recents || (recents && !recents.includes(result.name))){
        if(recents && recents?.length > 5) recents.pop();
        recents.push(result.name);
        await profileResult(result);
      }
    });
    console.timeEnd("result computation took");
  fs.unlink(path, (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
  webserver.notification(clientId, stranger, recents);
}

async function unknownResult(result, image) {
  result.name = await dao.createStranger();
  const newPath = `${__dirname}/faces/strangers/${result.name}.png`;
  const canvas = createCanvas(parseInt(result.width), parseInt(result.height));
  canvas.getContext('2d').drawImage(image, result.x, result.y, result.width, result.height, 0, 0, result.width, result.height);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(newPath, buffer, (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
  await facerecognition.updateFaceMatcher(true);
}

async function strangerResult(result) {
  const stranger = await dao.getStrangerById(result.name);
  console.log(stranger);
  stranger.detections++;
  await dao.updateStranger(stranger);
}

async function profileResult(result) {
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
          .then(profiles => {return updateFaceMatcher(profiles, false);}).then( () => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ status: 'success', profileId: profileId}));
          })
          .catch( (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
        else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ status: 'success', profileId: profileId}));
        }
      });
    })
    .catch( (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
}

/* Server Activation */
(async function activateServers() {
  console.time(`...Servers started in`);
  //console.time(`Models loaded and Face Matchers computed in`);
  await facerecognition.loadModels(__dirname+process.env.MODELS_URL);
  await facerecognition.updateFaceMatcher(false).then(facerecognition.updateFaceMatcher(true));
  //console.timeEnd(`Models loaded and Face Matchers computed in`);
  const address = await webserver.activateServer();
  console.timeEnd(`...Servers started in`);
  console.log(`\nListening to requests on ${address} or http://localhost:${address.split(':')[address.split(':').length-1]}`);
})();

// Handling Promise Rejection Warning
process.on('unhandledRejection', (err) => {if(err) console.log({errors: [{'param': 'Main Server', 'msg': err}]});} );
