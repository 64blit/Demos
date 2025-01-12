import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SceneStoreState
{
    setAspectRatio: (aspectRatio: number) => void;
    setBlurAmount: (blurAmount: number) => void;
}

interface SceneStoreActions
{
    aspectRatio: number;
    blurAmount: number;
}

type SceneStore = SceneStoreState & SceneStoreActions;

const store = (set, get): SceneStore => ({
    aspectRatio: 16 / 9,
    blurAmount: 1,
    setBlurAmount: (blurAmount: number) => set({ blurAmount }),
    setAspectRatio: (aspectRatio: number) => set({ aspectRatio }),
});

export const useSceneStore =
    create(
            devtools(
                store,
            )
    );
