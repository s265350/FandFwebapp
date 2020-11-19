/* Fetch API */

import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";

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
        throw `/statistics`;
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
async function getAllStatistics() {
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
        const res = await response.json();
        return res;
    } else
        throw `ERROR fetching /strangers`;
}

// get profile image or stranger image
async function getImage(filename, stranger) {
    let path = "";
    if(stranger) path = "/strangers";
    const response = await fetch(`/faces${path}/${filename}`);
    if(response.ok){
        return response.url;
    } else
        throw `ERROR fetching /faces${path}/${filename}`;
}

/* POST */

// upload a new profile row
async function newProfile(profile) {
    return new Promise( (resolve, reject) => {
        fetch(`/profiles`, {
            method: 'POST',
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

// upload a new statistics row
async function newProfileStatistics(profileStatistics) {
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

// upload an image in "faces" or "strangers" folder
async function uploadImage(file, name, stranger){
    const formData = new FormData();
    formData.append('name', name);
    formData.append('avatar', file);
    let path = "faces";
    if(stranger) path = "strangers";
    return new Promise( (resolve, reject) => {
        fetch(`/${path}`, {method: 'POST', body: formData})
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

// copy an image from "strangers" folder to "faces" one
async function saveStrangerImage(filename, name){
    return new Promise( (resolve, reject) => {
        fetch(`/faces/strangers`, {
            method: 'POST',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify({"filename": filename, "name": name}),
        })
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

// delete an image in "faces" or "strangers" folder
async function deleteImage(filename, stranger){
    return new Promise( (resolve, reject) => {
        fetch(`/faces/${filename}`, {
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

//TODO: delete Profiles and ProfileStatistics

export {
    getAllProfiles, 
    getAllProfilesId, 
    getProfileById, 
    getAdminProfile, 
    getAllStatistics, 
    getProfileStatisticsById, 
    getStrangers, 
    getImage, 
    newProfile, 
    newProfileStatistics, 
    saveStrangerImage, 
    uploadImage, 
    updateProfile, 
    updateProfileStatistics, 
    deleteImage, 
};