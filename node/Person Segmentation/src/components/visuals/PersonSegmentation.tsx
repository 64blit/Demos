import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import { useEyePop } from '../../EyePopWrapper';
import { useFrame } from '@react-three/fiber';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';


const PersonSegmentation: React.FC = () =>
{

    const { aspectRatio } = useSceneStore(); // replace with your store
    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const [ canvas, setCanvas ] = useState<HTMLCanvasElement | null>(null);
    const [ ctx, setCtx ] = useState<CanvasRenderingContext2D | null>(null);
    const [ maskTexture, setMaskTexture ] = useState<THREE.CanvasTexture | null>(null);
    const [ material, setMaterial ] = useState<THREE.ShaderMaterial | null>(null);

    const { getOutline, isReady, webcamVideo, eyePop } = useEyePop();


    useFrame(() =>
    {
        if (!isReady) return;
        if (!material && !canvas && !ctx && !maskTexture && !videoTexture && webcamVideo.width && webcamVideo.height)
        {
            setup();
            return;
        }

        // The computer vision prediction result from the EyePop SDK
        const outline = getOutline();

        if (!outline) return;
        if (!outline.points) return;

        material.uniforms.personTexture.value = videoTexture;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(outline.points[ 0 ].x, outline.points[ 0 ].y);

        for (let i = 1; i < outline.points.length; i++)
        {
            ctx.lineTo(outline.points[ i ].x, outline.points[ i ].y);
        }

        ctx.closePath();
        ctx.fill();

        maskTexture.needsUpdate = true;
        videoTexture.needsUpdate = true;
        material.needsUpdate = true;
    });

    const setup = () =>
    {

        let canvas = document.getElementById('maskCanvas');

        if (!canvas)
        {
            canvas = document.createElement('canvas');
            canvas.id = 'maskCanvas';
            document.body.appendChild(canvas);
        }
        canvas.width = webcamVideo.width;
        canvas.height = webcamVideo.height;

        const maskCtx = canvas.getContext('2d');

        setCtx(maskCtx);
        setCanvas(canvas);

        // canvas.style.display = 'none';
        const tempMask = new THREE.CanvasTexture(canvas);

        setMaskTexture(tempMask);


        const texture = new THREE.VideoTexture(webcamVideo);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        setVideoTexture(texture);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                personTexture: { value: texture },
                mask: { value: tempMask }
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
            uniform sampler2D mask;
            varying vec2 vUv;
            void main() {
                vec4 maskValue = texture2D(mask, vUv);
                if (maskValue.r < 0.5) discard;
                gl_FragColor = texture2D(personTexture, vUv);
            }
            `,
            transparent: true,
            side: THREE.DoubleSide
        })

        setMaterial(material)
    }

    return (
        <>
            {material &&
                <mesh position={[ 0, 0, .1 ]} material={material} >

                    <planeGeometry args={[ aspectRatio, 1, 1 ]} />

                </mesh >
            }
        </>
    );
};

export default PersonSegmentation;
