'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import { Zap, BookOpen, Info, Trophy } from 'lucide-react';

interface HeaderProps {
  onlineVisitors?: number;
  totalClicks?: number;
}

export function Header({ onlineVisitors = 1, totalClicks = 0 }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Leaderboard', icon: Trophy },
    { href: '/about', label: 'About', icon: Info },
    { href: '/rules', label: 'Rules', icon: BookOpen },
  ];

  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-5 px-4 mb-8 border-b border-white/[0.07]">
      {/* Left: Brand Logo & Navigation */}
      <div className="flex items-center gap-6 sm:gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="size-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-zinc-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-transform group-hover:scale-105">
            <Zap className="size-4.5 fill-zinc-950" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
            TopX<span className="text-amber-400">.</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Live Visitors Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full bg-zinc-900/90 border border-white/10 px-3.5 py-1.5 text-xs text-zinc-300 backdrop-blur-md shadow-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-zinc-200">
            {formatNumber(onlineVisitors)} online
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 font-medium">
            {formatNumber(totalClicks)} clicks
          </span>
        </div>
      </div>
    </header>
  );
}
