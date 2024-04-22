import React, { useState } from 'react';
import { useSceneStore } from '../../store/SceneStore';

interface DialogProps
{
    onClose: () => void;
}



const Dialog: React.FC<DialogProps> = ({ onClose }) =>
{

    return (
        <div className="bg-gray-500 rounded p-4 flex flex-col gap-3 justify-center text-black">

            <h2 className="text-center"></h2>


            <div className="flex justify-center">

            </div>

        </div>
    );
};

export default Dialog;
