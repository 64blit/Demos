import React, { useEffect, useRef } from 'react';




const EyePopVisuals = ({ className, resultCanvasRef, videoRef, setModel }) =>
{
    const sharedClass = 'object-contain h-full bg-transparent d-block';

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
                    className="btn select select-bordered  outline border-black max-w-xs w-1/2 m-5 text-yellow-50 rounded-xl transition-all">
                    <option value="peopleCommon">People + Common Objects</option>
                    <option value="peopleBody">People + 2D Body Pose</option>
                    <option value="people3d">People + 3D Pose + Hands + Face</option>
                </select>

            </div>

            <canvas
                id="result-overlay"
                ref={resultCanvasRef}
                className={`${sharedClass} aboslute shadow-2xl shadow-black w-full max-h-[90%] flex-none`}
            >
            </canvas>

            <video
                ref={videoRef}
                className={`${sharedClass} hidden absolute flex-none`}
                autoPlay
                playsInline
                muted
            >
            </video>


        </div >
    );
};

export default EyePopVisuals;
