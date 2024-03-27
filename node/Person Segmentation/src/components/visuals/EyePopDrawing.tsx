import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// import { useEyePop } from 'eyepop-react-wrapper';
import { useEyePop } from '../../EyePopWrapper';

import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import TextContainer from './TextContainer';
import PersonSegmentation from './PersonSegmentation';

const EyePopDrawing: React.FC = () =>
{

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

        const groupChildren = personSegmentationRef.current.children;

        const { x, y, width, height } = normalizePosition(person.x, person.y, person.width, person.height, sourceWidth, sourceHeight);

        const { x: xMax, y: yMax } = normalizePosition((person.x + person.width), person.y + person.height, person.width, person.height, sourceWidth, sourceHeight);


        // const parentPosition = new THREE.Vector3();
        // personSegmentationRef.current?.getWorldPosition(parentPosition);

        // personBoundsRef.current?.position.set(
        //     x - parentPosition.x,
        //     yMax - parentPosition.y,
        //     z - parentPosition.z
        // );

    }



    return (
        <>
            <PersonSegmentation />

            <TextContainer text="This is placeholder text for the future of humanity" size={.15} />
        </>
    );
};

export default EyePopDrawing;
