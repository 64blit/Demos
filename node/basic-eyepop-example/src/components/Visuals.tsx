import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box, CameraControls, DragControls, Environment, Text } from '@react-three/drei'
import * as THREE from 'three';
import { Container, Fullscreen, Root } from '@react-three/uikit';

import WebcamMesh from './video/WebcamMesh';
import useEyePop from '../store/EyePopStore';
import useSceneStore from '../store/SceneStore';

const Visuals: React.FC = () =>
{
    const { getEyePop, prediction, update, videoElement, initialize, startWebcamStream } = useEyePop();

    const { setCameraControls, cameraControls, setVideoTexture, videoTexture, groupRef, setGroupRef } = useSceneStore();

    useEffect(() =>
    {
        if (!initialize) return;
        if (!startWebcamStream) return;
        if (!cameraControls) return;
        if (!setCameraControls) return;
        if (!groupRef) return;
        if (!setGroupRef) return;


        async function setupEyePop()
        {
            await initialize({ popId: 'e4fd9369a9de42f6becfb90e11f4620c', 'secretKey': 'AAEx0k5X9gzahbFdKDNq33wLZ0FBQUFBQmwtS2NTMmZiVEJISU9yelBXVnVPUnQ4cC1wOVBHSDBWa3lrZW5QSnRIdVcxQXFBMmJobEFCSUV6dnNheG01aWVJdHc1SEZKN2VkaGhTMXViS3ZtaTRESy1GeW1fVnYxZFl5LWVtTTZ2RzJBN01CWnM9' })

            await startWebcamStream();
        }

        setCameraControls(cameraControls);
        setGroupRef(groupRef);
        setupEyePop();

    }, [ initialize, startWebcamStream, cameraControls, setCameraControls, groupRef, setGroupRef ]);


    useEffect(() =>
    {

        if (!videoElement) return;
        if (!getEyePop) return;
        if (!update) return;


        const texture = new THREE.VideoTexture(videoElement as HTMLVideoElement);
        texture.colorSpace = THREE.SRGBColorSpace;

        setVideoTexture(texture);

        cameraControls?.current?.fitToBox(groupRef.current, true);

        let intervalId = setInterval(() =>
        {
            console.log("updating prediction")
            // console.log('-==--==updating prediction ', getEyePop(), 'prediction: ', getEyePop()?.prediction)
            // if (!getEyePop()) return;
            // if (!update) return;

            // update();
            // console.log('updating prediction ', getEyePop(), 'prediction: ', getEyePop()?.prediction)
        }, 1000);

        // return () => clearInterval(intervalId);

    }, [ videoElement, getEyePop, update, prediction, setVideoTexture, cameraControls, groupRef ])


    return (
        <Canvas
            shadows={true}
            style={{ height: '100dvh', touchAction: 'none' }}
            gl={{ localClippingEnabled: true }}
        >

            <axesHelper args={[ 1 ]} />

            <Environment preset="sunset" />
            <CameraControls ref={(ref) => { setCameraControls(ref) }} />

            <spotLight position={[ 10, 10, 10 ]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[ -10, -10, -10 ]} decay={0} intensity={Math.PI / 4} />
            <ambientLight intensity={5} />

            <Text  >
                {`${prediction}`}
            </Text>

            <object3D ref={(ref) => { setGroupRef(ref) }} name='webcam'>
                <WebcamMesh videoTexture={videoTexture} maskArray={null} />
            </object3D>

        </Canvas >
    );
};

export default Visuals;
