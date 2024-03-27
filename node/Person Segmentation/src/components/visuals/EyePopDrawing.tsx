import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import TextContainer from './TextContainer';
import PersonSegmentation from './PersonSegmentation';
import { DragControls } from '@react-three/drei';

const EyePopDrawing: React.FC = () =>
{
    const [ text, setText ] = useState<string>('');

    // here we use the javascript voice to text API to get the text from the user
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

        recognition.onend = () =>
        {
            console.log('Speech recognition ended');
            setText('');

            recognition.start();
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

                    setText(interimTranscript);
                }
            }
        };

        recognition.start();

        return () =>
        {
            recognition.stop();
        }
    }, []);

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
            <DragControls>
                <PersonSegmentation />
            </DragControls>


            <DragControls>
                <TextContainer text={text} size={.33} />
            </DragControls>
        </>
    );
};

export default EyePopDrawing;
