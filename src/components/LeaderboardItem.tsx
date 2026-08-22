'use client';

import React from 'react';
import { formatCurrency, timeAgo, formatNumber } from '@/lib/utils';
import { ExternalLink, CheckCircle2, Crown, Zap } from 'lucide-react';

export interface LeaderboardItemData {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string | null;
  faviconUrl: string | null;
  totalBidAmount: number;
  clickCount: number;
  createdAt: string | Date;
  status: string;
}

interface LeaderboardItemProps {
  item: LeaderboardItemData;
  rank: number;
  onClaimRank: (targetAmount: number) => void;
}

export function LeaderboardItem({ item, rank, onClaimRank }: LeaderboardItemProps) {
  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;
  const avatarSrc = item.faviconUrl || `https://unavatar.io/x/${item.domain.replace(/^@/, '')}`;

  const handleCardClick = () => {
    window.open(`/api/r/${item.id}`, '_blank', 'noopener,noreferrer');
  };

  let cardClass = 'glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 group transition-all relative cursor-pointer select-none hover:border-white/20 active:scale-[0.995]';
  let rankBadgeClass = 'size-8 sm:size-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 ';

  if (isTop1) {
    cardClass += ' shimmer-gold bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-950/20 hover:border-amber-400/60';
    rankBadgeClass += 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-zinc-950 font-black shadow-md shadow-amber-500/40 animate-pulse';
  } else if (isTop2) {
    cardClass += ' shimmer-silver bg-gradient-to-r from-slate-400/15 via-slate-400/5 to-slate-900/20 hover:border-slate-200/50';
    rankBadgeClass += 'bg-gradient-to-tr from-slate-100 to-slate-300 text-zinc-950 font-black shadow-md shadow-slate-400/30';
  } else if (isTop3) {
    cardClass += ' shimmer-bronze bg-gradient-to-r from-amber-700/15 via-amber-700/5 to-amber-950/20 hover:border-amber-500/50';
    rankBadgeClass += 'bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-black shadow-md shadow-amber-700/30';
  } else {
    cardClass += ' bg-zinc-900/60 hover:bg-zinc-900/90 border-white/[0.07]';
    rankBadgeClass += 'bg-zinc-800/80 text-zinc-400 border border-white/5';
  }

  return (
    <div
      onClick={handleCardClick}
      className={cardClass}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Left section: Rank + X Avatar + Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
        {/* Rank Badge */}
        <div className={rankBadgeClass}>
          {isTop1 ? <Crown className="size-4.5 fill-zinc-950" /> : `#${rank}`}
        </div>

        {/* X Profile Avatar */}
        <div className={`size-10 sm:size-11 rounded-full p-0.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
          isTop1
            ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : isTop2
            ? 'ring-2 ring-slate-300 shadow-[0_0_12px_rgba(203,213,225,0.3)]'
            : isTop3
            ? 'ring-2 ring-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.3)]'
            : 'ring-1 ring-white/10'
        }`}>
          <img
            src={avatarSrc}
            alt={item.domain}
            className="size-full rounded-full object-cover bg-zinc-900"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${item.domain}`;
            }}
          />
        </div>

        {/* X Profile Details */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-extrabold text-sm sm:text-base transition flex items-center gap-1 truncate group-hover:underline ${
                isTop1
                  ? 'text-amber-300'
                  : isTop2
                  ? 'text-slate-100'
                  : isTop3
                  ? 'text-amber-200'
                  : 'text-white'
              }`}
            >
              {item.title || item.domain}
            </span>

            {/* Verified Checkmark */}
            <CheckCircle2 className="size-3.5 fill-sky-500 text-zinc-950 shrink-0" />

            {/* X Handle */}
            <span className="text-xs text-zinc-400 font-mono font-normal">
              {item.domain.startsWith('@') ? item.domain : `@${item.domain}`}
            </span>

            {/* Rank Tag for Top 3 */}
            {isTop1 ? (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                #1 Apex X
              </span>
            ) : isTop2 ? (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30">
                #2 Spotlight
              </span>
            ) : isTop3 ? (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-700/20 text-amber-300 border border-amber-700/30">
                #3 Spotlight
              </span>
            ) : null}
          </div>

          {/* Bio / Description */}
          {item.description && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {item.description}
            </p>
          )}

          {/* Social Stats: Live Clicks & Time */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-medium mt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {formatNumber(item.clickCount)} profile visits
            </span>

            <span>•</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right section: Valuation + Outbid Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 relative z-10">
        <div className="text-right hidden sm:block">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
            Valuation
          </span>
          <span className={`font-mono font-black text-sm sm:text-base ${
            isTop1 ? 'text-amber-400' : isTop2 ? 'text-slate-200' : isTop3 ? 'text-amber-300' : 'text-white'
          }`}>
            {formatCurrency(item.totalBidAmount)}
          </span>
        </div>

        {/* Dedicated Outbid Button with stopPropagation */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaimRank(item.totalBidAmount + 1);
          }}
          className={`py-2 px-3 sm:px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            isTop1
              ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20 font-black'
              : isTop2
              ? 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold'
              : isTop3
              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 hover:border-white/20'
          }`}
        >
          <Zap className={`size-3.5 ${isTop1 || isTop2 || isTop3 ? 'fill-zinc-950' : 'text-amber-400'}`} />
          <span>Outbid</span>
        </button>
      </div>
    </div>
  );
}
