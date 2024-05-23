import React, { useEffect, useRef } from 'react';




const EyePopVisuals = ({ className, resultCanvasRef, videoRef, setModel }) =>
{
    const sharedClass = 'object-contain h-full bg-transparent d-block';
    const canvasRef = useRef();

    // when the f key is pressed make the canvas go full screen
    const toggleFullScreen = () =>
    {
        if (!document.fullscreenElement)
        {
            resultCanvasRef.current.requestFullscreen();
        } else
        {
            if (document.exitFullscreen)
            {
                document.exitFullscreen();
            }
        }
    }

    //handle the key press event
    const handleKeyPress = (e) =>
    {
        if (e.key === 'f')
        {
            toggleFullScreen();
        }
    }

    useEffect(() =>
    {
        // Add key press event listener when component mounts
        window.addEventListener('keypress', handleKeyPress);

        // Remove event listener when component unmounts
        return () =>
        {
            window.removeEventListener('keypress', handleKeyPress);
        };

    }, []);

    const modelSelectionRef = useRef();

    useEffect(() =>
    {
        console.log('modelSelectionRef', modelSelectionRef.current, resultCanvasRef.current, videoRef.current, setModel);

    }, []);

    return (
        <div className={`${className} w-1/2 h-full flex justify-center p-5  bg-purple-gradient `} >

            <div
                className="fixed w-[48.5%] bottom-0 left-0 flex h-20 justify-center items-center shadow-2xl  shadow-black ml-2 pr-2 rounded-t-xl pt-2">

                <h5 className="text-xl text-center text-white">Select Model:</h5>

                <select
                    ref={modelSelectionRef}
                    onChange={() => { setModel(modelSelectionRef.current.value); }}
                    className="btn select select-bordered outline border-black max-w-xs w-1/2 m-5 text-white rounded-xl transition-all bg-black hover:bg-purple-500 hover:text-white"
                >

                    <option className='text-white bg-black' value="personBody">Person w/ 2D Body Points</option>
                    <option className='text-white bg-black' value="person3d">Person w/ 3D Face, Body & Hands</option>

                    <option className='text-white bg-black' value="personCommon">Person + Common Objects</option>
                    <option className='text-white bg-black' value="person2dBodyDemographic">Person w/ 2D Body Points + Demographic Data</option>
                    <option className='text-white bg-black' value="person">Person</option>
                    <option className='text-white bg-black' value="personDemographic">Person w/ Demographic Data (Age, Gender, Expression)</option>
                    <option className='text-white bg-black' value="peopleAnimals">People + Animals</option>
                    <option className='text-white bg-black' value="peopleDevices">People + Devices</option>
                    <option className='text-white bg-black' value="personSportsEquipment">Person + Sports Equipment</option>
                    <option className='text-white bg-black' value="personVehicles">Person + Vehicles</option>


                </select>
            </div>
            <canvas
                id="result-overlay"
                ref={resultCanvasRef}
                className={`${sharedClass} aboslute shadow-2xl shadow-black w-full max-h-[90%] flex-none`}
            ></canvas>
            <video
                ref={videoRef}
                className={`${sharedClass} hidden absolute flex-none`}
                autoPlay
                playsInline
                muted
            ></video>
        </div>
    );
};

export default EyePopVisuals;
