/* FACE API LIBRARY */
// module for accessing library methods

'use strict';

import * as dao from './dao.js';
import * as faceapi from './face-api.min.js';

let faceMatcherProfiles;
let faceMatcherStrangers;

exports.loadModels = function(url) {
    return new Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromUri(url),
        faceapi.nets.faceRecognitionNet.loadFromUri(url),
        faceapi.nets.ssdMobilenetv1.loadFromUri(url)
    ]).then(getFaceMatchers);
}

exports.getFaceMatchers = function(){
    faceMatcherProfiles = await getFaceMatcher(false);
    if(!faceMatcherProfiles || faceMatcherProfiles.length <= 0)console.log('there are no profile faces');
    faceMatcherStrangers = await getFaceMatcher(true);
    if(!faceMatcherStrangers || faceMatcherStrangers.length <= 0)console.log('there are no stranger faces');
}

exports.getFaceMatcher = function(stranger) {
    // label images
    let people;
    if(stranger) people = await dao.getStrangers();
    else people = await dao.getProfiles();
    const labeledFaceDescriptors = await new Promise.all(
        people.map(async person => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(person.avatar, stranger))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${person.profileId}`);return undefined;}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(person.profileId, descriptions);
        })
    );
    if(!labeledFaceDescriptors || labeledFaceDescriptors.length <= 0) return undefined;
    return  new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

exports.identify = function(image) {
    // return an object with the name id of the face and the box sizes that contains it
    if (!faceMatcherProfiles || faceMatcherProfiles.length <= 0) {return;}
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(image, displaySize);
    const detections = await faceapi.detectAllFaces(document.getElementById('video')).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = [];
    resizedDetections.map(d => faceMatcherProfiles.findBestMatch(d.descriptor)).forEach((resultP, i) => {
        const { x, y, width, height } = resizedDetections[i].detection.box;
        let name = resultP.toString().split(' ')[0];
        let isStranger = false;
        if (name == 'unknown' && faceMatcherStrangers && faceMatcherStrangers.length > 0) {
            isStranger = true;
            name = faceMatcherStrangers.findBestMatch(resizedDetections[i].descriptor).toString().split(' ')[0];
        }
        results.push({ name: name, isStranger: isStranger, x: x - width, y: y - height, width: width * 4, height: height * 4 });
    });
    return results;
}
