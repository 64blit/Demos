import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, CameraControls, Plane } from '@react-three/drei';
import * as THREE from 'three';

import { VideoMesh } from './VideoMesh.jsx';
import EyePopDrawing from './EyePopDrawing.jsx';
import Controls from './Controls.jsx';

export function Index()
{
    const canvasParentRef = useRef(null);

    // makes the canvas go fullscreen on the f key being pressed
    const handleKeyDown = (e) =>
    {
        if (!canvasParentRef.current)
        {
            return;
        }

        if (e.key === 'f')
        {
            canvasParentRef.current.requestFullscreen();
        }
    };

    useEffect(() =>
    {
        document.addEventListener('keydown', handleKeyDown);
        return () =>
        {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div ref={canvasParentRef} className='flex flex-col justify-center items-center gap-2 m-5 text-white h-full'>

            <Controls />

            <Canvas
                className='w-full h-full'
                dpr={window.devicePixelRatio * 2}>

                <VideoMesh />

                <EyePopDrawing />

            </Canvas >

        </div>
    );
}
