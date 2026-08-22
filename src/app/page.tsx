'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { UnifiedBoard } from '@/components/UnifiedBoard';
import { OutbidConsole } from '@/components/OutbidConsole';
import { LiveActivityStream } from '@/components/LiveActivityStream';
import { LeaderboardItemData } from '@/components/LeaderboardItem';
import { PaymentModal } from '@/components/PaymentModal';

export default function HomePage() {
  const [items, setItems] = useState<LeaderboardItemData[]>([]);
  const [activeTakeover, setActiveTakeover] = useState<any>(null);
  const [onlineVisitors, setOnlineVisitors] = useState<number>(1);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [topBid, setTopBid] = useState<number>(0);
  const [takeoverPrice, setTakeoverPrice] = useState<number>(50);
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
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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
      url: 'https://',
      domain: 'yourproduct.com',
      email: '',
      amount: takeoverPrice,
      title: '3-Hour VIP Takeover',
      description: 'Own the top spotlight exclusively for 3 hours on gettopx.lol!',
      faviconUrl: '',
      isTakeover: true,
      existingAmount: 0,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-20 max-w-6xl mx-auto w-full relative">
      {/* Header */}
      <Header
        onlineVisitors={onlineVisitors}
        totalClicks={totalClicks}
      />

      {/* Main Split Grid: Left = Top 10 Leaderboard, Right = Outbid & Live Activity */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (7 Cols / Main Stage): TOP 10 LEADERBOARD */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1 mb-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              TopX <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Live Spotlight</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              No gatekeepers. Outbid the competition in real time to claim the #1 spotlight on gettopx.lol.
            </p>
          </div>

          <UnifiedBoard
            items={items}
            onClaimRank={handleClaimRank}
            onRefresh={fetchLeaderboard}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT COLUMN (5 Cols / Sticky Companion): OUTBID + LIVE ACTIVITY STREAM */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* Quick Outbid Console */}
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

      {/* Footer */}
      <footer className="mt-20 text-center text-xs text-zinc-500 space-y-3 border-t border-white/[0.07] pt-8 w-full">
        <div className="flex items-center justify-center gap-5 font-semibold text-zinc-400">
          <Link href="/" className="hover:text-white transition">Leaderboard</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-white transition">Rules & Guidelines</Link>
        </div>

        <p className="text-zinc-600 text-[11px]">
          gettopx.lol (TopX) — The viral real-time pay-to-rank platform. Powered by Next.js 16 (Turbopack) & Prisma ORM.
        </p>
      </footer>
    </div>
  );
}
