import React, { useEffect, useRef, useState } from 'react';
import DemoVideo from './presentation-pages/DemoVideo';
import PipelineVisualization from './presentation-pages/PipelineVisualization';
import JsonExplorer from './presentation-pages/JsonExplorer';
import Header from './Header';
import HeaderPopControls from './HeaderPopControls';

import "swiper/css";
import { Swiper, SwiperSlide } from 'swiper/react';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faGear, faComputer, faVideo, faChain, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

let activeTimeout = null;

const EyePopPresentation = ({ className, json = { status: { 'message': 'Loading...' } }, popNameRef, handleWebcamChange, startButtonRef, onStart, loading }) =>
{
    const navButton1Ref = useRef();
    const navButton2Ref = useRef();
    const navButton3Ref = useRef();

    const [ swipe, setSwipe ] = useState();
    const [ slideIndex, setSlideIndex ] = useState(0);
    const [ showControls, setShowControls ] = useState(false);
    const [ paused, setPaused ] = useState(false);
    const [ reset, setReset ] = useState("");


    const startTimeout = (index) =>
    {
        clearTimeout(activeTimeout);

        let newTiemeout = null;

        if (index === 0)
        {
            highlightButton(navButton1Ref);
            changeSlide(0);
            newTiemeout = setTimeout(() =>
            {
                setSlideIndex(1);
            }, 10000);
        }
        if (index === 1)
        {
            highlightButton(navButton2Ref);
            changeSlide(1);
            newTiemeout = setTimeout(() =>
            {
                setSlideIndex(2);
            }, 78000);
        }
        if (index === 2)
        {
            highlightButton(navButton3Ref);
            changeSlide(2);
            newTiemeout = setTimeout(() =>
            {
                setSlideIndex(0);
            }, 25000);
        }
        activeTimeout = (newTiemeout);
    }

    useEffect(() =>
    {
        //pause the active timeout
        if (paused)
        {
            clearTimeout(activeTimeout);
        }
        else
        {
            startTimeout(slideIndex);
        }
    }, [ paused ]);


    const highlightButton = (buttonRef) =>
    {
        navButton1Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton2Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton3Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        buttonRef.current.classList.add('bg-primary-gradient', 'scale-110');
    }

    const changeSlide = (index) =>
    {
        setReset(Math.random());
        setSlideIndex(index);
    }

    useEffect(() =>
    {
        navButton1Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton2Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton3Ref.current.classList.remove('bg-primary-gradient', 'scale-110');

        clearTimeout(activeTimeout);

        startTimeout(slideIndex);

        swipe?.slideTo(slideIndex);

    }, [ slideIndex ]);


    return (
        <div
            className={`${className} w-1/2 h-full flex flex-col bg-primary-gradient gap-5`} >

            <Header
                handleWebcamChange={handleWebcamChange}
                startButtonRef={startButtonRef}
                onStart={onStart}
                popNameRef={popNameRef}
                loading={loading}
            />


            <Swiper
                ref={swipe}
                onBeforeInit={(swipper) => { setSwipe(swipper); }}
                className="w-full">

                <SwiperSlide>
                    <JsonExplorer updateTrigger={reset} className=" ml-5 mr-5 mt-0 mb-0 p-0 h-full " data={json} />
                </SwiperSlide>

                <SwiperSlide>
                    <DemoVideo updateTrigger={reset} />
                </SwiperSlide>


                <SwiperSlide>
                    <PipelineVisualization updateTrigger={reset} />
                </SwiperSlide>

            </Swiper>



            <HeaderPopControls
                handleWebcamChange={handleWebcamChange}
                startButtonRef={startButtonRef}
                onStart={onStart}
                popNameRef={popNameRef}
                loading={loading}
                showControls={showControls}
            />

            <div className=' flex-1 w-full flex flex-col-reverse'>
                {/* Pagination self-center object-center justify-start*/}
                <div className="flex gap-5 w-full justify-center content-center bg-primary-gradient p-5">

                    {/* pause timeline button */}
                    <FontAwesomeIcon
                        icon={paused ? faPlay : faPause}
                        className="text self-center text-white cursor-pointer text-xl hover:scale-150 transition-all"
                        onClick={() => { setPaused(!paused); }}>
                    </FontAwesomeIcon>

                    <button
                        ref={navButton1Ref}
                        className='btn bg-slate-800 text-xl rounded-full p-2 w-50 hover:scale-110 hover:bg-primary-gradient hover:border-white text-white'
                        onClick={(e) => { setSlideIndex(0); }}>1.
                        <FontAwesomeIcon icon={faComputer}></FontAwesomeIcon>JSON
                    </button>

                    <FontAwesomeIcon className="self-center" icon={faArrowRight}></FontAwesomeIcon>

                    <button
                        ref={navButton2Ref}
                        className='btn bg-slate-800 text-xl rounded-full p-2 w-50 hover:scale-110 hover:bg-primary-gradient hover:border-white text-white'
                        onClick={(e) => { setSlideIndex(1); }}>2.
                        <FontAwesomeIcon icon={faVideo}></FontAwesomeIcon>DEMO
                    </button>

                    <FontAwesomeIcon className="self-center" icon={faArrowRight}></FontAwesomeIcon>

                    <button
                        ref={navButton3Ref}
                        className='btn bg-slate-800 text-xl rounded-full p-2 w-50 hover:scale-110 hover:bg-primary-gradient hover:border-white text-white'
                        onClick={(e) => { setSlideIndex(2); }}>3.
                        <FontAwesomeIcon icon={faChain}></FontAwesomeIcon>PIPELINE
                    </button>


                    <FontAwesomeIcon
                        icon={faGear}
                        className="text self-center text-white cursor-pointer"
                        onClick={(e) => { setShowControls(!showControls) }}>

                    </FontAwesomeIcon>

                </div>

            </div>

        </div>
    );
};

export default EyePopPresentation;
