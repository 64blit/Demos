import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


let objectPool = [];
let webcamTexture = undefined;

let scene = null;
let material = null;
let bgModel = null;
let bgModelPlanes = [];

const createPlane = () =>
{
    let plane = bgModelPlanes.pop();

    if (!plane)
    {
        plane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.0, 0.0),
            material
        );
    }

    plane.geometry.computeBoundingBox();
    plane.geometry.computeBoundingSphere();
    plane.visible = false;
    scene.add(plane);
    return plane;
}

const getPlaneFromPool = () =>
{

    const newPlane = { id: null, mesh: createPlane(scene, material), target: new THREE.Vector3(), inactiveFrames: 0, activeFrames: 0 };

    objectPool.push(newPlane);

    return newPlane;
}

const lerp = (a, b, t) =>
{
    return a + (b - a) * t;
}

export const updateScene = async (thirdEyePop) =>
{
    const raycaster = new THREE.Raycaster();
    scene = thirdEyePop.getScene();
    const renderer = thirdEyePop.getRenderer();
    const renderManager = thirdEyePop.getRenderManager();
    const controls = thirdEyePop.getControls();

    const buildScene = async (scene, renderer) =>
    {

        webcamTexture = renderManager.videoTexture;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.background = new THREE.Color(0x000000);

        // build a pool of plane meshes to be used to display all the people in the webcam feed
        objectPool = [];

        material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });

        const gltfLoader = new GLTFLoader();
        gltfLoader.load('../assets/conference_call.glb', (gltf) =>
        {
            bgModel = gltf.scene;
            bgModel.traverse((child) =>
            {
                if (child.isMesh && child.name.includes('p'))
                {
                    bgModelPlanes.push(child);
                    child.material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });
                    child.visible = false;
                }
            });

            // sort the bgModelPlanes by name
            bgModelPlanes.sort((a, b) =>
            {
                return a.name.localeCompare(b.name);
            });

            controls.fitToBox(bgModel, true);
            scene.add(bgModel);
        });

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

        person.smoothedBounds.min.x = lerp(person.smoothedBounds.min.x, person.bounds.min.x, 0.01);
        person.smoothedBounds.min.y = lerp(person.smoothedBounds.min.y, person.bounds.min.y, 0.01);
        person.smoothedBounds.max.x = lerp(person.smoothedBounds.max.x, person.bounds.max.x, 0.01);
        person.smoothedBounds.max.y = lerp(person.smoothedBounds.max.y, person.bounds.max.y, 0.01);


        // update the uv coordinates of the plane to only show the part of the webcam feed that the person is in
        const bounds = person.smoothedBounds;

        const width = Math.abs(bounds.max.x - bounds.min.x);
        const height = Math.abs(bounds.max.y - bounds.min.y);

        plane.scale.set(1, 1, 1);

        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(width, height);

        // convert bounds coordinates to uv coordinates
        const uvMin = new THREE.Vector2(1 - (bounds.min.x + 1) / 2, (bounds.min.y + 1) / 2);
        const uvMax = new THREE.Vector2(1 - (bounds.max.x + 1) / 2, (bounds.max.y + 1) / 2);

        // update the uv coordinates
        plane.geometry.attributes.uv.setXY(0, uvMin.x, uvMin.y);
        plane.geometry.attributes.uv.setXY(1, uvMax.x, uvMin.y);
        plane.geometry.attributes.uv.setXY(2, uvMin.x, uvMax.y);
        plane.geometry.attributes.uv.setXY(3, uvMax.x, uvMax.y);
        plane.geometry.attributes.uv.needsUpdate = true;


        // set the boundingGeometry to the new bounds
        plane.geometry.needsUpdate = true;
        plane.geometry.computeBoundingBox();
        plane.geometry.computeBoundingSphere();

    }


    const showActivePeople = () =>
    {
        const activeIds = [];

        for (const person of thirdEyePop.getActivePeople())
        {

            // get a plane from the pool if the person doesn't have one
            if (!person.frame)
            {
                person.frame = getPlaneFromPool(scene);
                person.frame.id = person.traceId;
            }

            // if ther person is less than 10% of the screen, ignore them
            if (person.boundsWidth < 0.10 || person.boundsHeight < 0.10)
            {
                continue;
            }

            person.frame.activeFrames++;
            person.frame.inactiveFrames = 0;
            activeIds.push(person.traceId);

            if (person.frame.activeFrames > 50)
            {
                person.frame.mesh.visible = true;
            }

            // update the plane mesh to scale of the person
            updatePersonPlane(person);
        }

        // hide any planes that are no longer active
        for (const object of objectPool)
        {
            if (object.mesh.visible && !activeIds.includes(object.id))
            {
                object.activeFrames = 0;
                object.inactiveFrames++;
                if (object.inactiveFrames > 100)
                {
                    object.mesh.visible = false;
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
            if (object.mesh.visible)
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

        positionPlanes(objectPool, 0.01);

    };


}
