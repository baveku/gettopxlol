'use client';

import React from 'react';
import { formatCurrency, timeAgo, formatNumber } from '@/lib/utils';
import { Crown, Zap, ArrowUpRight, Users, Eye } from 'lucide-react';

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

  // Render Bio with highlighted @mentions, #hashtags, and links
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

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none border relative overflow-hidden group ${
        isTop1
          ? 'bg-[#121316] border-amber-500/50 shadow-[0_4px_30px_rgba(245,158,11,0.12)] hover:border-amber-400 hover:shadow-[0_6px_36px_rgba(245,158,11,0.2)]'
          : isTop2
          ? 'bg-[#16181c] border-slate-600/50 hover:border-slate-400'
          : isTop3
          ? 'bg-[#16181c] border-amber-800/40 hover:border-amber-600'
          : 'bg-[#16181c] border-[#2f3336] hover:border-[#536471] hover:bg-[#1a1d22]'
      }`}
    >
      {/* Top ambient accent glow line for Top 1 */}
      {isTop1 && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
      )}

      <div className="flex items-start justify-between gap-4">
        
        {/* LEFT & CENTER CONTENT */}
        <div className="min-w-0 flex-1 flex items-start gap-3.5">
          {/* Rank + Avatar unit */}
          <div className="relative shrink-0 pt-0.5">
            <div className={`size-12 rounded-full overflow-hidden bg-[#202327] ${
              isTop1
                ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : isTop2
                ? 'ring-2 ring-slate-300'
                : isTop3
                ? 'ring-2 ring-amber-700'
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

            {/* Micro Rank Chip on Avatar Bottom */}
            <div className={`absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] shadow-md ${
              isTop1
                ? 'bg-amber-400 text-black ring-2 ring-[#121316]'
                : isTop2
                ? 'bg-slate-200 text-black ring-2 ring-[#16181c]'
                : isTop3
                ? 'bg-amber-700 text-white ring-2 ring-[#16181c]'
                : 'bg-[#202327] text-[#71767b] border border-[#2f3336] ring-2 ring-[#16181c]'
            }`}>
              {isTop1 ? '👑' : rank}
            </div>
          </div>

          {/* Profile Header & Bio */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Name + Verified + Handle */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
                {item.title || rawHandle}
              </span>

              {/* Verified Badge */}
              {isTop1 ? (
                <svg viewBox="0 0 24 24" aria-label="Verified gold account" className="w-[17px] h-[17px] fill-amber-400 shrink-0">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-label="Verified blue account" className="w-[16px] h-[16px] fill-[#1d9bf0] shrink-0">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6S8.65 2.475 8.01 3.738c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.64 1.263 2.01 2.138 3.59 2.138s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.7 4.29l-4.3-4.3 1.41-1.41 2.89 2.89 6.89-6.89 1.41 1.41-8.3 8.3z" />
                </svg>
              )}

              <span className="text-xs sm:text-sm text-[#71767b] font-mono">
                {handle}
              </span>

              <span className="text-[#71767b] text-xs">·</span>
              <span className="text-xs text-[#71767b]">{timeAgo(item.createdAt)}</span>
            </div>

            {/* Bio */}
            {item.description && (
              <p className="text-xs sm:text-[13px] text-[#cfd3d7] leading-relaxed line-clamp-2 font-normal">
                {renderBio(item.description)}
              </p>
            )}

            {/* Unified Metadata Footer Bar */}
            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#71767b] flex-wrap">
              {item.followers ? (
                <div className="flex items-center gap-1 text-[#e7e9ea]">
                  <Users className="size-3 text-[#1d9bf0]" />
                  <span className="font-bold text-white">{item.followers}</span>
                  <span className="text-[#71767b]">followers</span>
                </div>
              ) : null}

              {item.followers ? <span>·</span> : null}

              <div className="flex items-center gap-1 text-[#00ba7c]">
                <Eye className="size-3" />
                <span className="font-bold text-[#00ba7c]">{formatNumber(item.clickCount)}</span>
                <span>visits</span>
              </div>

              <span>·</span>

              <div className="flex items-center gap-1">
                <span>Valuation:</span>
                <span className={`font-bold ${isTop1 ? 'text-amber-400' : 'text-white'}`}>
                  {formatCurrency(item.totalBidAmount)}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-0.5 text-[#71767b] hover:text-[#1d9bf0] transition ml-auto">
                <span>x.com/{rawHandle}</span>
                <ArrowUpRight className="size-3" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ACTION BUTTON */}
        <div className="shrink-0 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClaimRank(item.totalBidAmount + 1);
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md ${
              isTop1
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'bg-white hover:bg-[#eff3f4] text-black hover:shadow-lg'
            }`}
          >
            <Zap className="size-3.5 fill-black text-black" />
            <span>Outbid</span>
          </button>
        </div>

      </div>
    </div>
  );
}
