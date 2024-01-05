import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://unpkg.com/dat.gui/build/dat.gui.module.js';
import RenderManager from './managers/RenderManager.js';
import PredictionDataManager from './managers/PredictionDataManager.js';
import SceneManager from './managers/SceneManager.js';


// TODO: 
//   - Add workflow for dispose and reset of objects
//   - 
//   - 

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

        let videoTime = 0;
        let pause = false;

        // ///////////////////// SETUP /////////////////////////////
        async function setup()
        {
            initManagers();
            initEventListeners();

            DEBUG && setupDebuggingTools();
            autoRender && render();
        }

        function initManagers()
        {
            renderManager = new RenderManager(
                canvas,
                videoUrl
            );

            predictionDataManager = new PredictionDataManager(frameData);

            sceneManager = new SceneManager(renderManager.getScene(), renderManager.getCamera(), renderManager.getDimensions());
        }


        function initEventListeners()
        {
            window.addEventListener('keydown', event =>
            {
                if (event.key == "ArrowLeft")
                {
                    console.log("Skip Backwards 1s");
                    renderManager.setTime(renderManager.getVideoTime() - 1);
                } else if (event.key == "ArrowRight")
                {
                    console.log("Skip Forwards 1s");
                    renderManager.setTime(renderManager.getVideoTime() + 1);
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

            const gui = new GUI();
            var playObj = { Play: function () { pause = false; renderManager.playVideo(); } };
            var pauseObj = { Pause: function () { pause = true; renderManager.playVideo(); } };
            var heatMapObj = { ToggleHeatmap: function () { renderManager.toggleHeatmap() } };

            gui.add(renderManager.video, 'currentTime', 0, renderManager.video.duration).name('Video Time');
            gui.add(playObj, 'Play');
            gui.add(pauseObj, 'Pause');
            gui.add(heatMapObj, 'ToggleHeatmap');


        }

        function bufferVideo()
        {
            // check if we need to buffer video

            // If we are more than 0.1 seconds away from the current frame
            // or if the last frame videoTime is greater than the video videoTime
            // then we need to buffer more video

            const currentFrameTime = predictionDataManager.getCurrentFrameTime();
            const onlyHaveOldFrames = Math.abs(currentFrameTime - videoTime) > 0.1;
            const needsMoreFrames = predictionDataManager.getLastFrameTime() < videoTime;
            const videoPlaying = renderManager.video.duration <= videoTime - 1;


            if (videoPlaying && needsMoreFrames && onlyHaveOldFrames)
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
            if (!renderManager) return;

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
            if (pause)
            {
                autoRender && requestAnimationFrame(render);
                return;
            }

            DEBUG && stats.begin();

            videoTime = renderManager.getVideoTime();

            // This is where we handle the rendering, including video playback
            renderManager.render();

            // This is a simple data frame manager
            predictionDataManager.setCurrentFrame(videoTime);

            // This is where we draw and manage meshes
            sceneManager.update(
                predictionDataManager.getCurrentFrame()
            );

            // Now we update the heatmap with the new path points
            renderManager.updateHeatmapPoints(
                sceneManager.getAllPathPoints()
            );

            // We buffer video if we need more prediction frames
            bufferVideo();

            // We also reset the canvas when window size changes
            resetCanvas();

            DEBUG && stats.end();

            autoRender && requestAnimationFrame(render);

        }


        // //////////////////// end SETUP /////////////////////////////


        // //////////////////// API /////////////////////////////

        scope.setup = setup;
        scope.render = render;
        scope.pushFrameData = pushFrameData;

        // //////////////////// end API /////////////////////////////

    }
}

