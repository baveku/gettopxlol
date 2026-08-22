'use client';

import React from 'react';
import { formatCurrency, timeAgo, formatNumber } from '@/lib/utils';
import { Crown, Zap, ExternalLink, ArrowUpRight } from 'lucide-react';

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
  const handle = item.domain.startsWith('@') ? item.domain : `@${item.domain}`;
  const rawHandle = item.domain.replace(/^@/, '');
  const avatarSrc = item.faviconUrl || `https://unavatar.io/x/${rawHandle}`;

  const handleCardClick = () => {
    window.open(`/api/r/${item.id}`, '_blank', 'noopener,noreferrer');
  };

  // Render Bio with highlighted @mentions and links
  const renderBio = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('@') || part.startsWith('#')) {
        return (
          <span key={i} className="text-[#1d9bf0] hover:underline font-medium">
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <span key={i} className="text-[#1d9bf0] hover:underline font-medium">
            {part.replace(/^https?:\/\//, '')}
          </span>
        );
      }
      return part;
    });
  };

  let rowContainerClass = 'p-4 sm:p-5 rounded-2xl flex items-start justify-between gap-3.5 sm:gap-4 group transition-all relative cursor-pointer select-none border ';

  if (isTop1) {
    rowContainerClass += 'x-top1 hover:bg-[#1f1a14]';
  } else if (isTop2) {
    rowContainerClass += 'bg-[#16181c] border-[#38444d] hover:bg-[#1a1d22]';
  } else if (isTop3) {
    rowContainerClass += 'bg-[#16181c] border-[#38444d] hover:bg-[#1a1d22]';
  } else {
    rowContainerClass += 'bg-[#16181c] border-[#2f3336] hover:bg-[#1a1d22]';
  }

  return (
    <div
      onClick={handleCardClick}
      className={rowContainerClass}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Left: Rank Badge + X Avatar */}
      <div className="flex items-start gap-3 shrink-0">
        {/* Rank Number / Crown */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          {isTop1 ? (
            <div className="size-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="size-4.5 fill-black text-black" />
            </div>
          ) : (
            <div className={`size-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
              isTop2
                ? 'bg-slate-200 text-black'
                : isTop3
                ? 'bg-amber-700 text-white'
                : 'bg-[#202327] text-[#71767b] border border-[#2f3336]'
            }`}>
              #{rank}
            </div>
          )}
        </div>

        {/* X Profile Avatar */}
        <div className={`size-11 sm:size-12 rounded-full overflow-hidden shrink-0 bg-[#202327] ${
          isTop1
            ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : isTop2
            ? 'ring-2 ring-slate-300'
            : isTop3
            ? 'ring-2 ring-amber-600'
            : 'ring-1 ring-[#2f3336]'
        }`}>
          <img
            src={avatarSrc}
            alt={handle}
            className="size-full rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${rawHandle}`;
            }}
          />
        </div>
      </div>

      {/* Middle: X Profile Details & Bio */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Line 1: Name + Verified + Handle + Rank Tag */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-extrabold text-sm sm:text-base text-[#e7e9ea] group-hover:underline truncate">
            {item.title || rawHandle}
          </span>

          {/* Official X Verified Badge SVG */}
          {isTop1 ? (
            <svg viewBox="0 0 24 24" aria-label="Verified organization" className="size-4 fill-amber-400 shrink-0">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-label="Verified account" className="size-4 fill-[#1d9bf0] shrink-0">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
            </svg>
          )}

          {/* Handle */}
          <span className="text-xs sm:text-sm text-[#71767b] font-mono">
            {handle}
          </span>

          <span className="text-[#71767b] text-xs">·</span>
          <span className="text-xs text-[#71767b]">{timeAgo(item.createdAt)}</span>

          {isTop1 ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 ml-auto sm:ml-1">
              👑 #1 APEX SPOTLIGHT
            </span>
          ) : null}
        </div>

        {/* Line 2: Creator Bio */}
        {item.description && (
          <p className="text-xs sm:text-sm text-[#e7e9ea] leading-relaxed line-clamp-2 pt-0.5">
            {renderBio(item.description)}
          </p>
        )}

        {/* Line 3: Social & Rank Metrics Bar */}
        <div className="flex items-center gap-4 text-xs text-[#71767b] pt-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[#00ba7c]">
            <span className="size-1.5 rounded-full bg-[#00ba7c] inline-block animate-pulse"></span>
            <span>{formatNumber(item.clickCount)} visits</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[#71767b]">
            <span>Valuation:</span>
            <strong className={`font-bold ${isTop1 ? 'text-amber-400' : 'text-white'}`}>
              {formatCurrency(item.totalBidAmount)}
            </strong>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] transition">
            <span>x.com/{rawHandle}</span>
            <ArrowUpRight className="size-3" />
          </div>
        </div>
      </div>

      {/* Right: Outbid Action Button */}
      <div className="shrink-0 pt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaimRank(item.totalBidAmount + 1);
          }}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
            isTop1
              ? 'x-btn-gold'
              : 'x-btn-primary'
          }`}
        >
          <Zap className="size-3.5 fill-current" />
          <span>Outbid</span>
        </button>
      </div>
    </div>
  );
}
