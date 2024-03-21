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
    const personBoundsRef = useRef<THREE.Group>(null);


    const normalizePosition = (x: number, y: number, width: number, height: number, sourceWidth: number, sourceHeight: number) =>
    {
        // since we are using a plane which is resized to the aspect ratio of the video,
        //  we need to normalize the position of the person to that aspect ratio, instead of something more common,
        //  like -1, to 1
        const aspectRatio = sourceWidth / sourceHeight;

        return {
            x: ((x / sourceWidth) - 0.5) * aspectRatio,
            y: ((y / sourceHeight) - 0.5) * -1,
            width: (width / sourceWidth) * aspectRatio,
            height: height / sourceHeight
        }
    }


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

        if (!person.traceId) return;

        // for normalizing the bounds of the person
        const sourceWidth = prediction.source_width;
        const sourceHeight = prediction.source_height;

        const groupChildren = groupRef.current.children;

        let { x, y, width, height } = normalizePosition(person.x, person.y, person.width, person.height, sourceWidth, sourceHeight);

        let { x: xMax, y: yMax } = normalizePosition((person.x + person.width), person.y + person.height, person.width, person.height, sourceWidth, sourceHeight);

        xMax = x + .01
        const z = .01;
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

            if (child.name.includes('trace' + person.traceId))
            {
                child.visible = true;

                let parentPosition = new THREE.Vector3();
                groupRef.current?.getWorldPosition(parentPosition);

                personBoundsRef.current?.position.set(
                    x - parentPosition.x,
                    yMax - parentPosition.y,
                    z - parentPosition.z
                );

                personBoundsRef.current?.scale.set(width, height * 2, 1);
                // if (child.type === 'Mesh' && child.geometry)
                // {
                //     child.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesOfBox, 3));
                //     child.geometry.attributes.position.needsUpdate = true;
                // }

            }
        }

        let areMeshesAdded = false;

        for (const child of groupChildren)
        {
            if (child.name.includes('trace' + person.traceId))
            {
                areMeshesAdded = true;
            }
        }

        if (!areMeshesAdded)
        {
            // // Create a box geometry and material
            // const geometry = new THREE.PlaneGeometry(1, 1);
            // const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
            // geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesOfBox, 3));

            // // Create a mesh and position it next to the person
            // const box = new THREE.Mesh(geometry, material);
            // box.name = 'trace' + person.traceId + '_box';
            // groupRef.current.add(box);

            personBoundsRef.current.name = 'trace' + person.traceId + '_bounds';

            // Add the box to the group
            groupRef.current.add(personBoundsRef.current);
        }


    });


    return (
        <group ref={groupRef}>

            <group ref={personBoundsRef} position={[ -100, -100, -100 ]} >
                <PersonBoundsIndicator scale={[ .01, .01, .01 ]} />
            </group>

            <WorkoutIndicator repsCount={0} repsPerSet={10} setCount={3} />

        </group>
    );
};

export default EyePopDrawing;
