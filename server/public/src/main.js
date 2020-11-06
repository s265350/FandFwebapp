import * as Api from './api.js';
import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";
import * as Navigation from './navigation.js';

window.addEventListener('load', () => {
    /* LOGIN */
    document.getElementById("sideHome").addEventListener("click", () => {Navigation.loadHome();});
    document.getElementById("sideRecognize").addEventListener("click", () => {Navigation.loadRecognize();});
    document.getElementById("sideProfile").addEventListener("click", () => {Navigation.loadProfile(new Profile("firstName1234567890", "firstName", "lastName", "1234567890", "firstName@lastName.com", "Admin", "Father", true, true, false, "svg/avatar.svg"));});
    document.getElementById("sideAboutUs").addEventListener("click", () => {Navigation.loadAboutUs();});
    Navigation.loadHome();
    const video = document.getElementById("webcam");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) { video.srcObject = stream; })
            .catch(function (err0r) { console.log("Video stream error: " + err0r); });
    }
});