'use strict';

class ProfileStatisctics {
    constructor(profileId){
        this.profileId = profileId;
        this.faces = 1;
        this.unrecognized = 1;
    }
    static from (json) {
        // returns a ProfileStatisctics obj from a json one
        return Object.assign(new ProfileStatisctics(), json);
    }
}

export default ProfileStatisctics;