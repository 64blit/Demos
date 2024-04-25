import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

import { EyePop } from "@eyepop.ai/eyepop";
import { processFrame, getVehicles, getFlowStatistics } from "../CollisionDetector.js";

const EyePopContext = createContext();

const EyePopProvider = ({ children }) =>
{
    const [ endpoint, setEndpoint ] = useState(undefined);
    const [ isLoadingEyePop, setLoading ] = useState(true);
    const [ inferenceData, setData ] = useState([]);
    const [ videoURL, setVideoURL ] = useState('');
    const [ isCollision, setCollision ] = useState(false);
    const [ isTraffic, setTraffic ] = useState(false);
    const [ prediction, setPrediction ] = useState(null);

    const videoRef = useRef(null);

    const eyepopInference =
        `ep_infer id=1  category-name="vehicle"
            model=eyepop-vehicle:EPVehicleB1_Vehicle_TorchScriptCuda_float32 threshold=0.5
            ! ep_infer id=2
            tracing=deepsort
            model=legacy:reid-mobilenetv2_x1_4_ImageNet_TensorFlowLite_int8
            secondary-to-id=1
            secondary-for-class-ids=<0,1,2,3,4,5>
            thread=true
            ! ep_mixer name="meta_mixer"`;

    // Initialize the EyePop.ai endpoint
    useEffect(() =>
    {
        console.log('Initializing EyePop.ai endpoint...');

        EyePop.endpoint({
            popId: 'ab3cb23c05c045a29ee6ea00c765f167', //production
            auth: {
                oAuth2: true
            },
        })
            .onStateChanged((from, to) =>
            {
                console.log("EyePop.ai endpoint state transition from " + from + " to " + to);
            })
            .connect()
            .then(async (endpoint) =>
            {

                setEndpoint(endpoint);

                await endpoint.changePopComp(eyepopInference);

                setLoading(false);
            }).catch((error) =>
            {
                console.error('Failed to connect to EyePop.ai endpoint:', error);
            });

    }, []);

    useEffect(() =>
    {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;

        console.log('Video URL:', videoURL);
        let animationFrameId;

        const onVideoUpdate = () =>
        {
            const time = videoRef.current.currentTime;
            const closestPrediction = getClosestPrediction(time);
            const frameResults = processFrame(closestPrediction);

            if (frameResults)
            {
                setCollision(frameResults.collision);
                setTraffic(frameResults.traffic);
                setPrediction(closestPrediction);
            }

            animationFrameId = requestAnimationFrame(onVideoUpdate);
            // Request the next frame
        }

        const onVideoStart = () =>
        {
            // Start the loop
            animationFrameId = requestAnimationFrame(onVideoUpdate);
        }

        videoRef.current.addEventListener('play', onVideoStart);

        return () =>
        {
            videoRef.current.removeEventListener('play', onVideoStart);
            cancelAnimationFrame(animationFrameId); // Cancel the animation frame when the component unmounts
        };

    }, [ videoRef.current ]);

    function getClosestPrediction(second)
    {
        let closest = null;
        let closestDistance = Infinity;

        for (const prediction of inferenceData)
        {
            const distance = Math.abs(prediction.seconds - second);
            if (distance < closestDistance)
            {
                closest = prediction;
                closestDistance = distance;
            }
        }

        return closest;
    }


    // Analyze an image and parse results
    async function startInference(url = '')
    {
        console.log('URL:', url, endpoint);
        const results = await endpoint.process({ url: url });

        setLoading(false);
        const data = [];

        for await (let result of results)
        {
            data.push(result);
            console.log('Inference length:', data.length);
        }
        const inferenceObj = { "url": url, "data": data };

        // save the data to a data.json file
        //  by creating a Blob and using URL.createObjectURL and link
        const json = JSON.stringify(inferenceObj, null, 2);
        const blob = new Blob([ json ], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'data.json';
        link.click();

        setData(data);
        setVideoURL(url);

    }

    // Load inference data from a JSON file
    async function setInferenceData(file)
    {
        const reader = new FileReader();
        let jsonData = null;
        reader.onload = async (event) =>
        {
            if (!event.target.result)
            {
                console.error('Failed to read file:', file);
                return;
            }

            jsonData = JSON.parse(event.target.result);

            setData(jsonData.data);
            setVideoURL(jsonData.url);

        }

        reader.readAsText(file);

    }

    function reset()
    {
        const vehicles = getVehicles(true);

        // clear the vehicles map
        vehicles.clear();
    }



    return (

        <EyePopContext.Provider value={{
            endpoint,
            videoURL,
            startInference,
            setInferenceData,
            videoRef,
            getClosestPrediction,
            getVehicles,
            isCollision,
            isTraffic,
            prediction,
            reset,
            getFlowStatistics
        }}>

            {
                !isLoadingEyePop
                &&
                <>
                    {children}
                    <video ref={videoRef} controls autoPlay crossOrigin='anonymous' src={videoURL} className='w-full hidden' ></video>
                </>
            }

        </EyePopContext.Provider>

    );
};

const useEyePop = () =>
{
    const context = useContext(EyePopContext);
    if (context === undefined)
    {
        throw new Error('useEyePop must be used within an EyePopProvider');
    }
    return context;
};


export { EyePopProvider, useEyePop };
