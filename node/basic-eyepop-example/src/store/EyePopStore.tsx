import EyePop from "@eyepop.ai/eyepop";

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';

import { Atom, atom, useAtom } from 'jotai'



class EyePopManager 
{
    public config: EyePopConfig | null;
    public videoElement: HTMLVideoElement | null | undefined = null;
    public ready: boolean = false;

    private prediction: JSON | null | undefined;
    private endpoint: EyePop.Endpoint | null | undefined = null;
    private ingressId: number | null | undefined;

    private stream: EyePop.Ingress | null | undefined = null;
    private egressId: number | null | undefined;



    constructor(config: EyePopConfig | null)
    {
        this.config = config;
        this.egressId = undefined;
        this.videoElement = undefined;
        this.stream = undefined;
        this.endpoint = undefined;
        this.prediction = undefined;
        this.ingressId = undefined;
        this.ready = false;

        this.createVideoElement();
        this.setup();
    }

    setup = async () =>
    {
        console.log('-----Setting up EyePop.ai');
        if (this.endpoint) return;

        try
        {
            const auth: EyePop.Authentication = {};

            if (this.config.secretKey)
            {
                auth.secretKey = this.config.secretKey
            } else
            {
                auth.oAuth2 = true
            }

            // API key and popID are easily obtained from the EyePop.ai dashboard
            this.endpoint = await EyePop.endpoint({
                auth: auth,
                popId: this.config.popId,
            })
                .onStateChanged((from: string, to: string) =>
                {
                    console.log(`EyePop.ai endpoint state transition from ${from} to ${to}`);
                }).onIngressEvent(async (ingressEvent) =>
                {
                    console.log('New stream detected:', ingressEvent);
                    this.egressId = Number(ingressEvent.ingressId);
                });

            await this.endpoint.connect();

            this.startWebcamStream();


            console.log('EyePop.ai endpoint connected')

        } catch (error)
        {
            // alert('Error initializing EyePop.ai: ' + error);
            console.error('Error initializing EyePop.ai:', error);
        }

    }

    createVideoElement = () =>
    {
        const existingVideoElement = document.getElementById('webcam-video-eyepop');
        if (existingVideoElement)
        {
            this.videoElement = existingVideoElement as HTMLVideoElement;
            return;
        }

        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('id', 'webcam-video-eyepop');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);
        this.videoElement.setAttribute('autoplay', 'true');
        this.videoElement.setAttribute('muted', 'true');
        this.videoElement.setAttribute('playsinline', 'true');
    };

    startWebcamPrediction = (ingressId?: number) =>
    {
        // return;
        const scope = this;
        this.endpoint.process({ ingressId })
            .then((results) =>
            {
                // starts a new prediction process in the background
                setTimeout(async () =>
                {
                    console.log('Starting prediction process');
                    for await (let result of results)
                    {
                        if (result.seconds % 2 < 0.1)
                        {
                            console.log('New prediction:', result);
                        }

                        scope.prediction = result;
                    }
                });
            });
    }

    startWebcamStream = async (): Promise<HTMLVideoElement | null | undefined | GlobalEventHandlers> =>
    {
        if (!this.videoElement)
        {
            console.error('Video stream not yet ready. Please wait a moment and try again.');
            return null;
        }

        if (this.stream?.active)
        {
            return this.videoElement;
        }

        const tempStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        const ingressStream = await this.endpoint?.liveIngress(tempStream);

        this.ingressId = ingressStream.ingressId();
        this.startWebcamPrediction(this.ingressId);

        this.videoElement.srcObject = tempStream;
        this.videoElement?.play();

        await new Promise((resolve) =>
        {
            if (!this.videoElement)
            {
                resolve(null);
                return;
            }

            this.videoElement.onloadedmetadata = () =>
            {
                this.videoElement.width = this.videoElement?.videoWidth || 0;
                this.videoElement.height = this.videoElement?.videoHeight || 0;

                resolve(this.videoElement);

                this.ready = true;
            }
        });


        return this.videoElement;

    };

    getStream = async (ingressId?: number): Promise<MediaStream> =>
    {
        if (!ingressId)
        {
            ingressId = this.egressId;
        }

        const egress = await this.endpoint?.liveEgress(ingressId);
        return egress?.stream() || new MediaStream();
    };


    getPrediction = (): JSON | null | undefined =>
    {
        return this.prediction;
    }
}



type EyePopConfig = {
    popId: string;
    secretKey?: string;
}


// Create an atom to hold the instance of EyePopManager
let eyePopManagerAtom: Atom<EyePopManager> | null = null;

const useEyePop = (config: EyePopConfig | null | undefined = null) =>
{
    if (!eyePopManagerAtom)
    {
        eyePopManagerAtom = atom(new EyePopManager(config))
    }

    const [ eyePopManager ] = useAtom(eyePopManagerAtom)

    return { eyePopManager, webcamVideo: eyePopManager.videoElement }
}

export default useEyePop
