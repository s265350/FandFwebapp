/* SERVER */

"use strict";

/* Required External Modules */
const express = require("express");
const fileupload = require('express-fileupload');
const fs = require('fs');
const dao = require('./dao.js');
const { createCanvas, loadImage } = require('canvas')

/* App Variables */
const app = express();
const port = process.env.PORT || "8000";

/* Process body content */
app.use(express.json(),fileupload());

/* Routes Definitions */
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/index.html'));

/* App Configuration */
// GET all profiles rows as Profile objects
app.get('/profiles', (req, res) => {
  dao.getProfiles()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET all profiles ID
app.get('/profilesid', (req, res) => {
  dao.getProfilesId()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET profile with corresponding profile ID
// Request parameters: profile ID
app.get('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end(`profileId: ${req.body.profileId}`);
  dao.getProfileById(req.params.profileId)
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET first admin profile
app.get('/admin', (req, res) => {
  dao.getAdminProfile()
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET all statistics as ProfileStatistics objects
app.get('/statistics', (req, res) => {
  dao.getStatistics()
    .then( (statistics) => res.json(statistics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET ProfileStatistics object with corresponding <profileId> 
// Request parameters: profile ID
app.get('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end(`profileId: ${req.body.profileId}`);
  dao.getProfileStatisticsById(req.params.profileId)
    .then( (profileStatisctics) => res.json(profileStatisctics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET path list for all images in "strangers" folder
app.get('/strangers', (req, res) => {
  fs.readdir(`${__dirname}/faces/strangers`, (err, names) => {
    if(err) { res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) }
    res.json(names.filter(function(name){return !name.includes("DS_Store");}));
  });
});

// GET image form "faces" folder
// Request parameters: name of the image file
app.get('/faces/:filename', (req, res) => {
  if(!req.params.filename) res.status(400).end(`filename: ${req.params.filename}`);
  res.sendFile(`${__dirname}/faces/${req.params.filename}`, {}, (err) => {if(err)res.status(503).json({errors: [{'param': 'Server', 'msg': err}],})});
});

// GET image form "strangers" folder
// Request parameters: name of the image file
app.get('/faces/strangers/:filename', (req, res) => {
  if(!req.params.filename) res.status(400).end(`filename: ${req.params.filename}`);
  res.sendFile(`${__dirname}/faces/strangers/${req.params.filename}`, {}, (err) => {if(err)res.status(503).json({errors: [{'param': 'Server', 'msg': err}],})});
});

// POST upload a new profile row
// Request body: object describing a Profile { profileId*, firstName*, lastName, phone*, email, system*, family, notifications, notificationsPhone, notificationsEmail }
app.post('/profiles', [], (req, res) => {
  if(!req.body.profileId || !req.body.firstName || !req.body.phone || !req.body.system) res.status(400).end(`profileId: ${req.body.profileId}; firstName: ${req.body.firstName}; phone: ${req.body.phone}; system: ${req.body.system};`);
  dao.createProfile({profileId: req.body.profileId,firstName: req.body.firstName,lastName: req.body.lastName,phone: req.body.phone,email: req.body.email,system: req.body.system,family: req.body.family,notifications: req.body.notifications,notificationsPhone: req.body.notificationsPhone,notificationsEmail: req.body.notificationsEmail,avatar: req.body.avatar})
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new statistics row
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
app.post('/statistics', [], (req, res) => {
  if(!req.body.profileId || !req.body.faces || !req.body.unrecognized) res.status(400).end(`profileId: ${req.body.profileId}; faces: ${req.body.faces}; unrecognized: ${req.body.unrecognized};`);
  dao.createProfileStatistics({profileId: req.body.profileId,faces: req.body.faces,unrecognized: req.body.unrecognized})
    .then( () => res.status(200).end() )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new image in "faces" folder
// Request body: image file to upload and name given to it
app.post('/faces', [], (req, res) => {
  if(!req.files || Object.keys(req.files).length === 0) res.status(400).end(`No files were uploaded`);
  if(!req.body.name) res.status(400).end(`name: ${req.body.name}`);
  const image = req.files.avatar;
  const name = `${req.body.name}.${image.name.split(".")[image.name.split(".").length-1]}`;
  image.mv(`${__dirname}/faces/${name}`, (error) => {
    if(error) {
      res.writeHead(500, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({ status: 'error', message: error }));
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', directory: name}));
  });
});

// POST upload a new image in "strangers" folder
// Request body: image url to upload, width and height of the screenshot and the name given to it
app.post('/screenshot', [], (req, res) => {
  if(!req.body.url || !req.body.width || !req.body.height || !req.body.name) res.status(400).end(`url: ${req.body.url};width: ${req.body.width};height: ${req.body.height};name: ${req.body.name}`);
  const canvas = createCanvas(req.body.width, req.body.height);
  const context = canvas.getContext('2d');
  loadImage(req.body.url).then(image => {
    context.drawImage(image, 0, 0);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${__dirname}/faces/strangers/${req.body.name}`, buffer);
  });
});

// POST move an image from "strangers" folder to the "faces" one
// Request body: file name of the image and name given to the copy
app.post('/faces/strangers', [], (req, res) => {
  if(!req.body.filename || !req.body.name) res.status(400).end(`file: ${req.body.filename}; name: ${req.body.name}`);
  const oldPath = `${__dirname}/faces/strangers/${req.body.filename}`;
  const newPath = `${__dirname}/faces/${req.body.name}.${req.body.filename.split('.')[req.body.filename.split('.').length-1]}`;
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

// PUT update a profile row
// Request parameters: 
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.put('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end(`profileId: ${req.body.profileId}; body: ${req.body}`);
  dao.updateProfile(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT update a ProfileStatistics row
// Request parameters: profile ID
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
app.put('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end(`profileId: ${req.body.profileId}; body: ${req.body}`);
  dao.updateProfileStatistics(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete an image in "faces" or "strangers" folder
// Request parameters: image name
// Request body: boolean to say if is a stranger or not
app.delete(`/faces/:filename`, (req, res) => {
  if(!req.params.filename || !req.body.stranger) res.status(400).end(`filename: ${req.params.filename};stranger: ${req.body.stranger}`);
  let path = "";
  if(req.body.stranger) path = "/strangers"
  fs.unlink(`${__dirname}/faces${path}/${req.params.filename}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

/* Server Activation */
app.listen(port, () => {console.log(`Listening to requests on http://localhost:${port}`);});