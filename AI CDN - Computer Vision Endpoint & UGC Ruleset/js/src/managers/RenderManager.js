import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { UnrealBloomPass } from 'https://unpkg.com/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'https://unpkg.com/three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'https://unpkg.com/three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'https://unpkg.com/three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'https://unpkg.com/three/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'https://unpkg.com/three/examples/jsm/shaders/GammaCorrectionShader.js';

export default class RenderManager
{
    constructor(canvas, videoUrl, params = {
        fov: 45,
        postEffects: {
            enabled: true,
            antialias: {
                enabled: true
            },
            bloom: {
                enabled: true,
                strength: 1.5,
                radius: 0.4,
                threshold: 0.85,
                exposure: 1
            }
        }
    })
    {
        THREE.Cache.enabled = true
        this.canvas = canvas;
        this.copyPass = null;

        console.log("RenderManager constructor");
        console.log("canvas: ", canvas);

        if (!this.canvas)
        {
            console.error(' ..... Canvas not found. Make sure this element is valid:, ', canvas)
        }


        this.isPostEffectsEnabled = params.postEffects.enabled;
        this.isAntialiasEnabled = params.postEffects.antialias.enabled && this.isPostEffectsEnabled;

        this.width = this.canvas.clientWidth
        this.height = this.canvas.clientHeight

        this.camera = new THREE.PerspectiveCamera(params.fov, this.width / this.height, 0.1, 10000);
        this.camera.position.set(0, 0, -10);
        this.camera.lookAt(0, 0, 0);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0, 0, 0, 0);

        //render the video url to a texture
        this.video = document.createElement('video');
        this.video.playsInline = true;
        this.video.crossOrigin = "Anonymous";
        this.video.loop = true;
        this.video.preload = "auto";
        this.video.autoplay = false;
        this.video.volume = 1;
        this.video.src = videoUrl;

        const scope = this;

        this.video.addEventListener('canplay', () =>
        {
            scope.videoTexture = new THREE.VideoTexture(scope.video);
            scope.videoTexture.minFilter = THREE.LinearFilter;
            scope.videoTexture.magFilter = THREE.LinearFilter;

            // const testMaterial = new THREE.ShaderMaterial({
            //     uniforms: {
            //         tDiffuse: { value: scope.videoTexture },
            //     },
            //     vertexShader: `
            //         varying vec2 vUv;
            //         void main() {
            //             vUv = uv;
            //             gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            //     }`,
            //     fragmentShader: `
            //         uniform sampler2D tDiffuse;
            //         varying vec2 vUv;
            //         void main() {
            //             vec4 texel = texture2D( tDiffuse, vUv );
            //             gl_FragColor = texel;
            //     }`
            //     , side: THREE.DoubleSide
            // });

            this.video.play();

            // // add a plane to the scene colored green
            // const planeGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);

            // const plane = new THREE.Mesh(planeGeometry, testMaterial);
            // plane.position.set(0, 0, 0);
            // this.scene.add(plane);
        });



        this.renderer = null;
        this.finalComposer = null;
        this.bloomPass = null;

        this.setupRenderer();

        if (!this.isPostEffectsEnabled)
        {
            return;
        }

        this.setupPostEffects();
    }

    setupRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true,
            antialias: this.isAntialiasEnabled,
        })
        this.renderer.shadowMap.enabled = false;
        this.renderer.toneMapping = THREE.NoToneMapping;

        this.camera.layers.enableAll();

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    // TODO: modularize post effects and split this into multiple functions
    setupPostEffects()
    {
        const renderScene = new RenderPass(this.scene, this.camera)

        // A pass that copies the texture on the bufferCanvas to the main canvas
        this.copyPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: this.videoTexture },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                void main() {
                    vec4 texel = texture2D( tDiffuse, vUv );
                    gl_FragColor = texel;
                }`
            , side: THREE.DoubleSide
        });
        this.copyPass.renderToScreen = true

        this.finalComposer = new EffectComposer(this.renderer)
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.finalComposer.setSize(this.width, this.height)

        // this.renderer.domElement.style.width = this.width;
        // this.renderer.domElement.style.height = this.height;
        // this.renderer.domElement.width = this.width
        // this.renderer.domElement.height = this.height

        this.finalComposer.addPass(renderScene);
        // this.finalComposer.addPass(this.copyPass);
    }

    onWindowResized()
    {
        this.width = this.canvas.clientWidth
        this.height = this.canvas.clientHeight

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.width, this.height)

        this.renderer.domElement.style.width = this.width;
        this.renderer.domElement.style.height = this.height;
        this.renderer.domElement.width = this.width
        this.renderer.domElement.height = this.height

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        if (!this.isPostEffectsEnabled)
        {
            return
        }

        this.finalComposer.setSize(this.width, this.height)
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    reset()
    {
        this.onWindowResized()
    }

    render()
    {
        this.finalComposer.render();

        if (!this.videoTexture) return;
        this.videoTexture.needsUpdate = true;
    }
}
