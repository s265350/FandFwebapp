'use strict';

// DAO module for accessing profiles and statistics
// Data Access Object

const sqlite = require('sqlite3');
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});


exports.getProfiles = function() {
    return new Promise( (resolve, reject) => {
    const sql = 'SELECT * FROM profiles';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const profiles = rows.map( (row) => ({
                profileId: row.profileId,
                firstName: row.firstName,
                lastName : row.lastName,
                phone : row.phone,
                email : row.email,
                system : row.system,
                family : row.family,
                notifications : row.notifications,
                notificationsPhone : row.notificationsPhone,
                notificationsEmail : row.notificationsEmail,
                avatar : row.avatar
            }));
            resolve(profiles);
        });
    });
};

exports.getProfilesId = function() {
    return new Promise( (resolve, reject) => {
    const sql = 'SELECT * FROM profiles';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const profiles = rows.map( (row) => ({profileId: row.profileId}));
            resolve(profiles);
        });
    });
};

exports.getProfileById = function(id) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles WHERE profileId = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve({});
            } else {
                const course = {
                    profileId: row.profileId,
                    firstName: row.firstName,
                    lastName : row.lastName,
                    phone : row.phone,
                    email : row.email,
                    system : row.system,
                    family : row.family,
                    notifications : row.notifications,
                    notificationsPhone : row.notificationsPhone,
                    notificationsEmail : row.notificationsEmail,
                    avatar : row.avatar
                };
                resolve(course);
            }
        });
    });
};

exports.createProfile = function(profile) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO profiles(profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail) VALUES(?,?,?,?,?,?,?,?,?,?)';
        db.run(sql, [profile.profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profile.avatar], function (err) {
            if (err) {reject(err);return;}
            resolve();
        });
    });
};
  
exports.getStatistics = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics';
        db.all(sql, (err, rows) => {
            if (err) {reject(err);return;}
            const statistics = rows.map((row) => ({profileId: row.profileId, faces: row.faces, recognized: row.recognized, unrecognized: row.unrecognized}));
            resolve(statistics);
        });
    });
};
  
exports.getProfileStatistics = function(profileId) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics WHERE profileId=?';
        db.get(sql, [profileId], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve({});
            } else {
                const profileStatistics = {profileId: row.profileId, faces: row.faces, recognized: row.recognized, unrecognized: row.unrecognized};
                resolve(profileStatistics);
            }
        });
    });
};

exports.createProfileStatistics = function(profileStatistics) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO statistics (profileId, faces, recognized, unrecognized, avatar) VALUES(?,?,?,?,?)';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.recognized, profileStatistics.unrecognized], function (err) {
            if (err) {reject(err);return;}
            resolve();
        });
    });
};