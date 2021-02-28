/* VIDEO FUNCTIONS */

'use strict';

import * as Api from './api.js';
import * as Main from './main.js';

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
])

let detectionInterval;
let faceMatcherProfiles;
let faceMatcherStrangers;
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

//individua volto
document.getElementById('video').addEventListener('play', async () => {
    //const canvas = faceapi.createCanvasFromMedia(document.getElementById('video'));
    //document.body.append(canvas);
    const displaySize = { width: document.getElementById('video').videoWidth, height: document.getElementById('video').videoHeight }
    faceapi.matchDimensions(document.getElementById('video'), displaySize);
    console.log(`faces detection started`);
    detectionInterval = setInterval(async () => { //individuo volto e faccio matching
        const detections = await faceapi.detectAllFaces(document.getElementById('video')).withFaceLandmarks().withFaceDescriptors();
        //console.log(`detected ${detections.length} faces`);
        //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        if (!faceMatcherProfiles || faceMatcherProfiles.length <= 0) return;
        resizedDetections.map(d => faceMatcherProfiles.findBestMatch(d.descriptor)).forEach(async (result, i) => {
            let name = result.toString().split(' ')[0];
            if (name == 'unknown') {
                const { x, y, width, height } = resizedDetections[i].detection.box;
                if (!faceMatcherStrangers || faceMatcherStrangers.length <= 0){
                    takeScreenshot(x-width, y-height, width*4, height*4);
                } else {
                    resizedDetections.map(d => faceMatcherStrangers.findBestMatch(d.descriptor)).forEach((resultS, j) => {if (resultS.toString().split(' ')[0] == 'unknown') {takeScreenshot(x-width, y-height, width*4, height*4);}});
                }
            } else {
                let stats;
                statistics.forEach(s => {if(s.profileId == name){s.faces++;stats = s;}});
                if(stats) await Api.updateProfileStatistics(stats);
                profiles.forEach(p => {if(p.profileId === name)name = p.firstName;});
            }
            //new faceapi.draw.DrawBox(resizedDetections[i].detection.box, { label: name }).draw(canvas);
        })
    }, 1000)
})

document.getElementById('video').addEventListener('suspend', () => {
    clearInterval(detectionInterval);
    document.getElementById('video').pause();
})

async function getProfileFaceMatcher() {
    // etichetto immagini profilo
    const labeledFaceDescriptors = await Promise.all(
        profiles.map(async profile => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(profile.avatar, false))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${profile.profileId}`)}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(profile.profileId, descriptions);
        })
    )
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0) return undefined;
    return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

async function getStrangersFaceMatcher() {
    // etichetto immagini sconosiuti
    const labeledFaceDescriptors = await Promise.all(
        strangers.map(async stranger => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(stranger, true))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${stranger}`);await Api.deleteImage(stranger, true);}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(stranger, descriptions);
        })
    )
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0) return undefined;
    return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

async function takeScreenshot(startx, starty, width, height){
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(document.getElementById('video'), startx, starty, width, height, 0, 0, width, height);
    const imageBase64 = canvas.toDataURL('image/png');
    console.log("notification sent");
    // for now notifications are sent only to the admin (because is the only one that can "log in" and email and sms are not set)
    let notificationEnabled = false;
    profiles.forEach(p => {if (p.system === 'Admin' && p.notifications == true)notificationEnabled = true;});
    if (notificationEnabled == true) Main.pushNotification(imageBase64);
    //await Main.emailNotification(imageBase64); // must be activated inserting credentials
    //await Main.smsNotification(imageBase64); // must be activated inserting credentials
    let name = '';
    do{name = generateName();} while (strangers.includes(name));
    await Api.uploadScreenshot(imageBase64, canvas.width, canvas.height, name);
    faceMatcherStrangers = await getStrangersFaceMatcher();
    console.log("faceMatcherStrangers up to date");
}

function generateName() {
    // name must be a unique string of 8 random characters/numbers
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomName = '';
    for (let i = 0; i < 8; ++i) randomName += charset.charAt(Math.floor(Math.random() * charset.length));
    return randomName + '.png';
}

export {setup, takeScreenshot};