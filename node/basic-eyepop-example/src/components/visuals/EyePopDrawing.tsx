import React, { useEffect } from 'react';
import gsap from 'gsap';
import { useFrame } from '@react-three/fiber';
import useEyePop from '../../store/EyePopStore';
import { Text } from '@react-three/drei';


const EyePopDrawing: React.FC = () =>
{
    // const { eyePopManager } = useEyePop();

    // useFrame(() =>
    // {

    //     if (!eyePopManager?.ready) return;

    // });

    return (
        <>
            <Text>
                {/* {`${JSON.stringify(prediction, null, 2)}`} */}
            </Text>
        </>
    );
};

export default EyePopDrawing;
