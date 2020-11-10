'use strict';

class ProfileStatisctics {
    constructor(profileId, faces, recognized){
        this.profileId = profileId;
        this.faces = faces;
        this.recognized = recognized;
    }

    static from (json) {
        // returns an exam obj from a json one
        return Object.assign(new ProfileStatisctics(), json);
    }
}

export default ProfileStatisctics;