import EyePop from "@eyepop.ai/eyepop";
import { create } from 'zustand';


// TODO:
//   add a person map with smoothing to avoid flickering
//   add file upload for images

class EyePopWrapper 
{

    public config: EyePopConfig | null;
    public videoElement: HTMLVideoElement = null;
    public ready: boolean = false;

    private prediction: JSON;
    private endpoint: any = null;
    private ingressId: number;

    private stream: any = null;
    private egressId: number;


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

            // API key and popID are easily obtained from the EyePop.ai dashboard
            this.endpoint = await EyePop.endpoint(this.config)
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

        console.log('Starting prediction process for ingressId:', ingressId);

        this.endpoint.process({ ingressId })
            .then((results) =>
            {
                // starts a new prediction process in the background
                (async () =>
                {
                    for await (const result of results)
                    {
                        // console.log('Prediction:', result)
                        this.prediction = result;
                    }

                })();
            });
    }

    public async startWebcamStream(): Promise<HTMLVideoElement | GlobalEventHandlers>
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

        this.videoElement.srcObject = tempStream;
        this.videoElement?.play();

        this.startWebcamPrediction(this.ingressId);


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

    public getBiggestPerson(): JSON
    {

        let prediction = this.getPrediction();
        if (!prediction) return null;

        if (!("objects" in prediction)) return null;
        if (!prediction.objects) return null;

        const people = []
        prediction = prediction as { objects: { classLabel: string, width: number, height: number }[] };

        for (const object of prediction.objects)
        {
            if (object.classLabel === 'person')
            {
                people.push(object);
            }
        }

        let biggestPerson = null;
        let biggestArea = 0;

        for (const person of people)
        {
            const area = person.width * person.height;
            if (area > biggestArea)
            {
                biggestPerson = person;
                biggestArea = area;
            }
        }

        return biggestPerson;
    }

    public getOutline(): JSON
    {
        const prediction = this.getBiggestPerson();

        if (!prediction) return null;
        if (!("contours" in prediction)) return null;
        // we return the contours of the person as an array of points
        if (prediction.contours.length < 1) return null;

        return prediction.contours[ 0 ];
    }


    public getPrediction(): JSON | { objects: { classLabel: string, width: number, height: number }[] }
    {
        return this.prediction;
    }
}


type EyePopConfig = {
    popId: string;
    secretKey?: string;
}

type EyePopStore = {
    isReady: boolean;
    eyePop: EyePopWrapper | null;
    webcamVideo: HTMLVideoElement | null;
    getBiggestPerson: () => JSON | any;
    initialize: (config: EyePopConfig | null | undefined) => void;
    startWebcam: () => void;
    getOutline: () => JSON | any;
}

export const useEyePop = create<EyePopStore>((set, get) => ({
    isReady: false,
    eyePop: null,
    webcamVideo: null,
    initialize: (config: EyePopConfig | null | undefined) =>
    {
        set({ isReady: false });

        if (!config)
        {
            console.error('Please provide a valid EyePop.ai configuration object');
            return;
        }

        const eyePop = new EyePopWrapper(config);

        set({ eyePop });

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

        set({
            isReady: true,
            webcamVideo: eyePop.videoElement
        });

        eyePop.startWebcamStream();

    },

    getBiggestPerson: () =>
    {

        const { eyePop } = get();

        if (!eyePop)
        {
            console.error('EyePop.ai not yet initialized. Please call initialize() first');
            return null;
        }

        return eyePop.getBiggestPerson();
    },

    getOutline: () =>
    {
        const { eyePop } = get();

        if (!eyePop)
        {
            console.error('EyePop.ai not yet initialized. Please call initialize() first');
            return null;
        }

        return eyePop.getOutline();
    }


}));
