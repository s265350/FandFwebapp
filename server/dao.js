'use strict';

// DAO module for accessing profiles and statistics
// Data Access Object

const sqlite = require('sqlite3');
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});

/* GET */
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

exports.getAdminProfile = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles WHERE system = ?';
        db.get(sql, ["Admin"], (err, row) => {
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
  
exports.getStatistics = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics';
        db.all(sql, (err, rows) => {
            if (err) {reject(err);return;}
            const statistics = rows.map((row) => ({profileId: row.profileId, faces: row.faces, unrecognized: row.unrecognized}));
            resolve(statistics);
        });
    });
};
  
exports.getProfileStatisticsById = function(profileId) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM statistics WHERE profileId=?';
        db.get(sql, [profileId], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve({});
            } else {
                const profileStatistics = {profileId: row.profileId, faces: row.faces, unrecognized: row.unrecognized};
                resolve(profileStatistics);
            }
        });
    });
};

/* POST */
exports.createProfile = function(profile) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO profiles (profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
        db.run(sql, [profile.profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profile.avatar], function (err) {
            if (err) {reject(err);return;}
            resolve();
        });
    });
};

exports.createProfileStatistics = function(profileStatistics) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO statistics (profileId, faces, unrecognized) VALUES(?,?,?)';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.unrecognized], function (err) {
            if (err) {reject(err);return;}
            resolve();
        });
    });
};

/* PUT */
// Update the profile with the given id
exports.updateProfile = function(profile){
    return new Promise( (resolve, reject) => {
        const sql = 'UPDATE profiles SET profileId = ?, firstName = ?, lastName = ?, phone = ?, email = ?, system = ?, family = ?, notifications = ?, notificationsPhone = ?, notificationsEmail = ?, avatar = ? WHERE profileId = ?';
        db.run(sql, [profile.profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profile.avatar, profile.profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// Update the profile statistics with the given id
exports.updateProfileStatistics = function(profileStatistics){
    return new Promise( (resolve, reject) => {
        const sql = 'UPDATE statistics SET profileId = ?, faces = ?, unrecognized = ? WHERE profileId = ?';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.unrecognized, profileStatistics.profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}