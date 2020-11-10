'use strict';

class Profile {
    constructor(firstName, lastName, phone, email, system, family, notifications, notificationsPhone, notificationsEmail, avatar){
        this.profileId = firstName+phone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.system = system;
        this.family = family;
        if(notifications === 0) this.notifications = false; else this.notifications = true;
        if(notificationsPhone === 0) this.notificationsPhone = false; else this.notificationsPhone = true;
        if(notificationsEmail === 0) this.notificationsEmail = false; else this.notificationsEmail = true;
        this.avatar = avatar;
    }

    static from (json) {
        // returns an exam obj from a json one
        return Object.assign(new Profile(), json);
    }
}

export default Profile;