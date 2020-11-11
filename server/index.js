"use strict";

/* Required External Modules */
const express = require("express");
const sqlite = require("sqlite3");
const fileupload = require('express-fileupload');
const dao = require('./dao.js');

/* App Variables */
const app = express();
const port = process.env.PORT || "8000";
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});

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

// GET /adminprofile 
app.get('/adminprofile', (req, res) => {
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

// POST /profiles
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.post('/profiles', [], (req, res) => {
  if(!req.body.profileId) res.status(400).end();
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
  }).then( () => res.end() )
  .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST /statistics
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.post('/statistics', [], (req, res) => {
  if(!req.body.profileId) res.status(400).end();
  dao.createProfileStatistics({
      profileId: req.body.profileId,
      faces: req.body.faces,
      recognized: req.body.recognized
  }).then( () => res.end() )
  .catch( (err) => res.status(503).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// POST images
// Request body: image file and name 
app.post('/newavatar', [], (req, res) => {
  if(!req.files || Object.keys(req.files).length === 0) res.status(400).end('No files were uploaded.');
  const image = req.files.avatar;
  const directory = `${__dirname}/faces/${req.body.name}.${image.name.split(".")[image.name.split(".").length-1]}`;
  image.mv(directory, (error) => {
    if (error) {
      res.writeHead(500, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({ status: 'error', message: error }));
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', directory: directory}));
  });
});

// PUT profile
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.put('/profiles/:profileId', (req, res) => {
  if(!req.body.profileId) res.status(400).end();
  dao.updateProfile(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT statistics
// Request body: object describing a ProfileStatistics { profileId, faces, recognized }
app.put('/statistics/:profileId', (req, res) => {
  if(!req.body.profileId) res.status(400).end();
  dao.updateProfileStatistics(req.body)
      .then( (result) => res.status(200).end() )
      .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

/* Server Activation */
app.listen(port, () => {console.log(`Listening to requests on http://localhost:${port}`);});