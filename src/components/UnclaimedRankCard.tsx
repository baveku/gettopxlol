'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Crown, Sparkles, Zap, PlusCircle } from 'lucide-react';

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
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;

  const handleClick = () => {
    onClaimRank(minRequiredAmount);
  };

  let cardStyle = 'p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 group transition-all cursor-pointer select-none border border-dashed active:scale-[0.995] ';
  let badgeStyle = 'size-8 sm:size-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 ';

  if (isTop1) {
    cardStyle += 'border-amber-500/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.09] hover:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.06)]';
    badgeStyle += 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  } else if (isTop2) {
    cardStyle += 'border-slate-400/30 bg-slate-400/[0.03] hover:bg-slate-400/[0.08] hover:border-slate-300/60';
    badgeStyle += 'bg-slate-400/20 text-slate-300 border border-slate-400/30';
  } else if (isTop3) {
    cardStyle += 'border-amber-700/30 bg-amber-700/[0.03] hover:bg-amber-700/[0.08] hover:border-amber-600/60';
    badgeStyle += 'bg-amber-700/20 text-amber-300 border border-amber-700/30';
  } else {
    cardStyle += 'border-white/[0.09] bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-white/20';
    badgeStyle += 'bg-zinc-800/60 text-zinc-500 border border-white/5';
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
      {/* Left: Rank + Placeholder Icon + Hook Description */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={badgeStyle}>
          {isTop1 ? <Crown className="size-4 text-amber-400" /> : `#${rank}`}
        </div>

        {/* Empty Favicon Placeholder */}
        <div className="size-9 sm:size-10 rounded-xl bg-zinc-900/50 border border-dashed border-white/10 flex items-center justify-center shrink-0 group-hover:border-amber-400/40 transition">
          <PlusCircle className="size-4 text-zinc-600 group-hover:text-amber-400 transition" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm sm:text-base tracking-tight truncate ${
              isTop1 ? 'text-amber-300' : isTop2 ? 'text-slate-200' : isTop3 ? 'text-amber-200' : 'text-zinc-300'
            }`}>
              {isTop1 ? '👑 #1 Apex Spotlight Available' : `Spot #${rank} Unclaimed`}
            </span>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              isTop1
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-zinc-800/80 text-zinc-400 border-white/5'
            }`}>
              Open
            </span>
          </div>

          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {isTop1
              ? 'No leader yet — Bid now to take the sovereign #1 spotlight!'
              : `Claim rank #${rank} and capture real-time attention.`}
          </p>
        </div>
      </div>

      {/* Right: Min Floor Bid + Claim Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
            Floor Bid
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-zinc-300">
            {formatCurrency(minRequiredAmount)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`py-2 px-3 sm:px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            isTop1
              ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20 font-black'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 hover:border-white/20'
          }`}
        >
          <Zap className={`size-3.5 ${isTop1 ? 'fill-zinc-950' : 'text-amber-400'}`} />
          <span>Claim #{rank}</span>
        </button>
      </div>
    </div>
  );
}
