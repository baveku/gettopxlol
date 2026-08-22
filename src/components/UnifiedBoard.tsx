'use client';

import React, { useState } from 'react';
import { LeaderboardItem, LeaderboardItemData } from './LeaderboardItem';
import { Search, RotateCw, Sparkles, X } from 'lucide-react';

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

  // Attach true original rank based on the full leaderboard sorting
  const rankedItems = items.map((item, originalIndex) => ({
    item,
    originalRank: originalIndex + 1,
  }));

  const filteredItems = rankedItems.filter(
    ({ item }) =>
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            className="w-full rounded-full border border-[#2f3336] bg-[#16181c] py-2.5 pl-9 pr-8 text-xs sm:text-sm text-[#e7e9ea] placeholder-[#71767b] outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full border border-[#2f3336] bg-[#16181c] hover:bg-[#202327] text-[#e7e9ea] text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
          >
            <RotateCw className={`size-3.5 ${isLoading ? 'animate-spin text-[#1d9bf0]' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>

      {/* Main List of Real 𝕏 Contenders */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map(({ item, originalRank }) => (
            <LeaderboardItem
              key={item.id}
              item={item}
              rank={originalRank}
              onClaimRank={onClaimRank}
            />
          ))
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#16181c] border border-[#2f3336] space-y-3">
            <p className="text-sm font-bold text-white">
              {searchTerm ? `No 𝕏 profiles found matching "${searchTerm}"` : 'No active 𝕏 contenders yet.'}
            </p>
            <p className="text-xs text-[#71767b] max-w-sm mx-auto">
              {searchTerm
                ? 'Try searching by a different @handle, display name, or bio keyword.'
                : 'Be the first to outbid and claim the #1 spotlight on gettopx.lol!'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#202327] border border-[#2f3336] text-[#e7e9ea] hover:bg-[#2c3136] transition"
              >
                Clear Search
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
