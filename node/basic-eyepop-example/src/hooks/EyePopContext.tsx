import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

import EyePop from "@eyepop.ai/eyepop";

interface EyePopContextProps
{
    results: object | null;
    endpoint: EyePop.Endpoint | null;
    startWebcamStream: () => Promise<void>;
    getStream: (ingressId?: number) => Promise<MediaStream>;
}

interface EyePopProviderProps
{
    children: ReactNode;
    config?: { secretKey: string; popId: string };
}

const EyePopContext = createContext<EyePopContextProps | null>(null);

const EyePopProvider = ({ children, config = { secretKey: '', popId: '' } }: EyePopProviderProps) =>
{
    const [ isLoadingEyePop, setLoading ] = useState(true);
    const [ results, setResults ] = useState<object>({});
    const [ endpoint, setEndpoint ] = useState<EyePop.Endpoint>(null);
    const [ egressId, setEgressId ] = useState<number>();

    const [ videoElement, setVideoElement ] = useState(null);
    const [ stream, setStream ] = useState(null);


    // Initialize the EyePop.ai endpoint
    useEffect(() =>
    {

        if (!config.popId)
        {
            console.error('EyePop.ai popId are missing. Please provide them in the EyePopProvider config prop.', ' Key: ', config.secretKey, 'pop Id: ', config.popId);
            return;
        }

        (async () =>
        {
            try
            {
                const auth: EyePop.Authentication = {};

                if (config.secretKey)
                {
                    auth.secretKey = config.secretKey
                } else
                {
                    auth.oAuth2 = true
                }

                // API key and popID are easily obtained from the EyePop.ai dashboard
                const newEndpoint = await EyePop.endpoint({
                    auth: auth,
                    popId: config.popId,
                })
                    .onStateChanged((from: string, to: string) =>
                    {
                        console.log(`EyePop.ai endpoint state transition from ${from} to ${to}`);
                    }).onIngressEvent(async (ingressEvent) =>
                    {
                        console.log(ingressEvent);
                        setEgressId(ingressEvent.ingressId);
                    });

                await newEndpoint.connect();

                console.log('EyePop.ai endpoint connected')

                setEndpoint(newEndpoint);
                setLoading(false);
            } catch (error)
            {
                console.error('Error initializing EyePop.ai:', error);
            }
        })();

    }, [ config.secretKey, config.popId ]);



    useEffect(() =>
    {
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.setAttribute('playsinline', 'true');

        setVideoElement(video);
    }, []);

    const startWebcamStream = async () =>
    {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();
        const ingress = await endpoint.liveIngress(stream);
        setStream(ingress);
    };

    const getStream = async (ingressId?: number) =>
    {
        if (!ingressId)
        {
            ingressId = egressId;
        }

        const egress = await endpoint.liveEgress(ingressId);
        const remoteStream = await egress.stream();
        return remoteStream;
    };

    return (
        <EyePopContext.Provider
            value={{
                results,
                endpoint,
                startWebcamStream,
                getStream
            }}
        >
            {!isLoadingEyePop && children}
        </EyePopContext.Provider>
    );
};

const useEyePop = (): EyePopContextProps =>
{
    const context = useContext(EyePopContext);
    if (context === null)
    {
        throw new Error('useEyePop must be used within an EyePopProvider');
    }
    return context;
};

export { EyePopProvider, useEyePop };
