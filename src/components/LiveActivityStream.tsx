'use client';

import React, { useState, useEffect } from 'react';
import { Zap, MousePointerClick, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ActivityEvent {
  id: string;
  type: 'click' | 'bid' | 'takeover';
  title: string;
  detail: string;
  timestamp: string;
}

export function LiveActivityStream() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial real events from database
  useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error('Error fetching activity stream:', err))
      .finally(() => setLoading(false));
  }, []);

  // Listen to live SSE events
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CLICK_UPDATE') {
          const newEvt: ActivityEvent = {
            id: `live_click_${Date.now()}`,
            type: 'click',
            title: data.domain || 'Visitor',
            detail: 'received a live click',
            timestamp: 'just now',
          };
          setEvents((prev) => [newEvt, ...prev.slice(0, 5)]);
        } else if (data.type === 'BID_COMPLETED') {
          const newEvt: ActivityEvent = {
            id: `live_bid_${Date.now()}`,
            type: 'bid',
            title: data.item?.domain || 'Contender',
            detail: data.transaction?.isTakeover
              ? 'activated 3-Hour VIP Takeover'
              : `outbid with ${formatCurrency(data.transaction?.amount || data.item?.totalBidAmount || 2)}`,
            timestamp: 'just now',
          };
          setEvents((prev) => [newEvt, ...prev.slice(0, 5)]);
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
        {events.length > 0 ? (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-zinc-900/60 border border-white/5 animate-in fade-in"
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
          ))
        ) : (
          <div className="py-6 px-4 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-white/5 space-y-1.5">
            <Activity className="size-5 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-zinc-400">Waiting for live activity...</p>
            <p className="text-[11px] text-zinc-400">
              Real-time bids and clicks will stream here as they happen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
