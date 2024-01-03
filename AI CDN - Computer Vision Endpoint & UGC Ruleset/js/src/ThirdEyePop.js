import SceneBuilder from './builders/SceneBuilder.js';
import RenderManager from './managers/RenderManager.js';
import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module.js';
import * as THREE from 'https://unpkg.com/three/build/three.module.js';


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
        frameData = null
    })
    {
        console.log("ThirdEyePop constructor");
        console.log("DEBUG: ", DEBUG);
        console.log("canvas: ", canvas);
        console.log("frameData: ", frameData);

        window.DEBUG_thirdEyePop = DEBUG;

        let scope = this
        let renderManager = null;
        let clock = null
        let deltaTime = null
        let stats = null
        let canvasNeedsReset = false

        // ///////////////////// SETUP /////////////////////////////
        async function setup()
        {
            DEBUG && setupDebuggingTools();

            initManagers();
            initEventListeners();
        }

        function initManagers()
        {
            // Setup managers
            clock = new THREE.Clock();
            renderManager = new RenderManager(
                canvas,
                videoUrl
            );
        }


        function initEventListeners()
        {
            window.addEventListener('keydown', event =>
            {
                if (event.key == "ArrowLeft")
                {
                    console.log("Left key");
                } else if (event.key == "ArrowRight")
                {
                    console.log("Right key");
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
            }

            addScript(
                'https://markknol.github.io/console-log-viewer/console-log-viewer.js?align=bottom?minimized=true'
            )
            stats = new Stats()
            stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(stats.dom)

        }

        // Main loop
        function render()
        {
            DEBUG && stats.begin()

            deltaTime = clock.getDelta();

            // Update managers
            renderManager.render()

            resetCanvas(false);

            DEBUG && stats.end();
            requestAnimationFrame(render);
        }


        function resetCanvas()
        {
            if (!canvasNeedsReset) return;

            canvasNeedsReset = false;
            renderManager.reset()
        }

        // //////////////////// end SETUP /////////////////////////////


        // //////////////////// API /////////////////////////////

        scope.setup = setup;
        scope.render = render;

        // //////////////////// end API /////////////////////////////

    }
}

