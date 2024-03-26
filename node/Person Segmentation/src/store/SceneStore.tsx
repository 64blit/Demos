import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import * as THREE from "three";

interface SceneStoreState
{
    setAspectRatio: (aspectRatio: number) => void;
    setVideoTexture: (videoTexture: any) => void;
}

interface SceneStoreActions
{
    aspectRatio: number;
    videoTexture: THREE.VideoTexture | null;
}

type SceneStore = SceneStoreState & SceneStoreActions;

const store = (set, get): SceneStore => ({
    aspectRatio: 0,
    videoTexture: null,
    setAspectRatio: (aspectRatio: number) => set({ aspectRatio }),
    setVideoTexture: (videoTexture: any) => set({ videoTexture }),
});

export const useSceneStore =
    create(
        devtools(
            persist(
                store,
                { key: 'scene-store-workout' }
            )
        )
    );
