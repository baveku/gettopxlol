import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Zap, Sparkles, Trophy, TrendingUp, ArrowRight, HelpCircle, Layers } from 'lucide-react';
import { getLeaderboardData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const data = await getLeaderboardData();
  const stats = {
    onlineVisitors: data.stats.onlineVisitors || 1,
    totalClicks: data.stats.totalClicks || 0,
    topBid: data.stats.topBid || 0,
    topDomain: data.items?.[0]?.domain || 'Unclaimed',
    totalItems: data.stats.totalItems || 0,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pb-20 max-w-6xl mx-auto w-full bg-black text-[#e7e9ea]">
      <Header onlineVisitors={stats.onlineVisitors} totalClicks={stats.totalClicks} />

      <main className="w-full max-w-4xl space-y-12 animate-in fade-in duration-300">
        {/* Top Badge & Hero */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/25 px-3.5 py-1 text-xs font-bold text-amber-400">
            <Zap className="size-3.5 fill-amber-400" />
            <span>The Spotlight on 𝕏</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            About GetTopX
          </h1>

          <p className="text-sm sm:text-base text-[#71767b] max-w-2xl mx-auto leading-relaxed">
            GetTopX (<strong className="text-white">gettopx.lol</strong>) is a sovereign meritocratic leaderboard where X (Twitter) accounts compete for the #1 spotlight. No opaque algorithms, no ad networks, no gatekeepers.
          </p>
        </div>

        {/* REAL LIVE PLATFORM METRICS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#71767b] flex items-center gap-2">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Real-Time Platform State</span>
            </h2>
            <span className="text-[10px] font-mono text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/20 px-2 py-0.5 rounded-full">
              ● Live Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Metric 1: Claimed Spots */}
            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-4 sm:p-5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#71767b]">
                <Layers className="size-3.5 text-amber-400" />
                <span>Claimed Spots</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-white">
                {stats.totalItems} <span className="text-xs text-[#71767b] font-normal">/ 10</span>
              </p>
              <p className="text-[11px] text-[#71767b]">active 𝕏 accounts</p>
            </div>

            {/* Metric 2: Highest Valuation */}
            <div className="rounded-2xl bg-[#16181c] border border-amber-500/40 p-4 sm:p-5 space-y-1 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Trophy className="size-3.5 text-amber-400" />
                <span>#1 Spotlight</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-amber-400">
                {stats.topBid > 0 ? formatCurrency(stats.topBid) : '$2 min'}
              </p>
              <p className="text-[11px] text-[#71767b] truncate">{stats.topDomain}</p>
            </div>

            {/* Metric 3: Total Clicks Delivered */}
            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-4 sm:p-5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#71767b]">
                <TrendingUp className="size-3.5 text-[#00ba7c]" />
                <span>Profile Visits</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-[#00ba7c]">
                {formatNumber(stats.totalClicks)}
              </p>
              <p className="text-[11px] text-[#71767b]">outbound clicks to 𝕏</p>
            </div>

            {/* Metric 4: Realtime Visitors */}
            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-4 sm:p-5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#71767b]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00ba7c] opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-[#00ba7c]"></span>
                </span>
                <span>Live Audience</span>
              </div>
              <p className="font-mono font-black text-xl sm:text-2xl text-white">
                {formatNumber(stats.onlineVisitors)}
              </p>
              <p className="text-[11px] text-[#71767b]">active connections</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="rounded-3xl bg-[#16181c] border border-[#2f3336] p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            How GetTopX Works
          </h2>
          <p className="text-xs sm:text-sm text-[#e7e9ea] leading-relaxed">
            Every 𝕏 (Twitter) profile listed on GetTopX is ranked purely on its cumulative bid power. Enter your 𝕏 handle (<strong className="text-white">@username</strong>), pay to place your profile on the board, and your ranking valuation stacks permanently on your handle.
          </p>
          <p className="text-xs sm:text-sm text-[#e7e9ea] leading-relaxed">
            When another creator or account outbids you, you simply drop to rank #2 with your full valuation intact. You can reclaim #1 anytime by bidding only the difference.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-6 space-y-3">
            <div className="size-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">Permanent Handle Power</h3>
            <p className="text-xs text-[#71767b] leading-relaxed">
              Every dollar you bid stacks permanently on top of your @handle power. You never start from zero when defending your rank on 𝕏.
            </p>
          </div>

          <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-6 space-y-3">
            <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              🎯
            </div>
            <h3 className="text-base font-bold text-white">Direct 𝕏 Traffic</h3>
            <p className="text-xs text-[#71767b] leading-relaxed">
              Every click routes directly to your 𝕏 profile (<strong className="text-[#e7e9ea]">x.com/username</strong>) with verified real-time analytics.
            </p>
          </div>

          <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-6 space-y-3">
            <div className="size-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
              👑
            </div>
            <h3 className="text-base font-bold text-white">3-Hour VIP Takeover</h3>
            <p className="text-xs text-[#71767b] leading-relaxed">
              Activate the VIP takeover option to exclusively dominate the #1 spotlight on 𝕏 for 3 hours straight with dedicated branding.
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
            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-5 space-y-1.5">
              <h4 className="font-bold text-white">Can someone outbid my 𝕏 handle?</h4>
              <p className="text-[#71767b]">
                Yes! If another account outbids you, your profile moves down to rank #2, keeping all your accumulated valuation intact. You can outbid them back anytime with an incremental bid.
              </p>
            </div>

            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-5 space-y-1.5">
              <h4 className="font-bold text-white">Do past bids expire?</h4>
              <p className="text-[#71767b]">
                Never. Bids are permanently cumulative. If you bid $50 today and $50 next week, your 𝕏 handle has $100 total ranking power forever.
              </p>
            </div>

            <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-5 space-y-1.5">
              <h4 className="font-bold text-white">Which 𝕏 accounts can be listed?</h4>
              <p className="text-[#71767b]">
                Any public, active 𝕏 (Twitter) account — creators, founders, traders, developers, projects, and personal brands.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-[#eff3f4] text-black font-extrabold px-6 py-3.5 text-sm transition shadow-lg active:scale-95"
          >
            <span>View Live GetTopX Leaderboard</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#71767b] space-y-3 border-t border-[#2f3336] pt-8 w-full">
        <div className="flex items-center justify-center gap-5 font-bold text-[#71767b]">
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
