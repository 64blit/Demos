import React, { useState } from 'react';
import { useSceneStore } from '../../store/SceneStore';

interface DialogProps
{
    onClose: () => void;
}



const Dialog: React.FC<DialogProps> = ({ onClose }) =>
{
    const { setRepsPerSet, setTotalSets, setWorkoutRoutine, workoutRules, repsPerSet, totalSets, reset } = useSceneStore();

    return (
        <div className="bg-white rounded p-4 flex flex-col gap-3 justify-center">
            <h2 className="text-center">Workout Routine</h2>
            <label className='flex flex-row justify-evenly items-center gap-3'>
                <div className='w-24'>
                    Workout Routine:
                </div>
                <textarea
                    value={workoutRules}
                    onChange={(e) =>
                    {
                        // add a \r\n to the end of each line if it doesn't already exist
                        const value = e.target.value.split('\n').map((line) => line.trim()).join('\r\n');

                        setWorkoutRoutine(value)
                    }}
                    className="border border-gray-300 rounded p-2"
                    rows={8}
                    cols={40}
                />
            </label>
            <br />
            <br />
            <label className='flex flex-row justify-evenly items-center gap-3  '>
                <div className='w-24'>
                    Reps per Set:
                </div>
                <input
                    type="number"
                    value={repsPerSet}
                    onChange={(e) => setRepsPerSet(Number(e.target.value))}
                    className="border border-gray-300 rounded p-2"
                />
            </label>
            <br />
            <label className='flex flex-row justify-evenly items-center gap-3  '>
                <div className='w-24'>
                    Total Set Count:
                </div>
                <input
                    type="number"
                    value={totalSets}
                    onChange={(e) => setTotalSets(Number(e.target.value))}
                    className="border border-gray-300 rounded p-2"
                />
            </label>
            <br />
            <div className="flex justify-center">
                <button
                    onClick={reset}
                    className=" btn  text-white rounded p-2 mr-2"
                >
                    Reset
                </button>
                <button
                    onClick={onClose}
                    className=" btn  text-white rounded p-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Dialog;
