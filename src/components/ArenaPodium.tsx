'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Crown, Sparkles, Swords, ExternalLink, ShieldCheck, Flame } from 'lucide-react';
import { LeaderboardItemData } from './LeaderboardItem';

interface ArenaPodiumProps {
  top3: LeaderboardItemData[];
  onStrikeRank: (amount: number) => void;
}

export function ArenaPodium({ top3, onStrikeRank }: ArenaPodiumProps) {
  if (top3.length === 0) return null;

  const king = top3[0];
  const warlord = top3[1];
  const gladiator = top3[2];

  return (
    <div className="w-full mb-10">
      <div className="text-center mb-4">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 flex items-center justify-center gap-2">
          <Crown className="size-4 text-amber-400" />
          <span>The Champions Podium</span>
          <Crown className="size-4 text-amber-400" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-8">
        
        {/* RANK #2: WARLORD (Left) */}
        {warlord ? (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="relative w-full rounded-2xl border-2 border-slate-700 bg-gradient-to-b from-slate-800/90 to-slate-950 p-4 shadow-xl text-center backdrop-blur transition-all hover:border-slate-500 hover:scale-[1.02]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center size-8 rounded-full bg-slate-300 text-slate-950 font-black text-sm shadow-md border-2 border-slate-600">
                #2
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className="size-12 rounded-xl bg-slate-900 border border-slate-700 p-1.5 flex items-center justify-center overflow-hidden mb-2">
                  {warlord.faviconUrl ? (
                    <img src={warlord.faviconUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-slate-300">{warlord.domain[0]}</span>
                  )}
                </div>

                <a
                  href={`/api/r/${warlord.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-100 hover:text-amber-400 transition truncate max-w-full text-base flex items-center gap-1"
                >
                  <span>{warlord.domain}</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                  {warlord.description || warlord.title}
                </p>

                <div className="mt-3 flex items-center justify-between w-full pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">Bounty:</span>
                  <span className="font-extrabold text-slate-200 text-sm">
                    {formatCurrency(warlord.totalBidAmount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStrikeRank(warlord.totalBidAmount + 1)}
                  className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Swords className="size-3 text-slate-400" />
                  <span>Challenge #2 ({formatCurrency(warlord.totalBidAmount + 1)})</span>
                </button>
              </div>
            </div>
            {/* Podium Base */}
            <div className="hidden md:flex w-full h-12 bg-gradient-to-b from-slate-800 to-slate-950 border-x border-b border-slate-700/80 rounded-b-xl items-center justify-center text-xs font-bold text-slate-500">
              WARLORD PODIUM
            </div>
          </div>
        ) : <div className="hidden md:block" />}

        {/* RANK #1: THE REIGNING KING (Center - Elevated) */}
        {king && (
          <div className="order-1 md:order-2 flex flex-col items-center relative -mt-4 sm:-mt-6">
            <div className="relative w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-950/60 via-slate-900/90 to-slate-950 p-5 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center backdrop-blur transition-all gold-glow hover:scale-[1.03]">
              {/* Glowing Crown */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-bounce">
                  <Crown className="size-7 fill-slate-950" />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full mb-2">
                  👑 Reigning Arena King
                </span>

                <div className="size-14 rounded-2xl bg-slate-900 border-2 border-amber-400/80 p-2 flex items-center justify-center overflow-hidden mb-2 shadow-md">
                  {king.faviconUrl ? (
                    <img src={king.faviconUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-amber-400">{king.domain[0]}</span>
                  )}
                </div>

                <a
                  href={`/api/r/${king.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-amber-300 hover:text-amber-200 transition truncate max-w-full text-lg flex items-center gap-1.5"
                >
                  <span>{king.domain}</span>
                  <ExternalLink className="size-4 text-amber-400" />
                </a>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-medium min-h-[32px]">
                  {king.description || king.title}
                </p>

                <div className="mt-3 flex items-center justify-between w-full pt-2 border-t border-amber-500/20 text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Flame className="size-3.5" /> Total Bounty:
                  </span>
                  <span className="font-black text-amber-300 text-base tabular-nums">
                    {formatCurrency(king.totalBidAmount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStrikeRank(king.totalBidAmount + 1)}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wide active:scale-95"
                >
                  <Swords className="size-4" />
                  <span>Dethrone for {formatCurrency(king.totalBidAmount + 1)}</span>
                </button>
              </div>
            </div>

            {/* King Podium Base */}
            <div className="hidden md:flex w-full h-20 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-x border-b border-amber-500/40 rounded-b-2xl items-center justify-center flex-col text-xs font-black text-amber-400">
              <span className="tracking-widest">THRONEROOM PODIUM #1</span>
              <span className="text-[10px] text-slate-500 font-normal">{king.clickCount} Outbound Strikes</span>
            </div>
          </div>
        )}

        {/* RANK #3: GLADIATOR (Right) */}
        {gladiator ? (
          <div className="order-3 flex flex-col items-center">
            <div className="relative w-full rounded-2xl border-2 border-amber-800/80 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-xl text-center backdrop-blur transition-all hover:border-amber-700 hover:scale-[1.02]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center size-8 rounded-full bg-amber-700 text-white font-black text-sm shadow-md border-2 border-amber-900">
                #3
              </div>

              <div className="mt-2 flex flex-col items-center">
                <div className="size-12 rounded-xl bg-slate-900 border border-slate-700 p-1.5 flex items-center justify-center overflow-hidden mb-2">
                  {gladiator.faviconUrl ? (
                    <img src={gladiator.faviconUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-amber-500">{gladiator.domain[0]}</span>
                  )}
                </div>

                <a
                  href={`/api/r/${gladiator.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-100 hover:text-amber-400 transition truncate max-w-full text-base flex items-center gap-1"
                >
                  <span>{gladiator.domain}</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                  {gladiator.description || gladiator.title}
                </p>

                <div className="mt-3 flex items-center justify-between w-full pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">Bounty:</span>
                  <span className="font-extrabold text-amber-500 text-sm">
                    {formatCurrency(gladiator.totalBidAmount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStrikeRank(gladiator.totalBidAmount + 1)}
                  className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Swords className="size-3 text-amber-600" />
                  <span>Challenge #3 ({formatCurrency(gladiator.totalBidAmount + 1)})</span>
                </button>
              </div>
            </div>
            {/* Podium Base */}
            <div className="hidden md:flex w-full h-8 bg-gradient-to-b from-slate-900 to-slate-950 border-x border-b border-amber-900/60 rounded-b-xl items-center justify-center text-xs font-bold text-amber-800">
              GLADIATOR PODIUM
            </div>
          </div>
        ) : <div className="hidden md:block" />}

      </div>
    </div>
  );
}
