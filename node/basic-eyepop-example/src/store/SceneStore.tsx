import { create, SetState } from 'zustand';
import { CameraControls } from '@react-three/drei';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';

type SceneStore = {
    cameraControls: React.MutableRefObject<CameraControls | null>;
    setCameraControls: (cameraControls: React.MutableRefObject<CameraControls | null>) => void;
    videoTexture: THREE.VideoTexture | null | undefined;
    setVideoTexture: (videoTexture: THREE.VideoTexture | null | undefined) => void;
    groupRef: React.MutableRefObject<THREE.Object3D | undefined>;
    setGroupRef: (groupRef: React.MutableRefObject<THREE.Object3D | undefined>) => void;
};

const store = (set, get): SceneStore => ({
    cameraControls: { current: undefined },
    setCameraControls: (cameraControls) => set({ cameraControls }),
    videoTexture: null,
    setVideoTexture: (videoTexture) => set({ videoTexture }),
    groupRef: { current: undefined },
    setGroupRef: (groupRef) => set({ groupRef }),
});

// const useSceneStore = create(devtools(persist(store, { name: 'sceneStore' })));
const useSceneStore = create(devtools(store));

export default useSceneStore;
