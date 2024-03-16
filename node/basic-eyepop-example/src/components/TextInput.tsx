import React, { useState } from 'react';

interface TextInputProps
{
    className?: string;
    label: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, className }) =>
{
    const [ value, setValue ] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setValue(event.target.value);
    };

    return (
        <div className={`${className} z-50`}>
            <label className='p-5 bg-orange-500 text-black '>{label}</label>
            <input
                className='p-5 '
                type="text"
                multiple
                value={value}
                onChange={handleChange}
            />

            <div className='btn p-5 m-0  min-h-full bg-blue-500 text-white'>Go</div>
        </div>
    );
};

export default TextInput;
