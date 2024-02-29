import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


let objectPool = [];
let webcamTexture = undefined;
let aspect = 16 / 9;

let scene = null;
let material = null;
let bgModel = null;
let bgModelPlanes = [];

const MAX_PEOPLE = 15;

const createPlane = () =>
{
    let plane = bgModelPlanes.pop();

    plane.visible = false;
    scene.add(plane);

    return plane;
}

const getFrame = () =>
{
    // get an inactive plane from the pool
    for (const object of objectPool)
    {
        if (object.mesh.visible === false)
        {
            return object;
        }
    }

    // if there are no inactive planes, create a new one
    const newPlane = { id: null, mesh: createPlane(scene, material), inactiveFrames: 0, activeFrames: 0 };

    objectPool.push(newPlane);

    return newPlane;
}

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
        webcamTexture.flipY = false;
        aspect = renderManager.videoTexture.image.videoWidth / renderManager.videoTexture.image.videoHeight;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.background = new THREE.Color(0x000000);

        // build a pool of plane meshes to be used to display all the people in the webcam feed
        objectPool = [];

        material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });

        const gltfLoader = new GLTFLoader();
        gltfLoader.load('./assets/conference_call.glb', (gltf) =>
        {
            bgModel = gltf.scene;
            // bgModel.rotateY(Math.PI);
            bgModel.scale.set(1, 1, -1);
            bgModel.traverse((child) =>
            {
                if (child.isMesh && child.name.includes('p'))
                {
                    bgModelPlanes.push(child);
                    child.material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });
                    child.visible = false;
                    child.scale.set(1, 1, -1);
                }
            });

            // sort the bgModelPlanes by name
            bgModelPlanes.sort((a, b) =>
            {
                return a.name.localeCompare(b.name);
            });


            // create bounds around all the planes
            const bounds = new THREE.Box3();
            for (const plane of bgModelPlanes)
            {
                bounds.expandByObject(plane);
            }

            controls.fitToBox(bounds, true);

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

        person.smoothedBounds.min.x = lerp(person.smoothedBounds.min.x, person.bounds.min.x, 0.05);
        person.smoothedBounds.min.y = lerp(person.smoothedBounds.min.y, person.bounds.min.y, 0.05);
        person.smoothedBounds.max.x = lerp(person.smoothedBounds.max.x, person.bounds.max.x, 0.05);
        person.smoothedBounds.max.y = lerp(person.smoothedBounds.max.y, person.bounds.max.y, 0.05);


        // update the uv coordinates of the plane to only show the part of the webcam feed that the person is in
        const bounds = person.smoothedBounds;

        // convert bounds coordinates to uv coordinates
        const uvMin = new THREE.Vector2(1 - (bounds.min.x + 1) / 2, (bounds.min.y + 1) / 2);
        const uvMax = new THREE.Vector2(1 - (bounds.max.x + 1) / 2, (bounds.max.y + 1) / 2);

        // Adjust the UV coordinates to match the aspect ratio of the image
        let uvWidth = uvMax.x - uvMin.x;
        let uvHeight = uvMax.y - uvMin.y;

        if (uvWidth / uvHeight > aspect)
        {
            // The UV width is too large, adjust the height
            let newHeight = uvWidth / aspect;
            let heightIncrease = (newHeight - uvHeight) / 2;
            uvMin.y -= heightIncrease;
            uvMax.y += heightIncrease;
        } else
        {
            // The UV height is too large, adjust the width
            let newWidth = uvHeight * aspect;
            let widthIncrease = (newWidth - uvWidth) / 2;
            uvMin.x -= widthIncrease;
            uvMax.x += widthIncrease;
        }


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
        const activePeople = thirdEyePop.getActivePeople();
        activePeople.sort((a, b) => a.traceId - b.traceId);

        const bounds = new THREE.Box3();

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

            person.frame.mesh = bgModelPlanes[ activeIds.length ];

            person.frame.activeFrames++;
            person.frame.inactiveFrames = 0;

            activeIds.push(person.traceId);

            if (person.frame.activeFrames > 50)
            {
                person.frame.mesh.visible = true;
            }

            bounds.expandByObject(person.frame.mesh);

            // update the plane mesh to scale of the person
            updatePersonPlane(person);
        }

        if (activeIds.length > 0)
        {
            controls.fitToBox(bounds, true);
        }

        console.log(activeIds, objectPool);

        // hide any planes that are no longer active
        for (const object of objectPool)
        {
            if (object.mesh.visible && !activeIds.includes(object.id))
            {
                object.activeFrames = 0;
                object.inactiveFrames++;

                if (object.inactiveFrames > 50)
                {
                    object.mesh.visible = false;
                    object.inactiveFrames = 0;
                    object.activeFrames = 0;
                }

            }
        }

    }

    // runs every frame
    thirdEyePop.onUpdate = function ()
    {
        showActivePeople();

    };


}
