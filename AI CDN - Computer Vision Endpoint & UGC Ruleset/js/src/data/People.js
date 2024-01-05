// a class to store the people data such as traceID, keypoints like nose, eyes, ears, etc., bounding box, and position in the scene
import * as THREE from 'https://unpkg.com/three/build/three.module.js';


export default class People
{

    constructor()
    {
        this.traceId = null;
        this.boundingBox = new THREE.Box3();

        this.position = new THREE.Vector3();
        this.topLeftPoint = new THREE.Vector3();
        this.bottomRightPoint = new THREE.Vector3();

        this.path = [];

        this.pathLine = null;
        this.centerSphere = null;
        this.boundsBox = null;
        this.bounds = null;
    }

    addPathPoint(point)
    {
        // If there is a large jump in the path, reset it
        if (this.path.length > 0)
        {
            const lastPoint = this.path[ this.path.length - 1 ];
            const distance = lastPoint.distanceTo(point);

            if (distance > 0.1)
            {
                this.path = [];
            }
        }

        this.path.push(point);

        this.path = this.path.slice(-1000);
    }

}
