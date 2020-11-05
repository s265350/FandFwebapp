'use strict';

class ProfileStatisctics {
    constructor(profileId, faces, recognized, unrecognized){
        this.porfileId = porfileId;
        this.faces = faces;
        this.recognized = recognized;
        this.unrecognized = unrecognized;
    }

    static from (json) {
        // returns an exam obj from a json one
        return Object.assign(new ProfileStatisctics(), json);
    }
}

export default ProfileStatisctics;