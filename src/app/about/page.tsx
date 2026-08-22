'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Zap, Sparkles, Trophy, TrendingUp, ArrowRight, HelpCircle, Layers } from 'lucide-react';

export default function AboutPage() {
  const [stats, setStats] = useState({
    onlineVisitors: 1,
    totalClicks: 0,
    topBid: 0,
    topDomain: 'Available',
    totalItems: 0,
  });

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats({
            onlineVisitors: data.stats.onlineVisitors || 1,
            totalClicks: data.stats.totalClicks || 0,
            topBid: data.stats.topBid || 0,
            topDomain: data.items?.[0]?.domain || 'Unclaimed',
            totalItems: data.stats.totalItems || 0,
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-20 max-w-6xl mx-auto w-full">
      <Header onlineVisitors={stats.onlineVisitors} totalClicks={stats.totalClicks} />

      <main className="w-full max-w-4xl space-y-12 animate-in fade-in duration-300">
        {/* Top Badge & Hero */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-xs font-bold text-amber-400">
            <Zap className="size-3.5 fill-amber-400" />
            <span>The Spotlight on 𝕏</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            About GetTopX
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            GetTopX (<strong className="text-zinc-200">gettopx.lol</strong>) is a sovereign meritocratic leaderboard where X (Twitter) accounts compete for the #1 spotlight. No opaque algorithms, no ad networks, no gatekeepers.
          </p>
        </div>

        {/* REAL LIVE PLATFORM METRICS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Real-Time Platform State</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ● Live Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Metric 1: Claimed Spots */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Layers className="size-3.5 text-amber-400" />
                <span>Claimed Spots</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-white">
                {stats.totalItems} <span className="text-xs text-zinc-500 font-normal">/ 10</span>
              </p>
              <p className="text-[11px] text-zinc-500">active X accounts</p>
            </div>

            {/* Metric 2: Highest Valuation */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-1 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Trophy className="size-3.5 text-amber-400" />
                <span>#1 Spotlight</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-amber-400">
                {stats.topBid > 0 ? formatCurrency(stats.topBid) : '$2 min'}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">{stats.topDomain}</p>
            </div>

            {/* Metric 3: Total Clicks Delivered */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <TrendingUp className="size-3.5 text-emerald-400" />
                <span>Profile Visits</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-emerald-400">
                {formatNumber(stats.totalClicks)}
              </p>
              <p className="text-[11px] text-zinc-500">outbound clicks to X</p>
            </div>

            {/* Metric 4: Realtime Visitors */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>Live Audience</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-white">
                {formatNumber(stats.onlineVisitors)}
              </p>
              <p className="text-[11px] text-zinc-500">active connections</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            How GetTopX Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Every X (Twitter) profile listed on GetTopX is ranked purely on its cumulative bid power. Enter your X handle (<strong className="text-white">@username</strong>), pay to place your profile on the board, and your ranking valuation stacks permanently on your handle.
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            When another creator or account outbids you, you simply drop to rank #2 with your full valuation intact. You can reclaim #1 anytime by bidding only the difference.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="size-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">Permanent Handle Power</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every dollar you bid stacks permanently on top of your @handle power. You never start from zero when defending your rank on X.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              🎯
            </div>
            <h3 className="text-base font-bold text-white">Direct X Profile Traffic</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every click routes directly to your X profile (<strong className="text-zinc-200">x.com/username</strong>) with verified real-time analytics.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <div className="size-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              👑
            </div>
            <h3 className="text-base font-bold text-white">3-Hour VIP Takeover</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Activate the VIP takeover option to exclusively dominate the #1 spotlight on X for 3 hours straight with dedicated branding.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="size-5 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="glass-panel p-5 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-white">Can someone outbid my X handle?</h4>
              <p className="text-zinc-400">
                Yes! If another account outbids you, your profile moves down to rank #2, keeping all your accumulated valuation intact. You can outbid them back anytime with an incremental bid.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-white">Do past bids expire?</h4>
              <p className="text-zinc-400">
                Never. Bids are permanently cumulative. If you bid $50 today and $50 next week, your X handle has $100 total ranking power forever.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-white">Which X accounts can be listed?</h4>
              <p className="text-zinc-400">
                Any public, active X (Twitter) account — creators, founders, traders, developers, projects, and personal brands. Suspended, bot, or illegal accounts are strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-3.5 text-sm transition shadow-lg active:scale-95"
          >
            <span>View Live GetTopX Leaderboard</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-zinc-500 space-y-3 border-t border-white/[0.07] pt-8 w-full">
        <div className="flex items-center justify-center gap-5 font-semibold text-zinc-400">
          <Link href="/" className="hover:text-white transition">Leaderboard</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-white transition">Rules & Guidelines</Link>
        </div>
      </footer>
    </div>
  );
}
