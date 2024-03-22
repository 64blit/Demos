import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SceneStoreState
{
    repCount: number;
    repsPerSet: number;
    currentSet: number;
    totalSets: number;
    workoutRules: string;
}

interface SceneStoreActions
{
    incrementRep: () => void;
    setRepCount: (value: number) => void;
    setRepsPerSet: (value: number) => void;
    setCurrentSet: (value: number) => void;
    setTotalSets: (value: number) => void;
    setWorkoutRoutine: (value: string) => void;
    reset: () => void;
}

type SceneStore = SceneStoreState & SceneStoreActions;

const store = (set): SceneStore => ({
    repCount: 0,
    repsPerSet: 10,
    currentSet: 0,
    totalSets: 3,
    workoutRules: " Biggest Person left wrist below Biggest Person left elbow " + "\r\n" +
        " Biggest Person right wrist below Biggest Person right elbow " + "\r\n" +
        " Biggest Person left wrist above Biggest Person left elbow " + "\r\n" +
        " Biggest Person right wrist above Biggest Person right elbow ",
    incrementRep: () =>
    {
        set((state) =>
        {
            let newRepCount = state.repCount + 1;

            if (newRepCount === state.repsPerSet)
            {
                // You can add additional logic here if needed
                set({ currentSet: state.currentSet + 1 })
                newRepCount = 0;
            }

            return { repCount: newRepCount };
        });
    },
    setRepCount: (value) => set((state) => ({ repCount: value })),
    setRepsPerSet: (value) => set((state) => ({ repsPerSet: value })),
    setCurrentSet: (value) => set((state) => ({ currentSet: value })),
    setTotalSets: (value) => set((state) => ({ totalSets: value })),
    setWorkoutRoutine: (value) => set((state) => ({ workoutRules: value })),
    reset: () => set({ repCount: 0, currentSet: 0, totalSets: 3, repsPerSet: 10 }),
});

export const useSceneStore = create(devtools(persist(store, { key: 'scene-store-workout' })));
