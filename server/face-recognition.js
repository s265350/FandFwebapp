/* FACE API LIBRARY */
// module for accessing library methods

'use strict';

const faceapi = require('face-api.js');
const canvas = require('canvas');
const fetch = require('node-fetch');
const fs = require('fs');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
faceapi.env.monkeyPatch({ fetch: fetch });

let faceMatcherProfiles;
let faceMatcherStrangers;

exports.loadModels = (url) => Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromDisk(url),
    faceapi.nets.faceRecognitionNet.loadFromDisk(url),
    faceapi.nets.ssdMobilenetv1.loadFromDisk(url)
]);

exports.updateFaceMatcher = async (stranger) => {
    // label images
    const folder = (stranger)? "strangers" : "profiles";
    console.time(`Computing ${folder.split('/')[folder.split('/').length-1]} Face Matcher...`);
    const labeledFaceDescriptors = await getlabeledFaceDescriptors(`${__dirname}/faces/${folder}`);
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0){console.log(`... ${folder} Face Matcher is empty`);return undefined;}
    if(stranger) faceMatcherStrangers = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    else faceMatcherProfiles = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    console.timeEnd(`Computing ${folder.split('/')[folder.split('/').length-1]} Face Matcher...`);
    console.log(`... ${folder} Face Matcher is up to date`);
}

async function getlabeledFaceDescriptors(folder) {
    const labels = fs.readdirSync(folder).filter(f => !f.includes('DS_Store'));
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            const img = await canvas.loadImage(`${folder}/${label}`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {return undefined;}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(label.split('.')[0], descriptions);
        })
    )
}

exports.identifyMultiple = async (image) => {
    // return an object with the name id of the face and the box sizes that contains it
    if (!faceMatcherProfiles || faceMatcherProfiles.length <= 0) {return undefined;}
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(image, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = [];
    resizedDetections.map(d => faceMatcherProfiles.findBestMatch(d.descriptor)).forEach((resultP, i) => {
        const { x, y, width, height } = resizedDetections[i].detection.box;
        let name = resultP.toString().split(' ')[0];
        let isStranger = false;
        if (name == 'unknown') {
            isStranger = true;
            if(faceMatcherStrangers && faceMatcherStrangers.length > 0) name = faceMatcherStrangers.findBestMatch(resizedDetections[i].descriptor).toString().split(' ')[0];
        }
        results.push({ name: name, isStranger: isStranger, x: x - width, y: y - height, width: width * 4, height: height * 4 });
    });
    return results;
}

exports.identifySingle = async (image) => {
    // return an object with the name id of the face and the box sizes that contains it
    if (!faceMatcherProfiles || faceMatcherProfiles.length <= 0) {return undefined;}
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(image, displaySize);
    const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetection = faceapi.resizeResults(detection, displaySize);
    faceMatcherProfiles.findBestMatch(resizedDetection.descriptor).then((resultP, i) => {
        const { x, y, width, height } = resizedDetection.detection.box;
        let name = resultP.toString().split(' ')[0];
        let isStranger = false;
        if (name == 'unknown') {
            isStranger = true;
            if(faceMatcherStrangers && faceMatcherStrangers.length > 0) name = faceMatcherStrangers.findBestMatch(resizedDetection.descriptor).toString().split(' ')[0];
        }
        return { name: name, isStranger: isStranger, x: x - width, y: y - height, width: width * 4, height: height * 4 };
    });
    return undefined;
}
