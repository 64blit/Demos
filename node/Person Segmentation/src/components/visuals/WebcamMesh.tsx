import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEyePop } from '../../EyePopWrapper';
import { useFrame, useThree } from '@react-three/fiber';
import { useSceneStore } from '../../store/SceneStore';

// const fragmentShader = `
//   uniform sampler2D baseTexture;
//   uniform vec2 baseTextureSize;  
//   uniform float blurAmount;
//   varying vec2 vUv;
//   void main() {
//     vec2 blurSize = blurAmount / baseTextureSize;
//     vec4 color = vec4(0.0);
//     for(int i = -1; i <= 1; i++) {
//       for(int j = -1; j <= 1; j++) {
//         vec2 uv = vec2(vUv.x + float(i) * blurSize.x, vUv.y + float(j) * blurSize.y);
//         color += texture2D(baseTexture, uv);
//       }
//     }
//     color /= 9.0;
//     gl_FragColor = color;
//   }
// `;


const WebcamMesh: React.FC<WebcamMeshProps> = () =>
{
    const { camera, gl } = useThree();

    const { eyePop, webcamVideo } = useEyePop();
    const { aspectRatio, setAspectRatio, blurAmount } = useSceneStore();

    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const boxMeshRef = useRef<THREE.Mesh>(null);

    const [ material, setMaterial ] = useState<THREE.ShaderMaterial | null>(null);

    useFrame(() =>
    {

        if (material)
        {
            material.uniforms.blurAmount.value = blurAmount;
            material.uniforms.baseTexture.value = videoTexture;
            material.uniforms.baseTextureSize.value = new THREE.Vector2(videoTexture.image.width, videoTexture.image.height);
            material.needsUpdate = true;
        }

        // initialize the webcam texture after eyepop is ready
        if (!boxMeshRef.current) return;

        if (!eyePop?.ready)
        {
            boxMeshRef.current.material.visible = false;
            return;
        }
        if (videoTexture)
        {
            boxMeshRef.current.material.visible = true;
            boxMeshRef.current.material.needsUpdate = true;
            return;
        }

        if (!webcamVideo) return;
        if (!webcamVideo.width) return;
        if (!webcamVideo.height) return;

        const texture = new THREE.VideoTexture(webcamVideo);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        // fixes the blown out colors
        texture.colorSpace = THREE.LinearSRGBColorSpace;// THREE.SRGBColorSpace or THREE.LinearSRGBColorSpace.
        texture.needsUpdate = true;
        setVideoTexture(texture);

        const aspect = webcamVideo.width / webcamVideo.height;

        setAspectRatio(aspect);

    })


    return (
        <mesh ref={boxMeshRef} visible={true} scale={1} position={[ 0, 0, -.01 ]} >
            <planeGeometry args={[ aspectRatio, 1 ]} />

            <meshBasicMaterial map={videoTexture} toneMapped={false} transparent={true} opacity={1} />
        </mesh>
    );
};

export default WebcamMesh;
