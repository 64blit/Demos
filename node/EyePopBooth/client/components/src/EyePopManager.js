import { EyePop } from "@eyepop.ai/eyepop";
import { Render2d } from "@eyepop.ai/eyepop-render-2d";
export default class EyePopManager
{
    static instance = null;
    static popComps = {
        "model1": "people+common-objects",
        "model2": "people+2d-body-pose",
        "model3": "people+3d-pose+hands+face"
    };

    constructor(resultCanvasRef, videoRef, popNameRef, startButtonRef, setters = { setProgress, setLoading, setJSON })
    {
        if (EyePopManager.instance)
        {
            return EyePopManager.instance;
        }

        this.startButtonRef = startButtonRef.current;
        this.resultCanvasRef = resultCanvasRef.current;
        this.videoRef = videoRef.current;
        this.popNameElement = popNameRef.current;

        this.endpoint = undefined;
        this.popSession = undefined;
        this.popPlotter = undefined;
        this.popLiveIngress = undefined;
        this.context = undefined;

        this.webcam = undefined;

        this.predictionData = [];

        this.setProgress = setters.setProgress;
        this.setLoading = setters.setLoading;
        this.setJSON = setters.setJSON;

        this.stop = false;
        this.isJobRunning = false;

        this.getWebcam();
        this.setProgress(0);
        this.setLoading(true);

        this.setup();

        EyePopManager.instance = this;
    }

    async getWebcam()
    {
        // A hack to get the webcam devices listed if they do not appear
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) =>
        {

            stream.getTracks().forEach((track) =>
            {
                track.stop();
            });

        });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const webcamDevices = devices.filter(device => device.kind === 'videoinput');

        this.setWebcam(webcamDevices[ 0 ].deviceId);
    }

    setWebcam(deviceID)
    {
        this.webcam = { id: deviceID };
    }

    setErrorMessage(message)
    {
        this.popNameElement.innerHTML = message;
        this.popNameElement.classList = [];
        this.popNameElement.classList.add('w-full', 'text-center', 'text-red-800', 'font-bold', 'text-sm', 'overflow-y-scroll', 'h-44', 'select-text');

        const parent = this.popNameElement.parentElement;
        const copy = this.popNameElement.cloneNode(true);

        console.log(parent)
        // remove all children from the parent without a loop
        parent.innerHTML = '';

        // make a clone of popNameElement and append it to the parent
        parent.appendChild(copy);
        parent.classList.remove('h-full')
        parent.classList.add('bg-black', 'h-44');

    }

    async toggleStart()
    {
        console.log('Starting');
        const scope = EyePopManager.instance;

        // if it's not running, start it
        if (!scope.isJobRunning)
        {
            await scope.startWebcamIngress();
            scope.startButtonRef.innerHTML = "Stop";
            scope.setLoading(false);
            return;
        }

        scope.setLoading(true);
        scope.startButtonRef.innerHTML = "Start";
        await scope.popLiveIngress.close();

        scope.webcam.stream.getTracks()
            .forEach((track) =>
            {
                track.stop();
            });

        scope.isJobRunning = false;
        scope.setLoading(false);
    }

    async setModel(model)
    {

        const scope = EyePopManager.instance;
        if (!scope.endpoint) return;

        await scope.endpoint.changePopComp(popComp[ model ]);
    }

    async setup()
    {

        this.popNameElement.innerHTML = "Loading...";

        const isAuthenticated = await this.authenticate();
        const isConnected = await this.connect();

        if (!isAuthenticated || !isConnected)
        {
            this.setErrorMessage("Error authenticating you pop...");
            return;
        }

        this.context = this.resultCanvasRef.getContext("2d");
        this.popPlotter = Render2d.renderer(this.context, [
            Render2d.renderBox(true),
            Render2d.renderPose(),
            Render2d.renderFace(),
            Render2d.renderHand(),
            Render2d.renderTrail(1.0,
                '$..keyPoints[?(@.category=="3d-body-points")].points[?(@.classLabel.includes("shoulder"))]')
        ]);

        this.setLoading(false);

        console.log("Pop Manager setup complete. ", this.popSession);
        this.toggleStart();
    }

    async authenticate()
    {
        try
        {
            const response = await fetch('/eyepop/session');
            const data = await response.json();

            console.log('Created new EyePop session:', data);
            this.popSession = data;

            if ('error' in this.popSession)
            {
                this.setErrorMessage("Authentication Failed... " + JSON.stringify(data));
                return false;
            }

            return true;

        } catch (error)
        {
            console.error('Authentication failed:', error);

            this.setErrorMessage("Authentication Error... " + error);

            return false;
        }
    }

    async connect()
    {
        if (this.endpoint) return false;
        if (!this.popSession) return false;

        try
        {

            this.endpoint = await EyePop.endpoint({
                auth: { session: this.popSession },
                popId: this.popUUID
            }).onStateChanged((from, to) =>
            {
                console.log("Endpoint state transition from " + from + " to " + to);
            }).onIngressEvent((ingressEvent) =>
            {
                console.log(ingressEvent);
            }).connect();

            this.popNameElement.innerHTML = this.endpoint.popName();

            return true;

        } catch (error)
        {

            console.error('Connection failed:', error);
            this.setErrorMessage("Connection Error..." + JSON.stringify(error));
            return false;

        }
    }

    async startWebcamIngress()
    {
        const scope = EyePopManager.instance;
        console.log('Starting webcam ingress...');
        console.log('Webcam:', scope.webcam);
        scope.isJobRunning = true;
        scope.webcam.stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: scope.webcam.id } });
        scope.videoRef.srcObject = scope.webcam.stream;
        scope.videoRef.play();

        try
        {
            scope.popLiveIngress = await scope.endpoint.liveIngress(scope.webcam.stream);
            scope.endpoint.process({ ingressId: scope.popLiveIngress.ingressId() })
                .then(async (results) =>
                {
                    for await (let result of results)
                    {
                        // console.log(result);
                        scope.setJSON(result);
                        this.drawPrediction(result);
                    }
                });
        } catch (error)
        {
            console.error("Failed to call liveIngress:", error);
        }
    }


    drawPrediction(result)
    {
        if (!this.context) return;
        if (!result) return;

        this.resultCanvasRef.width = result.source_width;
        this.resultCanvasRef.height = result.source_height;
        this.context.clearRect(0, 0, this.resultCanvasRef.width, this.resultCanvasRef.height);

        // draw the video frame
        this.context.drawImage(this.videoRef, 0, 0, this.resultCanvasRef.width, this.resultCanvasRef.height);

        this.popPlotter.draw(result);
    }

    getClosestPrediction(time)
    {
        if (this.predictionData.length === 0) return;

        let closest = this.predictionData[ 0 ];
        let closestDifference = Math.abs(this.predictionData[ 0 ].seconds - time);

        for (let i = 0; i < this.predictionData.length; i++)
        {
            const diff = Math.abs(this.predictionData[ i ].seconds - time);
            closestDifference = Math.abs(closest.seconds - time);

            if (diff < closestDifference)
            {
                closest = this.predictionData[ i ];
            }


        }

        console.log('Closest prediction: ', closestDifference, closest.seconds, time);

        return closest;
    }

    getVideoDuration(video)
    {
        return new Promise((resolve) =>
        {
            video.onloadedmetadata = () =>
            {
                video.pause();
                resolve(video.duration);
            };
        });
    }


    disconnect()
    {
        this.endpoint.disconnect();
    }

}
