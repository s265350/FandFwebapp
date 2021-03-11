/* MAIN SERVER */
/* here face detection and recognition operations are performed */

'use strict';

/* Required External Modules */
const express = require('express');
require('dotenv').config();

const fetch = require('node-fetch');

const fs = require('fs');
const chokidar = require('chokidar');
const { createCanvas, loadImage } = require('canvas');

const dao = require('./dao.js');
const facerecognition = require('./face-recognition.js');

/* App Variables */
const app = express();
const webURL = (clientId) => {return `${process.env.URL}${process.env.WEBPORT || '3999'}/recents/${clientId}`};

/* App Configuration */
const watcherOptions = {depth: 0, awaitWriteFinish: true};
const watcherFaces = chokidar.watch('./faces/**/*.png', watcherOptions);
watcherFaces.on('add', path => newImage(path));
const watcherProfiles = chokidar.watch('./faces/profiles/**/*.png', watcherOptions);
watcherProfiles.on('add', path => newProfileImage(path));

// called when a new image is added to the 'faces' folder
async function newImage(path) {
  //console.time("faces computation tooks");
  const clientId = path.split('_')[1];
  let stranger = false;
  const getRecentsResponse = await fetch(webURL(clientId));
  if(!getRecentsResponse.ok) throw `ERROR fetching ${webURL(clientId)}`;
  const recents = await getRecentsResponse.json();
  const image = await loadImage(`${__dirname}/${path}`);
  const results = await facerecognition.identifyMultiple(image);
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
  fs.unlink(path, (err) => {if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});} );
  const postRecentsResponse = await fetch(webURL(clientId), {
    method: 'POST',
    headers:{'Content-Type': 'application/json',},
    body: JSON.stringify({stranger: stranger, recents: recents}),
  });
  if(!postRecentsResponse.ok) {
    console.log(postRecentsResponse);
    postRecentsResponse.json()
        .then( (obj) => {console.log(obj);} ) // error msg in the response body
        .catch( (err) => {console.log({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
  }
  //console.timeEnd("faces computation tooks");
}

async function unknownResult(result, image) {
  result.name = await dao.createStranger();
  const newPath = `${__dirname}/faces/strangers/${result.name}.png`;
  const canvas = createCanvas(parseInt(result.width), parseInt(result.height));
  canvas.getContext('2d').drawImage(image, result.x, result.y, result.width, result.height, 0, 0, result.width, result.height);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(newPath, buffer, async (err) => {
    if(err) console.log({errors: [{'param': 'Server', 'msg': err}]});
    else await facerecognition.updateFaceMatcher(true);
  });
}

async function strangerResult(result) {
  const stranger = await dao.getStrangerById(result.name);
  //console.log(stranger);
  stranger.detected++;
  await dao.updateStranger(stranger);
}

async function profileResult(result) {
  const profileStatistics = await dao.getProfileStatisticsById(result.name);
  profileStatistics.faces++;
  await dao.updateProfileStatistics(profileStatistics);
}

// called when a new image is added to 'profile' folder
async function newProfileImage(path) {
  await facerecognition.updateFaceMatcher(false);
}

/* Server Activation */
(exports.run = async function() {
  console.log(`\n--------------------------------------------------------------------`);
  console.log(`Server activation might take some time due to loading models and computing initial face descriptors...`);
  console.log(`--------------------------------------------------------------------`);
  console.time(`...Server activation ended in`);
  await facerecognition.loadModels(__dirname+process.env.MODELS_URL);
  await facerecognition.updateFaceMatcher(false).then(facerecognition.updateFaceMatcher(true));
  console.log(`\n---------------------------------------`);
  console.timeEnd(`...Server activation ended in`);
  console.log(`---------------------------------------\n`);
})();

// Handling Promise Rejection Warning and crashes
process
  .on('unhandledRejection', (err, p) => {
    console.error(err, 'Unhandled Rejection at Promise', p);
    process.exit(1);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  })
  .on('SIGTERM', err => {
    console.error(err, 'SIGTERM');
    process.exit(1);
  });
