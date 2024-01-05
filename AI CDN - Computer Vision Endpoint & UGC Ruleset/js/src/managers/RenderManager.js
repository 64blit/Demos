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
        this.heatmapPass = null;
        this.copyPass = null;

        this.renderer = null;
        this.finalComposer = null;
        this.bloomPass = null;
        this.time = 0;
        this.showHeatmap = true;
        this.heatmapPoints = [];
        this.maxHeatmapPoints = 10000;

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

    toggleHeatmap()
    {
        this.showHeatmap = !this.showHeatmap;
        this.heatmapPass.uniforms.uShowHeatmap.value = this.showHeatmap ? 1.0 : 0.0;
    }

    updateHeatmapPoints(points)
    {
        if (!this.heatmapPass) return;

        this.heatmapPoints = points.slice(0, this.maxHeatmapPoints);

        // if the heatmap points length is less than this.maxHeatmapPoints, fill it with 0s until it is this.maxHeatmapPoints
        if (this.heatmapPoints.length < this.maxHeatmapPoints)
        {
            const diff = this.maxHeatmapPoints - this.heatmapPoints.length;
            for (let i = 0; i < diff; i++)
            {
                this.heatmapPoints.push(new THREE.Vector3(-1000, -1000, -1000));
            }
        }

        this.heatmapPass.uniforms.uPoints.value = this.heatmapPoints;
        this.heatmapPass.uniforms.uPointsLength.value = this.heatmapPoints.length - 1;
    }

    getDimensions()
    {
        return {
            width: this.width,
            height: this.height
        }
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

            scope.setupRenderer();
            scope.setupPostEffects();
            scope.onWindowResized();
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

    resetScene()
    {
        this.scene.children.forEach((child) =>
        {
            child.traverse((node) =>
            {
                if (node.type == "Mesh")
                {
                    node.position.x = -1000;
                    node.position.y = -1000;
                }
            });

        });
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


        this.heatmapPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                uPoints: { value: null }, // array of x,y coordinates
                uPointsLength: { value: 0 }, // array of x,y coordinates
                uGridSize: { value: .01 }, // size of the grid
                uShowHeatmap: { value: this.showHeatmap ? 1.0 : 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader:
                `#define POINTSMAX 1000
                uniform sampler2D tDiffuse;
                uniform int uPointsLength;
                uniform vec3 uPoints[POINTSMAX];
                uniform float uGridSize;
                uniform float uShowHeatmap;

                varying vec2 vUv;
                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    float maxPoints = 0.0;
                    float gridX = floor(vUv.x * uGridSize);
                    float gridY = floor(vUv.y * uGridSize);
                    for (int i = 0; i < uPointsLength; i++) {
                        float pointX = floor(uPoints[i].x * uGridSize);
                        float pointY = floor(uPoints[i].y * uGridSize);
                        if (gridX == pointX && gridY == pointY) {
                            maxPoints += 1.0;
                        }
                    }

                    if (uShowHeatmap == 1.0) {
                        texel.r = mix(texel.r,  maxPoints / 100.0, 0.5);
                    }
                    
                    gl_FragColor = texel;
                }
            `
        });

        // Add the shader pass to the composer

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.finalComposer.setSize(this.width, this.height);

        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(this.copyPass);
        this.finalComposer.addPass(this.heatmapPass);
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

        // if the video restarts, reset the time
        if (this.time == 0)
        {
            this.resetScene();
        }

        if (!this.finalComposer) return;
        this.finalComposer.render();

    }
}
