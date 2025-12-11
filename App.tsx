import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AppState } from './types';
import { Scene } from './components/Scene';
import { AUDIO_URL } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.TREE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // For distinguishing click vs drag
  const clickStartRef = useRef<{x: number, y: number, time: number}>({x: 0, y: 0, time: 0});

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    // Attempt auto-play on mount (may be blocked by browser)
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Auto-play was prevented.
        console.log("Autoplay prevented. Audio will start on interaction.");
      });
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    clickStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - clickStartRef.current.x;
    const dy = e.clientY - clickStartRef.current.y;
    const dt = Date.now() - clickStartRef.current.time;

    // If movement is small and time is short, consider it a CLICK, not a DRAG
    if (Math.sqrt(dx * dx + dy * dy) < 10 && dt < 300) {
      handleClick();
    }
  };

  const handleClick = useCallback(() => {
    // Start audio on first interaction if not playing
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }

    setAppState((prev) => {
      switch (prev) {
        case AppState.TREE:
          return AppState.EXPLODED;
        case AppState.EXPLODED:
          return AppState.TEXT;
        case AppState.TEXT:
          return AppState.TREE;
        default:
          return AppState.TREE;
      }
    });
  }, []);

  return (
    <div className="w-full h-screen relative bg-black select-none">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none p-10 flex flex-col items-center">
        <h1 className="text-2xl md:text-4xl whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 font-serif tracking-widest drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)] text-center">
          MERRY CHRISTMAS 2025
        </h1>
      </div>

      {/* 3D Canvas */}
      <div 
        className="w-full h-full cursor-pointer" 
        onPointerDown={handlePointerDown} 
        onPointerUp={handlePointerUp}
      >
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 35], fov: 50 }}>
            <Scene appState={appState} />
        </Canvas>
      </div>
    </div>
  );
};

export default App;