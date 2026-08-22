'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Crown, Sparkles, Shield, Timer, Flame } from 'lucide-react';

interface TakeoverBannerProps {
  takeoverPrice: number;
  activeTakeover: {
    domain: string;
    title: string;
    description: string | null;
    url: string;
    takeoverExpiresAt: string | Date | null;
  } | null;
  onTakeoverClick: () => void;
}

export function TakeoverBanner({ takeoverPrice, activeTakeover, onTakeoverClick }: TakeoverBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!activeTakeover?.takeoverExpiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(activeTakeover.takeoverExpiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Lockdown Ended');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTakeover]);

  if (activeTakeover) {
    return (
      <div className="w-full rounded-2xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-purple-950/80 p-5 shadow-[0_0_35px_rgba(168,85,247,0.25)] text-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
              <Crown className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-purple-400">
                  ⚔️ Arena Total Lockdown VIP
                </span>
                {timeLeft && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
                    <Timer className="size-3" />
                    {timeLeft}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-100 mt-0.5">
                {activeTakeover.title || activeTakeover.domain}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {activeTakeover.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href={activeTakeover.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-black uppercase transition shadow-md"
            >
              Explore {activeTakeover.domain}
            </a>
            <button
              onClick={onTakeoverClick}
              className="rounded-xl border border-purple-400/40 bg-purple-950/60 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/60 transition"
            >
              Re-Siege ({formatCurrency(takeoverPrice)})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-fit flex-col sm:flex-row items-center justify-center gap-2.5 rounded-2xl border border-amber-500/30 bg-slate-950/80 px-5 py-3 text-center text-xs sm:text-sm text-slate-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] mb-8">
      <div className="flex items-center gap-1.5">
        <Flame className="size-4 text-amber-500" />
        <span className="font-bold text-amber-400 uppercase tracking-wide">Arena Lockdown:</span>
        <span>Own the entire throne for 3 hours</span>
      </div>
      <span className="hidden sm:inline text-slate-600">|</span>
      <span className="font-extrabold text-white text-sm">
        {formatCurrency(takeoverPrice)}
      </span>
      <button
        type="button"
        onClick={onTakeoverClick}
        className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-black text-slate-950 shadow hover:brightness-110 active:scale-95 transition"
      >
        <Sparkles className="size-3" />
        <span>Seize Throne</span>
      </button>
    </div>
  );
}
