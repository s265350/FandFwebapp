import Profile from "./profile.js";
import ProfileStatistics from "./profilestatistics.js";

async function getAllProfiles() {
    const response = await fetch('/profiles');
    if(response.ok){
        const profiles = await response.json();
        return profiles.map( (p) => Profile.from(p) );
    } else
        throw 'ERROR fetching /profiles';
}

async function getAllProfilesId() {
    const response = await fetch('/profilesid');
    if(response.ok){
        const ids = await response.json();
        return ids.map( (p) => JSON.parse(p) );
    } else
        throw 'ERROR fetching /profilesid';
}

async function getProfileById(profileId) {
    const response = await fetch(`/profiles/${profileId}`);
    if(response.ok){
        const profile = await response.json();
        return Profile.from(profile);
    } else
        throw `ERROR fetching /profiles/${profileId}`;
}

async function getAllStatistics() {
    const response = await fetch('/statistics');
    if(response.ok){
        const statistics = await response.json();
        return statistics.map( (ps) => ProfileStatistics.from(ps) );
    } else
        throw 'ERROR fetching /statistics';
}

async function getProfileStatisticsById(profileId) {
    const response = await fetch(`/statistics/${profileId}`);
    if(response.ok){
        const profileStatistics = await response.json();
        return Profile.from(profileStatistics);
    } else
        throw `ERROR fetching /statistics/${profileId}`;
}

async function newProfile(profile) {
    return new Promise( (resolve, reject) => {
        fetch('/profiles', {
            method: 'POST',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profile),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else reject(null);
        });
    });
}

async function newProfileStatistic(profileStatistics) {
    return new Promise( (resolve, reject) => {
        fetch('/statistics', {
            method: 'POST',
            headers:{'Content-Type': 'application/json',},
            body: JSON.stringify(profileStatistics),
        }).then( (response) => {
            if(response.ok) resolve(null);
            else reject(null);
        });
    });
}

export {getAllProfiles, getAllProfilesId, getProfileById, getAllStatistics, getProfileStatisticsById, newProfile, newProfileStatistic};