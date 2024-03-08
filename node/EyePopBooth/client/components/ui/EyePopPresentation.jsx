import React, { useEffect, useRef, useState } from 'react';
import DemoVideo from './presentation-pages/DemoVideo';
import PipelineVisualization from './presentation-pages/PipelineVisualization';
import JsonExplorer from './presentation-pages/JsonExplorer';
import Header from './Header';
import HeaderPopControls from './HeaderPopControls';
import gsap from 'gsap';

import "swiper/css";
import { Swiper, SwiperSlide } from 'swiper/react';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faGear, faComputer, faVideo, faChain, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';


const EyePopPresentation = ({ className, json = { status: { 'message': 'Loading...' } }, popNameRef, handleWebcamChange, startButtonRef, onStart, loading }) =>
{
    const [ swipe, setSwipe ] = useState();
    const [ slideIndex, setSlideIndex ] = useState(0);
    const [ showControls, setShowControls ] = useState(false);
    const navButton1Ref = useRef();
    const navButton2Ref = useRef();
    const navButton3Ref = useRef();
    const [ tl, setTl ] = useState(gsap.timeline({ repeat: -1, repeatDelay: 0 }));
    const [ paused, setPaused ] = useState(false);
    const [ slideDelay, setSlideDelay ] = useState(10);

    useEffect(() =>
    {
        if (!tl) return;
        tl.paused(paused);
    }, [ paused ]);


    useEffect(() =>
    {
        // update all the delays in the timeline
        navButton1Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton2Ref.current.classList.remove('bg-primary-gradient', 'scale-110');
        navButton3Ref.current.classList.remove('bg-primary-gradient', 'scale-110');

        swipe?.slideTo(slideIndex);
        tl.seek(slideIndex * slideDelay);
    }, [ slideIndex, slideDelay ]);

    useEffect(() =>
    {
        if (!navButton1Ref.current) return;
        if (!navButton2Ref.current) return;
        if (!navButton3Ref.current) return;

        const highlightButton = (buttonRef, oldButtonRef) =>
        {
            buttonRef.current.classList.add('bg-primary-gradient', 'scale-110');
            oldButtonRef.current.classList.remove('bg-primary-gradient', 'scale-110');
        }

        const changeSlide = (index) =>
        {
            setSlideIndex(index);
        }

        tl.kill();
        tl.clear();

        tl.to(navButton1Ref.current, {
            duration: slideDelay, delay: 0, onStart: () =>
            {
                changeSlide(0);
                highlightButton(navButton1Ref, navButton3Ref);
            }
        });
        tl.to(navButton2Ref.current, {
            duration: slideDelay, delay: 0, onStart: () =>
            {

                changeSlide(1);
                highlightButton(navButton2Ref, navButton1Ref);
            }
        });
        tl.to(navButton3Ref.current, {
            duration: slideDelay, delay: 0, onStart: () =>
            {
                changeSlide(2);
                highlightButton(navButton3Ref, navButton2Ref);
            }
        });
        tl.play();

    }, [ navButton1Ref.current, navButton2Ref.current, navButton3Ref.current, slideDelay ]);

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


            <Swiper ref={swipe}
                onBeforeInit={(swipper) => setSwipe(swipper)}
                className="w-full">

                <SwiperSlide>
                    <JsonExplorer className=" ml-5 mr-5 mt-0 mb-0 p-0 h-full " data={json} />
                </SwiperSlide>

                <SwiperSlide>
                    <DemoVideo />
                </SwiperSlide>


                <SwiperSlide>
                    <PipelineVisualization />
                </SwiperSlide>

            </Swiper>



            <HeaderPopControls
                handleWebcamChange={handleWebcamChange}
                startButtonRef={startButtonRef}
                onStart={onStart}
                popNameRef={popNameRef}
                loading={loading}
                showControls={showControls}
                setSlideDelay={setSlideDelay}
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
