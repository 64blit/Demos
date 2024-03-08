import React from "react";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faComputer, faVideo, faChain } from '@fortawesome/free-solid-svg-icons';


const PipelineVisualization = () =>
{
    return (
        <>
            <h1 className="text-2xl text-center text-white">Pipeline Visualization:</h1>

            <video className="max-h-[100%]" width={'100%'} src="../../../assets/graphic.webm" autoPlay playsInline loop></video>

        </>
    );
};

export default PipelineVisualization;
