import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEyePop } from '../../EyePopWrapper';
import { useFrame, useThree } from '@react-three/fiber';
import { useSceneStore } from '../../store/SceneStore';

const VideoMesh: React.FC<VideoMeshProps> = () =>
{
    const { camera, gl } = useThree();

    const { eyePop, video } = useEyePop();
    const { aspectRatio, setAspectRatio, blurAmount } = useSceneStore();

    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const boxMeshRef = useRef<THREE.Mesh>(null);

    useFrame(() =>
    {
        // initialize the texture after eyepop is ready
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

        if (!video) return;
        if (!video.width) return;
        if (!video.height) return;

        const texture = new THREE.VideoTexture(video);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        // fixes the blown out colors
        texture.colorSpace = THREE.LinearSRGBColorSpace;// THREE.SRGBColorSpace or THREE.LinearSRGBColorSpace.
        texture.needsUpdate = true;
        setVideoTexture(texture);

        const aspect = video.width / video.height;

        setAspectRatio(aspect);

    })


    return (
        <mesh ref={boxMeshRef} visible={true} scale={1} position={[ 0, 0, -.01 ]} >
            <planeGeometry args={[ aspectRatio, 1 ]} />

            <meshBasicMaterial map={videoTexture} toneMapped={false} transparent={true} opacity={1} />
        </mesh>
    );
};

export default VideoMesh;
