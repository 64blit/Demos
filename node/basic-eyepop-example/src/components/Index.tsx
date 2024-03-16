import React from 'react';
import TextInput from './TextInput';
import Visuals from './Visuals';

const Index: React.FC = () =>
{
    return (
        <>
            <TextInput className="absolute bottom-0 p-5 -mt-[5rem]" label="Enter Message..." />
            <Visuals />
        </>
    );
};

export default Index;
