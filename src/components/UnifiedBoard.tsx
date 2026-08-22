'use client';

import React, { useState } from 'react';
import { LeaderboardItem, LeaderboardItemData } from './LeaderboardItem';
import { UnclaimedRankCard } from './UnclaimedRankCard';
import { Search, RotateCw } from 'lucide-react';

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

  const topBidAmount = items.length > 0 ? items[0].totalBidAmount : 0;
  const remainingSlots = Math.max(0, 10 - filteredItems.length);

  return (
    <div className="w-full space-y-3">
      {/* Search & Sync Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="size-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71767b]" />
          <input
            type="text"
            placeholder="Search 𝕏 contenders & handles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-[#2f3336] bg-[#16181c] py-2 pl-9 pr-3.5 text-xs sm:text-sm text-[#e7e9ea] placeholder-[#71767b] outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition"
          />
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-full border border-[#2f3336] bg-[#16181c] hover:bg-[#202327] text-[#e7e9ea] text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`size-3.5 ${isLoading ? 'animate-spin text-[#1d9bf0]' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>

      {/* Main Unified List of 10 Slots */}
      <div className="space-y-2.5">
        {/* Render Occupied Ranks */}
        {filteredItems.map((item, idx) => (
          <LeaderboardItem
            key={item.id}
            item={item}
            rank={idx + 1}
            onClaimRank={onClaimRank}
          />
        ))}

        {/* Render Dynamic Unclaimed Slots to always complete Top 10 */}
        {Array.from({ length: remainingSlots }).map((_, i) => {
          const slotRank = filteredItems.length + i + 1;
          const minRequired = slotRank === 1 ? Math.max(2, topBidAmount + 1) : 2;

          return (
            <UnclaimedRankCard
              key={`unclaimed-${slotRank}`}
              rank={slotRank}
              minRequiredAmount={minRequired}
              onClaimRank={onClaimRank}
            />
          );
        })}
      </div>
    </div>
  );
}
