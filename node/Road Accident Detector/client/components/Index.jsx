import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, CameraControls, Plane } from '@react-three/drei';
import * as THREE from 'three';

import { useEyePop } from '../hook/EyePopContext.jsx';
import { VideoMesh } from './VideoMesh.jsx';
import UIOverlay from './UIOverlay.jsx';

export function Index()
{

    const { startInference, setInferenceData, videoURL, videoRef } = useEyePop();
    const videoURlRef = useRef(null);

    const start = async (e) =>
    {
        const url = videoURlRef.current.value;

        if (!url)
        {
            alert('Please enter a video URL');
            return;
        }

        console.log('Starting inference with URL:', url);

        await startInference(url);
    }

    const handleFileUpload = (e) =>
    {
        const file = e.target.files[ 0 ];
        setInferenceData(file);
    };


    return (
        <div className='flex flex-col justify-center items-center gap-5 m-5 text-white h-full'>

            <h3 className='text-3xl'>Automated Collision Detection</h3>

            <div className='flex flex-row justify-center items-center gap-5 m-5 text-white'>

                <input ref={videoURlRef} type="text" className='input text' placeholder="Enter URL" />

                <div className='btn btn-primary' onClick={start}> Start Inference </div>

            </div>

            <input type="file" accept=".json" onChange={handleFileUpload} placeholder='Load json inference file' />

            <Canvas
                className='w-full h-full'
                dpr={window.devicePixelRatio * 2}>

                <VideoMesh />

                <UIOverlay />

            </Canvas >

        </div>
    );
}
