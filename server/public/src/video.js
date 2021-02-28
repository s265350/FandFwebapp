/* VIDEO FUNCTIONS */

'use strict';

import * as Api from './api.js';
import * as Main from './main.js';

let detectionInterval;
let profiles;
let strangers;
let statistics;

async function setup(){
    // the user is free to choose any video input attached to the device
    // mediaDevices support check
    if (!!(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)) {alert('getUserMedia() is not supported by your browser');return;}
    // permission request
    await navigator.mediaDevices.getUserMedia({video: true});
    if(window.stream) {window.stream.getTracks().forEach((track) => {track.stop();});}
    // devices scan
    navigator.mediaDevices.enumerateDevices()
        .then((devices) => {devices.forEach((device) => {if(device.kind === 'videoinput'){const option = document.createElement('option');option.value = device.deviceId;option.text = device.label || 'Camera ' + (document.getElementById('videoSelector').length + 1);document.getElementById('videoSelector').appendChild(option);} });})
        .then(getStream)
        .catch((error) => {console.error('EnumerateDevices error: ', error)});
    document.getElementById('videoSelector').addEventListener('change', getStream);
    document.getElementById('video').addEventListener('mousedown', () => {document.getElementById('video').style.opacity = 0.3;});
    document.getElementById('video').addEventListener('mouseup', () => {document.getElementById('video').style.opacity = 1;});
    //carico descriptor da immagini etichettate
    profiles = await Api.getAllProfiles();
    strangers = await Api.getStrangers();
    statistics = await Api.getAllStatistics();
    faceMatcherProfiles = await getProfileFaceMatcher();
    faceMatcherStrangers = await getStrangersFaceMatcher();
}

function getStream(){
    if(window.stream) {window.stream.getTracks().forEach((track) => {track.stop();});}
    if(document.getElementById('videoSelector').value != 'None')
        navigator.mediaDevices.getUserMedia({video: {deviceId: { exact: document.getElementById('videoSelector').value },}})
            .then((stream) => {
                window.stream = stream; // make stream available to console
                document.getElementById('video').srcObject = stream;})
            .catch((error) => {console.error('Video stream error: ', error)});
}

document.getElementById('video').addEventListener('play', () => {
    detectionInterval = setInterval( () => takeScreenshot(document.getElementById('video')), 1000);
});

document.getElementById('video').addEventListener('suspend', () => {
    clearInterval(detectionInterval);
    document.getElementById('video').pause();
});

async function takeScreenshot(video){
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0);
    /*// for now notifications are sent only to the admin (because is the only one that can "log in" and email and sms are not set)
    let notificationEnabled = false;
    profiles.forEach(p => {if (p.system === 'Admin' && p.notifications == true)notificationEnabled = true;});
    if (notificationEnabled == true) Main.pushNotification(imageBase64);
    //await Main.emailNotification(imageBase64); // must be activated inserting credentials
    //await Main.smsNotification(imageBase64); // must be activated inserting credentials*/
    await Api.uploadScreenshot(canvas.toDataURL('image/png'), canvas.width, canvas.height);
}

export {setup, takeScreenshot};