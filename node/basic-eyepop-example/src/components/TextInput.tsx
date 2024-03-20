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
        <div className={`${className} z-50 flex rounded-sm`}>
            <input
                className='p-5 '
                type="text"
                multiple
                value={value}
                placeholder={label}
                onChange={handleChange}
            />

            <div className='p-5 m-0 w-20 bg-blue-500 text-white cursor-pointer'>ok</div>
        </div>
    );
};

export default TextInput;
