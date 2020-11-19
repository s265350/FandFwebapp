/* VIDEO FUNCTIONS */

import * as Api from './api.js';

function setup(){
    // the user is free to choose any video input attached to the device
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        const videoSelect = document.getElementById('videoSelector');
        navigator.mediaDevices.enumerateDevices()
            .then((deviceInfos) => {
                deviceInfos.forEach( (deviceInfo) => {
                    if (deviceInfo.kind === 'videoinput') {
                        const option = document.createElement('option');
                        option.value = deviceInfo.deviceId;
                        option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                        videoSelect.appendChild(option);
                    } else {
                        console.log('Found another kind of device: ', deviceInfo);
                    }
                });
            })
            .then(getStream)
            .catch((error) => {console.error('EnumerateDevices error: ', error)});
        videoSelect.addEventListener('change', getStream);
    } else {
        alert('getUserMedia() is not supported by your browser');
    }
}

function getStream(){
    if(window.stream) {window.stream.getTracks().forEach((track) => {track.stop();});}
    if(document.getElementById('videoSelector').value !== "None")
        navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: document.getElementById('videoSelector').value}}})
            .then((stream) => {
                window.stream = stream; // make stream available to console
                document.getElementById("video").srcObject = stream;
            }).catch((error) => {console.error('Video stream error: ', error)});
}

async function takeScreenshot(){
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    let files = await Api.getStrangers();
    files = files.map(file => {return file.split('/')[file.split('/').length-1];});
    let name = "";
    do{name = generateName(8);} while (files.includes(`/faces/strangers/${name}.png`));
    await Api.uploadImage(canvas.toDataURL(), name, true);
}

function generateName(length) {
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomName = "";
    for (let i = 0; i < length; ++i)
        randomName += charset.charAt(Math.floor(Math.random() * charset.length));
    return randomName;
}

export {setup, takeScreenshot};