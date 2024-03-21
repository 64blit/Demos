// example prediction
// {
//     "objects": [
//         {
//             "category": "person",
//             "classId": 0,
//             "classLabel": "person",
//             "confidence": 0.972,
//             "height": 594.181,
//             "id": 8626,
//             "keyPoints": [
//                 {
//                     "category": "2d-body-points",
//                     "confidence": 0.837,
//                     "id": 8635,
//                     "points": [
//                         {
//                             "classId": 0,
//                             "classLabel": "nose",
//                             "confidence": 0.837,
//                             "id": 8628,
//                             "x": 587.096,
//                             "y": 323.2
//                         },
//                         {
//                             "classId": 1,
//                             "classLabel": "left eye",
//                             "confidence": 0.722,
//                             "id": 8629,
//                             "x": 634.947,
//                             "y": 270.717
//                         },
//                         {
//                             "classId": 2,
//                             "classLabel": "right eye",
//                             "confidence": 0.743,
//                             "id": 8630,
//                             "x": 518.923,
//                             "y": 275.453
//                         },
//                         {
//                             "classId": 3,
//                             "classLabel": "left ear",
//                             "confidence": 0.802,
//                             "id": 8631,
//                             "x": 688.319,
//                             "y": 342.071
//                         },
//                         {
//                             "classId": 4,
//                             "classLabel": "right ear",
//                             "confidence": 0.84,
//                             "id": 8632,
//                             "x": 450.949,
//                             "y": 355.013
//                         },
//                         {
//                             "classId": 5,
//                             "classLabel": "left shoulder",
//                             "confidence": 0.857,
//                             "id": 8633,
//                             "x": 820.641,
//                             "y": 625.425
//                         },
//                         {
//                             "classId": 6,
//                             "classLabel": "right shoulder",
//                             "confidence": 0.56,
//                             "id": 8634,
//                             "x": 286.821,
//                             "y": 608.866
//                         }
//                     ],
//                     "type": "body-coco-17"
//                 }
//             ],
//             "orientation": 0,
//             "traceId": 2,
//             "width": 716.948,
//             "x": 186.432,
//             "y": 119.741
//         }
//     ],
//         "seconds": 78.054752834,
//             "source_height": 720,
//                 "source_id": "3f62411a-e746-11ee-877b-0242ac110006",
//                     "source_width": 1280,
//                         "system_timestamp": 1711000009570350000,
//                             "timestamp": 78054752834
// }


import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useFrame } from '@react-three/fiber';
import useEyePop from '../../store/EyePopStore';
import { WorkoutIndicator } from '../../assets/WorkoutIndicator';
import { PersonBoundsIndicator } from '../../assets/PersonBoundsIndicator';

import * as THREE from 'three';

const EyePopDrawing: React.FC = () =>
{
    const { eyePopManager } = useEyePop();

    const groupRef = useRef<THREE.Group>(null);

    // const normalizePosition = (x: number, y: number, width: number, height: number, sourceWidth: number, sourceHeight: number) =>
    // {

    //     const aspectRatio = sourceWidth / sourceHeight;

    //     return {
    //         x: (((x / sourceWidth) * aspectRatio) - aspectRatio / 2) / 2 * aspectRatio,
    //         y: -(((y / (sourceHeight)) * 2) - 1) / 2,
    //         width: (width / sourceWidth) * aspectRatio,
    //         height: (height / sourceHeight)
    //     }
    // }

    const normalizePosition = (x: number, y: number, width: number, height: number, sourceWidth: number, sourceHeight: number) =>
    {
        const aspectRatio = sourceWidth / sourceHeight;

        return {
            x: ((x / sourceWidth) - 0.5) * aspectRatio,
            y: ((y / sourceHeight) - 0.5) * -1,
            width: (width / sourceWidth) * aspectRatio,
            height: height / sourceHeight
        }
    }

    const personBoundsRef = useRef<THREE.Group>(null);

    useFrame(() =>
    {
        if (!groupRef.current) return;
        if (!eyePopManager?.ready) return;

        const prediction = eyePopManager?.getPrediction();

        if (!prediction) return;
        if (!groupRef.current) return;

        if (!prediction.objects) return;
        if (prediction.objects.length === 0) return;

        // finds the biggest person, ensure it's classLabel is 'person'
        const people = prediction.objects.filter((o: any) => o.classLabel === 'person');
        if (people.length === 0) return;

        const person = people.reduce((a: any, b: any) => a.width > b.width ? a : b);

        // for normalizing the bounds of the person
        const sourceWidth = prediction.source_width;
        const sourceHeight = prediction.source_height;

        const groupChildren = groupRef.current.children;

        // if there is a child of the group with the name of the person.traceId, update it
        const aspectRation = sourceWidth / sourceHeight;

        let { x, y, width, height } = normalizePosition(person.x, person.y, person.width, person.height, sourceWidth, sourceHeight);

        let { x: xMax, y: yMax } = normalizePosition((person.x + person.width), person.y + person.height, person.width, person.height, sourceWidth, sourceHeight);

        xMax = x + .01
        const z = .001;
        const verticesOfBox = [
            x, y, z,
            xMax, y, z,
            x, yMax, z,
            xMax, yMax, z,
        ];

        for (const child of groupChildren)
        {
            if (child.type === 'Mesh')
            {
                child.visible = false;
            }

            if (child.name === person.traceId)
            {
                child.visible = true;
                personBoundsRef.current?.position.set(x, yMax, z);

                child.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesOfBox, 3));
                child.geometry.attributes.position.needsUpdate = true;
                return;
            }
        }


        // Create a box geometry and material
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesOfBox, 3));

        // Create a mesh and position it next to the person
        const box = new THREE.Mesh(geometry, material);
        box.name = person.traceId;

        // personBoundsRef.current.name = person.traceId;
        // Add the box to the group
        groupRef.current.add(personBoundsRef.current);
        groupRef.current.add(box);


    });

    return (
        <group ref={groupRef}>
            <group ref={personBoundsRef}  >
                <PersonBoundsIndicator scale={[ .01, .01, .01 ]} />
            </group>

            <WorkoutIndicator />
        </group>
    );
};

export default EyePopDrawing;
