'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Check, XCircle, ArrowRight } from 'lucide-react';

export default function RulesPage() {
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

      <main className="w-full max-w-3xl space-y-10 animate-in fade-in duration-300">
        {/* Live Metrics Header Chip */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/90 border border-white/10 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">{formatNumber(stats.onlineVisitors)} online</span>
            <span className="text-zinc-600">·</span>
            <span>{stats.totalItems} / 10 spots claimed</span>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-400 font-mono font-bold">Top bid: {stats.topBid > 0 ? formatCurrency(stats.topBid) : '$2 min'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            GetTopX Rules & Guidelines
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            GetTopX (gettopx.lol) is a public meritocratic leaderboard for X (Twitter) accounts. There are no ads, no hidden algorithms, and no revenue share. You pay to stand above everyone else on X. Rank is the bid — nothing else.
          </p>
        </div>

        {/* Section 1: How Ranking Works */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-amber-400 font-mono font-bold">01.</span>
            <span>How Ranking on X Works</span>
          </h2>

          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Bids are whole US dollars, <strong>$2 minimum</strong>, placed <strong>$1 at a time</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Paying less than #1 still places you on the board at whatever rank that bid can take. Equal bids preserve the order they were placed — the older bid keeps the higher rank.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Enter the same <strong>@handle</strong> again to raise your profile back to #1. The new bid only needs to exceed the top bid by at least $1; <strong>you only pay the difference</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <span>All X account listings are keyed strictly by their canonical username (e.g. <code>@elonmusk</code> = <code>x.com/elonmusk</code>).</span>
            </li>
          </ul>
        </section>

        {/* Section 2: What You Can List */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-bold">02.</span>
            <span>What X Accounts You Can List</span>
          </h2>

          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Any public, active X (Twitter) profile — creators, founders, builders, traders, personal brands, and project accounts.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Suspended or banned accounts</strong> on X will be automatically rejected or removed.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Scam & Phishing profiles</strong> posing as impersonators or malware distribution bots are permanently banned without refund.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: After You Pay */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-purple-400 font-mono font-bold">03.</span>
            <span>After You Pay</span>
          </h2>

          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Your X profile is immediately public worldwide across all connected clients via Server-Sent Events.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Clicks route directly to your X profile URL (<code>https://x.com/username</code>) with real-time profile visit tracking.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="size-4 text-purple-400 shrink-0 mt-0.5" />
              <span>Completed payments are processed securely by Polar.sh and lock your valuation permanently on your handle.</span>
            </li>
          </ul>
        </section>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-3.5 text-sm transition shadow-lg active:scale-95"
          >
            <span>Go to Live X Leaderboard</span>
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
