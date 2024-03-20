import EyePop from "@eyepop.ai/eyepop";

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';

type EyePopConfig = {
    secretKey?: string | null | undefined;
    popId: string;
};

type EyePopState = {
    eyePop: EyePopManager | undefined;
    prediction: JSON | null | undefined;
    videoElement: HTMLVideoElement | null | undefined;
    initialize: (config: EyePopConfig) => Promise<void | EyePopManager>;
    startWebcamStream: () => Promise<void | HTMLVideoElement> | void;
    update: () => Promise<void> | void;
    getEyePop: () => EyePopManager | undefined;
};

const store = (set, get): EyePopState => ({
    eyePop: undefined,
    getEyePop: () => get().eyePop,
    videoElement: null,
    prediction: null,
    initialize: async (config) =>
    {
        const eyePopManager = new EyePopManager(config);
        await eyePopManager.setup();
        set({ eyePop: eyePopManager }, 'eyePop');
    },
    startWebcamStream: () =>
    {
        set(
            produce((draft: EyePopState) =>  //useful for modifying the state in a more complex way, so you dont have to unroll the state and then roll it back up again
            {
                if (!draft.eyePop)
                {
                    console.error('EyePop not yet initialized. Please wait a moment and try again.');
                }

                draft.eyePop?.startWebcamStream().then((videoElement) =>
                {
                    if (!videoElement) return;

                    videoElement.onloadedmetadata = () =>
                    {
                        // update the video width and height
                        videoElement.width = videoElement?.videoWidth || 0;
                        videoElement.height = videoElement?.videoHeight || 0;

                        set({
                            videoElement: videoElement
                        }, 'videoElement');

                    }

                })

                return draft
            },
                'startWebcamStream'
            )
        )
    },
    update: async () =>
    {
        const eyePop = get().eyePop;

        console.log('Updating prediction:', eyePop, eyePop?.prediction);

        if (!eyePop)
        {
            return;
        }

        set({ prediction: eyePop.prediction });
    }
})

// const useEyePop = create(devtools(persist(store, { name: 'store' })));
const useEyePop = create(devtools(store));

class EyePopManager 
{
    public config: EyePopConfig;
    public videoElement: HTMLVideoElement | null | undefined = null;
    public prediction: JSON | null | undefined;
    public endpoint: EyePop.Endpoint | null | undefined = null;

    private stream: EyePop.Ingress | null | undefined = null;
    private egressId: number | null | undefined;


    constructor(config: EyePopConfig)
    {
        this.config = config;
        this.egressId = undefined;
        this.videoElement = undefined;
        this.stream = undefined;
        this.endpoint = undefined;
        this.prediction = undefined;

        this.createVideoElement();
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

            console.log('EyePop.ai endpoint connected')

        } catch (error)
        {
            // alert('Error initializing EyePop.ai: ' + error);
            console.error('Error initializing EyePop.ai:', error);
        }

    }

    createVideoElement = () =>
    {
        this.videoElement = document.createElement('video');
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);
        this.videoElement.setAttribute('autoplay', 'true');
        this.videoElement.setAttribute('muted', 'true');
        this.videoElement.setAttribute('playsinline', 'true');
    };

    startWebcamPrediction = (ingressId, onNewPrediction) =>
    {
        const scope = this;
        this.endpoint.process({ ingressId })
            .then((results) =>
            {
                // starts a new prediction process in the background
                setTimeout(async () =>
                {
                    for await (let result of results)
                    {
                        (result.seconds.toFixed(1) % 2 < .0001) && console.log('Prediction result:', result.seconds);
                        scope.prediction = result;
                        onNewPrediction(result);
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
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        const ingressStream = await this.endpoint?.liveIngress(tempStream);

        this.startWebcamPrediction(ingressStream.ingressId());

        this.videoElement.srcObject = tempStream;
        this.videoElement?.play();

        console.log('Completed startWebcamStream')

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

}


export default useEyePop;
