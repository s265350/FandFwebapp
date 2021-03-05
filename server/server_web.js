/* SERVER */

'use strict';

/* Required External Modules */
const express = require('express');
require('dotenv').config();

const fileupload = require('express-fileupload');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const mandrill = require('node-mandrill')(process.env.MANDRILL_API_KEY);
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const dao = require('./dao.js');
const facerecognition = require('./face-recognition.js');

/* App Variables */
const web = express();
const port = process.env.FRONTENDPORT || '4000';

/* Process body content */
web.use(express.json(),fileupload());

/* Routes Definitions */
web.use(express.static('public'));
web.get('/', (req, res) => res.redirect('/index.html'));

/* App Configuration */
// GET all profiles rows as Profile objects
web.get('/profiles', (req, res) => {
  dao.getProfiles()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET all profiles ID
web.get('/profilesid', (req, res) => {
  dao.getAllProfilesId()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET profile with corresponding profile ID
// Request parameters: profile ID
web.get('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.getProfileById(req.params.profileId)
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET first admin profile
web.get('/admin', (req, res) => {
  dao.getAdminProfile()
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET all statistics as ProfileStatistics objects
web.get('/statistics', (req, res) => {
  dao.getProfilesStatistics()
    .then( (statistics) => res.json(statistics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET ProfileStatistics object with corresponding <profileId> 
// Request parameters: profile ID
web.get('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.getProfileStatisticsById(req.params.profileId)
    .then( (profileStatisctics) => res.json(profileStatisctics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET path list for all images in 'strangers' folder
web.get('/strangers', (req, res) => {
  dao.getStrangers()
    .then( (strangers) => res.json(strangers) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET all strangers ID
web.get('/strangersid', (req, res) => {
  dao.getAllStrangersId()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET the stranger with corresponding profile ID
// Request parameters: profile ID
web.get('/strangers/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.getStrangerById(req.params.profileId)
    .then( (stranger) => res.json(stranger) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET image form 'profiles' folder
// Request parameters: name of the image file
web.get('/faces/profiles/:filename', (req, res) => {
  if(!req.params.filename) res.status(400).end();
  res.sendFile(`${__dirname}/faces/profiles/${req.params.filename}`, {}, (err) => {if(err)res.status(503).json({errors: [{'param': 'Server', 'msg': err}],})});
});

// GET image form strangers' folder
// Request parameters: name of the image file
web.get('/faces/strangers/:filename', (req, res) => {
  if(!req.params.filename) res.status(400).end();
  res.sendFile(`${__dirname}/faces/strangers/${req.params.filename}`, {}, (err) => {if(err)res.status(503).json({errors: [{'param': 'Server', 'msg': err}],})});
});

// POST upload a new profile row
// Request body: object describing a Profile { profileId*, firstName*, lastName, phone*, email, system*, family, notifications, notificationsPhone, notificationsEmail }
web.post('/profiles', [], (req, res) => {
  if(!req.body.firstName || !req.body.phone || !req.body.system) res.status(400).end();
  dao.createProfile({firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone, email: req.body.email, system: req.body.system, family: req.body.family, notifications: req.body.notifications, notificationsPhone: req.body.notificationsPhone, notificationsEmail: req.body.notificationsEmail})
    .then( (profileId) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: profileId}));
    })
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new statistics row
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
web.post('/statistics', [], (req, res) => {
  if(!req.body.profileId || !req.body.faces || !req.body.unrecognized) res.status(400).end();
  dao.createProfileStatistics({profileId: req.body.profileId,faces: req.body.faces,unrecognized: req.body.unrecognized})
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new stranger row
// Request body: object describing a stranger { profileId*, detections }
web.post('/strangers', [], (req, res) => {
  if(!req.body.profileId || !req.body.detections) res.status(400).end();
  dao.createStranger({profileId: req.body.profileId, detections: req.body.detections})
    .then( (profileId) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: profileId}));
    })
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new image in 'faces' folder
// Request body: image FILE to upload and the profileId
web.post('/faces/profiles', [], (req, res) => {
  if(!req.body.profileId || !req.body.imageBase64) res.status(400).end();
  loadImage(req.body.imageBase64)
    .then( image => {
      facerecognition.identifySingle(image).then(result => {
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
      });
    })
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a screenshot
// Request body: BASE64 image to save
web.post('/screenshot', [], async (req, res) => {
  if(!req.body.imageBase64) res.status(400).end();
  const image = await loadImage(req.body.imageBase64);
  const results = await facerecognition.identifyMultiple(image);
  if(!results && results.length <= 0){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', profileIds: undefined}));
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

// POST move an image from a folder to another one
// Request params: the folder in which the image is
// Request body: the file name of the image (old id) and the destination folder
web.post('/faces/:folder', [], (req, res) => {
  if(!req.params.folder || !req.body.filename || !req.body.folder) res.status(400).end();
  const oldPath = `${__dirname}/faces/${req.params.folder}/${req.body.filename}`;
  const newPath = `${__dirname}/faces/${req.body.folder}/${req.body.filename}`;
  fs.readFile(oldPath, (err, data) => {
      if(err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
      fs.writeFile(newPath, data, (err) => {
          if(err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
      });
  });
  fs.unlink(oldPath, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

// POST email
// Request parameters: 
// Request body: email address, name, subject, message
web.post('/sendemail', function(req, res){
  if(!req.body.email || !req.body.name || !req.body.subject || !req.body.message || !req.body.imageBase64) res.status(400).end();
  // eventual spam protection or checks.
  mandrill('/messages/send', {
    message: {
        to: [{email: req.body.email , name: req.body.name}],
        from_email: process.env.MANDRILL_EMAIL,
        from_name: process.env.COMPANY_NAME,
        subject: req.body.subject,
        text: req.body.message,
        important: true,
        images: [{type: 'image/png' , name: 'unknown', content: req.body.imageBase64}]
    }
  }, function(error){if (error) console.log( JSON.stringify(error) );});
});

// POST sms
// Request parameters: 
// Request body: phone number, message, (optional) image
web.post('/sendsms', function(req, res){
  if(!req.body.phone || !req.body.message) res.status(400).end();
  // if an image is passed send MMS else send SMS
  if(req.body.imageBase64)
    twilio.messages.create({
      body: req.body.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      mediaUrl: req.body.imageBase64,
      to: req.body.phone
    });
  else
    twilio.messages.create({
      body: req.body.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.phone
    });
});

// PUT update a profile row
// Request parameters: 
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
web.put('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end();
  dao.updateProfile(req.body)
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT update a ProfileStatistics row
// Request parameters: profile ID
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
web.put('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end();
  dao.updateProfileStatistics(req.body)
      .then( () => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT update a stranger row
// Request parameters: profile ID
// Request body: object describing a stranger { profileId*, detections }
web.put('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end();
  dao.updateStranger(req.body)
      .then( () => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete an image in a folder
// Request parameters: image name
// Request body: boolean specifing if is a stranger or not
web.delete(`/faces/:filename`, (req, res) => {
  if(!req.params.filename) res.status(400).end();
  const path = (req.body.stranger)? "strangers" : "profiles";
  fs.unlink(`${__dirname}/faces/${path}/${req.params.filename}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

// DELETE delete a profile row
// Request parameters: profile ID
web.delete(`/profiles/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteProfile(req.params.profileId)
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete a statistics row
// Request parameters: profile ID
web.delete(`/statistics/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteProfileStatistics(req.params.profileId)
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete stranger row
// Request parameters: profile ID
web.delete(`/strangers/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteStranger(req.params.profileId)
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

/* Server Activation */
exports.activateServer = function (){
  web.listen(port, async () => {
    console.log(`Loading models...`);
    await facerecognition.loadModels(__dirname+process.env.MODELS_URL);
    await facerecognition.updateFaceMatcher(false).then(facerecognition.updateFaceMatcher(true));
    console.log(`Listening to requests on http://localhost:${port}`);
  });
}