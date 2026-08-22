'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe, { Marker, Arc } from 'cobe';
import { formatNumber } from '@/lib/utils';
import { Radio } from 'lucide-react';

interface CityPoint {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

const CITIES: CityPoint[] = [
  { name: 'San Francisco', country: 'US', flag: '🇺🇸', lat: 37.7749, lng: -122.4194 },
  { name: 'Tokyo', country: 'JP', flag: '🇯🇵', lat: 35.6762, lng: 139.6503 },
  { name: 'London', country: 'GB', flag: '🇬🇧', lat: 51.5074, lng: -0.1278 },
  { name: 'Hanoi', country: 'VN', flag: '🇻🇳', lat: 21.0285, lng: 105.8542 },
  { name: 'Singapore', country: 'SG', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { name: 'Berlin', country: 'DE', flag: '🇩🇪', lat: 52.52, lng: 13.405 },
  { name: 'New York', country: 'US', flag: '🇺🇸', lat: 40.7128, lng: -74.006 },
  { name: 'Sydney', country: 'AU', flag: '🇦🇺', lat: -33.8688, lng: 151.2093 },
  { name: 'Paris', country: 'FR', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
  { name: 'Seoul', country: 'KR', flag: '🇰🇷', lat: 37.5665, lng: 126.978 },
];

const ARCS: Arc[] = [
  { from: [37.7749, -122.4194], to: [35.6762, 139.6503], color: [0.96, 0.62, 0.07] }, // SF -> Tokyo
  { from: [51.5074, -0.1278], to: [21.0285, 105.8542], color: [0.1, 0.75, 0.5] }, // London -> Hanoi
  { from: [40.7128, -74.006], to: [52.52, 13.405], color: [0.65, 0.4, 0.95] }, // NY -> Berlin
  { from: [1.3521, 103.8198], to: [-33.8688, 151.2093], color: [0.96, 0.62, 0.07] }, // Singapore -> Sydney
];

interface InteractiveGlobeProps {
  onlineVisitors: number;
}

export function InteractiveGlobe({ onlineVisitors }: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const [activeCityIdx, setActiveCityIdx] = useState(0);

  // Cycle latest visitor location
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCityIdx((prev) => (prev + 1) % CITIES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let width = 0;
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const onResize = () => {
      if (currentCanvas) {
        width = currentCanvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const markers: Marker[] = CITIES.map((c, i) => ({
      location: [c.lat, c.lng],
      size: i === activeCityIdx ? 0.1 : 0.05,
      color: i === activeCityIdx ? [0.2, 0.9, 0.5] : [0.96, 0.62, 0.07],
    }));

    const globe = createGlobe(currentCanvas, {
      devicePixelRatio: 2,
      width: width * 2 || 640,
      height: (width * 2) || 640,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.12, 0.16],
      markerColor: [0.96, 0.62, 0.07],
      glowColor: [0.96, 0.62, 0.07],
      opacity: 0.95,
      markers,
      arcs: ARCS,
      arcColor: [0.96, 0.62, 0.07],
      arcWidth: 1.2,
      arcHeight: 0.25,
    });

    let animationId: number;

    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: width * 2,
        height: width * 2,
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeCityIdx]);

  const activeCity = CITIES[activeCityIdx];

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden group shadow-2xl">
      {/* Top Header info */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-bold text-emerald-400">
            <Radio className="size-3.5 animate-pulse text-emerald-400" />
            <span>REAL-TIME 3D EARTH</span>
          </div>

          <span className="text-xs text-zinc-400 font-mono font-medium">
            {formatNumber(onlineVisitors)} live sessions
          </span>
        </div>

        <p className="text-xs text-zinc-400 font-normal">
          Interactive WebGL Earth with real continents & live traffic arcs. Drag to rotate.
        </p>
      </div>

      {/* 3D WebGL Canvas Globe */}
      <div className="relative w-full aspect-square max-w-[320px] mx-auto my-2 flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            pointerInteracting.current = {
              x: e.clientX - pointerInteractionMovement.current,
              y: e.clientY,
            };
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
          }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              const deltaX = e.clientX - pointerInteracting.current.x;
              pointerInteractionMovement.current = deltaX * 0.008;
            }
          }}
          className="size-full object-contain touch-none"
        />
      </div>

      {/* Live Location Stream Ticker */}
      <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between gap-2 text-xs relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-zinc-400 text-[11px]">Active node:</span>
          <span className="font-bold text-zinc-100 truncate">
            {activeCity.flag} {activeCity.name}, {activeCity.country}
          </span>
        </div>

        <span className="text-[10px] text-emerald-400 font-mono shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Streaming
        </span>
      </div>
    </div>
  );
}
