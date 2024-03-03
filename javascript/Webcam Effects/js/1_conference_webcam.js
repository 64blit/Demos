import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


let objectPool = [];
let webcamTexture = undefined;
let aspect = 16 / 9;

let scene = null;
let material = null;
let activeObjects = [];

const MAX_PEOPLE = 25;

const createPlane = (scene, material) =>
{
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.0, 0.0),
        material
    );

    plane.geometry.computeBoundingBox();
    plane.geometry.computeBoundingSphere();
    plane.visible = false;
    scene.add(plane);
    return plane;
}

const getFrame = (scene) =>
{

    for (const object of objectPool)
    {
        if (!object.active)
        {
            return object;
        }
    }

    const newPlane = { id: null, active: false, mesh: createPlane(scene, material), target: new THREE.Vector3(), activeFrames: 0, inactiveFrames: 0 };

    objectPool.push(newPlane);

    return newPlane;
}

const minTime = 0.05;
const maxTime = 0.25;

const calculateTime = (smoothedValue, targetValue) =>
{
    const distance = Math.abs(smoothedValue - targetValue);
    return minTime + (maxTime - minTime) * distance;
};
const lerp = (a, b, t) =>
{
    return a + (b - a) * t;
}

export const updateScene = async (thirdEyePop) =>
{
    scene = thirdEyePop.getScene();
    const renderer = thirdEyePop.getRenderer();
    const renderManager = thirdEyePop.getRenderManager();
    const controls = thirdEyePop.getControls();

    const buildScene = async (scene, renderer) =>
    {

        webcamTexture = renderManager.videoTexture;
        webcamTexture.flipY = true;
        aspect = renderManager.videoTexture.image.videoWidth / renderManager.videoTexture.image.videoHeight;

        scene.add(new THREE.AmbientLight(0xffffff, 1));

        material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });

    }

    await buildScene(scene, renderer);

    const updatePersonPlane = (person) =>
    {
        const plane = person.frame.mesh;


        // smoothly interpolate the smoothedBounds to the actual bounds of the person, these are both THREE.Box3 objects
        if (!person.smoothedBounds)
        {
            person.smoothedBounds = person.bounds.clone();
        }

        person.smoothedBounds.min.x = lerp(person.smoothedBounds.min.x, person.bounds.min.x, calculateTime(person.smoothedBounds.min.x, person.bounds.min.x));
        person.smoothedBounds.min.y = lerp(person.smoothedBounds.min.y, person.bounds.min.y, calculateTime(person.smoothedBounds.min.y, person.bounds.min.y));
        person.smoothedBounds.max.x = lerp(person.smoothedBounds.max.x, person.bounds.max.x, calculateTime(person.smoothedBounds.max.x, person.bounds.max.x));
        person.smoothedBounds.max.y = lerp(person.smoothedBounds.max.y, person.bounds.max.y, calculateTime(person.smoothedBounds.max.y, person.bounds.max.y));

        // update the uv coordinates of the plane to only show the part of the webcam feed that the person is in
        const bounds = person.smoothedBounds;

        const width = Math.abs(bounds.max.x - bounds.min.x);
        const height = Math.abs(bounds.max.y - bounds.min.y);
        // create a new plane geometry with the calculated width and height
        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(width, height);


        // convert bounds coordinates to uv coordinates
        const uvMin = new THREE.Vector2(1 - (bounds.min.x + 1) / 2, (bounds.min.y + 1) / 2);
        const uvMax = new THREE.Vector2(1 - (bounds.max.x + 1) / 2, (bounds.max.y + 1) / 2);

        // update the uv coordinates
        plane.geometry.attributes.uv.setXY(0, uvMax.x, uvMin.y);
        plane.geometry.attributes.uv.setXY(1, uvMin.x, uvMin.y);
        plane.geometry.attributes.uv.setXY(2, uvMax.x, uvMax.y);
        plane.geometry.attributes.uv.setXY(3, uvMin.x, uvMax.y);
        plane.geometry.attributes.uv.needsUpdate = true;

        // set the boundingGeometry to the new bounds
        plane.geometry.needsUpdate = true;
        plane.geometry.computeBoundingBox();
        plane.geometry.computeBoundingSphere();

    }

    const showActivePeople = () =>
    {
        activeObjects = [];
        const activePeople = thirdEyePop.getActivePeople();
        activePeople.sort((a, b) => a.traceId - b.traceId);


        for (let i = 0; i < activePeople.length && i < MAX_PEOPLE; i++)
        {
            const person = activePeople[ i ];
            // if ther person is less than 10% of the screen, ignore them
            if (person.boundsWidth < 0.10 || person.boundsHeight < 0.10)
            {
                continue;
            }

            // get a plane from the pool if the person doesn't have one
            if (!person.frame)
            {
                person.frame = getFrame(scene);
                person.frame.id = person.traceId;
            }

            person.frame.activeFrames++;
            person.frame.inactiveFrames = 0;

            if (person.frame.activeFrames > 100)
            {
                person.frame.active = true;
                person.frame.mesh.visible = true;
            }

            person.frame.activeFrames = Math.min(person.frame.activeFrames, 1000);

            activeObjects.push(person.frame);
            // update the plane mesh to scale of the person
            updatePersonPlane(person);
        }


        // hide any planes that are no longer active
        for (const object of objectPool)
        {

            if (object.active && !activeObjects.includes(object))
            {
                object.activeFrames = 0;
                object.inactiveFrames++;

                if (object.inactiveFrames > 100)
                {
                    object.inactiveFrames = 0;
                    object.activeFrames = 0;
                    object.mesh.visible = false;
                    object.active = false;
                }

            }
        }


    }


    // Position the planes in a dynamic grid layout
    function positionPlanes(planesObjects, padding)
    {
        // get object meshes which are visible
        let planes = [];

        for (const object of planesObjects)
        {
            if (object.active)
            {
                planes.push(object);
            }
        }

        // Calculate the number of rows and columns for the grid
        var gridRows = Math.floor(Math.sqrt(planes.length));
        var gridColumns = Math.ceil(planes.length / gridRows);

        // Calculate the width and height of each cell
        var cellWidth = (2 - padding * (gridColumns - 1)) / gridColumns;
        var cellHeight = (2 - padding * (gridRows - 1)) / gridRows;

        // Position each plane in its cell
        for (var i = planes.length - 1; i >= 0; i--)
        {
            var plane = planes[ i ].mesh;

            // Calculate the cell's x and y position
            const cellX = (i % gridColumns) * (cellWidth + padding) - 1 + cellWidth / 2;
            const cellY = Math.floor(i / gridColumns) * (cellHeight + padding) - 1 + cellHeight / 2;

            // Calculate the scale factor to fit the plane in the cell
            const scaleFactor = Math.min(cellWidth / plane.geometry.parameters.width, cellHeight / plane.geometry.parameters.height);

            // Position and scale the plane in the cell
            plane.scale.setScalar(scaleFactor);

            planes[ i ].target.set(cellX, -cellY, 0);

            plane.position.lerp(planes[ i ].target, .1);
        }
    }

    // runs every frame
    thirdEyePop.onUpdate = function ()
    {
        showActivePeople();

        positionPlanes(objectPool, 0.15);

    };

}
