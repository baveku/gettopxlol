'use client';

import React from 'react';
import { formatCurrency, timeAgo, formatNumber } from '@/lib/utils';
import { ExternalLink, ShieldCheck, Flame, Eye, Crown, Zap, Sparkles } from 'lucide-react';

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
  const faviconSrc = item.faviconUrl || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`;

  // Handle card click to open product redirect URL
  const handleCardClick = () => {
    window.open(`/api/r/${item.id}`, '_blank', 'noopener,noreferrer');
  };

  // Styling & Shining effects based on rank
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
      {/* Left section: Rank + Favicon + Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
        {/* Rank Badge */}
        <div className={rankBadgeClass}>
          {isTop1 ? <Crown className="size-4.5 fill-zinc-950" /> : `#${rank}`}
        </div>

        {/* Favicon Logo with glowing border for top ranks */}
        <div className={`size-9 sm:size-10 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
          isTop1
            ? 'bg-amber-950/80 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            : isTop2
            ? 'bg-slate-900/80 border border-slate-300/40 shadow-[0_0_12px_rgba(203,213,225,0.2)]'
            : isTop3
            ? 'bg-amber-950/80 border border-amber-600/40 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
            : 'bg-zinc-900/90 border border-white/10'
        }`}>
          <img
            src={faviconSrc}
            alt={item.domain}
            className="size-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold text-sm sm:text-base transition flex items-center gap-1 truncate group-hover:underline ${
                isTop1
                  ? 'text-amber-200 group-hover:text-amber-100'
                  : isTop2
                  ? 'text-slate-100 group-hover:text-white'
                  : isTop3
                  ? 'text-amber-100 group-hover:text-white'
                  : 'text-zinc-100 group-hover:text-amber-400'
              }`}
            >
              <span className="truncate">{item.domain}</span>
              <ExternalLink className="size-3 opacity-60 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
            </span>

            {isTop1 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shrink-0">
                <Sparkles className="size-2.5 text-amber-300 fill-amber-300" />
                <span>#1 SPOTLIGHT</span>
              </span>
            )}
            {isTop2 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-200 border border-slate-400/30 shrink-0">
                #2 Contender
              </span>
            )}
            {isTop3 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-300 border border-amber-700/30 shrink-0">
                #3 Contender
              </span>
            )}
            {item.status === 'ACTIVE' && (
              <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
            )}
          </div>

          <p className="text-xs text-zinc-300 truncate mt-0.5 max-w-md">
            {item.description || item.title}
          </p>

          {/* Live Clicks & Time */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {formatNumber(item.clickCount)} clicks
            </span>
            <span>·</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right section: Valuation + Outbid Trigger */}
      <div className="flex items-center gap-3 shrink-0 relative z-10">
        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
            Valuation
          </span>
          <span className={`font-mono font-bold text-sm sm:text-base ${
            isTop1 ? 'text-amber-400 font-extrabold' : isTop2 ? 'text-slate-200' : isTop3 ? 'text-amber-300' : 'text-zinc-100'
          }`}>
            {formatCurrency(item.totalBidAmount)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaimRank(item.totalBidAmount + 1);
          }}
          className={`py-2 px-3 sm:px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 z-20 ${
            isTop1
              ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg shadow-amber-500/30 font-black'
              : isTop2
              ? 'bg-slate-200 hover:bg-white text-zinc-950 shadow-md shadow-slate-400/20'
              : isTop3
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-700/20'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 hover:border-white/20'
          }`}
        >
          <Zap className={`size-3.5 ${isTop1 ? 'fill-zinc-950' : 'text-amber-400'}`} />
          <span className="hidden sm:inline">Outbid</span>
        </button>
      </div>
    </div>
  );
}
