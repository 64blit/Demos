import React, { useEffect, useRef, useState } from 'react';

import Header from './ui/Header.jsx';
import EyePopVisuals from './ui/EyePopVisuals.jsx';
import EyePopManager from './src/EyePopManager.js';
import LoadingScreen from './ui/LoadingScreen.jsx';
import EyePopPresentation from './ui/EyePopPresentation.jsx';

export function AutoVideoClipper()
{

    const resultCanvasRef = useRef();
    const videoRef = useRef();
    const popNameRef = useRef();
    const startButtonRef = useRef();

    const [ eyePopManager, setEyePopManager ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ clicked, setClicked ] = useState(true);
    const [ progress, setProgress ] = useState(0);
    const [ json, setJSON ] = useState();

    const handleWebcamChange = (deviceID) =>
    {
        console.log("Setting device:", deviceID, eyePopManager);
        eyePopManager.setWebcam(deviceID);
    }

    const toggleStart = () =>
    {
        console.log('toggle Start', eyePopManager);
        eyePopManager.toggleStart();
    }

    const setModel = (model) =>
    {
        console.log('setModel', model);
        eyePopManager.setModel(model);
    }

    const setupEyePopManager = () =>
    {
        if (eyePopManager) return;
        if (!resultCanvasRef.current) return;
        if (!popNameRef.current) return;
        if (!videoRef.current) return;

        const manager = new EyePopManager(resultCanvasRef, videoRef, popNameRef, startButtonRef, { setProgress, setLoading, setJSON });
        setEyePopManager(manager);
    }

    useEffect(() =>
    {
        if (eyePopManager) return
        setupEyePopManager();
    }, []);

    return (
        <>
            {!clicked ?
                <>
                    <div
                        className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-900 z-50">
                        <div className="btn text-xl btn-primary hover:bg-primary-gradient hover:scale-125"
                            onClick={() => { setClicked(true); }}
                        >
                            continue
                        </div>
                    </div>

                </>

                :

                <>

                    <div className='flex w-full h-full '>

                        <EyePopVisuals
                            clicked={clicked}
                            resultCanvasRef={resultCanvasRef}
                            videoRef={videoRef}
                            setModel={setModel}
                        />

                        <EyePopPresentation
                            clicked={clicked}
                            json={json}
                            loading={loading}
                            popNameRef={popNameRef}
                            handleWebcamChange={handleWebcamChange}
                            startButtonRef={startButtonRef}
                            onStart={toggleStart} />

                    </div>


                    <LoadingScreen
                        className={'absolute top-0 left-0 w-full h-full bg-black'}
                        loading={loading}
                    />
                </>
            }

        </>

    );
}



