import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, } from '@react-three/fiber'
import { CameraControls, DragControls, Environment, } from '@react-three/drei'
import * as THREE from 'three';

import WebcamMesh from './visuals/WebcamMesh';
import { useEyePop } from '../store/EyePopWrapper';
import EyePopDrawing from './visuals/EyePopDrawing';
import { Perf } from 'r3f-perf';
import UI from './ui/UI';


const Index: React.FC = () =>
{
    const { initialize, eyePopManager } = useEyePop();

    const [ webcamMesh, setWebcamMesh ] = useState<THREE.Mesh | null>(null);
    const cameraRef = useRef(null);

    // initialize the EyePop SDK
    useEffect(() =>
    {
        if (eyePopManager) return
        if (eyePopManager?.ready) return

        console.log('---------------Initializing EyePop SDK');

        initialize({
            popId: 'e4fd9369a9de42f6becfb90e11f4620c',
            secretKey: 'AAHHcbNafB-AyslKYRhYSFaMZ0FBQUFBQm1BYkpJWXFxeTVEbGVoaEFOSzJueW9jbnpDMGZZU3JHTTR3MElKZTBlN3VMRVpveWtEM1dISVlHTGhUc2JKUHJDVjY5eW5LUkRtV3BISExJSFo0TUtrZ3V1Nmdmc1Utc0JhY0NVTW1HZUFlZUZsdGM9'
        })
    }, [ initialize, eyePopManager ]);


    // Setup the camera controls
    useEffect(() =>
    {
        if (!cameraRef.current) return;
        if (!webcamMesh) return;

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


    // Reset camera on escape key
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

    return (
        <Canvas
            shadows={true}
            style={{ height: '100dvh' }}
            gl={{ localClippingEnabled: true }}
            dpr={window.devicePixelRatio * 2}
        >
            {/* <Perf position="top-left" /> */}

            <CameraControls ref={cameraRef} />
            <Environment preset="city" resolution={512} />
            <pointLight position={[ 0, 0, 10 ]} decay={0} intensity={5} />


            <UI />


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
