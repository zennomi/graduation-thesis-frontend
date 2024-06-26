/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/slider_draco.glb --types --transform 
Files: public/slider_draco.glb [2.1KB] > /home/zennomi/hust/minaverse/slider_draco-transformed.glb [1.5KB] (29%)
*/

import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Plane_remesh_remesh: THREE.Mesh
  }
  materials: {
    ['default']: THREE.MeshStandardMaterial
  }
}

export function Slider({ map, ...props }: JSX.IntrinsicElements['group'] & { map: THREE.Texture }) {
  const { nodes, } = useGLTF('/slider_draco.glb') as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0, -15.862]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <primitive object={nodes.Plane_remesh_remesh.geometry} attach="geometry" />
        <meshBasicMaterial
          map={map}
          transparent={true}
          needsUpdate
          depthTest
          depthWrite
        />
      </mesh>
    </group>
  )
}

useGLTF.preload('/slider_draco-transformed.glb')
