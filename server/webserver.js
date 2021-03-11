/* SERVER for the client to connect with */
/* here push notifications are haldled */

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

/* App Variables */
const web = express();
const port = process.env.WEBPORT || '4000';
let clients = [];

/* Process body content */
web.use(express.json(),fileupload());

/* Routes Definitions */
web.use(express.static('public'));
web.get('/', (req, res) => res.redirect('/index.html'));
web.get('/notifications', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  // Generate an id based on timestamp and save res
  let tmpId = Date.now();
  while(clients.map(c => c.clientId).includes(tmpId))tmpId = Date.now();
  const clientId = tmpId;
  // sending the clientId and telling the client to retry every 10 seconds if connectivity is lost
  res.write(`event: id\ndata: ${clientId}\n\nretry: 10000\n`);
  clients.push({ clientId: `${clientId}`, res: res, recents: [] });
  //console.log(`client ${clientId} connected`);
  // When client closes connection we update the clients list avoiding sendi notifications to the disconnected ones
  req.on('close', () => {
    //console.log(`client ${clientId} disconnected`);
    clients = clients.filter(c => {c.clientId !== clientId});
    res.end();
  });
});

/* App Configuration */

// GET recents for the give clientId
web.get('/recents/:clientId', (req, res) => {
  if(!req.params.clientId) res.status(400).end();
  const client = clients.filter(c => c.clientId === req.params.clientId)[0];
  if(!client || client?.recents?.length <= 0) res.json([]);
  else res.json(client.recents);
});

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

// POST change clientId
// Request body: clientId
web.post('/clientid', [], (req, res) => {
  if(!req.body.oldClientId || !req.body.newClientId) res.status(400).end();
  if(!clients.filter(c => c.clientId === req.body.oldClientId)[0]){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', clientId: req.body.newClientId}));
    return;
  }
  const client = clients.filter(c => c.clientId === req.body.oldClientId);
  clients.push({clientId: req.body.newClientId, res: client.res, recents: client.recents});
  clients = clients.filter(c => c.clientId !== req.body.oldClientId);
  //console.log(`client ${req.body.newClientId} reconnected`);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', clientId: req.body.newClientId}));
});

// POST receive new recents for a client
// Request params: client ID
// Request body: stranger boolean and recents array
web.post('/recents/:clientId', [], (req, res) => {
  if(!req.params.clientId || (!req.body.stranger && req.body.stranger !== false)|| !req.body.recents) res.status(400).end();
  const client = clients.filter(c => c.clientId === req.params.clientId)[0];
  if(!client) {
    //console.log(`client ${req.params.clientId} has disconnected`);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ status: 'success', clientId: req.params.clientId}));
    return;
  }
  //console.log("client", clients.filter(c => c.clientId === req.params.clientId)[0]);
  client.res.write(`event: strangerNotification\ndata: ${JSON.stringify({stranger: req.body.stranger, recents: req.body.recents})}\n\n)retry: 10000\n`);
  clients = clients.filter(c => c.clientId !== req.params.clientId);
  clients.push({clientId: client.clientId, res: client.res, recents: req.body.recents});
  //console.log("client", clients.filter(c => c.clientId === req.params.clientId)[0]);
  console.log("image computation ended");
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', clientId: req.params.clientId}));
});

// POST upload a new profile row
// Request body: object describing a Profile { profileId*, firstName*, lastName, phone*, email, system*, family, notifications, notificationsPhone, notificationsEmail }
web.post('/profiles', [], (req, res) => {
  if(!req.body.firstName || !req.body.phone || !req.body.system) res.status(400).end();
  dao.createProfile({profileId: '', firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone, email: req.body.email, system: req.body.system, family: req.body.family, notifications: req.body.notifications, notificationsPhone: req.body.notificationsPhone, notificationsEmail: req.body.notificationsEmail})
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

// POST upload a new image in 'profiles' folder
// Request body: image FILE to upload and the profileId
web.post('/faces/profiles', [], async (req, res) => {
  if(!req.body.profileId || !req.body.imageBase64) res.status(400).end();
  const image = await loadImage(req.body.imageBase64);
  const canvas = createCanvas(parseInt(image.width), parseInt(image.height));
  canvas.getContext('2d').drawImage(image, 0, 0);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(`${__dirname}/faces/profiles/${req.body.profileId}.png`, buffer, (err) => {
    if(err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
  });
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileId: req.body.profileId}));
});

// POST upload a screenshot
// Request body: BASE64 image to save
web.post('/screenshot', [], async (req, res) => {
  if(!req.body.clientId || !req.body.imageBase64) res.status(400).end();
  const image = await loadImage(req.body.imageBase64);
  const profileId = await dao.generateId(10);
  const canvas = createCanvas(parseInt(image.width), parseInt(image.height));
  canvas.getContext('2d').drawImage(image, 0, 0);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(`${__dirname}/faces/_${req.body.clientId}_${profileId}.png`, buffer, (err) => {
    if(err) throw res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});
  });
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileId: profileId}));
});

// POST email
// Request parameters: 
// Request body: email address, name, subject, message
web.post('/sendemail', function(req, res){
  if(!req.body.email || !req.body.name || !req.body.subject || !req.body.message) res.status(400).end();
  // eventual spam protection or checks
  mandrill('/messages/send', {
    message: {
        to: [{email: req.body.email , name: req.body.name}],
        from_email: process.env.MANDRILL_EMAIL,
        from_name: process.env.COMPANY_NAME,
        subject: req.body.subject,
        text: req.body.message,
        important: true
    }
  }, (error) => {if (error) console.log( JSON.stringify(error) );});
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileId: req.body.email}));
});

// POST sms
// Request parameters: 
// Request body: phone number, message
web.post('/sendsms', function(req, res){
  if(!req.body.phone || !req.body.message) res.status(400).end();
  twilio.messages.create({
    body: req.body.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: req.body.phone
  });
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileId: req.body.phone}));
});

// PUT update a profile row
// Request parameters: 
// Request body: object describing a Profile { profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail }
web.put('/profiles/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end();
  dao.updateProfile(req.body)
    .then( () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: req.params.profileId}));
    })
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// PUT update a ProfileStatistics row
// Request parameters: profile ID
// Request body: object describing a ProfileStatistics { profileId*, faces, unrecognized }
web.put('/statistics/:profileId', (req, res) => {
  if(!req.params.profileId || !req.body) res.status(400).end();
  dao.updateProfileStatistics(req.body)
    .then( () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: req.params.profileId}));
    })
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete an image in a folder
// Request parameters: image name
// Request body: boolean specifing if is a stranger or not
web.delete(`/faces/:filename`, (req, res) => {
  if(!req.params.filename) res.status(400).end();
  const path = (req.body.stranger)? "strangers" : "profiles";
  fs.unlink(`${__dirname}/faces/${path}/${req.params.filename}`, (err) => {
    if(err) {res.status(500).json({errors: [{'param': 'Server', 'msg': err}],});return;}
  });
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ status: 'success', profileId: req.params.filename}));
});

// DELETE delete a profile row
// Request parameters: profile ID
web.delete(`/profiles/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteProfile(req.params.profileId)
    .then( () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: req.params.profileId}));
    })
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete a statistics row
// Request parameters: profile ID
web.delete(`/statistics/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteProfileStatistics(req.params.profileId)
    .then( () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: req.params.profileId}));
    })
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

// DELETE delete stranger row
// Request parameters: profile ID
web.delete(`/strangers/:profileId`, (req, res) => {
  if(!req.params.profileId) res.status(400).end();
  dao.deleteStranger(req.params.profileId)
    .then( () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'success', profileId: req.params.profileId}));
    })
    .catch( (err) => res.status(500).json({errors: [{'param': 'Server', 'msg': err}],}) );
});

/* Server Activation */
exports.run = async function(port) {
  //console.time(`...WEB server started in`);
  const address = `http://${Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family==='IPv4' && !i.internal && i.address || []), [])), [])[0]}:${port}`;
  web.listen(port, () => {
    console.log(`\nListening to requests on ${address} or http://localhost:${address.split(':')[address.split(':').length-1]}`);
    //console.timeEnd(`...WEB server started in`);
  });
  //return address;
}

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