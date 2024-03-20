import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';


type WebcamMeshProps = {
    videoTexture: THREE.VideoTexture | null | undefined;
    maskArray: [] | null;
};

const WebcamMesh: React.FC<WebcamMeshProps> = ({ videoTexture, maskTexture }) =>
{

    const boxMeshRef = useRef<THREE.Mesh>(null);

    const [ aspectRatio, setAspectRatio ] = useState(16 / 9);

    useEffect(() =>
    {
        if (!videoTexture) return;
        if (!videoTexture.source.data) return;
        if (!boxMeshRef.current) return;
        const aspectRatio = videoTexture.image.width / videoTexture.image.height;

        setAspectRatio(aspectRatio);

        boxMeshRef.current.material.needsUpdate = true;


    }, [ boxMeshRef, videoTexture ]);

    return (
        <mesh ref={boxMeshRef}>
            <boxGeometry args={[ aspectRatio, 1, aspectRatio ]} />
            <meshBasicMaterial map={videoTexture} needsUpdate />
        </mesh>
    );
};

export default WebcamMesh;
