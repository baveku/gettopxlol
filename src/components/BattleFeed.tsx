'use client';

import React from 'react';
import { Swords, Flame, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BattleEvent {
  id: string;
  domain: string;
  amount: number;
  targetRank?: number;
  timeStr: string;
}

interface BattleFeedProps {
  recentEvents?: BattleEvent[];
}

export function BattleFeed({ recentEvents }: BattleFeedProps) {
  const events: BattleEvent[] = recentEvents && recentEvents.length > 0
    ? recentEvents
    : [
        { id: '1', domain: 'lathire.com', amount: 7000, targetRank: 1, timeStr: 'Just now' },
        { id: '2', domain: 'mytb.ai', amount: 2999, targetRank: 3, timeStr: '12m ago' },
        { id: '3', domain: 'trycomp.ai', amount: 10000, targetRank: 1, timeStr: '1h ago' },
      ];

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 backdrop-blur mb-8">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 px-2 mb-1.5 uppercase tracking-wider">
        <Swords className="size-3.5" />
        <span>Live Combat Log</span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar text-xs py-0.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-slate-300"
          >
            <span className="flex size-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="font-bold text-amber-300">{ev.domain}</span>
            <span className="text-slate-400">struck with</span>
            <span className="font-extrabold text-emerald-400">{formatCurrency(ev.amount)}</span>
            <span className="text-[10px] text-slate-500 font-mono">({ev.timeStr})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
