import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';

interface PersonSegmentationProps
{
    segmentationMask: number[];
    maskWidth: number;
    maskHeight: number;
}

const PersonSegmentation: React.FC<PersonSegmentationProps> = ({ segmentationMask, maskWidth, maskHeight }) =>
{
    const { videoTexture, aspectRatio } = useSceneStore(); // replace with your store

    const material = useMemo(() =>
    {
        return new THREE.ShaderMaterial({
            uniforms: {
                personTexture: { value: videoTexture },
                mask: { value: new THREE.DataTexture(segmentationMask, maskWidth, maskHeight, THREE.LuminanceFormat) }
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
                if (maskValue.r < 0.5) discard; // adjust threshold based on your mask values
                gl_FragColor = texture2D(personTexture, vUv);
            }
            `
        });
    }, [ videoTexture, segmentationMask, maskWidth, maskHeight ]);


    return (
        <>

            <mesh material={material}>

                <planeGeometry args={[ aspectRatio, 1 ]} />

            </mesh >

        </>
    );
};

export default PersonSegmentation;
