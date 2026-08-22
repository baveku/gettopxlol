'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { UnifiedBoard } from '@/components/UnifiedBoard';
import { OutbidConsole } from '@/components/OutbidConsole';
import { LiveActivityStream } from '@/components/LiveActivityStream';
import { LeaderboardItemData } from '@/components/LeaderboardItem';
import { PaymentModal } from '@/components/PaymentModal';

interface LeaderboardViewProps {
  initialData?: {
    items: LeaderboardItemData[];
    activeTakeover: any;
    stats: {
      totalItems: number;
      totalClicks: number;
      onlineVisitors: number;
      topBid: number;
      takeoverPrice: number;
      totalTransactions: number;
    };
  };
}

export function LeaderboardView({ initialData }: LeaderboardViewProps) {
  const [items, setItems] = useState<LeaderboardItemData[]>(initialData?.items || []);
  const [activeTakeover, setActiveTakeover] = useState<any>(initialData?.activeTakeover || null);
  const [onlineVisitors, setOnlineVisitors] = useState<number>(initialData?.stats?.onlineVisitors || 1);
  const [totalClicks, setTotalClicks] = useState<number>(initialData?.stats?.totalClicks || 0);
  const [topBid, setTopBid] = useState<number>(initialData?.stats?.topBid || 0);
  const [takeoverPrice, setTakeoverPrice] = useState<number>(initialData?.stats?.takeoverPrice || 50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetRankAmount, setTargetRankAmount] = useState<number | null>(null);
  const [pendingBidData, setPendingBidData] = useState<any | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setActiveTakeover(data.activeTakeover || null);
        if (data.stats) {
          setTotalClicks(data.stats.totalClicks || 0);
          setOnlineVisitors(data.stats.onlineVisitors || 1);
          setTopBid(data.stats.topBid || 0);
          setTakeoverPrice(data.stats.takeoverPrice || 50);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'VISITOR_UPDATE') {
          setOnlineVisitors(data.onlineVisitors || 1);
        } else if (data.type === 'CLICK_UPDATE') {
          setItems((prev) =>
            prev.map((item) =>
              item.id === data.itemId
                ? { ...item, clickCount: data.newClickCount }
                : item
            )
          );
          setTotalClicks((prev) => prev + 1);
        } else if (data.type === 'BID_COMPLETED' || data.type === 'LEADERBOARD_UPDATE') {
          fetchLeaderboard();
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchLeaderboard]);

  const handleClaimRank = (amount: number) => {
    setTargetRankAmount(amount);
    const bentoInput = document.getElementById('bento-input');
    if (bentoInput) {
      bentoInput.focus();
      bentoInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInitiateBid = (bidData: any) => {
    setPendingBidData(bidData);
  };

  const handleTakeoverClick = () => {
    setPendingBidData({
      url: 'https://x.com/yourhandle',
      domain: '@yourhandle',
      email: '',
      amount: takeoverPrice,
      title: '3-Hour VIP Takeover',
      description: 'Own the #1 spotlight exclusively for 3 hours on gettopx.lol!',
      faviconUrl: 'https://unavatar.io/x/x',
      isTakeover: true,
      existingAmount: 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-20 max-w-6xl mx-auto w-full relative">
      {/* 𝕏 Header */}
      <Header
        onlineVisitors={onlineVisitors}
        totalClicks={totalClicks}
      />

      {/* Main Grid: Left = Top 10 X Timeline, Right = Outbid & Live Feed */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (7 Cols): TOP 10 LEADERBOARD ON X */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#e7e9ea] tracking-tight">
              Top 10 Spotlight on <span className="text-white font-mono">𝕏</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#71767b] font-normal">
              No gatekeepers. Outbid the competition in real time to claim the #1 spotlight for your 𝕏 profile on gettopx.lol.
            </p>
          </div>

          <UnifiedBoard
            items={items}
            onClaimRank={handleClaimRank}
            onRefresh={fetchLeaderboard}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT COLUMN (5 Cols): OUTBID + REALTIME FEED */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {/* Outbid Console */}
          <OutbidConsole
            topBid={topBid}
            takeoverPrice={takeoverPrice}
            onInitiateBid={handleInitiateBid}
            onTakeoverClick={handleTakeoverClick}
            presetTargetRankAmount={targetRankAmount}
          />

          {/* Real-time Activity Feed */}
          <LiveActivityStream />
        </div>

      </div>

      {/* Root-Level Single Payment Modal */}
      <PaymentModal
        isOpen={Boolean(pendingBidData)}
        onClose={() => setPendingBidData(null)}
        bidData={pendingBidData}
        onSuccess={() => {
          fetchLeaderboard();
          setTargetRankAmount(null);
        }}
      />

      {/* 𝕏 Footer */}
      <footer className="mt-20 text-center text-xs text-[#71767b] space-y-3 border-t border-[#2f3336] pt-8 w-full">
        <div className="flex items-center justify-center gap-5 font-bold text-[#71767b]">
          <Link href="/" className="hover:text-white transition">Leaderboard</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-white transition">Rules & Guidelines</Link>
        </div>

        <p className="text-[#71767b]/70 text-[11px]">
          GetTopX (gettopx.lol) — The sovereign pay-to-rank spotlight for 𝕏 creators & founders. Powered by Polar.sh & Supabase.
        </p>
      </footer>
    </div>
  );
}
