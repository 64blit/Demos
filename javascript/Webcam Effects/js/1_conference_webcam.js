import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';


let objectPool = [];
let webcamTexture = undefined;
let aspect = 16 / 9;

let scene = null;
let material = null;

const mediaMaterial = new THREE.ShaderMaterial({
    uniforms: {
        tex: {
            value: null
        },
        aspect: {
            value: 1.0
        }
    },
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tex;
      uniform float aspect;
      
      void main() {
      	vec2 uv = vUv;
        // uv.y *= ratio;
        // uv.y -= (0.5 - (1. / ratio) * 0.5) * ratio;
   		
        if (aspect > 1.0) {
            uv.x = uv.x / aspect + (1.0 - 1.0 / aspect) / 2.0;
        } else {
            uv.y = uv.y * aspect + (1.0 - aspect) / 2.0;
        }

        vec3 col = texture2D(tex, uv).rgb;
        
        col = mix(col, vec3(0), step(0.5, abs(uv.y - 0.5)));
        
        gl_FragColor = vec4(col, 1.);
      }
    `
})

const createPlane = (scene, material, width = 0.0, height = 0.0) =>
{
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
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

    const newPlane = { id: null, active: false, mesh: createPlane(scene, material.clone()), target: new THREE.Vector3(), activeFrames: 0, inactiveFrames: 0 };

    objectPool.push(newPlane);

    return newPlane;
}

const minTime = 0.01;
const maxTime = 0.15;

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

        // material = new THREE.MeshBasicMaterial({ map: webcamTexture, side: THREE.DoubleSide });

        material = mediaMaterial;
        material.uniforms.tex.value = webcamTexture;
        material.uniforms.aspect.value = aspect;


        const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const bgPlane = createPlane(scene, darkMaterial, 10, 10);
        bgPlane.position.z = -1;
        bgPlane.visible = true;
    }

    await buildScene(scene, renderer);

    const updatePersonPlane = (person, cellWidth, cellHeight) =>
    {
        const plane = person.frame.mesh;


        // smoothly interpolate the smoothedBounds to the actual bounds of the person, these are both THREE.Box3 objects
        if (!person.smoothedBounds)
        {
            person.smoothedBounds = person.bounds.clone();
        }

        person.smoothedBounds.min.x = lerp(person.smoothedBounds.min.x, person.bounds.min.x + .05, calculateTime(person.smoothedBounds.min.x, person.bounds.min.x));
        person.smoothedBounds.min.y = lerp(person.smoothedBounds.min.y, person.bounds.min.y + .05, calculateTime(person.smoothedBounds.min.y, person.bounds.min.y));
        person.smoothedBounds.max.x = lerp(person.smoothedBounds.max.x, person.bounds.max.x - .05, calculateTime(person.smoothedBounds.max.x, person.bounds.max.x));
        person.smoothedBounds.max.y = lerp(person.smoothedBounds.max.y, person.bounds.max.y - .05, calculateTime(person.smoothedBounds.max.y, person.bounds.max.y));

        // update the uv coordinates of the plane to only show the part of the webcam feed that the person is in
        const bounds = person.smoothedBounds;

        let width = Math.abs(bounds.max.x - bounds.min.x);
        let height = Math.abs(bounds.max.y - bounds.min.y);
        person.frame.mesh.material.uniforms.aspect.value = (width / height) * cellHeight / cellWidth;
        person.frame.mesh.material.uniforms.aspect.needsUpdate = true;

        let scaleFactor = Math.max(cellWidth / width, cellHeight / height);
        width *= scaleFactor;
        height *= scaleFactor;

        width = Math.min(width, cellWidth);
        height = Math.min(height, cellHeight);

        // create a new plane geometry with the calculated width and height
        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(width, height);

        // convert bounds coordinates to uv coordinates
        const uvMin = new THREE.Vector2((1 - (bounds.min.x + 1) / 2), ((bounds.min.y + 1) / 2));
        const uvMax = new THREE.Vector2((1 - (bounds.max.x + 1) / 2), ((bounds.max.y + 1) / 2));

        // update the uv coordinates with the new centered coordinates
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

        let activeFrameObjects = [];
        const activePeople = thirdEyePop.getActivePeople();
        activePeople.sort((a, b) => a.traceId - b.traceId);


        for (let i = 0; i < activePeople.length; i++)
        {
            const person = activePeople[ i ];

            // get a plane from the pool if the person doesn't have one
            if (!person.frame)
            {
                person.frame = getFrame(scene);
            }

            person.frame.id = person.traceId;
            person.frame.activeFrames++;
            person.frame.inactiveFrames = 0;

            if (person.frame.activeFrames > 100)
            {
                person.frame.active = true;
                person.frame.mesh.visible = true;
            }

            person.frame.activeFrames = Math.min(person.frame.activeFrames, 1000);

            activeFrameObjects.push(person.frame);
            // // update the plane mesh to scale of the person
        }


        // hide any planes that are no longer active
        for (const object of objectPool)
        {

            if (object.active && !activeFrameObjects.includes(object))
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

        return { activeFrameObjects, activePeople };
    }


    // Position the planes in a dynamic grid layout
    function positionFrames(activePeople, padding)
    {

        // Calculate the number of rows and columns for the grid
        var gridRows = Math.floor(Math.sqrt(activePeople.length));
        var gridColumns = Math.ceil(activePeople.length / gridRows);

        // Calculate the width and height of each cell
        var cellWidth = (2 - padding * (gridColumns - 1)) / gridColumns;
        var cellHeight = (2 - padding * (gridRows - 1)) / gridRows;

        // Position each plane in its cell
        for (var i = activePeople.length - 1; i >= 0; i--)
        {
            var plane = activePeople[ i ].frame.mesh;

            // Calculate the cell's x and y position
            const cellX = (i % gridColumns) * (cellWidth + padding) - 1 + cellWidth / 2;
            const cellY = Math.floor(i / gridColumns) * (cellHeight + padding) - 1 + cellHeight / 2;

            activePeople[ i ].frame.target.set(cellX, -cellY, -2);

            plane.position.lerp(activePeople[ i ].frame.target, .1);

            updatePersonPlane(activePeople[ i ], cellWidth, cellHeight)
        }
    }

    // runs every frame
    thirdEyePop.onUpdate = function ()
    {
        const { activeFrameObjects, activePeople } = showActivePeople();

        positionFrames(activePeople, 0.05);

    };

}
