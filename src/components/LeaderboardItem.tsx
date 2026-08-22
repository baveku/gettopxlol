'use client';

import React from 'react';
import { formatCurrency, timeAgo, formatNumber } from '@/lib/utils';
import { Crown, Zap, ExternalLink, ArrowUpRight, Users, TrendingUp, Sparkles } from 'lucide-react';

export interface LeaderboardItemData {
  id: string;
  url: string;
  domain: string;
  title: string;
  description: string | null;
  faviconUrl: string | null;
  followers?: string | null;
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
  const handle = item.domain.startsWith('@') ? item.domain : `@${item.domain}`;
  const rawHandle = item.domain.replace(/^@/, '');
  const avatarSrc = item.faviconUrl || `https://unavatar.io/x/${rawHandle}`;

  const handleCardClick = () => {
    window.open(`/api/r/${item.id}`, '_blank', 'noopener,noreferrer');
  };

  // Render Bio with highlighted @mentions, #hashtags, and URLs
  const renderBio = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('@') || part.startsWith('#')) {
        return (
          <span key={i} className="text-[#1d9bf0] hover:underline font-medium cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <span key={i} className="text-[#1d9bf0] hover:underline font-medium cursor-pointer">
            {part.replace(/^https?:\/\//, '')}
          </span>
        );
      }
      return part;
    });
  };

  let cardStyle = 'p-4 sm:p-5 rounded-2xl flex items-start justify-between gap-3.5 sm:gap-4.5 group transition-all duration-200 relative cursor-pointer select-none border ';

  if (isTop1) {
    cardStyle += 'bg-gradient-to-b from-[#18150c] via-[#16181c] to-[#121417] border-amber-500/50 shadow-[0_4px_30px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_6px_36px_rgba(245,158,11,0.22)]';
  } else if (isTop2) {
    cardStyle += 'bg-[#16181c] border-slate-400/35 hover:border-slate-300 shadow-[0_2px_15px_rgba(255,255,255,0.03)]';
  } else if (isTop3) {
    cardStyle += 'bg-[#16181c] border-amber-700/35 hover:border-amber-600 shadow-[0_2px_15px_rgba(217,119,6,0.04)]';
  } else {
    cardStyle += 'bg-[#16181c] border-[#2f3336] hover:border-[#536471] hover:bg-[#1a1d22]';
  }

  return (
    <div
      onClick={handleCardClick}
      className={cardStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* LEFT: Rank Badge + Profile Avatar */}
      <div className="flex items-start gap-3 shrink-0">
        {/* Rank Badge */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          {isTop1 ? (
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-300">
              <Crown className="size-4.5 fill-black text-black" />
            </div>
          ) : (
            <div className={`size-7 rounded-full flex items-center justify-center font-mono font-black text-xs ${
              isTop2
                ? 'bg-gradient-to-b from-slate-100 to-slate-300 text-black shadow-sm ring-1 ring-white/50'
                : isTop3
                ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-white shadow-sm ring-1 ring-amber-600/50'
                : 'bg-[#202327] text-[#71767b] border border-[#2f3336]'
            }`}>
              #{rank}
            </div>
          )}
        </div>

        {/* X Avatar with Glow Ring */}
        <div className={`size-11 sm:size-12 rounded-full overflow-hidden shrink-0 bg-[#202327] relative transition-transform duration-200 group-hover:scale-105 ${
          isTop1
            ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
            : isTop2
            ? 'ring-2 ring-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.2)]'
            : isTop3
            ? 'ring-2 ring-amber-600'
            : 'ring-1 ring-[#2f3336]'
        }`}>
          <img
            src={avatarSrc}
            alt={handle}
            className="size-full rounded-full object-cover bg-[#16181c]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${rawHandle}`;
            }}
          />
        </div>
      </div>

      {/* MIDDLE: 𝕏 Profile Details & Metrics */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* LINE 1: Name + Verified Check + Handle + Timestamp + Spotlight Tag */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
            {item.title || rawHandle}
          </span>

          {/* Official 𝕏 Verified Badge */}
          {isTop1 ? (
            <svg viewBox="0 0 24 24" aria-label="Verified gold account" className="w-[18px] h-[18px] fill-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-label="Verified blue account" className="w-[17px] h-[17px] fill-[#1d9bf0] shrink-0">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
            </svg>
          )}

          {/* Handle */}
          <span className="text-xs sm:text-sm text-[#71767b] font-mono hover:text-[#e7e9ea] transition-colors">
            {handle}
          </span>

          <span className="text-[#71767b] text-xs">·</span>
          <span className="text-xs text-[#71767b]">{timeAgo(item.createdAt)}</span>

          {isTop1 ? (
            <span className="text-[10px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/25 to-yellow-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)] ml-auto sm:ml-2">
              👑 #1 APEX SPOTLIGHT
            </span>
          ) : null}
        </div>

        {/* LINE 2: Creator Pitch / Bio */}
        {item.description && (
          <p className="text-xs sm:text-[13px] text-[#d7d9dc] leading-relaxed line-clamp-2 pt-0.5 font-normal">
            {renderBio(item.description)}
          </p>
        )}

        {/* LINE 3: Social & Rank Badges Bar */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-[#71767b] pt-2 flex-wrap">
          {/* Follower Count Chip */}
          {item.followers ? (
            <div className="flex items-center gap-1.5 font-mono text-[#e7e9ea] bg-[#1d9bf0]/10 border border-[#1d9bf0]/25 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <Users className="size-3 text-[#1d9bf0]" />
              <span className="text-white">{item.followers}</span>
              <span className="text-[#71767b] font-normal">followers</span>
            </div>
          ) : null}

          {/* Live Clicks Chip */}
          <div className="flex items-center gap-1.5 font-mono text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/25 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00ba7c] opacity-75"></span>
              <span className="relative inline-flex size-1.5 rounded-full bg-[#00ba7c]"></span>
            </span>
            <span>{formatNumber(item.clickCount)} visits</span>
          </div>

          {/* Valuation Chip */}
          <div className={`flex items-center gap-1 font-mono px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            isTop1
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
              : 'bg-[#202327] border-[#2f3336] text-[#e7e9ea]'
          }`}>
            <span className="text-[#71767b] font-normal">Valuation:</span>
            <strong className={isTop1 ? 'text-amber-400' : 'text-white'}>
              {formatCurrency(item.totalBidAmount)}
            </strong>
          </div>

          {/* Direct Profile Link Hook */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-[#71767b] hover:text-[#1d9bf0] transition font-mono ml-auto">
            <span>x.com/{rawHandle}</span>
            <ArrowUpRight className="size-3" />
          </div>
        </div>
      </div>

      {/* RIGHT: Outbid Action Button */}
      <div className="shrink-0 flex items-center self-center pl-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaimRank(item.totalBidAmount + 1);
          }}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
            isTop1
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : 'bg-white hover:bg-[#eff3f4] text-black hover:shadow-lg'
          }`}
        >
          <Zap className={`size-3.5 ${isTop1 ? 'fill-black text-black' : 'fill-black text-black'}`} />
          <span>Outbid</span>
        </button>
      </div>
    </div>
  );
}
