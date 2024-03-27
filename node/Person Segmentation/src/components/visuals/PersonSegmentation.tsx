import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import { useEyePop } from '../../EyePopWrapper';


const PersonSegmentation: React.FC = () =>
{

    const { aspectRatio, segMask, width, height } = useSceneStore(); // replace with your store
    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const { webcamVideo } = useEyePop();


    useEffect(() =>
    {
        if (videoTexture) return;
        if (!webcamVideo) return;
        if (!webcamVideo.width) return;
        if (!webcamVideo.height) return;

        const texture = new THREE.VideoTexture(webcamVideo);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        setVideoTexture(texture);
    }, [ videoTexture, webcamVideo ]);

    // Ray-casting algorithm to check if a point is inside a polygon
    function isInside(point, polygon)
    {
        const x = point.x, y = point.y;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++)
        {
            const xi = polygon[ i ].x, yi = polygon[ i ].y;
            const xj = polygon[ j ].x, yj = polygon[ j ].y;
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    const createDataTexture = (width, height, points) =>
    {
        // Assuming points is an array of {x, y} objects forming a polygon
        const data = new Uint8Array(width * height * 4);

        for (let i = 0; i < width; i++)
        {
            for (let j = 0; j < height; j++)
            {
                const index = (i + j * width) * 4;


                if (isInside({ x: i, y: j }, points))
                {
                    data[ index ] = 255; // Red component
                    data[ index + 1 ] = 255; // Green component
                    data[ index + 2 ] = 255; // Blue component
                    data[ index + 3 ] = 255; // Alpha component
                }
            }
        }

        return new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    }


    const material = useMemo(() =>
    {
        return new THREE.ShaderMaterial({
            uniforms: {
                personTexture: { value: null },
                mask: { value: null }
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
                gl_FragColor = maskValue;
                // if (maskValue.r < 0.5) discard; // adjust threshold based on your mask values
                // gl_FragColor = texture2D(personTexture, vUv);
            }
            `
        });
    }, []);

    useEffect(() =>
    {
        if (!material) return;
        if (!videoTexture) return;
        if (!segMask) return;
        if (!width) return;
        if (!height) return;

        console.log('updating material', segMask.length);

        material.uniforms.personTexture.value = videoTexture;
        material.uniforms.mask.value = createDataTexture(width, height, segMask);
        material.needsUpdate = true;

    }, [ videoTexture, segMask, width, height, material ]);

    return (
        <>

            <mesh material={material} >

                <planeGeometry args={[ aspectRatio, 1, 1 ]} />

            </mesh >

        </>
    );
};

export default PersonSegmentation;
