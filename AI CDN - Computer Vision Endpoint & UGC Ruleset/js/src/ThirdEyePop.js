import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module.js';
import RenderManager from './managers/RenderManager.js';
import PredictionDataManager from './managers/PredictionDataManager.js';
import SceneManager from './managers/SceneManager.js';

// "objects":
//     [
//         {
//         "classLabel": "person",
//         "keyPoints": [
//          {
//           "classLabel": "left eye",
//           "x":0.5, "y":0.5,
//           "confidence":0.5
//          }
//          ]
//         }
//      ]
//  }
//]
export default class ThirdEyePop
{
    constructor({
        DEBUG = true,
        canvas = null,
        videoUrl = null,
        frameData = []
    })
    {
        console.log("ThirdEyePop constructor");
        console.log("DEBUG: ", DEBUG);
        console.log("canvas: ", canvas);
        console.log("frameData: ", frameData);

        window.DEBUG_thirdEyePop = DEBUG;
        let scope = this;
        let renderManager = null;
        let predictionDataManager = null;
        let sceneManager = null;

        let stats = null;
        let canvasNeedsReset = false
        let autoRender = frameData.length > 0 ? true : false;

        let time = 0;
        let currentFrame = null;

        // ///////////////////// SETUP /////////////////////////////
        async function setup()
        {
            DEBUG && setupDebuggingTools();

            initManagers();
            initEventListeners();

            autoRender && render();
        }

        function initManagers()
        {
            renderManager = new RenderManager(
                canvas,
                videoUrl
            );

            predictionDataManager = new PredictionDataManager(frameData);

            sceneManager = new SceneManager(renderManager.getScene(), renderManager.getCamera());
        }


        function initEventListeners()
        {
            window.addEventListener('keydown', event =>
            {
                if (event.key == "ArrowLeft")
                {
                    console.log("Left key");
                    renderManager.setTime(renderManager.getTime() - 1);
                } else if (event.key == "ArrowRight")
                {
                    console.log("Right key");
                    renderManager.setTime(renderManager.getTime() + 1);
                } else if (event.key == "-")
                {
                    setupDebuggingTools()
                }
            })

            // let resizeTimeout
            window.addEventListener(
                'resize',
                () =>
                {
                    // Resetting in this callback created a memory leak, instancing multiple scenes in the background.
                    //   A flag fixes this.
                    // clearTimeout(resizeTimeout)
                    // resizeTimeout = setTimeout(() =>
                    // {
                    canvasNeedsReset = true;
                    // }, 100)
                },
                true
            )

        }

        function setupDebuggingTools()
        {
            if (!DEBUG) return;


            function addScript(src)
            {
                var s = document.createElement('script')
                s.setAttribute('src', src)
                s.async = true
                document.body.appendChild(s)
            };

            addScript(
                'https://markknol.github.io/console-log-viewer/console-log-viewer.js?align=bottom?minimized=true'
            );
            stats = new Stats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom);

        }

        function bufferVideo()
        {

            // Pause video to buffer more prediction frames
            if (Math.abs(predictionDataManager.getCurrentFrameTime() - time) > 0.1)
            {
                renderManager.pauseVideo();
            } else
            {
                renderManager.playVideo();
            }


        }


        function resetCanvas()
        {


            if (!canvasNeedsReset) return;

            canvasNeedsReset = false;
            renderManager.reset();


        }


        function pushFrameData(frame)
        {
            predictionDataManager.pushFrameData(frame);
        }


        // Main loop
        function render()
        {


            DEBUG && stats.begin();

            time = renderManager.getVideoTime();

            // This is where we handle the rendering, including video playback
            renderManager.render();

            // This is a simple data frame manager
            predictionDataManager.setCurrentFrame(time);

            // This is where we draw and manage meshes
            sceneManager.update(
                predictionDataManager.getCurrentFrame()
            );


            // We buffer video if we need more prediction frames
            bufferVideo();

            // We also reset the canvas when window size changes
            resetCanvas(false);

            autoRender && requestAnimationFrame(render);
            DEBUG && stats.end();


        }


        // //////////////////// end SETUP /////////////////////////////


        // //////////////////// API /////////////////////////////

        scope.setup = setup;
        scope.render = render;
        scope.pushFrameData = pushFrameData;

        // //////////////////// end API /////////////////////////////

    }
}

