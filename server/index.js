"use strict";

/* Required External Modules */
const express = require("express");
const fileupload = require('express-fileupload');
const fs = require('fs');
const dao = require('./dao.js');

/* App Variables */
const app = express();
const port = process.env.PORT || "8000";

// Process body content
app.use(express.json(),fileupload());

/* Routes Definitions */
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/index.html'));

/* App Configuration */
// GET /profiles
app.get('/profiles', (req, res) => {
  dao.getProfiles()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /profilesid
app.get('/profilesid', (req, res) => {
  dao.getProfilesId()
    .then( (profiles) => res.json(profiles) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /profiles/<profileId> 
app.get('/profiles/:profileId', (req, res) => {
  dao.getProfileById(req.params.profileId)
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /avatars/<profileId> 
app.get('/avatars/:profileId', (req, res) => {
  dao.getAvatarById(req.params.profileId)
    .then( (res) => res.blob() )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /profile/admin 
app.get('/profile/admin', (req, res) => {
  dao.getAdminProfile()
    .then( (profile) => res.json(profile) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /statistics
app.get('/statistics', (req, res) => {
  dao.getStatistics()
    .then( (statistics) => res.json(statistics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /statistics/<profileId> 
app.get('/statistics/:profileId', (req, res) => {
  dao.getProfileStatisticsById(req.params.profileId)
    .then( (profileStatisctics) => res.json(profileStatisctics) )
    .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// GET /profile/strangers
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

// POST /profiles
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.post('/profiles', [], (req, res) => {
  if(!req.body.profileId || !req.body.firstName || !req.body.phone || !req.body.system) res.status(400).end();
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

// POST /statistics
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.post('/statistics', [], (req, res) => {
  if(!req.body.profileId) res.status(400).end();
  dao.createProfileStatistics({
      profileId: req.body.profileId,
      faces: req.body.faces,
      unrecognized: req.body.unrecognized
  }).then( () => res.status(200).end() )
  .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST images
// Request body: image file and name 
app.post('/public/faces', [], (req, res) => {
  if(!req.files || Object.keys(req.files).length === 0) res.status(400).end('No files were uploaded.');
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

// POST copy stranger image
app.post('/public/faces/strangers', [], (req, res) => {
  if(!req.body.path || !req.body.name) res.status(400).end();
  const oldPath = `${__dirname}/public/faces/strangers/${req.body.path}`;
  const newPath = `${__dirname}/public/faces/${req.body.name}`;
  fs.readFile(oldPath, (err, data) => {
      if (err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
      fs.writeFile(newPath, data, (err) => {
          if (err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
          res.status(200).end();
      });
  });
});

// PUT profile
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.put('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.updateProfile(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT statistics
// Request body: object describing a ProfileStatistics { profileId, faces, unrecognized }
app.put('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.updateProfileStatistics(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE /public/faces/<imgPath>
app.delete(`/public/faces/:imgName`, (req, res) => {
  if(!req.params.imgName) res.status(400).end();
  fs.unlink(`${__dirname}/public/faces/${req.params.imgName}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

// DELETE /public/faces/strangers/<imgName>
app.delete(`/public/faces/strangers/:imgName`, (req, res) => {
  if(!req.params.imgName) res.status(400).end();
  fs.unlink(`${__dirname}/public/faces/strangers/${req.params.imgName}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});}
    res.status(200).end();
  });
});

/* Server Activation */
app.listen(port, () => {console.log(`Listening to requests on http://localhost:${port}`);});