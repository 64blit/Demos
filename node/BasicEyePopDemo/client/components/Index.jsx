import React, { useEffect, useRef, useState } from 'react';

import { useEyePop } from '../hook/EyePopContext.jsx';

export function Index()
{

    const [ valid, setValid ] = useState(false);
    const [ isMedicalFocused, setIsMedicalFocused ] = useState(true);

    const { checkFile } = useEyePop();


    const fileChange = async (e) =>
    {

        const category = isMedicalFocused ? 'medical' : 'animal';

        const isValid = await checkFile(e.target.files[ 0 ], category);

        console.log('isValid:', isValid);

        setValid(isValid);
    }

    useEffect(() =>
    {
        console.log('valid state has changed:', valid);
    }, [ valid ]);

    return (
        <div className='flex flex-col justify-center items-center gap-5 m-5 text-white'>

            <h3 className='text-3xl'>Basic EyePop Demo</h3>
            <div className='flex gap-5'>

                <button className={`btn text-white ${isMedicalFocused ? 'active bg-green-500' : ''}`}
                    onClick={() => setIsMedicalFocused(true)}>
                    Medical
                </button>

                <button className={`btn text-white ${!isMedicalFocused ? 'active bg-green-500' : ''}`}
                    onClick={() => setIsMedicalFocused(false)}>
                    Animal
                </button>
            </div>

            <input type="file" onChange={fileChange} />


            {valid &&
                <h2 className={`text-2xl text-white ${valid ? 'bg-green-500' : 'bg-red-500'}`}>

                    {valid ? 'Good!' : 'Not so good!'}

                </h2>
            }


        </div>
    );
}

