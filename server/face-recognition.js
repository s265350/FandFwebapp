/* FACE API LIBRARY */
// module for accessing library methods

'use strict';

import * as faceapi from './face-api.min.js';

let faceMatcherProfiles;
let faceMatcherStrangers;

exports.loadModels = function(url) {
    return new Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromUri(url),
        faceapi.nets.faceRecognitionNet.loadFromUri(url),
        faceapi.nets.ssdMobilenetv1.loadFromUri(url)
    ]);
}

exports.updateFaceMatcher = function(people, stranger) {
    // label images
    if(!people || people.length <= 0) return undefined;
    const labeledFaceDescriptors = await new Promise.all(
        people.map(async person => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(person.avatar, stranger))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {return undefined;}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(person.profileId, descriptions);
        })
    );
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0){return undefined;}
    if(stranger) faceMatcherStrangers = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    else faceMatcherProfiles = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    return 0; // just to know the result of the operation
}

exports.identifyMultiple = function(image) {
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

exports.identifySingle = function(image) {
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