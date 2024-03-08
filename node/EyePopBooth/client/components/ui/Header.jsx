import React from 'react';
import HeaderPopControls from './HeaderPopControls';

const Header = ({ className, loading, popNameRef, handleWebcamChange, startButtonRef, onStart }) =>
{

    return (
        <header
            className={`${className} w-full`}>
            <div
                className=" flex flex-col justify-center items-center shadow-2xl shadow-black bg-blue-300 ml-2 mr-2 rounded-b-xl">

                <h2 className="text-3xl pt-2">Introducing</h2>

                <a
                    className="overflow-hidden pb-2 w-[23rem] hover:scale-125 transition-all"
                    href='https://eyepop.ai'
                    target='_blank'>

                    <img
                        src="https://raw.githubusercontent.com/64blit/files/main/pose_follow/ep_logo.png"
                        className="object-contain h-full w-full" />
                </a>

            </div>

        </header>
    );
};

export default Header;
