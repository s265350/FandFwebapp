/* VIDEO FUNCTIONS */

'use strict';

import * as Api from './api.js';
import * as Main from './main.js';

let detectionInterval;
let clearRecentsInterval;
let recents = [];

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

document.getElementById('video').addEventListener('play', () => {startRecording();});

document.getElementById('video').addEventListener('suspend', () => {stopRecording();});

document.getElementById('video').addEventListener('pause', () => {stopRecording();});

function startRecording(){
    if(clearRecentsInterval != null || detectionInterval != null)return;
    console.log("startRecording");
    clearRecentsInterval = setInterval( () => recents.length = 0, 60000);
    detectionInterval = setInterval( () => takeScreenshot(), 3000);
    document.getElementById('video').play();
}

function stopRecording(){
    if(clearRecentsInterval == null && detectionInterval == null)return;
    console.log("stopRecording");
    clearInterval(clearRecentsInterval);
    clearRecentsInterval = null;
    clearInterval(detectionInterval);
    detectionInterval = null;
    document.getElementById('video').pause();
}

async function takeScreenshot(){
    const canvas = document.createElement('canvas');
    canvas.width = document.getElementById('video').videoWidth;
    canvas.height = document.getElementById('video').videoHeight;
    canvas.getContext('2d').drawImage(document.getElementById('video'), 0, 0);
    const imageBase64 = canvas.toDataURL('image/png');
    await Api.uploadImage(imageBase64, recents);
}

function setRecents(lasts){recents = lasts;}

export {setup, takeScreenshot, startRecording, stopRecording, setRecents};
