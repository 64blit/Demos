import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';
import { useSceneStore } from '../../store/SceneStore';
import TextContainer from './TextContainer';
import PersonSegmentation from './PersonSegmentation';
import { DragControls, PivotControls } from '@react-three/drei';

const EyePopDrawing: React.FC = () =>
{
    return (
        <>
            <PersonSegmentation />

            <DragControls axisLock='z'>
                <TextContainer size={.33} />
            </DragControls>
        </>
    );
};

export default EyePopDrawing;
