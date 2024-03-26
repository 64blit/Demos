import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// import { useEyePop } from 'eyepop-react-wrapper';
import { useEyePop } from '../../EyePopWrapper';

import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import TextContainer from './TextContainer';


const rulesStateArray = [];


const EyePopDrawing: React.FC = () =>
{

    // Our external state stores, use for simplifying state management accross components
    const { eyePop, getOutline, webcamVideo } = useEyePop();

    const groupRef = useRef<THREE.Group>(null);

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

    const manageDynamicMeshes = (person, prediction) =>
    {
        // for normalizing the bounds of the person
        const sourceWidth = prediction.source_width;
        const sourceHeight = prediction.source_height;

        const groupChildren = groupRef.current.children;

        const { x, y, width, height } = normalizePosition(person.x, person.y, person.width, person.height, sourceWidth, sourceHeight);

        const { x: xMax, y: yMax } = normalizePosition((person.x + person.width), person.y + person.height, person.width, person.height, sourceWidth, sourceHeight);


        // const parentPosition = new THREE.Vector3();
        // groupRef.current?.getWorldPosition(parentPosition);

        // personBoundsRef.current?.position.set(
        //     x - parentPosition.x,
        //     yMax - parentPosition.y,
        //     z - parentPosition.z
        // );

    }

    // The primary update loop which will run per frame
    useFrame(() =>
    {
        if (!groupRef.current) return;
        if (!eyePop?.ready) return;

        // The computer vision prediction result from the EyePop SDK
        const outline = getOutline();

        if (!outline) return;

        console.log('Outline', outline);
    });


    return (
        <>
            <group ref={groupRef}>


            </group>

            <TextContainer text="Hello World" />
        </>
    );
};

export default EyePopDrawing;
