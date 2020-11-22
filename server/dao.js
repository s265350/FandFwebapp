/* DATA ACCESS OBJECT */
// DAO module for accessing profiles and statistics

'use strict';

const sqlite = require('sqlite3');
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});

/* GET */

// get all profiles rows as Profile objects
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
                notifications : !!row.notifications,
                notificationsPhone : !!row.notificationsPhone,
                notificationsEmail : !!row.notificationsEmail,
                avatar : row.avatar
            }));
            resolve(profiles);
        });
    });
};

// get all profiles ID
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

// get profile with corresponding profile ID
exports.getProfileById = function(id) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles WHERE profileId = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve({});
            } else {
                const profile = {
                    profileId: row.profileId,
                    firstName: row.firstName,
                    lastName : row.lastName,
                    phone : row.phone,
                    email : row.email,
                    system : row.system,
                    family : row.family,
                    notifications: !!row.notifications,
                    notificationsPhone: !!row.notificationsPhone,
                    notificationsEmail: !!row.notificationsEmail,
                    avatar : row.avatar
                };
                resolve(profile);
            }
        });
    });
};

// get first admin profile
exports.getAdminProfile = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles WHERE system = ?';
        db.get(sql, ['Admin'], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined || Array.isArray(row)) {resolve({});
            } else {
                const profile = {
                    profileId: row.profileId,
                    firstName: row.firstName,
                    lastName : row.lastName,
                    phone : row.phone,
                    email : row.email,
                    system : row.system,
                    family : row.family,
                    notifications: !!row.notifications,
                    notificationsPhone: !!row.notificationsPhone,
                    notificationsEmail: !!row.notificationsEmail,
                    avatar : row.avatar
                };
                resolve(profile);
            }
        });
    });
};

// get all statistics as ProfileStatistics objects
exports.getStatistics = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics';
        db.all(sql, (err, rows) => {
            if (err) reject(err);
            const statistics = rows.map((row) => ({profileId: row.profileId, faces: row.faces, unrecognized: row.unrecognized}));
            resolve(statistics);
        });
    });
};

// get ProfileStatistics object with corresponding profile ID
exports.getProfileStatisticsById = function(profileId) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics WHERE profileId=?';
        db.get(sql, [profileId], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve(null);
            } else {
                const profileStatistics = {profileId: row.profileId, faces: row.faces, unrecognized: row.unrecognized};
                resolve(profileStatistics);
            }
        });
    });
};

/* POST */

// upload a new profile row
exports.createProfile = function(profile) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO profiles (profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
        // id must be a unique string of 6 random characters/numbers
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        do{
            profile.profileId = '';
            for (let i = 0; i < 6; i++) profile.profileId += charset.charAt(Math.floor(Math.random() * charset.length));
        } while(this.getProfileById(profile.profileId) === null);
        // save
        db.run(sql, [profile.profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profile.avatar], function (err) {
            if (err) reject(err);
            resolve(profile.profileId);
        });
    });
};

// upload a new statistics row
exports.createProfileStatistics = function(profileStatistics) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO statistics (profileId, faces, unrecognized) VALUES(?,?,?)';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.unrecognized], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
};

/* PUT */

// update a profile row
exports.updateProfile = function(profile){
    return new Promise( (resolve, reject) => {
        const sql = 'UPDATE profiles SET profileId = ?, firstName = ?, lastName = ?, phone = ?, email = ?, system = ?, family = ?, notifications = ?, notificationsPhone = ?, notificationsEmail = ?, avatar = ? WHERE profileId = ?';
        db.run(sql, [profile.profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profile.avatar, profile.profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// update a ProfileStatistics row
exports.updateProfileStatistics = function(profileStatistics){
    return new Promise( (resolve, reject) => {
        const sql = 'UPDATE statistics SET profileId = ?, faces = ?, unrecognized = ? WHERE profileId = ?';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.unrecognized, profileStatistics.profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// delete a Profile row
exports.deleteProfile = function(profileId){
    return new Promise( (resolve, reject) => {
        const sql = 'DELETE FROM profiles WHERE profileId=?';
        db.run(sql, [profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// delete a ProfileStatistics row
exports.deleteProfileStatistics = function(profileId){
    return new Promise( (resolve, reject) => {
        const sql = 'DELETE FROM statistics WHERE profileId=?';
        db.run(sql, [profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}