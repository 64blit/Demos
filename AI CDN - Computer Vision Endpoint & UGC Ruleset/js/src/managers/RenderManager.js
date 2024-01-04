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

        this.renderer = null;
        this.finalComposer = null;
        this.bloomPass = null;
        this.time = 0;

        console.log("RenderManager constructor");


        if (!this.canvas)
        {
            console.error(' ..... Canvas not found. Make sure this element is valid:, ', canvas)
        }


        this.isPostEffectsEnabled = params.postEffects.enabled;
        this.isAntialiasEnabled = params.postEffects.antialias.enabled && this.isPostEffectsEnabled;

        this.width = this.canvas.clientWidth
        this.height = this.canvas.clientHeight

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
        // Calculate the aspect ratio of the canvas

        // Adjust the camera's frustum planes
        this.camera.left = -1;
        this.camera.right = 1;
        this.camera.top = 1;
        this.camera.bottom = -1;

        // Update the camera's projection matrix
        this.camera.updateProjectionMatrix();

        this.camera.position.set(0, 0, -10);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();
        this.video = null;
        this.videoTexture = null;
        this.setupVideo(videoUrl);
    }

    getCamera()
    {
        return this.camera;
    }

    getScene()
    {
        return this.scene;
    }

    setupVideo(videoUrl)
    {
        //render the video url to a texture
        this.video = document.createElement('video');
        this.video.playsInline = true;
        this.video.crossOrigin = "Anonymous";
        this.video.loop = true;
        this.video.preload = "auto";
        this.video.autoplay = false;
        this.video.volume = 1;
        this.video.src = videoUrl;
        this.video.load();
        this.video.play();

        const scope = this;

        this.video.addEventListener('loadedmetadata', () =>
        {
            scope.videoTexture = new THREE.VideoTexture(scope.video);
            scope.videoTexture.crossOrigin = "Anonymous";
            scope.videoTexture.minFilter = THREE.LinearFilter;
            scope.videoTexture.magFilter = THREE.LinearFilter;
            scope.videoTexture.generateMipmaps = false;
            scope.videoTexture.flipY = true;


            scope.width = scope.video.videoWidth;
            scope.height = scope.video.videoHeight;

            const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
            const plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ map: scope.videoTexture, side: THREE.DoubleSide }));
            // this.scene.add(plane);

            this.video.play();
            this.setupRenderer();
            this.setupPostEffects();
        });

    }

    pauseVideo()
    {
        if (this.video.paused) return;
        this.video.pause();
    }

    playVideo()
    {
        if (!this.video.paused) return;

        this.video.play();
    }

    setupRenderer()
    {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true,
            antialias: this.isAntialiasEnabled,
            alpha: true,
        });

        this.renderer.shadowMap.enabled = false;
        this.renderer.toneMapping = THREE.NoToneMapping;

        this.camera.layers.enableAll();
        // Calculate the aspect ratio of the canvas

        // Adjust the camera's frustum planes
        this.camera.left = -1;
        this.camera.right = 1;
        this.camera.top = 1;
        this.camera.bottom = -1;

        // Update the camera's projection matrix
        this.camera.updateProjectionMatrix();

        const clientAspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const videoAspect = this.video.videoWidth / this.video.videoHeight;

        this.width = this.canvas.clientWidth * (videoAspect / clientAspect);
        this.height = this.canvas.clientHeight * (clientAspect / videoAspect);

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    onWindowResized()
    {
        const clientAspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const videoAspect = this.video.videoWidth / this.video.videoHeight;

        this.width = this.canvas.clientWidth * (videoAspect / clientAspect);
        this.height = this.canvas.clientHeight * (clientAspect / videoAspect);

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);

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
        this.onWindowResized();
    }

    // TODO: modularize post effects and split this into multiple functions
    setupPostEffects()
    {
        const renderScene = new RenderPass(this.scene, this.camera);
        // A pass that copies the texture on the bufferCanvas to the main canvas
        this.copyPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                tImage: { value: this.videoTexture },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tImage;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    vec4 texelSrc = texture2D( tImage, vUv );
                    vec4 texel = texture2D( tDiffuse, vUv );

                    texel = mix(texelSrc, texel, texel.a);

                    gl_FragColor = texel; // RGBA color

                }`
        });

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.finalComposer.setSize(this.width, this.height);

        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(this.copyPass);
    }

    getVideoTime()
    {
        return this.time;
    }

    setTime(time)
    {
        if (!this.video) return;

        if (time < 0) time = 0;
        if (time > this.video.duration) time = this.video.duration;

        this.video.currentTime = time;
    }

    render()
    {
        if (this.videoTexture)
        {
            this.videoTexture.needsUpdate = true;
            this.copyPass.uniforms.tDiffuse.value = this.videoTexture;
            this.time = this.video.currentTime;
        }

        if (!this.finalComposer) return;
        this.finalComposer.render();

    }
}
