/* VIDEO FUNCTIONS */

'use strict';

import * as Api from './api.js';

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(getStream)

const video = document.getElementById('video')

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
    video.addEventListener('mousedown', () => {video.style.opacity = 0.3;});
    video.addEventListener('mouseup', () => {video.style.opacity = 1;});
}

function getStream(){
    if(window.stream) {window.stream.getTracks().forEach((track) => {track.stop();});}
    if(document.getElementById('videoSelector').value != 'None')
        navigator.mediaDevices.getUserMedia({video: {deviceId: { exact: document.getElementById('videoSelector').value },}})
            .then((stream) => {
                window.stream = stream; // make stream available to console
                video.srcObject = stream;})
            .catch((error) => {console.error('Video stream error: ', error)});
}

//individua volto e mostra i Landmarks, se lo porto in getStream riquadri multipli!!
video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    //carico descriptor da immagini etichettate
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const labeledStrangersDescriptors = await loadLabeledStrangers()
    const faceMatcherStrangers = new faceapi.FaceMatcher(labeledStrangersDescriptors, 0.6)

    setInterval(async () => { //individuo volto e faccio matching
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => { //disegno riquadro e nome attorno al volto
            if (result.toString().split(' ')[0] == 'unknown') {
                setInterval(async () => { //individuo volto e faccio matching
                    const detectionsStranger = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
                    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                    const resizedDetectionsStranger = faceapi.resizeResults(detectionsStranger, displaySize)
                    const resultsStranger = resizedDetectionsStranger.map(e => faceMatcherStrangers.findBestMatch(e.descriptor))
                    resultsStranger.forEach((resultS, j) => {
                        if (resultS.toString().split(' ')[0] == 'unknown') {takeScreenshot()}
                        const boxS = resizedDetectionsStranger[j].detection.box
                        const drawBox = new faceapi.draw.DrawBox(boxS, { label: resultS.toString().split(' ')[0] })
                        drawBox.draw(canvas)
                    })
                }, 100)
                /*const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString().split(' ')[0] })
                drawBox.draw(canvas)*/
            } else {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString().split(' ')[0] })
                drawBox.draw(canvas)
            }
        })
    }, 100)
})

async function loadLabeledImages() {
    //etichetto foto
    const profiles = await Api.getAllProfiles()
    return Promise.all(
        profiles.map(async profile => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(profile.avatar, false))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {throw new Error(`no faces detected for ${profile.firstName}`)}
            descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(profile.firstName, descriptions)
        })
    )
}


async function loadLabeledStrangers() { //etichetto foto stranieri
    const strangers = await Api.getStrangers()
    return Promise.all(
        strangers.map(async stranger => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(stranger, true))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {throw new Error(`no faces detected for ${stranger}`)}
            descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(stranger, descriptions)
        })
    )
}

async function takeScreenshot(){
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    let strangers = await Api.getStrangers();
    let name = '';
    do{name = generateName();} while (strangers.includes(name));
    await Api.uploadScreenshot(canvas.toDataURL('image/png'), canvas.width, canvas.height, name);
}

function generateName() {
    // name must be a unique string of 8 random characters/numbers
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomName = '';
    for (let i = 0; i < 8; ++i)
        randomName += charset.charAt(Math.floor(Math.random() * charset.length));
    return randomName + '.png';
}

export {setup, takeScreenshot};