/* SERVER */

"use strict";

/* Required External Modules */
const express = require("express");
const fileupload = require('express-fileupload');
const fs = require('fs');
const dao = require('./dao.js');

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
app.get('/profile/admin', (req, res) => {
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
app.get('/faces/strangers', (req, res) => {
  fs.readdir(`${__dirname}/public/faces/strangers`, (err, names) => {
    if(err) { res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) }
    const ext = ["jpg", "jpeg", "png", "svg"];
    names = names.filter(function(name){return !name.includes("DS_Store");})
    names = names.map(name => {
      if(ext.includes(name.split(".")[name.split(".").length-1])){return `/faces/strangers/${name}`;}
      else{res.status(503).json({errors: [{'param': 'Server', 'msg': err}],})}
    });
    res.json(names);
  });
});

// POST upload a new profile row
// Request body: object describing a Profile { profileId*, firstName*, lastName, phone*, email, system*, family, notifications, notificationsPhone, notificationsEmail }
app.post('/profiles', [], (req, res) => {
  if(!req.body.profileId || !req.body.firstName || !req.body.phone || !req.body.system) res.status(400).end(`profileId: ${req.body.profileId}; firstName: ${req.body.firstName}; phone: ${req.body.phone}; system: ${req.body.system};`);
  dao.createProfile({
      profileId: req.body.profileId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      system: req.body.system,
      family: req.body.family,
      notifications: req.body.notifications,
      notificationsPhone: req.body.notificationsPhone,
      notificationsEmail: req.body.notificationsEmail,
      avatar: req.body.avatar
  }).then( () => res.status(200).end() )
  .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new statistics row
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
app.post('/statistics', [], (req, res) => {
  if(!req.body.profileId || !req.body.faces || !req.body.unrecognized) res.status(400).end(`profileId: ${req.body.profileId}; faces: ${req.body.faces}; unrecognized: ${req.body.unrecognized};`);
  dao.createProfileStatistics({
      profileId: req.body.profileId,
      faces: req.body.faces,
      unrecognized: req.body.unrecognized
  }).then( () => res.status(200).end() )
  .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST upload a new image in "faces" folder
// Request body: image file to upload and name given to it
app.post('/public/faces', [], (req, res) => {
  if(!req.files || Object.keys(req.files).length === 0) res.status(400).end(`No files were uploaded`);
  if(!req.body.name) res.status(400).end(`name: ${req.body.name}`);
  const image = req.files.avatar;
  const name = `${req.body.name}.${image.name.split(".")[image.name.split(".").length-1]}`;
  image.mv(`${__dirname}/public/faces/${name}`, (error) => {
    if (error) {
      res.writeHead(500, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({ status: 'error', message: error }));
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', directory: name}));
  });
});

// POST copy an image in "stranger" in the "faces" one
// Request body: file name of the image and name given to the copy
app.post('/public/faces/strangers', [], (req, res) => {
  if(!req.body.filename || !req.body.name) res.status(400).end(`file: ${req.body.filename}; name: ${req.body.name}`);
  const oldPath = `${__dirname}/public/faces/strangers/${req.body.filename}`;
  const newPath = `${__dirname}/public/faces/${req.body.name}`;
  fs.readFile(oldPath, (err, data) => {
      if (err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
      fs.writeFile(newPath, data, (err) => {
          if (err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
          res.status(200).end();
      });
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

// DELETE delete an image in "faces" folder
// Request parameters: image name
app.delete(`/public/faces/:imgName`, (req, res) => {
  if(!req.params.imgName) res.status(400).end(`imgName: ${req.params.imgName}`);
  fs.unlink(`${__dirname}/public/faces/${req.params.imgName}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

// DELETE delete an image in "strangers" folder
// Request parameters: image name
app.delete(`/public/faces/strangers/:imgName`, (req, res) => {
  if(!req.params.imgName) res.status(400).end(`imgName: ${req.params.imgName}`);
  fs.unlink(`${__dirname}/public/faces/strangers/${req.params.imgName}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

/* Server Activation */
app.listen(port, () => {console.log(`Listening to requests on http://localhost:${port}`);});