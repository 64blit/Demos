import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import * as THREE from "three";

interface SceneStoreState
{
    setAspectRatio: (aspectRatio: number) => void;
}

interface SceneStoreActions
{
    aspectRatio: number;
}

type SceneStore = SceneStoreState & SceneStoreActions;

const store = (set, get): SceneStore => ({
    aspectRatio: 16 / 9,
    setAspectRatio: (aspectRatio: number) => set({ aspectRatio }),
});

export const useSceneStore =
    create(
        devtools(
            store,
        )
    );
