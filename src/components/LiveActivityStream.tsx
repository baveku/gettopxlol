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
            detail: 'received a profile visit',
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
        console.error('Error parsing activity stream SSE:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-5 space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#e7e9ea] flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#00ba7c] animate-pulse"></span>
          <span>Live 𝕏 Feed</span>
        </h3>
        <span className="text-[10px] font-mono text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/20 px-2 py-0.5 rounded-full">
          Realtime
        </span>
      </div>

      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#000000] border border-[#2f3336] text-xs transition animate-in fade-in"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="size-6 rounded-full bg-[#202327] flex items-center justify-center shrink-0">
                  {evt.type === 'click' ? (
                    <MousePointerClick className="size-3 text-[#00ba7c]" />
                  ) : (
                    <Zap className="size-3 text-amber-400 fill-amber-400" />
                  )}
                </div>

                <div className="truncate">
                  <span className="font-bold text-[#e7e9ea] truncate mr-1 font-mono">
                    {evt.title}
                  </span>
                  <span className="text-[#71767b]">{evt.detail}</span>
                </div>
              </div>

              <span className="text-[10px] text-[#71767b] shrink-0 ml-2 font-mono">
                {evt.timestamp}
              </span>
            </div>
          ))
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#000000]/60 border border-dashed border-[#2f3336] space-y-1">
            <Activity className="size-5 text-[#71767b] mx-auto opacity-50" />
            <p className="text-xs text-[#71767b] font-medium">Waiting for live 𝕏 activity...</p>
            <p className="text-[11px] text-[#71767b]/70">
              Real-time bids and profile visits will stream here as they happen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
