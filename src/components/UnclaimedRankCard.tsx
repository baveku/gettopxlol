'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Crown, Zap } from 'lucide-react';

interface UnclaimedRankCardProps {
  rank: number;
  minRequiredAmount: number;
  onClaimRank: (targetAmount: number) => void;
}

export function UnclaimedRankCard({
  rank,
  minRequiredAmount,
  onClaimRank,
}: UnclaimedRankCardProps) {
  const isTop1 = rank === 1;

  const handleClick = () => {
    onClaimRank(minRequiredAmount);
  };

  let cardStyle = 'p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3.5 sm:gap-4 group transition-all cursor-pointer select-none border border-dashed active:scale-[0.995] ';

  if (isTop1) {
    cardStyle += 'border-amber-500/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.06)]';
  } else {
    cardStyle += 'border-[#2f3336] bg-[#16181c]/60 hover:bg-[#16181c] hover:border-[#71767b]';
  }

  return (
    <div
      onClick={handleClick}
      className={cardStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Left: Rank Number + Dotted X Placeholder */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`size-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
          isTop1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-[#202327] text-[#71767b]'
        }`}>
          {isTop1 ? <Crown className="size-3.5 text-amber-400" /> : `#${rank}`}
        </div>

        <div className="size-11 sm:size-12 rounded-full bg-[#16181c] border border-dashed border-[#38444d] flex items-center justify-center shrink-0 group-hover:border-amber-400/50 transition">
          <span className="text-[#71767b] font-mono font-bold text-sm group-hover:text-amber-400 transition">𝕏</span>
        </div>
      </div>

      {/* Middle: Text Details */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-extrabold text-sm sm:text-base tracking-tight truncate ${
            isTop1 ? 'text-amber-300' : 'text-[#e7e9ea]'
          }`}>
            {isTop1 ? '👑 #1 Apex Spotlight on 𝕏' : `Spot #${rank} on 𝕏 Open`}
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            isTop1
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-[#202327] text-[#71767b] border-[#2f3336]'
          }`}>
            Unclaimed
          </span>
        </div>

        <p className="text-xs text-[#71767b] truncate">
          {isTop1
            ? 'No leader yet — Enter your @handle to take the sovereign #1 crown on 𝕏!'
            : `Claim rank #${rank} for your 𝕏 profile and capture real-time attention.`}
        </p>

        <div className="text-[11px] text-[#71767b] font-mono pt-0.5">
          <span>Floor Bid: </span>
          <strong className="text-[#e7e9ea] font-bold">{formatCurrency(minRequiredAmount)}</strong>
        </div>
      </div>

      {/* Right: Claim Pill Button */}
      <div className="shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            isTop1
              ? 'x-btn-gold'
              : 'bg-[#202327] hover:bg-[#2f3336] text-[#e7e9ea] border border-[#38444d]'
          }`}
        >
          <Zap className={`size-3.5 ${isTop1 ? 'fill-black' : 'text-amber-400'}`} />
          <span>Claim #{rank}</span>
        </button>
      </div>
    </div>
  );
}
