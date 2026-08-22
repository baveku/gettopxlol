'use client';

import React, { useState } from 'react';
import { LeaderboardItem, LeaderboardItemData } from './LeaderboardItem';
import { UnclaimedRankCard } from './UnclaimedRankCard';
import { Search, RotateCw, Trophy } from 'lucide-react';

interface UnifiedBoardProps {
  items: LeaderboardItemData[];
  onClaimRank: (targetAmount: number) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function UnifiedBoard({
  items,
  onClaimRank,
  onRefresh,
  isLoading,
}: UnifiedBoardProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = items.filter(
    (item) =>
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Total spots to display (always guarantee at least 10 spots)
  const totalSlots = Math.max(10, items.length);
  const remainingSlots = Math.max(0, 10 - filteredItems.length);

  return (
    <div className="w-full space-y-3">
      {/* Search & Sync Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search rankings & contenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-2 pl-9 pr-3.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition backdrop-blur-md"
          />
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`size-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5">
        {/* Render Real Active Items */}
        {filteredItems.map((item, index) => (
          <LeaderboardItem
            key={item.id}
            item={item}
            rank={index + 1}
            onClaimRank={onClaimRank}
          />
        ))}

        {/* Render Unclaimed Hook Slots (when board has fewer than 10 products and no search term) */}
        {!searchTerm &&
          Array.from({ length: remainingSlots }).map((_, idx) => {
            const rankNumber = filteredItems.length + idx + 1;
            const minRequiredAmount = 2;

            return (
              <UnclaimedRankCard
                key={`unclaimed-${rankNumber}`}
                rank={rankNumber}
                minRequiredAmount={minRequiredAmount}
                onClaimRank={onClaimRank}
              />
            );
          })}

        {/* If search active and nothing matched */}
        {searchTerm && filteredItems.length === 0 && (
          <div className="p-12 text-center rounded-3xl glass-panel text-zinc-500 text-sm">
            No projects found matching &ldquo;{searchTerm}&rdquo;. Be the first to claim this spot!
          </div>
        )}
      </div>
    </div>
  );
}
