'use strict';

class Stranger {
    constructor(profileId){
        this.profileId = profileId;
        this.detections = 1; // considering the profile image
    }
    static from (json) {
        // returns a Stranger obj from a json one
        return Object.assign(new Stranger(), json);
    }
}

export default Stranger;
