/* SERVER to make image computation */

'use strict';

/* Required External Modules */
const express = require('express');
require('dotenv').config();

const fileupload = require('express-fileupload');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const dao = require('./dao.js');
const facerecognition = require('./face-recognition.js');

/* App Variables */
const main = express();
const port = process.env.MAINPORT || '3999';

/* Process body content */
main.use(express.json(),fileupload());

/* Routes Definitions */
main.use(express.static('public'));
main.get('/', (req, res) => res.redirect('/index.html'));

/* App Configuration */

// POST upload a new image in 'faces' folder
// Request body: image FILE to upload and the profileId
main.post('/faces/profiles', [], (req, res) => {
  if(!req.body.profileId || !req.body.imageBase64) res.status(400).end();
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
          .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
        else{
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ status: 'success', profileId: profileId}));
        }
      })
      ;
    })
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a screenshot
// Request body: BASE64 image to save
main.post('/screenshot', [], async (req, res) => {
  if(!req.body.imageBase64) return res.status(400).end();
  const image = await loadImage(req.body.imageBase64);
  const results = await facerecognition.identifyMultiple(image);
  if(!results || results.length <= 0){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', profileIds: []}));
  }
  const {profileIds, recents} = await evaluateResults(results, req.body.recentFaces);
  console.log("profileIds: ", profileIds);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileIds: profileIds, recentFaces: recents}));
});

async function evaluateResults(results, recentFaces){
  let profileIds = [];
  let recents = (recentFaces)? recentFaces : [];
  console.log(recents);
  for(const result of results) {
    if(result.name == 'unknown') {
      console.log('unknown');
      result.name = await dao.createStranger();
      const canvas = createCanvas(parseInt(result.width), parseInt(result.height));
      canvas.getContext('2d').drawImage(image, result.x, result.y, result.width, result.height, 0, 0, result.width, result.height);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(`${__dirname}/faces/strangers/${result.name}.png`, buffer);
      profileIds.push({profileId: result.name, stranger: result.isStranger});
      await facerecognition.updateFaceMatcher(true);
    } else if(result.isStranger && (!recents || (recents && !recents.includes(result.name)))) {
      if(recents && recents?.length > 4) recents.pop();
      recents.push(result.name);
      profileIds.push({profileId: result.name, stranger: result.isStranger});
      const stranger = await dao.getStrangerById(result.name);
      console.log(stranger);
      stranger.detections++;
      await dao.updateStranger(stranger);
    } else if(!recents || (recents && !recents.includes(result.name))) {
      if(recents && recents?.length > 4) recents.pop();
      recents.push(result.name);
      profileIds.push({profileId: result.name, stranger: result.isStranger});
      //console.log("getting profileStatistics...");
      const profileStatistics = await dao.getProfileStatisticsById(result.name);
      //console.log("...", profileStatistics);
      profileStatistics.faces++;
      await dao.updateProfileStatistics(profileStatistics);
    }
  }
  return {profileIds, recents};
}

/* Server Activation */
exports.activateServer = async function () {
  console.time(`...MAIN server started in`);
  console.time(`Models loaded in`);
  await facerecognition.loadModels(__dirname+process.env.MODELS_URL);
  console.timeEnd(`Models loaded in`);
  console.time(`Face Matchers computed in`);
  await facerecognition.updateFaceMatcher(false);
  await facerecognition.updateFaceMatcher(true);
  console.timeEnd(`Face Matchers computed in`);
  main.listen(port, async () => {console.timeEnd(`...MAIN server started in`);});
  return `http://${Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family==='IPv4' && !i.internal && i.address || []), [])), [])[0]}:${port}`;
}

// Handling Promise Rejection Warning
process.on('unhandledRejection', error => {console.log('MAIN unhandled Rejection', error);});
