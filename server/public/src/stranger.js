'use strict';

class Stranger {
    constructor(profileId){
        this.profileId = profileId;
        this.detected = 1; // considering the first image
        this.avatar = `${profileId}.png`;
    }
    static from (json) {
        // returns a Stranger obj from a json one
        return Object.assign(new Stranger(), json);
    }
}

export default Stranger;
