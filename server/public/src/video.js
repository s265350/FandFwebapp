/* VIDEO FUNCTIONS */

import * as Api from './api.js';

function setup(){
    // the user is free to choose any video input attached to the device
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        const videoSelect = document.getElementById('videoSelector');
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                devices.forEach((device) => {
                    if (device.kind === 'videoinput'){
                        const option = document.createElement('option');
                        option.value = device.deviceId;
                        option.text = device.label || 'Camera ' + (videoSelect.length + 1);
                        videoSelect.appendChild(option);
                    } else {console.log('Found another kind of device: ', device);}
                });})
            .then(getStream)
            .catch((error) => {console.error('EnumerateDevices error: ', error)});
        videoSelect.addEventListener('change', getStream);
    } else {
        alert('getUserMedia() is not supported by your browser');
    }
}

function getStream(){
    if(window.stream) {window.stream.getTracks().forEach((track) => {track.stop();});}
    if(document.getElementById('videoSelector').value != "None")
        navigator.mediaDevices.getUserMedia({video: {deviceId: { exact: document.getElementById('videoSelector').value },}})
            .then((stream) => {
                window.stream = stream; // make stream available to console
                document.getElementById("video").srcObject = stream;})
            .catch((error) => {console.error('Video stream error: ', error)});
}

async function takeScreenshot(){
    const canvas = document.createElement('canvas');
    canvas.width = document.getElementById('video').videoWidth;
    canvas.height = document.getElementById('video').videoHeight;
    canvas.getContext('2d').drawImage(document.getElementById('video'), 0, 0);
    let files = await Api.getStrangers();
    let name = "";
    do{name = generateName(8);} while (files.includes(name));
    await Api.uploadScreenshot(canvas.toDataURL('image/png'), canvas.width, canvas.height, name);
}

function generateName(length) {
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomName = "";
    for (let i = 0; i < length; ++i)
        randomName += charset.charAt(Math.floor(Math.random() * charset.length));
    return randomName + '.png';
}

export {setup, takeScreenshot};