import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import { useEyePop } from '../../EyePopWrapper';
import { useFrame, useThree } from '@react-three/fiber';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';
import gsap from 'gsap';
import { max } from 'three/examples/jsm/nodes/Nodes.js';


const PersonSegmentation: React.FC = () =>
{

    const { getOutline, isReady, webcamVideo } = useEyePop();
    const { aspectRatio } = useSceneStore();
    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const [ canvas, setCanvas ] = useState<HTMLCanvasElement | null>(null);
    const [ ctx, setCtx ] = useState<CanvasRenderingContext2D | null>(null);
    const [ maskTexture, setMaskTexture ] = useState<THREE.CanvasTexture | null>(null);
    const [ material, setMaterial ] = useState<THREE.ShaderMaterial | undefined>(undefined);
    const [ scale, setScale ] = useState<number>(1);
    const meshRef = useRef<THREE.Mesh>(null);

    const { invalidate } = useThree();

    useEffect(() =>
    {
        console.log('Person Segmentation', isReady);
        if (!isReady) return;

        if (!webcamVideo)
        {
            console.log('no webcam video');
            return;
        }

        let canvas = document.getElementById('maskCanvas');

        if (!canvas)
        {
            canvas = document.createElement('canvas');
            canvas.id = 'maskCanvas';
            document.body.appendChild(canvas);
        }

        // const maxWidth = 1280;
        // const maxHeight = 720;
        // const widthDifference = webcamVideo.width - maxWidth;
        // const heightDifference = webcamVideo.height - maxHeight;
        // const scale = widthDifference > heightDifference ? maxWidth / webcamVideo.width : maxHeight / webcamVideo.height;

        // canvas.width = maxWidth;
        // canvas.height = maxHeight;

        canvas.width = webcamVideo.width;
        canvas.height = webcamVideo.height;

        const maskCtx = canvas.getContext('2d');
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, canvas.width, canvas.height);

        setCtx(maskCtx);
        setCanvas(canvas);
        setScale(scale)

        canvas.style.display = 'none';
        const tempMask = new THREE.CanvasTexture(canvas);
        tempMask.needsUpdate = true;
        setMaskTexture(tempMask);

        const texture = new THREE.VideoTexture(webcamVideo);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        setVideoTexture(texture);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                personTexture: { value: texture },
                maskTexture: { value: tempMask }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
            fragmentShader: `
            uniform sampler2D personTexture;
            uniform sampler2D maskTexture;
            varying vec2 vUv;
            void main() {
                vec4 maskValue = texture2D(maskTexture, vUv);
                if (maskValue.r < 0.5) discard;
                gl_FragColor = texture2D(personTexture, vUv);
            }
            `,
            transparent: true,
            side: THREE.DoubleSide,

        })

        console.log('material created', material);
        setMaterial(material)
    }, [ webcamVideo, isReady ]);

    useFrame(() =>
    {
        if (!isReady) return

        // The computer vision prediction result from the EyePop SDK
        const outline = getOutline();

        if (!outline) return;
        if (!outline.points) return;

        if (outline.points.length < 10) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(outline.points[ 0 ].x, outline.points[ 0 ].y);

        for (let i = 1; i < outline.points.length; ++i)
        {
            ctx.lineTo(outline.points[ i ].x, outline.points[ i ].y);
        }

        ctx.closePath();
        ctx.fill();

        material.needsUpdate = true;
        material.uniforms.personTexture.value = videoTexture;
        material.uniforms.maskTexture.value = maskTexture;
        material.uniforms.personTexture.value.needsUpdate = true;
        material.uniforms.maskTexture.value.needsUpdate = true;

        // Here we force a redraw, for some reason the material doesn't update without this
        invalidate()
    });

    return (
        <>
            {material &&
                <mesh ref={meshRef} position={[ 0, 0, .01 ]} material={material}>
                    <planeGeometry args={[ aspectRatio, 1, 1 ]} />
                </mesh >
            }
        </>
    );
};

export default PersonSegmentation;
