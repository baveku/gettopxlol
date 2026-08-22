'use client';

import React, { useState } from 'react';
import { LeaderboardItemData } from './LeaderboardItem';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Trophy, ChevronLeft, ChevronRight, Eye, Navigation, Globe } from 'lucide-react';

interface Top10HUDProps {
  items: LeaderboardItemData[];
  selectedItem: LeaderboardItemData | null;
  onSelectItem: (item: LeaderboardItemData) => void;
}

export function Top10HUD({ items, selectedItem, onSelectItem }: Top10HUDProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed top-24 left-4 z-30 transition-all duration-300 max-w-sm w-full hidden md:block">
      <div className="rounded-3xl glass-panel p-4 backdrop-blur-2xl border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-white">
              Top 10 Skylines
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* List of Towers */}
        {!isCollapsed && (
          <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
            {items.map((item, index) => {
              const rank = index + 1;
              const isSelected = selectedItem?.id === item.id;
              const isTop1 = rank === 1;
              const faviconSrc = item.faviconUrl || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`group p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/40 text-white'
                      : isTop1
                      ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
                      : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank number badge */}
                    <span className={`size-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isTop1
                        ? 'bg-amber-400 text-zinc-950 font-black'
                        : rank === 2
                        ? 'bg-zinc-300 text-zinc-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {rank}
                    </span>

                    {/* Logo Favicon */}
                    <div className="size-7 rounded-xl bg-zinc-800/90 border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={faviconSrc}
                        alt=""
                        className="size-full object-contain"
                        onError={(e) => {
                          // Fallback to initial
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="min-w-0 truncate">
                      <p className="font-bold text-xs text-white truncate group-hover:text-amber-300 transition">
                        {item.domain}
                      </p>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Eye className="size-2.5 text-emerald-400" />
                        <span>{formatNumber(item.clickCount)} clicks</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-mono font-bold text-xs text-amber-400 block">
                      {formatCurrency(item.totalBidAmount)}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <Navigation className="size-2.5 text-amber-400" /> Fly-to
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
