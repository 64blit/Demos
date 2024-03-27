

import React, { useState, useEffect } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { extend, Object3DNode } from "@react-three/fiber";

import { Box3, Vector3, MeshBasicMaterial } from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import font3d from '../../assets/dosis.json';
import { useSceneStore } from '../../store/SceneStore';
import * as THREE from 'three';
import test from 'node:test';

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

const TextContainer: React.FC<TextContainerProps> = ({ text, fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', size = .1, color = '#0d31ff' }) =>
{
    const { camera } = useThree();
    const font = useLoader(FontLoader, fontUrl);
    const [ lines, setLines ] = useState<[]>([]);
    const { aspectRatio } = useSceneStore();

    const bufferGeometry = new THREE.BufferGeometry();

    useEffect(() =>
    {
        let fontSize = size; // Start with the initial font size
        let lines = [];
        let totalHeight = 0;

        const words = text.split(' '); // Define the words variable
        let scale = 1;

        // Function to calculate lines and total height for a given font size
        const calculateLines = () =>
        {
            lines = [];
            totalHeight = 0;
            let yPosition = 0;
            let textLine = "";
            words.forEach((word, index) =>
            {
                let testLine = textLine + word + ' ';
                const textGeometry = new TextGeometry(testLine, { font: font as Font, size: fontSize * scale, height: 0, curveSegments: 1 });

                textGeometry.computeBoundingBox();
                const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

                // if (index === 0)
                // {
                //     yPosition = textHeight;
                // }

                // If the text width is greater than the aspect ratio or it's the last word
                if (textWidth > aspectRatio || index === words.length - 1)
                {

                    // If the current line is the last line, add it to the lines array
                    if (index === words.length - 1)
                    {
                        textLine += words[ index ];
                    }

                    // Add the current line to the lines array
                    lines.push({ text: textLine, yPosition, scale, xOffset: 0 });
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
        const desiredHeight = 1; // Adjust this value as needed


        while (totalHeight > desiredHeight && fontSize > 0.01)
        {
            lines = [];
            scale *= 0.95;
            calculateLines();
        }

        setLines(lines);

    }, [ text, font, size, color, camera ]);

    function getTextSize(textMesh: THREE.Mesh): Vector3
    {
        // loop over vertices to find the width and height of the text geometry
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        const vertices = [];

        const positionAttribute = textMesh.geometry.getAttribute('position');
        for (let i = 0; i < positionAttribute.count; i++)
        {
            const vertex = new THREE.Vector3();
            vertex.x = positionAttribute.getX(i);
            vertex.y = positionAttribute.getY(i);
            vertex.z = positionAttribute.getZ(i);
            vertices.push(vertex);
        }

        vertices.forEach((vertex) =>
        {
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
        });

        return new Vector3(maxX - minX, maxY - minY, 0);
    }

    function getCameraWidth(camera: THREE.PerspectiveCamera): number
    {
        const vFOV = camera.fov * Math.PI / 180;
        const height = 2 * Math.tan(vFOV / 2) * camera.position.z;
        const width = height * camera.aspect;
        return width;
    }

    return (
        <>
            <group position={[ -aspectRatio / 2, .5 - size, 0 ]} >
                {
                    lines.map((line, index) => (
                        <mesh key={index} position={[ line.xOffset, line.yPosition, 0 ]} >

                            <textGeometry args={[ line.text, { font: font as Font, size: size * line.scale, height: 0.01, curveSegments: 4 } ]} />

                            <meshNormalMaterial attach="material" color={color} metalness={0} roughness={1} />

                        </mesh>
                    ))}
            </group >
            {/* <mesh>
                <boxGeometry args={[ aspectRatio, 1, 0.01 ]} />
                < meshBasicMaterial attach="material" color="red" wireframe />
            </mesh> */}
        </>
    );
}

export default TextContainer;
