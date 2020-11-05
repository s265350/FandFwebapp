"use strict";

/* Required External Modules */
const express = require("express");
const sqlite = require("sqlite3");
const dao = require('./dao.js');

/* App Variables */
const app = express();
const port = process.env.PORT || "8000";
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});

// Process body content
app.use(express.json());

/* Routes Definitions */
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/index.html'));

/* App Configuration */
// GET /profiles
app.get('/profiles', (req, res) => {
    dao.getProfiles()
      .then( (profiles) => res.json(profiles) )
      .catch( (err) => res.status(503).json(err) );
});

// GET /profilesid
app.get('/profilesid', (req, res) => {
    dao.getProfilesId()
      .then( (profiles) => res.json(profiles) )
      .catch( (err) => res.status(503).json(err) );
});

// GET /profiles/<profileId> 
app.get('/profiles/:profileId', (req, res) => {
    dao.getProfileById(req.params.profileId)
      .then( (profile) => res.json(profile) )
      .catch( (err) => res.status(503).json(err) );
});

// GET /statistics
app.get('/statistics', (req, res) => {
    dao.getStatistics()
      .then( (statistics) => res.json(statistics) )
      .catch( (err) => res.status(503).json(err) );
});

// GET /statistics/<profileId> 
app.get('/statistics/:profileId', (req, res) => {
    dao.getProfileById(req.params.profileId)
      .then( (profileStatisctics) => res.json(profileStatisctics) )
      .catch( (err) => res.status(503).json(err) );
});

// POST /profiles
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
app.post('/profiles', [], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(422).json({errors: errors.array()});}
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
        notificationsEmail: req.body.notificationsEmail
    }).then( () => res.end() )
    .catch( (err) => res.status(503).json(err) );
  });

/* Server Activation */
app.listen(port, () => {console.log(`Listening to requests on http://localhost:${port}`);});