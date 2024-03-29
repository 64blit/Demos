

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
import { scaleMap } from './scaleMap.js'

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

/**
 * Renders a container for displaying text with speech recognition and text wrapping functionality.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.textInput=''] - The input text for the container.
 * @param {string} [props.fontUrl='https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json'] - The URL of the font file to be used.
 * @param {number} [props.size=0.1] - The font size.
 * @param {string} [props.color='#16efff'] - The color of the text.
 * @param {number} [props.padding=0.2] - The padding around the text.
 * @returns {JSX.Element} The rendered TextContainer component.
 */
const TextContainer: React.FC<TextContainerProps> = ({ textInput = '', fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', size = .1, color = '#16efff', padding = .1 }) =>
{
    const { camera } = useThree();
    const font = useLoader(FontLoader, fontUrl);
    const [ lines, setLines ] = useState<[]>([]);
    const { aspectRatio } = useSceneStore();
    const [ isAudioStarted, setIsAudioStarted ] = useState<boolean>(false);

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
            setIsAudioStarted(true);
        }

        recognition.onaudioend = () =>
        {
            console.log('Speech Audio ended');
        }

        let startTimeout: any = null;

        recognition.onend = () =>
        {
            console.log('Speech recognition ended');
            updateTextDynamic('');
            clearTimeout(startTimeout);

            startTimeout = setTimeout(() =>
            {
                recognition.start();
            }, 100);
        };

        recognition.onerror = (event) =>
        {
            console.error('Speech recognition error', event);
        };

        const maxWords = -10;

        recognition.onresult = (event) =>
        {
            // console.log('Speech recognition result', event);

            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++)
            {
                let transcript = event.results[ i ][ 0 ].transcript;

                // if (event.results[ i ].isFinal)
                // {
                //     updateTextDynamic(transcript);
                // }
                updateTextDynamic(transcript);

            }
        };

        recognition.start();

        return () =>
        {
            recognition.stop();
        }
    }, []);

    // handles text wrapping
    const updateTextDynamic = (text) =>
    {
        let fontSize = size; // Start with the initial font size
        let lines = [];
        let totalHeight = 0;
        const words = text.split(' ');

        // Here we add some empty strings to the end of the words array to ensure that the last word is processed
        //  This is a hack and there is probably a better way to do this
        words.push('_', '_', '_', '_', '_');
        let scale = 1;

        // Function to calculate lines and total height for a given font size
        const calculateLines = () =>
        {
            lines = [];
            totalHeight = 0;
            let yPosition = (padding);
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

        scale = scaleMap.get(text.length) || 1;

        // Calculate lines and total height for the initial font size
        calculateLines();

        // // Calculate the desired height based on the aspect ratio
        const desiredHeight = 1 - (padding * 2); // Adjust this value as needed

        while (totalHeight > desiredHeight && fontSize > 0.01)
        {
            lines = [];
            // console.log('scale', scale);
            scale *= .95;

            calculateLines();
        }

        setLines(lines);

    }


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


            <mesh position={[ (aspectRatio / 2) - .2, -.45, 0 ]} scale={[ 1, 1, .1 ]} >
                <sphereGeometry args={[ 0.01 ]} />
                <meshBasicMaterial visible={isAudioStarted} color="red" wireframe={false} />
            </mesh>
        </>
    );
}

export default TextContainer;
