import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState } from '../types';

interface InteractiveShapesProps {
  appState: AppState;
  data: {
    positions: Float32Array;
    colors: Float32Array;
    textPos: Float32Array;
    explodePos: Float32Array;
  };
  geometryType: 'sphere' | 'cube';
}

export const InteractiveShapes: React.FC<InteractiveShapesProps> = ({ appState, data, geometryType }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = data.positions.length / 3;
  
  // Create dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store current positions to support smooth transitions
  const currentPositions = useMemo(() => {
    // Initialize with tree positions
    return Float32Array.from(data.positions);
  }, [data.positions]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      // Set initial colors
      const color = new THREE.Color();
      for (let i = 0; i < count; i++) {
        color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2]);
        meshRef.current.setColorAt(i, color);
      }
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data.colors, count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const lerpFactor = 0.05; // Speed of transition

    // Determine target positions array based on state
    let targetArr = data.positions; // Default TREE
    if (appState === AppState.EXPLODED) {
      targetArr = data.explodePos;
    } else if (appState === AppState.TEXT) {
      targetArr = data.textPos;
    }

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Interpolate current position towards target
      currentPositions[idx] = THREE.MathUtils.lerp(currentPositions[idx], targetArr[idx], lerpFactor);
      currentPositions[idx+1] = THREE.MathUtils.lerp(currentPositions[idx+1], targetArr[idx+1], lerpFactor);
      currentPositions[idx+2] = THREE.MathUtils.lerp(currentPositions[idx+2], targetArr[idx+2], lerpFactor);

      dummy.position.set(
        currentPositions[idx],
        currentPositions[idx+1],
        currentPositions[idx+2]
      );

      // Add self-rotation to individual shapes for sparkles
      dummy.rotation.set(
          time * 0.5 + i,
          time * 0.3 + i,
          time * 0.4 + i
      );

      // Scale animation (pulse slightly)
      // Reduced scale for smaller individual items
      const scale = geometryType === 'sphere' ? 0.25 : 0.25;
      const pulse = 1 + Math.sin(time * 3 + i) * 0.1;
      dummy.scale.set(scale * pulse, scale * pulse, scale * pulse);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {geometryType === 'sphere' ? (
        <sphereGeometry args={[1, 16, 16]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial 
        roughness={0.15} 
        metalness={0.9}
        envMapIntensity={1.2}
      />
    </instancedMesh>
  );
};