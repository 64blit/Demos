

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
    textInput?: string;
    fontUrl?: string;
    size?: number;
    color?: string;
}

interface Line
{
    textInput?: string;
    yPosition: number;
}

const TextContainer: React.FC<TextContainerProps> = ({ textInput = '', fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', size = .1, color = '#16efff', padding = .2 }) =>
{
    const { camera } = useThree();
    const font = useLoader(FontLoader, fontUrl);
    const [ lines, setLines ] = useState<[]>([]);
    const { aspectRatio } = useSceneStore();

    const lineRefs = lines.map(() => createRef<THREE.Mesh>());

    // handles speech recognition
    useEffect(() =>
    {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        console.log('Speech Recognition started', recognition);

        recognition.onaudiostart = () =>
        {
            console.log('Audio started');
        }

        recognition.onaudioend = () =>
        {
            console.log('Speech Audio ended');
        }

        let startTimeout: any = null;

        recognition.onend = () =>
        {
            console.log('Speech recognition ended');
            updateText('');
            clearTimeout(startTimeout);

            startTimeout = setTimeout(() =>
            {
                recognition.start();
            }, 1000);
        };

        recognition.onerror = (event) =>
        {
            console.error('Speech recognition error', event);
        };
        const maxWords = -5;
        recognition.onresult = (event) =>
        {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++)
            {
                let transcript = event.results[ i ][ 0 ].transcript;

                // keep only the last 80 characters of the transcript but make sure we don't cut off a word
                transcript = transcript.split(' ').slice(maxWords).join(' ');

                if (event.results[ i ].isFinal)
                {
                    // setText(transcript);
                }
                else
                {
                    interimTranscript += transcript;
                    interimTranscript = interimTranscript.split(' ').slice(maxWords).join(' ');

                    updateText(interimTranscript);
                }
            }
        };

        recognition.start();

        // setInterval(() =>
        // {
        //     const randomWords = [ 'Hello', 'World', 'This', 'is', 'a', 'test', 'of', 'the', 'speech', 'recognition', 'system', ' ' ];
        //     const randomSentence = Array(5).fill(0).map(() => randomWords[ Math.floor(Math.random() * randomWords.length) ]).join(' ');
        //     updateText(randomSentence);
        // }, 2000);

        return () =>
        {
            recognition.stop();
        }
    }, []);

    // handles text wrapping
    const updateText = (text) =>
    {
        let fontSize = size; // Start with the initial font size
        let lines = [];
        let totalHeight = 0;
        const words = text.split(' '); // Define the words variable

        // Here we add some empty strings to the end of the words array to ensure that the last word is processed
        //  This is a hack and there is probably a better way to do this
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

                    if (textLine.length <= 0 || textLine === '' || textLine === ' ') return;

                    // console.log('textLine', textLine);

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
        const desiredHeight = 1 - (padding * 2); // Adjust this value as needed

        while (totalHeight > desiredHeight && fontSize > 0.01)
        {
            lines = [];
            scale *= 0.95;
            calculateLines();
        }

        setLines(lines);

    }

    // handles text animations
    useEffect(() =>
    {

        animateUp(lines);

    }, [ lines, lineRefs ])

    const animateUp = (line: any) =>
    {

        if (lines.length <= 0) return;
        if (lineRefs.length <= 0) return;
        //use gsap to animate in the lines in a nice staggered way
        for (let i = 0; i < lines.length; i++)
        {
            const line = lineRefs[ i ].current;
            line.position.y = -10;
            gsap.to(line.position, { y: lines[ i ].yPosition, delay: i * 0.1, duration: .5 });
        }

    }

    const animateRight = (line: any) =>
    {
        if (lines.length <= 0) return;
        if (lineRefs.length <= 0) return;
        //use gsap to animate in the lines in a nice staggered way
        for (let i = 0; i < lines.length; i++)
        {
            const line = lineRefs[ i ].current;
            const startX = line?.position.x;
            line.position.x = -10;
            gsap.to(line.position, { x: startX, delay: i * 0.1, duration: .5 });
        }
    }

    const animateScale = (line: any) =>
    {
        if (lines.length <= 0) return;
        if (lineRefs.length <= 0) return;
        //use gsap to animate in the lines in a nice staggered way
        for (let i = 0; i < lines.length; i++)
        {
            const line = lineRefs[ i ].current;
            const startScale = line?.scale.x;
            line.scale.x = 0;
            gsap.to(line.scale, { x: startScale, delay: i * 0.1, duration: .5 });
        }
    }


    return (
        <>
            <group position={[ -aspectRatio / 2, .5 - size, 0 ]} >
                {
                    lines.map((line, index) => (
                        <mesh ref={lineRefs[ index ]} key={index} position={[ line.xOffset, line.yPosition - padding, 0 ]} >

                            <textGeometry args={[ line.text, { font: font as Font, size: size * line.scale, height: 0.001, curveSegments: 6 } ]} />

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
