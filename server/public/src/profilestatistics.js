'use strict';

class ProfileStatisctics {
    constructor(profileId){
        this.profileId = profileId; // every profile has to be created as well its statistics
        this.faces = 1; // considering the profile image
        this.unrecognized = 1; // profile image was not recognized
    }
    static from (json) {
        // returns a ProfileStatisctics obj from a json one
        return Object.assign(new ProfileStatisctics(), json);
    }
}

export default ProfileStatisctics;
