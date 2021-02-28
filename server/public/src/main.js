import * as Api from './api.js';
import * as Video from './video.js';
import * as Recognize from './page_recognize.js';
import * as Profile from './page_profile.js';

let loggedProfile;

window.addEventListener('load', () => {
    // sidebar listeners
    document.getElementById('sideHome').addEventListener('click', () => {loadHome();});
    document.getElementById('sideRecognize').addEventListener('click', () => {loadRecognize();});
    document.getElementById('sideProfile').addEventListener('click', () => {loadProfile();});
    document.getElementById('sideAboutUs').addEventListener('click', () => {loadAboutUs();});
    /* LOGIN it would complicate the code and it's not mandatory for the system to work */
    // init page
    Video.setup();
    loadHome();
    // Check if the browser supports notifications and ask the user for permission
    if (!("Notification" in window)) alert("This browser does not support desktop notification");
    else if (Notification.permission !== "denied") Notification.requestPermission();
});

function pushNotification(imageBase64){
    const subject = `F&F System alert`;
    const message = `The F&F Recognition system has detected a stranger in your house! You should check now on the web app as soon as possible! Meanwhile here is an image of him/her: `;
    if (Notification.permission === 'granted'){
        const notification = new Notification(subject, {
            body: "Don't worry! An image of his face was saved",
            icon: "../svg/logo.png",
            badge: "../svg/logo.png",
            image: imageBase64
        });
        notification.onclick = function() {loadRecognize();};
    }
}

async function emailNotification(imageBase64){
    // for this is necessary to create an .env file and insert the credentials for Mandrill
    const subject = `F&F System alert`;
    const message = `The F&F Recognition system has detected a stranger in your house! You should check now on the web app as soon as possible! Meanwhile here is an image of him/her: `;
    await Api.sendEmailNotification(loggedProfile.email, loggedProfile.firstName, subject, message, imageBase64);
}

async function smsNotification(imageBase64){
    // for this is necessary to create an .env file and insert the credentials for Mandrill
    const subject = `F&F System alert`;
    const message = `The F&F Recognition system has detected a stranger in your house! You should check now on the web app as soon as possible! Meanwhile here is an image of him/her: `;
    await Api.sendSmsNotification(loggedProfile.phone, loggedProfile.firstName, subject, message, imageBase64);
}

function loadHome(){
    // sidemenu update
    document.querySelectorAll('.nav-link').forEach(a => {a.classList.remove('active');});
    document.getElementById('sideHome').classList.add('active');
    // video css and listener
    document.getElementById('videowrap').classList.remove('video');
    document.getElementById('video').removeEventListener('click', () => {loadHome()});
    document.getElementById('video').addEventListener('click', () => {Video.takeScreenshot()});
    // clear page content
    document.getElementById('content').innerHTML = '';
}

async function loadRecognize(){
    // sidemenu update
    document.querySelectorAll('.nav-link').forEach(a => {a.classList.remove('active');});
    document.getElementById('sideRecognize').classList.add('active');
    // video css and listener
    document.getElementById('videowrap').classList.add('video');
    document.getElementById('video').addEventListener('click', () => {loadHome()});
    // clear page content
    const content = document.getElementById('content');content.innerHTML = '';
    // page header
    let img = document.createElement('img');img.setAttribute('class', 'img-fluid');img.setAttribute('src', 'svg/polito.png');content.appendChild(img);
    // page body
    const container = document.createElement('div');container.setAttribute('id', 'container');container.setAttribute('class', 'p-4 m-4');content.appendChild(container);
    const title = document.createElement('p');title.setAttribute('class', 'title text-dark');title.innerHTML = `<i class='fa fa-question mr-3'></i>I don't recognize those faces`;container.appendChild(title);
    container.appendChild(document.createElement('hr'));
    const list = document.createElement('div');list.setAttribute('id', 'recognize_list');list.setAttribute('class', 'card-columns');container.appendChild(list);
    // modals
    container.appendChild(Recognize.createRecognizeModal());
    container.appendChild(Profile.createEditModal());
    const strangers = await Api.getStrangers();
    for(let i=0; i<strangers.length; i++){list.appendChild(await Recognize.recognizeListItem(strangers[i]));}
}

async function loadProfile(){
    // sidemenu update
    document.querySelectorAll('.nav-link').forEach(a => {a.classList.remove('active');});
    document.getElementById('sideProfile').classList.add('active');
    // if login is available this will change
    const loggedProfile = await Api.getAdminProfile('Admin');
    // video css and listener
    document.getElementById('videowrap').classList.add('video');
    document.getElementById('video').addEventListener('click', () => {loadHome()});
    // clear page content
    const content = document.getElementById('content');content.innerHTML = '';
    // page header
    const img = document.createElement('img');img.setAttribute('class', 'img-fluid');img.setAttribute('src', 'svg/polito.png');content.appendChild(img);
    // page body
    // profile section
    const container = document.createElement('div');container.setAttribute('id', 'container');container.setAttribute('class', 'p-4 m-4');content.appendChild(container);
    let title = document.createElement('p');title.setAttribute('id', 'profile_title');title.setAttribute('class', 'title text-dark');title.innerHTML = `<i class='fa fa-user mr-3'></i>FirstName LastName`;container.appendChild(title);
    container.appendChild(document.createElement('hr'));
    container.appendChild(Profile.createProfile('profile'));
    Profile.populateProfile(loggedProfile, loggedProfile);
    container.appendChild(Profile.createProfileAccuracy('profile'));
    await Profile.populateProfileAccuracy(loggedProfile.profileId, 'profile');
    // family section
    title = document.createElement('p');title.setAttribute('class', 'subtitle text-dark pt-4');title.innerHTML = `<i class='fa fa-home mr-2'></i>Family`;container.appendChild(title);
    container.appendChild(document.createElement('hr'));
    const list = document.createElement('div');list.setAttribute('class', 'card-columns');container.appendChild(list);
    const profiles = await Api.getAllProfiles();
    for(let i=0; i<profiles.length; i++) {if(loggedProfile.profileId !== profiles[i].profileId){list.appendChild(await Profile.familyListItem(loggedProfile, profiles[i]));}}
    // modals
    container.appendChild(Profile.createEditModal());
    container.appendChild(Profile.createFamilyModal());
}

async function loadAboutUs(){
    // sidemenu update
    document.querySelectorAll('.nav-link').forEach(a => {a.classList.remove('active');});
    document.getElementById('sideAboutUs').classList.add('active');
    // video css and listener
    document.getElementById('videowrap').classList.add('video');
    document.getElementById('video').addEventListener('click', () => {loadHome()});
    // clear page content
    const content = document.getElementById('content');content.innerHTML = '';
    // page header
    const img = document.createElement('img');img.setAttribute('class', 'img-fluid');img.setAttribute('src', 'svg/polito.png');content.appendChild(img);
    // page body
    const container = document.createElement('div');container.setAttribute('id', 'container');container.setAttribute('class', 'p-4 m-4');content.appendChild(container);
    const title = document.createElement('p');title.setAttribute('class', 'title text-dark');title.innerHTML = `<i class='fas fa-info mr-3'></i>Who we are`;container.appendChild(title);
    container.appendChild(document.createElement('hr'));
    const div = document.createElement('div');
    div.setAttribute('class', 'row p-1 m-1');
    container.appendChild(div);
    let element = document.createElement('p');
    element.setAttribute('class', 'text-secondary');
    element.innerHTML = `Hi, we are a group of students of 
        <a class='text-info' style='text-decoration: none;' href='https://www.polito.it/' target='_blank'>Politecnico di Torino</a> 
        and this is an homework for the course Image Processing And Computer Vision.`;
    div.appendChild(element);
    element = document.createElement('p');
    element.setAttribute('class', 'text-secondary');
    element.innerHTML = `The goal of this web application is to test the facerecognition python library, emulating a domestic video surveillance system`;
    div.appendChild(element);
    element = document.createElement('p');
    element.setAttribute('class', 'text-secondary');
    element.innerHTML = `Please contact us for any question or problem via email at: S123456@studenti.polito.it`;
    div.appendChild(element);
}

export {loadRecognize, loadProfile, pushNotification, emailNotification, smsNotification};