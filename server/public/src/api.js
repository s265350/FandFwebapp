import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";

/* GET */
async function getAllProfiles() {
    const response = await fetch(`/profiles`);
    if(response.ok){
        const profiles = await response.json();
        return profiles.map( (p) => Profile.from(p) );
    } else
        throw `ERROR fetching /profiles`;
}

async function getAllProfilesId() {
    const response = await fetch(`/profilesid`);
    if(response.ok){
        const ids = await response.json();
        return ids.map( (p) => JSON.parse(p) );
    } else
        throw `/statistics`;
}

async function getProfileById(profileId) {
    const response = await fetch(`/profiles/${profileId}`);
    if(response.ok){
        const profile = await response.json();
        return Profile.from(profile);
    } else
        throw `ERROR fetching /profiles/${profileId}`;
}

async function getAdminProfile() {
    const response = await fetch(`/adminprofile`);
    if(response.ok){
        const profile = await response.json();
        return Profile.from(profile);
    } else
        throw `ERROR fetching /adminprofile`;
}

async function getAllStatistics() {
    const response = await fetch(`/statistics`);
    if(response.ok){
        const statistics = await response.json();
        return statistics.map( (ps) => ProfileStatistics.from(ps) );
    } else
        throw `ERROR fetching /statistics`;
}

async function getProfileStatisticsById(profileId) {
    const response = await fetch(`/statistics/${profileId}`);
    if(response.ok){
        const profileStatistics = await response.json();
        return ProfileStatistics.from(profileStatistics);
    } else
        throw `ERROR fetching /statistics/${profileId}`;
}

/* POST */
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
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

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
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

/* PUT */
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
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

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
                    .catch( (err) => {reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

export {getAllProfiles, getAllProfilesId, getProfileById, getAdminProfile, getAllStatistics, getProfileStatisticsById, newProfile, newProfileStatistics, updateProfile, updateProfileStatistics};