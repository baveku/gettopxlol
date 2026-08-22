'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, cleanXHandle } from '@/lib/utils';
import { Sparkles, Loader2, Plus, Minus, Zap, CheckCircle2, Users, Edit3 } from 'lucide-react';

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
  const [handleInput, setHandleInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [customTagline, setCustomTagline] = useState<string>('');
  const [showCustomBio, setShowCustomBio] = useState<boolean>(false);
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    description: string;
    faviconUrl: string;
    followers?: string;
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
    if (!handleInput || handleInput.trim().length < 2) {
      setScrapedData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsScraping(true);
      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: handleInput }),
        });
        if (res.ok) {
          const data = await res.json();
          setScrapedData({
            title: data.metadata.title,
            description: data.metadata.description,
            faviconUrl: data.metadata.faviconUrl,
            followers: data.metadata.followers,
            existingAmount: data.existing?.totalBidAmount || 0,
          });
          if (!customTagline) {
            setCustomTagline(data.metadata.description || '');
          }
        }
      } catch (err) {
        console.error('Error fetching X preview:', err);
      } finally {
        setIsScraping(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [handleInput]);

  const handleAdjustBid = (delta: number) => {
    setBidAmount((prev) => Math.max(2, prev + delta));
  };

  const handleQuickAdd = (add: number) => {
    setBidAmount((prev) => prev + add);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) {
      alert('Please enter your X handle (e.g. @naval or x.com/elonmusk)');
      return;
    }
    if (!emailInput.trim()) {
      alert('Please enter your email for receipt & notifications');
      return;
    }

    const { handle, profileUrl } = cleanXHandle(handleInput);
    onInitiateBid({
      url: profileUrl,
      domain: handle,
      email: emailInput,
      amount: bidAmount,
      title: scrapedData?.title || handle,
      description: customTagline.trim() || scrapedData?.description || `Official X profile of ${handle}`,
      faviconUrl: scrapedData?.faviconUrl || `https://unavatar.io/x/${handle.replace('@', '')}`,
      existingAmount: scrapedData?.existingAmount || 0,
    });
  };

  const isTakingRank1 = (scrapedData?.existingAmount || 0) + bidAmount > topBid;

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 space-y-4 border border-white/10 shadow-2xl">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-400 fill-amber-400" />
            <span>Spotlight on 𝕏</span>
          </span>

          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            isTakingRank1
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-800/80 text-zinc-400 border-white/5'
          }`}>
            {isTakingRank1 ? '👑 Takes #1 Spot' : 'Places on Board'}
          </span>
        </div>

        {/* Stepper and Quick Add Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/90 p-1 shadow-inner">
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
          {/* X Handle Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none font-bold text-sm">
              {isScraping ? (
                <Loader2 className="size-4 animate-spin text-amber-400" />
              ) : (
                <span className="text-zinc-400 font-mono">𝕏</span>
              )}
            </span>
            <input
              id="bento-input"
              type="text"
              placeholder="X @handle or link (e.g. @naval)"
              required
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
            />
          </div>

          {/* Email for Receipt */}
          <input
            type="email"
            placeholder="Receipt & notification email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 py-2.5 px-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
          />

          {/* Live X Profile Preview Card */}
          {scrapedData && (
            <div className="p-3 rounded-2xl bg-zinc-900/95 border border-white/10 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <img
                  src={scrapedData.faviconUrl}
                  alt=""
                  className="size-11 rounded-full shrink-0 object-cover ring-2 ring-amber-400/50 bg-zinc-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${handleInput}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <p className="font-extrabold text-sm text-white truncate">{scrapedData.title}</p>
                    <CheckCircle2 className="size-3.5 fill-sky-500 text-zinc-950 shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                    <span>{handleInput.startsWith('@') ? handleInput : `@${handleInput}`}</span>
                    {scrapedData.followers && (
                      <span className="text-[11px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Users className="size-3 text-zinc-500" />
                        {scrapedData.followers}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {scrapedData.description && !showCustomBio && (
                <p className="text-xs text-zinc-300 line-clamp-2 pt-1 border-t border-white/5">
                  {scrapedData.description}
                </p>
              )}

              {/* Custom Tagline Toggle */}
              <div className="pt-1.5 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowCustomBio(!showCustomBio)}
                  className="text-zinc-400 hover:text-amber-400 transition flex items-center gap-1"
                >
                  <Edit3 className="size-3" />
                  <span>{showCustomBio ? 'Hide custom pitch' : 'Customize pitch/shoutout'}</span>
                </button>

                {scrapedData.existingAmount ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ {formatCurrency(scrapedData.existingAmount)} existing power
                  </span>
                ) : null}
              </div>

              {showCustomBio && (
                <div className="pt-1 animate-in fade-in">
                  <textarea
                    rows={2}
                    placeholder="Custom shoutout or pitch to display on your rank card..."
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-400 transition resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <Zap className="size-4 fill-zinc-950" />
            <span>Outbid for {formatCurrency(bidAmount)} via Polar</span>
          </button>
        </form>
      </div>

      {/* Integrated Takeover Pill */}
      <div className="pt-3.5 border-t border-white/[0.07] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>3-Hour VIP Takeover:</span>
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
