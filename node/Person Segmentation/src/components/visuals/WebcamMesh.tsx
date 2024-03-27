import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEyePop } from '../../EyePopWrapper';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '../../store/SceneStore';


const WebcamMesh: React.FC<WebcamMeshProps> = () =>
{

    const { eyePop, webcamVideo } = useEyePop();
    const { aspectRatio, setAspectRatio } = useSceneStore();

    const [ videoTexture, setVideoTexture ] = useState<THREE.VideoTexture | null>(null);
    const boxMeshRef = useRef<THREE.Mesh>(null);

    useFrame(() =>
    {
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
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        setVideoTexture(texture);


        const aspect = webcamVideo.width / webcamVideo.height;

        setAspectRatio(aspect);

    })

    return (
        <>
            <mesh ref={boxMeshRef} visible={false}>
                <planeGeometry args={[ aspectRatio, 1, ]} />
                <meshBasicMaterial map={videoTexture ? videoTexture : null} needsUpdate={true} />
            </mesh>
        </>
    );
};

export default WebcamMesh;
