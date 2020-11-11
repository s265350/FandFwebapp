'use strict';

class Profile {
    constructor(firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar){
        this.profileId = [firstName, phone].join("");
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.system = system;
        this.family = family;
        this.notifications = Number(notifications);
        this.notificationsPhone = Number(notificationsPhone);
        this.notificationsEmail = Number(notificationsEmail);
        this.avatar = avatar;
    }
    static from (json) {
        // returns a Profile obj from a json one
        return Object.assign(new Profile(), json);
    }
}

export default Profile;