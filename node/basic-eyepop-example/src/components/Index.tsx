import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box, CameraControls, DragControls, Environment, Text } from '@react-three/drei'
import * as THREE from 'three';
import { Container, Fullscreen, Root } from '@react-three/uikit';

import WebcamMesh from './visuals/WebcamMesh';
import useEyePop from '../store/EyePopStore';
import EyePopDrawing from './visuals/EyePopDrawing';
import { Perf } from 'r3f-perf';

const Index: React.FC = () =>
{
    const [ webcamMesh, setWebcamMesh ] = useState<THREE.Mesh | null>(null);

    const cameraRef = useRef(null);

    useEffect(() =>
    {
        if (!cameraRef.current) return;
        if (!webcamMesh) return;

        console.log('Fitting camera to webcamMesh', cameraRef.current, webcamMesh);
        cameraRef.current.near
        cameraRef.current.fitToBox(webcamMesh, true);
        cameraRef.current.saveState();
        cameraRef.current.mouseButtons.left = null;
        cameraRef.current.mouseButtons.right = null;
        cameraRef.current.mouseButtons.middle = null;
        cameraRef.current.mouseButtons.wheel = null;
        cameraRef.current.touches.two = null;
        cameraRef.current.touches.three = null;
        cameraRef.current.touches.one = null;



    }, [ cameraRef, webcamMesh ])


    useEffect(() =>
    {
        const handleEscape = (e: KeyboardEvent) =>
        {
            if (e.key === 'Escape')
            {
                cameraRef?.current.reset(true);
            }
        }
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    })

    useEyePop(
        {
            popId: 'e4fd9369a9de42f6becfb90e11f4620c',
            'secretKey': 'AAEx0k5X9gzahbFdKDNq33wLZ0FBQUFBQmwtS2NTMmZiVEJISU9yelBXVnVPUnQ4cC1wOVBHSDBWa3lrZW5QSnRIdVcxQXFBMmJobEFCSUV6dnNheG01aWVJdHc1SEZKN2VkaGhTMXViS3ZtaTRESy1GeW1fVnYxZFl5LWVtTTZ2RzJBN01CWnM9'
        });


    return (
        <Canvas
            shadows={true}
            style={{ height: '100dvh' }}
            gl={{ localClippingEnabled: true }}
        >

            {/* <Perf position="top-left" /> */}

            <CameraControls ref={cameraRef} />
            <Environment preset="sunset" />

            <spotLight position={[ 0, 0, 10 ]} penumbra={1} decay={.5} intensity={20} />
            <pointLight position={[ 0, 0, 10 ]} decay={0} intensity={Math.PI / 4} />

            <DragControls >
                <EyePopDrawing />
            </DragControls>

            <group ref={(node) =>
            {
                setWebcamMesh(node);
            }}>
                <WebcamMesh />
            </group>

        </Canvas >
    );
};

export default Index;
