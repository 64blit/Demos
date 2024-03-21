/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 .\EyePopPersonBoundsIndicator.glb -T -p 6 -j -s -K -k -R 2048 
Files: .\EyePopPersonBoundsIndicator.glb [57.69KB] > C:\Users\edmun\OneDrive\Documents\_SPACE\EyePop\EyePopDemos\node\basic-eyepop-example\src\assets\EyePopPersonBoundsIndicator-transformed.glb [52.39KB] (9%)
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/EyePopPersonBoundsIndicator-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <mesh name="line" castShadow receiveShadow geometry={nodes.line.geometry} material={materials.basic_grey} />
        <mesh name="top" castShadow receiveShadow geometry={nodes.top.geometry} material={materials['basic_white.001']} />
        <mesh name="bottom" castShadow receiveShadow geometry={nodes.bottom.geometry} material={materials['basic_white.001']} />
      </group>
    </group>
  )
}

useGLTF.preload('/EyePopPersonBoundsIndicator-transformed.glb')
