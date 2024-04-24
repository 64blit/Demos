
import './style/App.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, } from '@react-three/fiber'
import { CameraControls, DragControls, Effects, Environment, } from '@react-three/drei'
import * as THREE from 'three';
import { Perf } from 'r3f-perf';

import WebcamMesh from './components/visuals/WebcamMesh';
import { useEyePop } from './EyePopWrapper.tsx';
import EyePopDrawing from './components/visuals/EyePopDrawing';
import UI from './components/ui/UI';
import gsap from 'gsap';


const App: React.FC = () =>
{

  const { initialize, startWebcam, eyePop } = useEyePop();

  const cameraRef = useRef(null);

  // initialize the EyePop SDK
  useMemo(() =>
  {
    console.log('Initializing EyePop', eyePop, eyePop?.ready);

    if (eyePop) return;
    if (eyePop?.ready) return;

    const setup = async () =>
    {

      await initialize({
        popId: '8d88113ee4814b6683eba5a69fba7454',
        auth: {
          oAuth2: true
        },
        eyepopUrl: 'https://staging-api.eyepop.ai',
      })

      // await startWebcam();

    };

    setup();

  }, [ initialize, startWebcam, eyePop ]);


  return (
    <Canvas dpr={window.devicePixelRatio * 2}>

      <CameraControls ref={cameraRef} />
      <Environment preset="city" resolution={512} />
      <pointLight position={[ 0, 0, 10 ]} decay={0} intensity={5} />

      <UI />

      <EyePopDrawing />

      <WebcamMesh />

    </Canvas >
  );
};

export default App;
