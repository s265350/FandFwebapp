'use strict';

import * as Api from './api.js';

class Profile {
    constructor(firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar){
        this.profileId = ''; // profile id is set by the server, NOT at client side
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.system = system;
        this.family = family;
        this.notifications = Number(notifications); // boolean converted in number for the database
        this.notificationsPhone = Number(notificationsPhone); // boolean converted in number for the database
        this.notificationsEmail = Number(notificationsEmail); // boolean converted in number for the database
        this.avatar = avatar; // name of the profile avatar file
    }
    static from (json) {
        // returns a Profile obj from a json one
        return Object.assign(new Profile(), json);
    }
}

export default Profile;