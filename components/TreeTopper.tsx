import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';
import { AppState } from '../types';

interface TreeTopperProps {
  appState: AppState;
}

export const TreeTopper: React.FC<TreeTopperProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate the star
    meshRef.current.rotation.y = time;
    meshRef.current.rotation.z = Math.sin(time * 2) * 0.1;

    // Movement logic based on state
    const targetScale = appState === AppState.TREE ? 1 : 0;
    
    // Lerp scale
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);

    // Floating effect
    if (appState === AppState.TREE) {
        meshRef.current.position.y = 10.5 + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 10.5, 0]}>
      <octahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial 
        color={COLORS.TREE_TOP} 
        emissive={COLORS.TREE_TOP}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
      <pointLight distance={10} intensity={2} color={COLORS.TREE_TOP} />
    </mesh>
  );
};