// a class to store the people data such as traceID, keypoints like nose, eyes, ears, etc., bounding box, and position in the scene
import * as THREE from 'https://unpkg.com/three/build/three.module.js';


export default class People
{

    constructor()
    {
        this.traceId = null;
        this.boundingBox = new THREE.Box3();
        this.position = new THREE.Vector3();
        this.path = [];

        this.line = null;
        this.point = null;
        this.midPoint = null;
        this.bounds = null;
    }

    addPathPoint(point)
    {
        this.path.push(point);

        this.path = this.path.slice(-1000);
    }

}
