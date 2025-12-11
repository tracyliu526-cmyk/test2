import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { AppState } from '../types';
import { generateGeometries } from '../services/geometryService';
import { InteractiveShapes } from './InteractiveShapes';
import { TreeTopper } from './TreeTopper';

interface SceneProps {
  appState: AppState;
}

export const Scene: React.FC<SceneProps> = ({ appState }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate geometry data once
  const { spheres, cubes } = useMemo(() => generateGeometries(), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Slow rotation of the whole group
        // If state is TEXT, we might want to slow it down or stop it to make text readable
        const rotationSpeed = appState === AppState.TEXT ? 0.05 : 0.2;
        groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 35]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={60}
        rotateSpeed={0.5}
      />

      {/* Lighting Setup for PBR Glow */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffd700" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff4500" />
      <pointLight position={[0, 20, 0]} intensity={2} color="#ffffff" distance={30} />
      
      {/* Environment map for nice reflections on PBR materials */}
      <Environment preset="sunset" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group ref={groupRef}>
        <InteractiveShapes appState={appState} data={spheres} geometryType="sphere" />
        <InteractiveShapes appState={appState} data={cubes} geometryType="cube" />
        <TreeTopper appState={appState} />
      </group>
    </>
  );
};