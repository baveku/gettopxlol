'use client';

import React, { useState } from 'react';
import { LeaderboardItem, LeaderboardItemData } from './LeaderboardItem';
import { RefreshCw, Swords, Search, Filter } from 'lucide-react';

interface LeaderboardListProps {
  items: LeaderboardItemData[];
  onClaimRank: (targetAmount: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function LeaderboardList({ items, onClaimRank, onRefresh, isLoading }: LeaderboardListProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = items.filter((item) =>
    item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Swords className="size-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">
            Arena Combat Board ({items.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-56">
            <Search className="size-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search challengers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        id="leaderboard"
        className="rounded-3xl border border-slate-800/90 bg-slate-950/90 p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur"
      >
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No arena warriors found. Be the first to enter!
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <LeaderboardItem
              key={item.id}
              item={item}
              rank={index + 1}
              onClaimRank={onClaimRank}
            />
          ))
        )}
      </div>
    </div>
  );
}
