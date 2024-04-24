import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useEyePop } from '../hook/EyePopContext';
import { Render2d } from '@eyepop.ai/eyepop-render-2d';
import * as THREE from 'three';
import { normalizePosition } from '../utils/BaseUtils';

const UIOverlay = () =>
{
    const { prediction, videoRef, getVehicles, isCollision } = useEyePop();

    const { invalidate } = useThree();

    const [ canvas, setCanvas ] = useState(null);
    const [ ctx, setCtx ] = useState(null);
    const [ aspect, setAspect ] = useState(1);

    const [ canvasTexture, setCanvasTexture ] = useState(null);
    const [ videoTexture, setVideoTexture ] = useState(null);
    const [ eyePopRenderer, setEyePopRenderer ] = useState(null);
    const [ shaderMaterial, setShaderMaterial ] = useState(null);

    const collisionMesh1Ref = useRef();
    const collisionMesh2Ref = useRef();

    let lastTime = -99.0;
    let collisionOutlines = [];
    let vehicleArrows = [];


    const setupCavas = () =>
    {

        let tempCanvas = document.createElement('canvas');
        tempCanvas.id = 'maskCanvas';
        document.body.appendChild(tempCanvas);
        tempCanvas.style.display = 'none';
        tempCanvas.width = videoRef.current.videoWidth;
        tempCanvas.height = videoRef.current.videoHeight;


        const maskCtx = tempCanvas.getContext('2d');
        maskCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

        const tempCanvasTexture = new THREE.CanvasTexture(tempCanvas);
        tempCanvasTexture.needsUpdate = true;

        const texture = new THREE.VideoTexture(videoRef.current);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;

        setVideoTexture(texture);
        setCtx(maskCtx);
        setCanvas(tempCanvas);
        setCanvasTexture(tempCanvasTexture);
        setAspect(videoRef.current.videoWidth / videoRef.current.videoHeight);


        // Use the eyepop renderer to draw the closest prediction
        const renderer = Render2d.renderer(maskCtx, [
            Render2d.renderBox(true),
            // Render2d.renderTrail(1.0,
            // '$..keyPoints[?(@.category=="3d-body-points")].points[?(@.classLabel.includes("nose"))]')
        ]);

        setEyePopRenderer(renderer);

        return { eyePopTexture: tempCanvasTexture, videoTexture: texture };
    }
    const setupShaderMaterial = (videoTex, canvasTex) =>
    {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                videoTexture: { value: videoTex },
                eyePopTexture: { value: canvasTex }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
            fragmentShader: `
            uniform sampler2D videoTexture;
            uniform sampler2D eyePopTexture;
            varying vec2 vUv;
            void main() {
                vec4 overlay = texture2D(eyePopTexture, vUv);
                gl_FragColor = mix(texture2D(videoTexture, vUv), overlay, 0.5);
            }
            `,
            transparent: true,
            side: THREE.DoubleSide,

        })

        setShaderMaterial(material)
    }


    useFrame(() =>
    {
        if (!videoRef.current) { return; }
        if (videoRef.current.readyState < 2) { return; }
        if (videoRef.current.currentTime === lastTime) { return; }

        lastTime = videoRef.current.currentTime;

        if (!canvas)
        {
            const textures = setupCavas();
            setupShaderMaterial(textures.videoTexture, textures.eyePopTexture);
        }

        if (!prediction) return;
        if (!canvas) return;
        if (!ctx) return;
        if (!eyePopRenderer) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const vehicles = getVehicles();

        vehicleArrows = [];
        collisionOutlines = [];

        for (const vehicle of vehicles)
        {

            if (vehicle.collisionFactor >= 0)
            {
                // draw on the ctx an arrow pointing in the direction of the vehicle velocity and a rectangle around the vehicle
                ctx.strokeStyle = 'red';
                ctx.beginPath();
                ctx.rect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);

                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.strokeStyle = 'green';
                ctx.beginPath();
                ctx.moveTo(vehicle.x + vehicle.width / 2, vehicle.y + vehicle.height / 2);
                ctx.lineTo(vehicle.x + vehicle.width / 2 + vehicle.velocity.x, vehicle.y + vehicle.height / 2 + vehicle.velocity.y);

                // draws the arrow tip
                const angle = Math.atan2(vehicle.velocity.y, vehicle.velocity.x);
                ctx.lineTo(vehicle.x + vehicle.width / 2 + vehicle.velocity.x - 10 * Math.cos(angle - Math.PI / 6), vehicle.y + vehicle.height / 2 + vehicle.velocity.y - 10 * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(vehicle.x + vehicle.width / 2 + vehicle.velocity.x, vehicle.y + vehicle.height / 2 + vehicle.velocity.y);
                ctx.lineTo(vehicle.x + vehicle.width / 2 + vehicle.velocity.x - 10 * Math.cos(angle + Math.PI / 6), vehicle.y + vehicle.height / 2 + vehicle.velocity.y - 10 * Math.sin(angle + Math.PI / 6));
                ctx.lineWidth = 3;
                ctx.stroke();

            }

        }

        eyePopRenderer.draw(prediction);

        shaderMaterial.needsUpdate = true;
        shaderMaterial.uniforms.videoTexture.value = videoTexture;
        shaderMaterial.uniforms.eyePopTexture.value = canvasTexture;
        shaderMaterial.uniforms.videoTexture.value.needsUpdate = true;
        shaderMaterial.uniforms.eyePopTexture.value.needsUpdate = true;


    })

    return (
        <>
            {aspect && shaderMaterial &&
                <mesh position={[ 0, 0, 0.01 ]} material={shaderMaterial} onClick={() => { videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause() }}>
                    <planeGeometry args={[ aspect, 1, 1 ]} />
                </mesh >
            }

            <group >

                {/* {collisionOutlines.map((outline, index) => (
                    <line key={index} >
                        <geometry attach="geometry" vertices={outline} />
                        <lineBasicMaterial attach="material" color="red" />
                    </line>
                ))}

                {vehicleArrows.map((arrow, index) => (
                    <arrowHelper key={index} args={arrow} />
                ))} */}

                {/* <mesh ref={collisionMesh2Ref} position={[ 0, 0, .01 ]} >
                    <planeGeometry />
                    <meshBasicMaterial color="green" wireframe={true} />
                </mesh>

                <mesh ref={collisionMesh1Ref} position={[ 0, 0, .01 ]} >
                    <planeGeometry />
                    <meshBasicMaterial color="red" wireframe={true} />
                </mesh> */}

            </group>
        </>
    );
};

export default UIOverlay;
