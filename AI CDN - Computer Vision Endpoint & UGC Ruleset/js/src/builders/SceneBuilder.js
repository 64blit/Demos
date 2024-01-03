// SceneBuilder.js adds to the threejs scene a plane with a VideoTexture material which matches the width and height of the dom canvas.
// It also adds a video element to the dom which is used to play the video stream.
import * as THREE from 'https://unpkg.com/three/build/three.module.js';

export default class SceneBuilder
{
    constructor(canvas)
    {
        this.canvas = canvas;
    }

    build()
    {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 1000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        // this.video = document.createElement('video');
        // this.video.setAttribute('autoplay', '');
        // this.video.setAttribute('playsinline', '');
        // this.video.setAttribute('muted', '');
        // this.video.setAttribute('loop', '');
        // this.video.setAttribute('id', 'ai-cdn-video');

        // this.videoTexture = new THREE.VideoTexture(this.video);
        // this.videoTexture.minFilter = THREE.LinearFilter;
        // this.videoTexture.magFilter = THREE.LinearFilter;
        // this.videoTexture.format = THREE.RGBFormat;

        // this.videoMaterial = new THREE.MeshBasicMaterial({ map: this.videoTexture });
        // this.videoMaterial.side = THREE.DoubleSide;

        // this.videoGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        // this.videoMesh = new THREE.Mesh(this.videoGeometry, this.videoMaterial);
        // this.videoMesh.position.set(0, 0, 0);
        // this.scene.add(this.videoMesh);

        // this.video.play();
    }

}
