import * as THREE from 'three';
import { PARTICLE_COUNT, COLORS } from '../constants';

// Helper to map a range
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const generateGeometries = (): { 
  spheres: { positions: Float32Array, colors: Float32Array, textPos: Float32Array, explodePos: Float32Array },
  cubes: { positions: Float32Array, colors: Float32Array, textPos: Float32Array, explodePos: Float32Array }
} => {
  
  // 1. Generate Text Positions using a Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 2000;
  const height = 300;
  canvas.width = width;
  canvas.height = height;
  
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 200px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MERRY CHRISTMAS 2025', width / 2, height / 2);
  }

  const imageData = ctx?.getImageData(0, 0, width, height);
  const textPoints: THREE.Vector3[] = [];
  
  if (imageData) {
    // Sample pixels to find where the text is
    for (let y = 0; y < height; y += 8) { // Step size determines density
      for (let x = 0; x < width; x += 8) {
        const index = (y * width + x) * 4;
        if (imageData.data[index + 3] > 128) { // If alpha > 128
          // Map 2D canvas coordinates to 3D space
          const posX = (x - width / 2) * 0.035;
          const posY = -(y - height / 2) * 0.035; // Flip Y
          const posZ = (Math.random() - 0.5) * 2; // Add slight depth
          textPoints.push(new THREE.Vector3(posX, posY, posZ));
        }
      }
    }
  }

  // Calculate split counts
  const sphereCount = Math.floor(PARTICLE_COUNT * 0.6);
  const cubeCount = PARTICLE_COUNT - sphereCount;

  const createAttributes = (count: number, isSphere: boolean) => {
    const treePositions = new Float32Array(count * 3);
    const textPositions = new Float32Array(count * 3);
    const explodePositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // --- Tree Shape (Cone) ---
      const theta = Math.random() * Math.PI * 2;
      // Height from -10 to 10
      const y = mapRange(Math.random(), 0, 1, -10, 10); 
      // Radius tapers as we go up
      const radiusBase = 8;
      const radius = mapRange(y, -10, 10, radiusBase, 0.5) * Math.sqrt(Math.random());
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);

      treePositions[i * 3] = x;
      treePositions[i * 3 + 1] = y;
      treePositions[i * 3 + 2] = z;

      // --- Text Shape ---
      // Pick a random point from the text points array
      if (textPoints.length > 0) {
        const targetIndex = Math.floor(Math.random() * textPoints.length);
        const p = textPoints[targetIndex];
        textPositions[i * 3] = p.x;
        textPositions[i * 3 + 1] = p.y;
        textPositions[i * 3 + 2] = p.z;
      } else {
        textPositions[i * 3] = x;
        textPositions[i * 3 + 1] = y;
        textPositions[i * 3 + 2] = z;
      }

      // --- Exploded Shape (Sphere shell) ---
      const u = Math.random();
      const v = Math.random();
      const thetaEx = 2 * Math.PI * u;
      const phiEx = Math.acos(2 * v - 1);
      const rEx = 20 + Math.random() * 15; // Explosion radius

      explodePositions[i * 3] = rEx * Math.sin(phiEx) * Math.cos(thetaEx);
      explodePositions[i * 3 + 1] = rEx * Math.sin(phiEx) * Math.sin(thetaEx);
      explodePositions[i * 3 + 2] = rEx * Math.cos(phiEx);

      // --- Colors ---
      if (isSphere) {
        // Gold and Red
        if (Math.random() > 0.4) {
           colorObj.set(COLORS.GOLD);
        } else {
           colorObj.set(COLORS.RED);
        }
      } else {
        // Gold and Dark Green
        if (Math.random() > 0.6) {
          colorObj.set(COLORS.METALLIC_GOLD);
        } else {
          colorObj.set(COLORS.DARK_GREEN);
        }
      }
      
      // Slight random variation in brightness
      const hsl = { h: 0, s: 0, l: 0 };
      colorObj.getHSL(hsl);
      colorObj.setHSL(hsl.h, hsl.s, hsl.l + (Math.random() * 0.1 - 0.05));

      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    return { positions: treePositions, colors, textPos: textPositions, explodePos: explodePositions };
  };

  return {
    spheres: createAttributes(sphereCount, true),
    cubes: createAttributes(cubeCount, false)
  };
};