import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import * as THREE from "three";

interface SceneStoreState
{
    setAspectRatio: (aspectRatio: number) => void;
    setVideoTexture: (videoTexture: any) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setSegMask: (segMask: any) => void;
}

interface SceneStoreActions
{
    aspectRatio: number;
    videoTexture: THREE.VideoTexture | null;
    width: number;
    height: number;
    segMask: any;
}

type SceneStore = SceneStoreState & SceneStoreActions;

const store = (set, get): SceneStore => ({
    aspectRatio: 16 / 9,
    videoTexture: null,
    segMask: null,
    width: 0,
    height: 0,
    setSegMask: (segMask: any) => set({ segMask }),
    setWidth: (width: number) => set({ width }),
    setHeight: (height: number) => set({ height }),
    setAspectRatio: (aspectRatio: number) => set({ aspectRatio }),
    setVideoTexture: (videoTexture: any) => set({ videoTexture }),
});

export const useSceneStore =
    create(
        devtools(
            store,
        )
    );
