'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, cleanDomain } from '@/lib/utils';
import { Sparkles, Globe, Loader2, Plus, Minus, Zap } from 'lucide-react';

interface OutbidConsoleProps {
  topBid: number;
  takeoverPrice: number;
  onInitiateBid: (bidData: {
    url: string;
    domain: string;
    email: string;
    amount: number;
    title: string;
    description: string;
    faviconUrl: string;
    existingAmount?: number;
  }) => void;
  onTakeoverClick: () => void;
  presetTargetRankAmount?: number | null;
}

export function OutbidConsole({
  topBid,
  takeoverPrice,
  onInitiateBid,
  onTakeoverClick,
  presetTargetRankAmount,
}: OutbidConsoleProps) {
  const [bidAmount, setBidAmount] = useState<number>(Math.max(2, topBid + 1));
  const [urlInput, setUrlInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    description: string;
    faviconUrl: string;
    existingAmount?: number;
  } | null>(null);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  useEffect(() => {
    if (presetTargetRankAmount) {
      setBidAmount(presetTargetRankAmount);
    } else {
      setBidAmount(Math.max(2, topBid + 1));
    }
  }, [topBid, presetTargetRankAmount]);

  useEffect(() => {
    if (!urlInput || urlInput.trim().length < 4) {
      setScrapedData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsScraping(true);
      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput }),
        });
        if (res.ok) {
          const data = await res.json();
          setScrapedData({
            title: data.metadata.title,
            description: data.metadata.description,
            faviconUrl: data.metadata.faviconUrl,
            existingAmount: data.existing?.totalBidAmount || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching preview:', err);
      } finally {
        setIsScraping(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [urlInput]);

  const handleAdjustBid = (delta: number) => {
    setBidAmount((prev) => Math.max(2, prev + delta));
  };

  const handleQuickAdd = (add: number) => {
    setBidAmount((prev) => prev + add);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      alert('Please enter your product URL');
      return;
    }
    if (!emailInput.trim()) {
      alert('Please enter your email for receipt');
      return;
    }

    const { domain, cleanUrl } = cleanDomain(urlInput);
    onInitiateBid({
      url: cleanUrl,
      domain,
      email: emailInput,
      amount: bidAmount,
      title: scrapedData?.title || domain,
      description: scrapedData?.description || `Visit ${domain}`,
      faviconUrl: scrapedData?.faviconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      existingAmount: scrapedData?.existingAmount || 0,
    });
  };

  const isTakingRank1 = (scrapedData?.existingAmount || 0) + bidAmount > topBid;

  return (
    <div className="rounded-3xl glass-panel p-6 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-400 fill-amber-400" />
            <span>Claim Your Rank</span>
          </span>

          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            isTakingRank1
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-zinc-800/80 text-zinc-400 border-white/5'
          }`}>
            {isTakingRank1 ? '👑 Takes #1 Spot' : 'Places on Board'}
          </span>
        </div>

        {/* Stepper and Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/90 p-1">
            <button
              type="button"
              onClick={() => handleAdjustBid(-10)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-3 font-mono font-bold text-sm text-white">
              {formatCurrency(bidAmount)}
            </span>
            <button
              type="button"
              onClick={() => handleAdjustBid(10)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleQuickAdd(100)}
            className="px-3 py-1.5 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition"
          >
            +$100
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(1000)}
            className="px-3 py-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 transition"
          >
            +$1k 🔥
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              {isScraping ? (
                <Loader2 className="size-4 animate-spin text-amber-400" />
              ) : (
                <Globe className="size-4" />
              )}
            </span>
            <input
              id="bento-input"
              type="text"
              placeholder="Product URL (e.g. trycomp.ai)"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
            />
          </div>

          <input
            type="email"
            placeholder="Receipt & notification email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-2.5 px-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
          />

          {scrapedData && (
            <div className="p-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs flex items-center gap-2.5 animate-in fade-in">
              <img src={scrapedData.faviconUrl} alt="" className="size-5 rounded shrink-0 object-cover" />
              <div className="min-w-0 flex-1 truncate">
                <p className="font-semibold text-zinc-200 truncate">{scrapedData.title}</p>
                {scrapedData.existingAmount ? (
                  <p className="text-emerald-400 text-[11px] font-medium">
                    ✓ {formatCurrency(scrapedData.existingAmount)} existing power
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <Zap className="size-4 fill-zinc-950" />
            <span>Outbid for {formatCurrency(bidAmount)}</span>
          </button>
        </form>
      </div>

      {/* Integrated Takeover Pill */}
      <div className="pt-3.5 border-t border-white/[0.07] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>3-Hour Takeover VIP:</span>
          <strong className="text-white font-mono">{formatCurrency(takeoverPrice)}</strong>
        </div>

        <button
          type="button"
          onClick={onTakeoverClick}
          className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline transition"
        >
          Take over →
        </button>
      </div>
    </div>
  );
}
