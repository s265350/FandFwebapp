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
    ]).then(setup);
}

exports.setup = function(){
    const labeledProfilesDescriptors = await getProfileFaceMatcher();
    if(labeledProfilesDescriptors && labeledProfilesDescriptors.length > 0) faceMatcherProfiles =  new faceapi.FaceMatcher(labeledProfilesDescriptors, 0.6);
    const labeledStrangersDescriptors = await getStrangersFaceMatcher();
    if(labeledStrangersDescriptors && labeledStrangersDescriptors.length > 0) faceMatcherStrangers =  new faceapi.FaceMatcher(labeledStrangersDescriptors, 0.6);
}

exports.getProfileFaceMatcher = function() {
    // label profile images
    return new Promise.all(
        profiles.map(async profile => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(profile.avatar, false))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${profile.profileId}`)}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(profile.profileId, descriptions);
        })
    );
}

exports.getStrangersFaceMatcher = function() {
    // label stranger images
    return new Promise.all(
        strangers.map(async stranger => {
            const descriptions = []
            const img = await faceapi.fetchImage(await Api.getImage(stranger, true))
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            if (!detections) {console.log(`no faces detected for ${stranger}`);await Api.deleteImage(stranger, true);}
            else descriptions.push(detections.descriptor)
            return new faceapi.LabeledFaceDescriptors(stranger, descriptions);
        })
    )
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
        let { x, y, width, height } = resizedDetections[i].detection.box;
        let name = resultP.toString().split(' ')[0];
        if (name == 'unknown' && faceMatcherStrangers && faceMatcherStrangers.length > 0) {name = faceMatcherStrangers.findBestMatch(resizedDetections[i].descriptor).toString().split(' ')[0];}
        results.push({ name: name, x: x - width, y: y - height, width: width * 4, height: height * 4 });
    });
    return results;
}
