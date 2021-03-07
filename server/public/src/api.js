/* Fetch API */

import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";
import Stranger from "./stranger.js";
import {getClientId} from "./main.js";

/* GET */

// get all profiles rows as Profile objects
async function getAllProfiles() {
    const response = await fetch(`/profiles`);
    if(response.ok){
        const profiles = await response.json();
        return profiles.map( (p) => Profile.from(p) );
    } else
        throw `ERROR fetching /profiles`;
}

// get all profiles ID
async function getAllProfilesId() {
    const response = await fetch(`/profilesid`);
    if(response.ok){
        const ids = await response.json();
        return ids.map( (p) => JSON.parse(p) );
    } else
        throw `/profilesid`;
}

// get profile with corresponding profile ID
async function getProfileById(profileId) {
    const response = await fetch(`/profiles/${profileId}`);
    if(response.ok){
        const profile = await response.json();
        return Profile.from(profile);
    } else
        throw `ERROR fetching /profiles/${profileId}`;
}

// get first admin profile
async function getAdminProfile() {
    const response = await fetch(`/admin`);
    if(response.ok){
        const profile = await response.json();
        return Profile.from(profile);
    } else
        throw `ERROR fetching /admin`;
}

// get all statistics as ProfileStatistics objects
async function getProfilesStatistics() {
    const response = await fetch(`/statistics`);
    if(response.ok){
        const statistics = await response.json();
        return statistics.map( (ps) => ProfileStatistics.from(ps) );
    } else
        throw `ERROR fetching /statistics`;
}

// get ProfileStatistics object with corresponding profile ID
async function getProfileStatisticsById(profileId) {
    const response = await fetch(`/statistics/${profileId}`);
    if(response.ok){
        const profileStatistics = await response.json();
        return ProfileStatistics.from(profileStatistics);
    } else
        throw `ERROR fetching /statistics/${profileId}`;
}

// get path list for all images in "strangers" folder
async function getStrangers(){
    const response = await fetch(`/strangers`);
    if(response.ok){
        const strangers = await response.json();
        return strangers.map( (p) => Stranger.from(p) );
    } else
        throw `ERROR fetching /strangers`;
}

// get all strangers ID
async function getAllStrangersId() {
    const response = await fetch(`/strangersid`);
    if(response.ok){
        const ids = await response.json();
        return ids.map( (p) => JSON.parse(p) );
    } else
        throw `/strangersid`;
}

// get stranger object with corresponding profile ID
async function getStrangerById(profileId) {
    const response = await fetch(`/strangers/${profileId}`);
    if(response.ok){
        const stranger = await response.json();
        return Stranger.from(stranger);
    } else
        throw `ERROR fetching /statistics/${profileId}`;
}

// get profile image or stranger image
async function getImage(filename, stranger) {
    const path = (stranger)? "strangers" : "profiles";
    const response = await fetch(`/faces/${path}/${filename}`);
    if(response.ok){
        return response.url;
    } else
        throw `ERROR fetching /faces/${path}/${filename}`;
}

/* POST */

// upload a new profile row
async function createProfile(profile) {
    return new Promise( (resolve, reject) => {
        fetch(`/profiles`, {
            method: 'POST',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profile),
        }).then( (response) => {
            if(response.ok) resolve(response.json());
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// upload a new statistics row
async function createProfileStatistics(profileStatistics) {
    return new Promise( (resolve, reject) => {
        fetch(`/statistics`, {
            method: 'POST',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profileStatistics),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// upload the new image for the given profileId
async function changeProfileImage(profileId, imageBase64){
    const formData = new FormData();
    formData.append('clientId', getClientId());
    formData.append('profileId', profileId);
    formData.append('imageBase64', imageBase64);
    return new Promise( (resolve, reject) => {
        fetch(`/faces/profiles`, {method: 'POST', body: formData})
        .then( (response) => {
            if(response.ok) resolve(response.json());
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// upload an image
async function uploadImage(imageBase64, recents){
    const formData = new FormData();
    formData.append('clientId', getClientId());
    formData.append("imageBase64", imageBase64);
    formData.append("recents", recents);
    console.log("uploading image");
    return new Promise( (resolve, reject) => {
        fetch(`/screenshot`, {method: 'POST', body: formData})
        .then( (response) => {
            if(response.ok) {
                resolve(response.json());
            }
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}
// send an email notification
async function sendEmailNotification(email, name){
    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("subject", `F&F System alert`);
    formData.append("message", "Stranger detected!");
    return new Promise( (resolve, reject) => {
        fetch(`/sendemail`, {method: 'POST', body: formData})
        .then( (response) => {
            if(response.ok) resolve(response.json());
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// send an SMS notification
async function sendSmsNotification(number){
    const formData = new FormData();
    formData.append("number", number);
    formData.append("message", `F&F System alert\nStranger detected!`);
    return new Promise( (resolve, reject) => {
        fetch(`/sendemail`, {method: 'POST', body: formData})
        .then( (response) => {
            if(response.ok) resolve(response.json());
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

/* PUT */

// update a profile row
async function updateProfile(profile) {
    return new Promise( (resolve, reject) => {
        fetch(`/profiles/${profile.profileId}`, {
            method: 'PUT',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profile),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// update a ProfileStatistics row
async function updateProfileStatistics(profileStatistics) {
    return new Promise( (resolve, reject) => {
        fetch(`/statistics/${profileStatistics.profileId}`, {
            method: 'PUT',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profileStatistics),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

/* DELETE */

// delete an image in "profiles" or "strangers" folder
async function deleteImage(filename, stranger){
    const path = (stranger)? 'strangers/' : 'profiles/';
    return new Promise( (resolve, reject) => {
        fetch(`/faces/${path}/${filename}`, {
            method: 'DELETE',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify({"stranger": stranger}),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else {
                response.json()
                    .then( (obj) => {reject(obj);} ) // error msg in the response body
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// delete a profile
async function deleteProfile(profileId){
    return new Promise( (resolve, reject) => {
        fetch(`/profiles/${profileId}`, {method: 'DELETE',})
            .then( (response) => {
                if(response.ok) resolve(null);
                else {
                    response.json()
                        .then( (obj) => {reject(obj);} ) // error msg in the response body
                        .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
                }
            }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

// delete statistics of a profile
async function deleteProfileStatistics(profileId){
    return new Promise( (resolve, reject) => {
        fetch(`/statistics/${profileId}`, {method: 'DELETE',})
            .then( (response) => {
                if(response.ok) resolve(null);
                else {
                    response.json()
                        .then( (obj) => {reject(obj);} ) // error msg in the response body
                        .catch( (err) => {reject({ errors: [{ param: "Application", msg: `Cannot parse server response: ${err}` }] }) }); // something else
                }
            }).catch( (err) => {reject({ errors: [{ param: "Server", msg: `Cannot communicate: ${err}` }] }) }); // connection errors
    });
}

export {
    getAllProfiles, 
    getAllProfilesId, 
    getProfileById, 
    getAdminProfile, 
    getProfilesStatistics, 
    getProfileStatisticsById, 
    getStrangers, 
    getAllStrangersId, 
    getStrangerById, 
    getImage, 
    createProfile, 
    createProfileStatistics, 
    changeProfileImage, 
    uploadImage, 
    sendSmsNotification, 
    sendEmailNotification, 
    updateProfile, 
    updateProfileStatistics, 
    deleteImage, 
    deleteProfile, 
    deleteProfileStatistics, 
};
