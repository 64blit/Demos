import React, { useEffect, useRef } from "react";

const DemoVideo = () =>
{

    const videoRef = useRef();

    useEffect(() =>
    {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
    }, []);

    return (
        <>
            <h1 className="text-2xl text-center text-white">Demo Video:</h1>
            <div className="pt-20 pl-5 pr-5 pb-40 flex flex-col  justify-center">


                <video ref={videoRef} muted src="../../../assets/3.6.24 compilation_1.mp4" controls playsInline loop></video>


            </div>
        </>
    );
};

export default DemoVideo;
