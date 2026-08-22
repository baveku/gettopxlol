'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatNumber } from '@/lib/utils';
import { BookOpen, Info, Trophy } from 'lucide-react';

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
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-4 mb-6 border-b border-[#2f3336]">
      {/* Left: Brand Logo & Navigation */}
      <div className="flex items-center gap-5 sm:gap-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
            <span className="font-mono text-base font-black">𝕏</span>
          </div>
          <span className="font-black text-xl tracking-tight text-[#e7e9ea] flex items-center">
            GetTopX<span className="text-amber-400">.</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#16181c] p-1 rounded-full border border-[#2f3336]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#202327]'
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
      <div className="flex items-center gap-2.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#16181c] border border-[#2f3336] px-3.5 py-1.5 text-xs text-[#e7e9ea]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00ba7c] opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-[#00ba7c]"></span>
          </span>
          <span className="font-bold text-[#e7e9ea]">
            {formatNumber(onlineVisitors)} online
          </span>
          <span className="text-[#2f3336]">|</span>
          <span className="text-[#71767b] font-medium">
            {formatNumber(totalClicks)} clicks
          </span>
        </div>
      </div>
    </header>
  );
}
