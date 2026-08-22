'use client';

import React from 'react';
import { Crown, Building2, Play, Pause, RotateCw } from 'lucide-react';

interface CameraHUDProps {
  cameraMode: 'overview' | 'focusTop1' | 'cinematic';
  onChangeMode: (mode: 'overview' | 'focusTop1' | 'cinematic') => void;
}

export function CameraHUD({ cameraMode, onChangeMode }: CameraHUDProps) {
  return (
    <div className="fixed bottom-6 left-6 z-30 flex items-center gap-1.5 p-1.5 rounded-full glass-panel backdrop-blur-2xl border border-white/10 shadow-2xl">
      <button
        onClick={() => onChangeMode('overview')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
          cameraMode === 'overview'
            ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
            : 'text-zinc-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <Building2 className="size-3.5" />
        <span>City Overview</span>
      </button>

      <button
        onClick={() => onChangeMode('focusTop1')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
          cameraMode === 'focusTop1'
            ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
            : 'text-zinc-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <Crown className="size-3.5" />
        <span>Focus #1 Tower</span>
      </button>

      <button
        onClick={() => onChangeMode(cameraMode === 'cinematic' ? 'overview' : 'cinematic')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
          cameraMode === 'cinematic'
            ? 'bg-purple-500 text-white font-bold shadow-md'
            : 'text-zinc-300 hover:text-white hover:bg-white/10'
        }`}
      >
        {cameraMode === 'cinematic' ? (
          <>
            <Pause className="size-3.5" />
            <span>Cinematic Tour ON</span>
          </>
        ) : (
          <>
            <Play className="size-3.5" />
            <span>Cinematic Orbit</span>
          </>
        )}
      </button>
    </div>
  );
}
