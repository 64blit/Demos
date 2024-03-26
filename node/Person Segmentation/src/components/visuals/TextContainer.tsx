import { Text3D } from '@react-three/drei';
import { Flex } from '@react-three/flex';
import React from 'react';

interface TextContainerProps
{
    text: string;
}

const TextContainer: React.FC<TextContainerProps> = ({ text }) =>
{
    return (
        <Flex >

            <Text3D
                font={font3d}
                scale={[ 1.5, 1.5, .5 ]}
                position={[ 4.2, 1, -.35 ]}
                bevelEnabled
                bevelSize={0.015}
                rotation={[ 0, Math.PI, 0 ]}
            >
                {text}

                <meshStandardMaterial color={0x30A7D7} roughness={95} metalness={.9} />

            </Text3D>

        </Flex>
    );
};

export default TextContainer;
