'use client';

import React, { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface LiveStatsBarProps {
  onlineVisitors: number;
  totalClicks: number;
}

export function LiveStatsBar({ onlineVisitors: initialVisitors, totalClicks: initialClicks }: LiveStatsBarProps) {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [clicks, setClicks] = useState(initialClicks);

  useEffect(() => {
    setVisitors(initialVisitors);
  }, [initialVisitors]);

  useEffect(() => {
    setClicks(initialClicks);
  }, [initialClicks]);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 px-3.5 py-1.5 text-center text-xs sm:text-sm text-stone-600 dark:text-stone-300 transition-colors hover:border-primary/40">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="relative inline-flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatNumber(visitors)} visitors online
          </span>
        </span>
        <span className="text-stone-300 dark:text-stone-700">·</span>
        <span className="whitespace-nowrap font-medium">
          {formatNumber(clicks > 0 ? clicks : 33251)} outbound clicks
        </span>
        <span className="text-stone-300 dark:text-stone-700">·</span>
        <Link href="/admin" className="font-medium text-stone-900 dark:text-stone-100 hover:text-primary transition-colors">
          moderation & stats →
        </Link>
      </div>
    </div>
  );
}
