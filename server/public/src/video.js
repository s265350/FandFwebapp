/* VIDEO FUNCTIONS */

'use strict';

import * as Api from './api.js';
import * as Main from './main.js';

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
])

let detectionInterval;
let faceMatcherProfiles;
let faceMatcherStrangers;

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

//individua volto e mostra i Landmarks, se lo porto in getStream riquadri multipli!!
document.getElementById('video').addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(document.getElementById('video'));
    document.body.append(canvas);
    const displaySize = { width: document.getElementById('video').videoWidth, height: document.getElementById('video').videoHeight }
    faceapi.matchDimensions(canvas, displaySize);
    console.log(`faces detection started`);
    detectionInterval = setInterval(async () => { //individuo volto e faccio matching
        const detections = await faceapi.detectAllFaces(document.getElementById('video'), new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
        console.log(`detected ${detections.length} faces`);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => faceMatcherProfiles.findBestMatch(d.descriptor));
        results.forEach(async (result, i) => { //disegno riquadro e nome attorno al volto
            new faceapi.draw.DrawBox(resizedDetections[i].detection.box, { label: result.toString().split(' ')[0] }).draw(canvas);
            if (result.toString().split(' ')[0] == 'unknown') {
                const resultsStranger = resizedDetections.map(e => faceMatcherStrangers.findBestMatch(e.descriptor));
                resultsStranger.forEach((resultS, j) => {if (resultS.toString().split(' ')[0] == 'unknown') {takeScreenshot()}});
            }
        })
    }, 100)
})

document.getElementById('video').addEventListener('suspend', () => {
    clearInterval(detectionInterval);
    document.getElementById('video').pause();
})

async function getProfileFaceMatcher() {
    //etichetto foto
    const profiles = await Api.getAllProfiles();
    const labeledFaceDescriptors = await Promise.all(
        profiles.map(async profile => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(profile.avatar, false))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${profile.firstName}`)}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(profile.firstName, descriptions);
        })
    )
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0) return undefined;
    return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

async function getStrangersFaceMatcher() { //etichetto foto stranieri
    const strangers = await Api.getStrangers()
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

async function takeScreenshot(){
    const canvas = document.createElement('canvas');
    canvas.width = document.getElementById('video').videoWidth;
    canvas.height = document.getElementById('video').videoHeight;
    canvas.getContext('2d').drawImage(document.getElementById('video'), 0, 0);
    const imageBase64 = canvas.toDataURL('image/png');
    Main.strangerNotification(imageBase64);
    let strangers = await Api.getStrangers();
    let name = '';
    do{name = generateName();} while (strangers.includes(name));
    await Api.uploadScreenshot(imageBase64, canvas.width, canvas.height, name);
    faceMatcherStrangers = await getStrangersFaceMatcher();
}

function generateName() {
    // name must be a unique string of 8 random characters/numbers
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomName = '';
    for (let i = 0; i < 8; ++i) randomName += charset.charAt(Math.floor(Math.random() * charset.length));
    return randomName + '.png';
}

export {setup, takeScreenshot};