'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Zap, MousePointerClick, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ActivityEvent {
  id: string;
  type: 'click' | 'bid' | 'takeover';
  title: string;
  detail: string;
  timestamp: string;
}

const INITIAL_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'click', title: 'trycomp.ai', detail: 'received a live click', timestamp: '2s ago' },
  { id: '2', type: 'click', title: 'lathire.com', detail: 'received a live click', timestamp: '8s ago' },
  { id: '3', type: 'bid', title: 'lathire.com', detail: 'raised bid to $10,100', timestamp: '5m ago' },
  { id: '4', type: 'click', title: 'joinklover.com', detail: 'received a live click', timestamp: '12m ago' },
  { id: '5', type: 'bid', title: 'trycomp.ai', detail: 'raised bid to $10,000', timestamp: '24m ago' },
];

export function LiveActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CLICK_UPDATE') {
          const newEvt: ActivityEvent = {
            id: Date.now().toString(),
            type: 'click',
            title: 'Live Visitor',
            detail: `clicked on ranking #${data.itemId.slice(-4)}`,
            timestamp: 'just now',
          };
          setEvents((prev) => [newEvt, ...prev.slice(0, 4)]);
        } else if (data.type === 'BID_COMPLETED') {
          const newEvt: ActivityEvent = {
            id: Date.now().toString(),
            type: 'bid',
            title: data.item?.domain || 'Contender',
            detail: `outbid with ${formatCurrency(data.amount || 100)}`,
            timestamp: 'just now',
          };
          setEvents((prev) => [newEvt, ...prev.slice(0, 4)]);
        }
      } catch (e) {
        console.error('Error handling SSE in ActivityStream:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="rounded-3xl glass-panel p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Live Activity Feed
          </span>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Realtime
        </span>
      </div>

      <div className="space-y-2">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-zinc-900/60 border border-white/5 animate-in fade-in"
          >
            <div className="flex items-center gap-2 min-w-0">
              {evt.type === 'bid' ? (
                <Zap className="size-3.5 text-amber-400 shrink-0 fill-amber-400" />
              ) : (
                <MousePointerClick className="size-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="font-bold text-zinc-200 truncate">{evt.title}</span>
              <span className="text-zinc-400 text-[11px] truncate">{evt.detail}</span>
            </div>

            <span className="text-[10px] text-zinc-400 font-mono shrink-0 pl-2">
              {evt.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
