

import React, { useState, useEffect, createRef } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { extend, Object3DNode } from "@react-three/fiber";

import { Box3, Vector3, MeshBasicMaterial } from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import font3d from '../../assets/Dosis-Medium.ttf';
import { useSceneStore } from '../../store/SceneStore';
import * as THREE from 'three';
import test from 'node:test';
import gsap from 'gsap';

extend({ TextGeometry });
declare module "@react-three/fiber" {
    interface ThreeElements
    {
        textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
    }
}

interface TextContainerProps
{
    text: string;
    fontUrl?: string;
    size?: number;
    color?: string;
}

interface Line
{
    text: string;
    yPosition: number;
}

const TextContainer: React.FC<TextContainerProps> = ({ text, fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', size = .1, color = '#16efff', padding = .1 }) =>
{
    const { camera } = useThree();
    const font = useLoader(FontLoader, fontUrl);
    const [ lines, setLines ] = useState<[]>([]);
    const { aspectRatio } = useSceneStore();

    const lineRefs = lines.map(() => createRef<THREE.Mesh>());

    useEffect(() =>
    {
        let fontSize = size; // Start with the initial font size
        let lines = [];
        let totalHeight = 0;
        const words = text.split(' '); // Define the words variable
        words.push('_'); // Add an empty string to the end of the words array
        words.push('_'); // Add an empty string to the end of the words array
        words.push('_'); // Add an empty string to the end of the words array
        words.push('_'); // Add an empty string to the end of the words array
        words.push('_'); // Add an empty string to the end of the words array
        let scale = 1;

        // Function to calculate lines and total height for a given font size
        const calculateLines = () =>
        {
            lines = [];
            totalHeight = 0;
            let yPosition = -(padding / 2);
            let textLine = "";

            words.forEach((word, index) =>
            {
                let testLine = textLine + word + ' ';

                const textGeometry = new TextGeometry(testLine, { font: font as Font, size: fontSize * scale, height: 0, curveSegments: 1 });

                textGeometry.computeBoundingBox();
                const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x * 2;
                const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

                // If the text width is greater than the aspect ratio or it's the last word
                if (textWidth * 1.5 > (aspectRatio - (padding)))
                {
                    // remove all underscores
                    textLine = textLine.replace(/_/g, '');

                    // remove any leading or trailing spaces
                    textLine = textLine.trim();

                    // make the string uppercase
                    textLine = textLine.toUpperCase();

                    // Add the current line to the lines array
                    lines.push({ text: textLine, yPosition, scale, xOffset: padding });
                    // Start a new line with the word that caused the overflow
                    textLine = word + ' '
                    // Move the y-position down
                    yPosition -= textHeight;
                    // Add the height of the line to the total height
                    totalHeight += textHeight;

                } else
                {
                    textLine = testLine;
                }

            });

        };

        // Calculate lines and total height for the initial font size
        calculateLines();

        // // Calculate the desired height based on the aspect ratio
        const desiredHeight = 1 - (padding / 2); // Adjust this value as needed


        while (totalHeight > desiredHeight && fontSize > 0.01)
        {
            lines = [];
            scale *= 0.95;
            calculateLines();
        }

        // console.log('Lines', lines);
        setLines(lines);

    }, [ text, font, size, color, camera ]);

    useEffect(() =>
    {

        if (lines.length <= 0) return;
        if (lineRefs.length <= 0) return;

        //use gsap to animate in the lines in a nice staggered way
        for (let i = 0; i < lines.length; i++)
        {
            const line = lineRefs[ i ].current;
            line.position.y = -10;
            // line.scale.x = .1
            // line.scale.y = .1
            gsap.to(line.position, { y: lines[ i ].yPosition, delay: i * 0.1, duration: .5 });
            // gsap.to(line.scale, { x: 1, y: 1, delay: i * 0.1, duration: 1 })
        }


    }, [ lines, lineRefs ])


    return (
        <>
            <group position={[ -aspectRatio / 2, .5 - size, 0 ]} >
                {
                    lines.map((line, index) => (
                        <mesh ref={lineRefs[ index ]} key={index} position={[ line.xOffset, line.yPosition - padding, 0 ]} >

                            <textGeometry args={[ line.text, { font: font as Font, size: size * line.scale, height: 0.025, curveSegments: 6 } ]} />

                            <meshPhysicalMaterial attach="material" color={color} metalness={0} roughness={1} />

                        </mesh>
                    ))}
            </group >


            <mesh position={[ 0, 0, 0 ]} >
                <boxGeometry args={[ aspectRatio, 1, 0.1 ]} />
                <meshBasicMaterial visible={false} color="red" wireframe={true} />
            </mesh>
        </>
    );
}

export default TextContainer;
