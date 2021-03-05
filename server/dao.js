/* DATA ACCESS OBJECT */
// DAO module for accessing profiles and statistics

'use strict';

const sqlite = require('sqlite3');
const db = new sqlite.Database('database.db', (err) => {if(err) throw err;});

/* GETS */

// get all profiles rows as Profile objects
exports.getProfiles = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const profiles = rows.map( (row) => ({
                profileId: row.profileId,
                firstName: row.firstName,
                lastName: row.lastName,
                phone: row.phone,
                email: row.email,
                system: row.system,
                family: row.family,
                notifications: !!row.notifications,
                notificationsPhone: !!row.notificationsPhone,
                notificationsEmail: !!row.notificationsEmail,
                avatar: row.avatar
            }));
            resolve(profiles);
        });
    });
};

// get all profiles ID
exports.getAllProfilesId = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM profiles';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const ids = rows.map( (row) => ({profileId: row.profileId}));
            resolve(ids);
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
                    lastName: row.lastName,
                    phone: row.phone,
                    email: row.email,
                    system: row.system,
                    family: row.family,
                    notifications: !!row.notifications,
                    notificationsPhone: !!row.notificationsPhone,
                    notificationsEmail: !!row.notificationsEmail,
                    avatar: row.avatar
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
                    lastName: row.lastName,
                    phone: row.phone,
                    email: row.email,
                    system: row.system,
                    family: row.family,
                    notifications: !!row.notifications,
                    notificationsPhone: !!row.notificationsPhone,
                    notificationsEmail: !!row.notificationsEmail,
                    avatar: row.avatar
                };
                resolve(profile);
            }
        });
    });
};

// get all statistics as ProfileStatistics objects
exports.getProfilesStatistics = function() {
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

// get all strangers rows as Stranger objects
exports.getStrangers = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM strangers';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const strangers = rows.map( (row) => ({profileId: row.profileId, detections: row.detections, avatar: row.avatar}));
            resolve(strangers);
        });
    });
};

// get all strangers ID
exports.getAllStrangersId = function() {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM strangers';
        db.all(sql, [], (err, rows) => {
            if (err) {reject(err);return;}
            const ids = rows.map( (row) => ({profileId: row.profileId}));
            resolve(ids);
        });
    });
};

// get stranger object with corresponding profile ID
exports.getStrangerById = function(profileId) {
    return new Promise( (resolve, reject) => {
        const sql = 'SELECT * FROM strangers WHERE profileId=?';
        db.get(sql, [profileId], (err, row) => {
            if (err) {reject(err);return;}
            if (row == undefined) {resolve(null);
            } else {
                const stranger = {profileId: row.profileId, detections: row.detections, avatar: row.avatar};
                resolve(stranger);
            }
        });
    });
};


/* POSTS */

exports.generateId = async (length) => {
    // id must be a unique string of at least 6 random characters/numbers
    if (length < 6) length = 6;
    const strangers = await this.getAllStrangersId();
    const profiles = await this.getAllProfilesId();
    let id;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (!id || id == '' || profiles.includes(id) || strangers.includes(id)){
        id = '';
        for (let i = 0; i < length; i++) id += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return id;
}

// upload a new profile row
exports.createProfile = function(profile) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO profiles (profileId, firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
        this.generateId(6).then( profileId => {
            db.run(sql, [profileId, profile.firstName, profile.lastName, profile.phone, profile.email, profile.system, profile.family, profile.notifications, profile.notificationsPhone, profile.notificationsEmail, profileId+".png"], function (err) {
                if (err) reject(err);
                resolve(profileId);
            })
            .catch( (err) => {reject(err);return;});
        });
    });
};

// upload a new statistics row
exports.createProfileStatistics = function(profileStatistics) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO statistics (profileId, faces, unrecognized) VALUES(?,?,?)';
        db.run(sql, [profileStatistics.profileId, profileStatistics.faces, profileStatistics.unrecognized], function (err) {
            if (err) reject(err);
            resolve(profileStatistics.profileId);
        })
    });
};

// upload a new statistics row
exports.createStranger = function() {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO strangers (profileId, detections, avatar) VALUES(?,?,?)';
        this.generateId(8).then(profileId => {
            db.run(sql, [profileId, 1, profileId+"png"], function (err) {
                if (err) reject(err);
                resolve(profileId);
            });
        })
        .catch( (err) => {reject(err);return;});
    });
};

/* PUTS */

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

// update a strangers row
exports.updateStranger = function(stranger){
    return new Promise( (resolve, reject) => {
        const sql = 'UPDATE strangers SET profileId = ?, detections = ?, avatar = ? WHERE profileId = ?';
        db.run(sql, [stranger.profileId, stranger.detections, stranger.avatar, stranger.profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

/* DELETES */

// delete a Profile row
exports.deleteProfile = function(profileId){
    return new Promise( (resolve, reject) => {
        const sql = 'DELETE FROM profiles WHERE profileId = ?';
        db.run(sql, [profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// delete a ProfileStatistics row
exports.deleteProfileStatistics = function(profileId){
    return new Promise( (resolve, reject) => {
        const sql = 'DELETE FROM statistics WHERE profileId = ?';
        db.run(sql, [profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}

// delete a strangers row
exports.deleteStranger = function(profileId){
    return new Promise( (resolve, reject) => {
        const sql = 'DELETE FROM strangers WHERE profileId = ?';
        db.run(sql, [profileId], (err) => {
            if(err) reject(err);
            resolve(null);
        });
    });
}