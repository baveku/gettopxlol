'use client';

import React from 'react';
import { LeaderboardItemData } from './LeaderboardItem';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ExternalLink, Zap, X, ShieldCheck, Eye } from 'lucide-react';

interface BuildingHologramModalProps {
  item: LeaderboardItemData | null;
  rank: number;
  onClose: () => void;
  onOutbid: (amount: number) => void;
}

export function BuildingHologramModal({
  item,
  rank,
  onClose,
  onOutbid,
}: BuildingHologramModalProps) {
  if (!item) return null;

  const isTop1 = rank === 1;
  const faviconSrc = item.faviconUrl || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`rounded-3xl glass-panel p-5 backdrop-blur-2xl shadow-2xl relative border ${
        isTop1 ? 'border-amber-500/50 bg-amber-950/40' : 'border-white/15 bg-zinc-950/80'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          {/* Logo with Rank indicator */}
          <div className="relative">
            <div className="size-14 rounded-2xl bg-zinc-900 border border-white/15 p-2 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src={faviconSrc}
                alt={item.domain}
                className="size-full object-contain"
              />
            </div>
            <span className={`absolute -top-2 -left-2 size-6 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
              isTop1 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-700 text-white'
            }`}>
              #{rank}
            </span>
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white truncate">{item.domain}</h3>
              {item.status === 'ACTIVE' && (
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">{item.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-2xl bg-zinc-900/80 border border-white/5 text-xs">
          <div>
            <span className="text-zinc-400 text-[11px]">Tower Valuation</span>
            <p className="font-mono font-bold text-base text-amber-400">{formatCurrency(item.totalBidAmount)}</p>
          </div>
          <div>
            <span className="text-zinc-400 text-[11px]">Total Live Clicks</span>
            <p className="font-mono font-bold text-base text-emerald-400 flex items-center gap-1">
              <Eye className="size-3.5" />
              <span>{formatNumber(item.clickCount)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/r/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-white/10"
          >
            <span>Visit Website</span>
            <ExternalLink className="size-3.5" />
          </a>

          <button
            onClick={() => onOutbid(item.totalBidAmount + 1)}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Zap className="size-3.5 fill-zinc-950" />
            <span>Outbid Tower</span>
          </button>
        </div>
      </div>
    </div>
  );
}
