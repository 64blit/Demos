import EyePop from "@eyepop.ai/eyepop";
import { create } from 'zustand';

class EyePopWrapper 
{

    public config: EyePopConfig | undefined | null = undefined;
    public videoElement: HTMLVideoElement | undefined = undefined;
    public ready: boolean = false;

    private prediction: JSON | undefined = undefined;
    private endpoint: any | undefined = undefined;
    private ingressId: number | undefined = undefined;

    private stream: any | undefined = undefined;
    private egressId: number | undefined = undefined;


    constructor(config: EyePopConfig | null)
    {
        this.config = config;

        this.createVideoElement();
        this.setup();
    }


    public async setup()
    {
        if (this.endpoint) return;

        try
        {
            const auth: any = {};

            if (this.config?.secretKey)
            {
                auth.secretKey = this.config?.secretKey
            } else
            {
                auth.oAuth2 = true
            }

            // API key and popID are easily obtained from the EyePop.ai dashboard
            this.endpoint = await EyePop.endpoint({
                auth: auth,
                popId: this.config?.popId,
            })
                .onStateChanged((from: string, to: string) =>
                {
                    console.log(`EyePop.ai endpoint state transition from ${from} to ${to}`);
                }).onIngressEvent(async (ingressEvent) =>
                {
                    console.log('EyePop.ai new stream detected:', ingressEvent);
                    this.egressId = Number(ingressEvent.ingressId);
                });

            await this.endpoint.connect();

            console.log('EyePop.ai endpoint connected')

        } catch (error)
        {
            console.error('Error initializing EyePop.ai:', error);
        }

    }

    private createVideoElement()
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
    }

    private startWebcamPrediction(ingressId?: number)
    {
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

                        this.prediction = result;
                    }
                });
            });
    }

    public async startWebcamStream(): Promise<HTMLVideoElement | GlobalEventHandlers | null>
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
                if (!this.videoElement) return;

                this.videoElement.width = this.videoElement?.videoWidth || 0;
                this.videoElement.height = this.videoElement?.videoHeight || 0;

                resolve(this.videoElement);

                this.ready = true;
            }
        });


        return this.videoElement;

    }

    public async getStream(ingressId?: number): Promise<MediaStream>
    {
        if (!ingressId)
        {
            ingressId = this.egressId;
        }

        const egress = await this.endpoint?.liveEgress(ingressId);
        return egress?.stream() || new MediaStream();
    }


    public getPrediction(): JSON | undefined
    {
        return this.prediction;
    }
}


type EyePopConfig = {
    popId: string;
    secretKey?: string;
}

type EyePopStore = {
    eyePop: EyePopWrapper | null;
    webcamVideo: HTMLVideoElement | null;
    initialize: (config: EyePopConfig | null | undefined) => void;
    startWebcam: () => void;
}

export const useEyePop = create<EyePopStore>((set, get) => ({
    eyePop: null,
    webcamVideo: null,
    initialize: (config: EyePopConfig | null | undefined) =>
    {
        if (!config)
        {
            console.error('Please provide a valid EyePop.ai configuration object');
            return;
        }

        const eyePop = new EyePopWrapper(config);

        set({ eyePop, webcamVideo: eyePop.videoElement });

        return eyePop.setup();
    },

    startWebcam: () =>
    {
        const { eyePop } = get();

        if (!eyePop)
        {
            console.error('EyePop.ai not yet initialized. Please call initialize() first');
            return;
        }

        eyePop.startWebcamStream();

    }
}));
