
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


const App: React.FC = () =>
{
  const { initialize, startWebcam, eyePop } = useEyePop();

  const [ webcamMesh, setWebcamMesh ] = useState<THREE.Mesh | null>(null);
  const cameraRef = useRef(null);

  // initialize the EyePop SDK
  useMemo(() =>
  {
    console.log('Initializing EyePop', eyePop, eyePop?.ready);

    if (eyePop) return;
    if (eyePop?.ready) return;

    console.log('first run');

    const setup = async () =>
    {

      await initialize({
        popId: '0e5b2512f4bd479286c83b38ad8ddb5d',
        auth: {
          oAuth2: true
        },
        eyepopUrl: 'https://staging-api.eyepop.ai',
      })
      console.log('EyePop initialized');

      await startWebcam();

      console.log('Webcam started');

    };

    setup();

  }, [ initialize, startWebcam, eyePop ]);


  // Setup the camera controls
  useEffect(() =>
  {
    if (!cameraRef.current) return;
    if (!webcamMesh) return;

    cameraRef.current.fitToBox(webcamMesh, true);
    cameraRef.current.saveState();
    cameraRef.current.mouseButtons.left = null;
    cameraRef.current.mouseButtons.right = null;
    cameraRef.current.touches.two = null;
    cameraRef.current.touches.three = null;
    cameraRef.current.touches.one = null;
    // cameraRef.current.mouseButtons.wheel = null;
    // cameraRef.current.mouseButtons.middle = null;

  }, [ cameraRef, webcamMesh ])


  // Reset camera on escape key
  useEffect(() =>
  {

    const handleEscape = (e: KeyboardEvent) =>
    {
      if (e.key === 'Escape')
      {
        cameraRef?.current.reset(true);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);

  })

  return (
    <Canvas
      shadows={true}
      style={{ height: '100dvh' }}
      gl={{ localClippingEnabled: true }}
      dpr={window.devicePixelRatio * 2}>

      {/* <Perf position="top-left" /> */}
      <CameraControls ref={cameraRef} />
      <Environment preset="city" resolution={512} />
      <pointLight position={[ 0, 0, 10 ]} decay={0} intensity={5} />


      <UI />


      <DragControls >
        <EyePopDrawing />
      </DragControls>


      <group ref={(node) => { setWebcamMesh(node); }}>
        <WebcamMesh />
      </group>


    </Canvas >
  );
};

export default App;