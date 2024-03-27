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

    // Our external state stores, use for simplifying state management accross components
    const { eyePop, getOutline, } = useEyePop();

    const { setHeight, setWidth, setSegMask } = useSceneStore();
    const personSegmentationRef = useRef<THREE.Group>(null);

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

    // The primary update loop which will run per frame
    useFrame(() =>
    {
        if (!eyePop?.ready) return;

        // The computer vision prediction result from the EyePop SDK
        const outline = getOutline();
        if (!outline) return;

        console.log('Outline', outline);
        // { contours: prediction.contours[ 0 ], width: prediction.width, height: prediction.height };

        if (!outline.countours) return;
        if (!outline.countours.points) return;

        setWidth(outline.width);
        setHeight(outline.height);

        setSegMask(outline.countours.points);

        {
            "contours": {
                "points": [
                    {
                        "x": 785.585,
                        "y": 159.398
                    },
                    {
                        "x": 762.992,
                        "y": 163.796
                    },
                    {
                        "x": 751.695,
                        "y": 168.195
                    },
                    {
                        "x": 723.453,
                        "y": 185.789
                    },
                    {
                        "x": 700.859,
                        "y": 185.789
                    },
                    {
                        "x": 689.562,
                        "y": 190.187
                    },
                    {
                        "x": 678.265,
                        "y": 194.585
                    },
                    {
                        "x": 655.671,
                        "y": 207.781
                    },
                    {
                        "x": 638.726,
                        "y": 225.375
                    },
                    {
                        "x": 633.078,
                        "y": 234.171
                    },
                    {
                        "x": 627.429,
                        "y": 242.968
                    },
                    {
                        "x": 627.429,
                        "y": 264.96
                    },
                    {
                        "x": 633.078,
                        "y": 273.757
                    },
                    {
                        "x": 655.671,
                        "y": 291.351
                    },
                    {
                        "x": 666.968,
                        "y": 295.75
                    },
                    {
                        "x": 689.562,
                        "y": 300.148
                    },
                    {
                        "x": 700.859,
                        "y": 304.546
                    },
                    {
                        "x": 717.804,
                        "y": 317.742
                    },
                    {
                        "x": 717.804,
                        "y": 339.734
                    },
                    {
                        "x": 723.453,
                        "y": 361.726
                    },
                    {
                        "x": 734.75,
                        "y": 374.921
                    },
                    {
                        "x": 740.398,
                        "y": 392.515
                    },
                    {
                        "x": 746.046,
                        "y": 423.304
                    },
                    {
                        "x": 751.695,
                        "y": 427.703
                    },
                    {
                        "x": 751.695,
                        "y": 436.499
                    },
                    {
                        "x": 746.046,
                        "y": 445.296
                    },
                    {
                        "x": 729.101,
                        "y": 458.492
                    },
                    {
                        "x": 740.398,
                        "y": 476.085
                    },
                    {
                        "x": 729.101,
                        "y": 484.882
                    },
                    {
                        "x": 717.804,
                        "y": 489.281
                    },
                    {
                    {
                        "x": 977.632,
                        "y": 410.109
                    },
                    {
                        "x": 949.39,
                        "y": 414.507
                    },
                    {
                        "x": 921.148,
                        "y": 392.515
                    },
                    {
                        "x": 921.148,
                        "y": 383.718
                    },
                    {
                        "x": 904.203,
                        "y": 370.523
                    },
                    {
                        "x": 904.203,
                        "y": 352.929
                    },
                    {
                        "x": 909.851,
                        "y": 348.531
                    },
                    {
                        "x": 909.851,
                        "y": 326.539
                    },
                    {
                        "x": 921.148,
                        "y": 300.148
                    },
                    {
                        "x": 921.148,
                        "y": 269.359
                    },
                    {
                        "x": 915.5,
                        "y": 247.367
                    },
                    {
                        "x": 909.851,
                        "y": 229.773
                    },
                    {
                        "x": 904.203,
                        "y": 216.578
                    },
                    {
                        "x": 898.554,
                        "y": 203.382
                    },
                    {
                        "x": 892.906,
                        "y": 194.585
                    },
                    {
                        "x": 881.609,
                        "y": 185.789
                    },
                    {
                        "x": 870.312,
                        "y": 185.789
                    },
                    {
                        "x": 836.421,
                        "y": 159.398
                    },
                    {
                        "x": 785.585,
                        "y": 159.398
                    }
                ]
            },
            "width": 723.109,
                "height": 562.973
        }



    });


    return (
        <>
            <PersonSegmentation />

            <TextContainer text="This is placeholder text for the future of humanity" size={.15} />
        </>
    );
};

export default EyePopDrawing;
