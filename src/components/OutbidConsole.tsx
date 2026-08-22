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
    const trimmed = handleInput.trim().replace(/^@+/, '');
    if (!trimmed || trimmed.length < 3) {
      setScrapedData(null);
      setIsScraping(false);
      return;
    }

    const controller = new AbortController();
    setIsScraping(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/scrape', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: handleInput }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!controller.signal.aborted && data.metadata) {
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
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching X preview:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsScraping(false);
        }
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
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
    <div className="rounded-2xl bg-[#16181c] border border-[#2f3336] p-5 sm:p-6 space-y-4 shadow-xl">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-amber-400/10 flex items-center justify-center">
              <Zap className="size-3.5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-sm font-black text-[#e7e9ea] tracking-tight">
              Claim Spotlight on 𝕏
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            isTakingRank1
              ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
              : 'bg-[#202327] text-[#71767b] border-[#2f3336]'
          }`}>
            {isTakingRank1 ? '👑 Takes #1 Spot' : 'Places on Board'}
          </span>
        </div>

        {/* Stepper and Quick Add Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <div className="flex items-center rounded-full border border-[#2f3336] bg-[#000000] p-1">
            <button
              type="button"
              onClick={() => handleAdjustBid(-10)}
              className="p-1 rounded-full hover:bg-[#202327] text-[#71767b] hover:text-white transition"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-3 font-mono font-bold text-sm text-[#e7e9ea]">
              {formatCurrency(bidAmount)}
            </span>
            <button
              type="button"
              onClick={() => handleAdjustBid(10)}
              className="p-1 rounded-full hover:bg-[#202327] text-[#71767b] hover:text-white transition"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleQuickAdd(100)}
            className="px-3 py-1.5 rounded-full border border-[#2f3336] bg-[#202327] hover:bg-[#2c3136] text-xs font-bold text-[#e7e9ea] transition"
          >
            +$100
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(1000)}
            className="px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition"
          >
            +$1k 🔥
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* X Handle Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71767b] pointer-events-none font-bold text-sm">
              {isScraping ? (
                <Loader2 className="size-4 animate-spin text-amber-400" />
              ) : (
                <span className="font-mono text-sm text-[#71767b]">𝕏</span>
              )}
            </span>
            <input
              id="bento-input"
              type="text"
              placeholder="@handle or x.com/username"
              required
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full rounded-full border border-[#2f3336] bg-[#000000] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-[#e7e9ea] placeholder-[#71767b] outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition"
            />
          </div>

          {/* Email for Receipt */}
          <input
            type="email"
            placeholder="Receipt & notification email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full rounded-full border border-[#2f3336] bg-[#000000] py-2.5 px-4 text-xs sm:text-sm text-[#e7e9ea] placeholder-[#71767b] outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition"
          />

          {/* Live X Profile Preview Card */}
          {scrapedData && (
            <div className="p-3.5 rounded-2xl bg-[#000000] border border-[#2f3336] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <img
                  src={scrapedData.faviconUrl}
                  alt=""
                  className="size-11 rounded-full shrink-0 object-cover ring-2 ring-amber-400/60 bg-[#202327]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${handleInput}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <p className="font-extrabold text-sm text-[#e7e9ea] truncate">{scrapedData.title}</p>
                    <CheckCircle2 className="size-3.5 fill-[#1d9bf0] text-black shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[#71767b] font-mono mt-0.5">
                    <span>{handleInput.startsWith('@') ? handleInput : `@${handleInput}`}</span>
                    {scrapedData.followers && (
                      <span className="text-[11px] bg-[#202327] text-[#e7e9ea] px-1.5 py-0.2 rounded-full flex items-center gap-1">
                        <Users className="size-3 text-[#71767b]" />
                        {scrapedData.followers}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {scrapedData.description && !showCustomBio && (
                <p className="text-xs text-[#e7e9ea] line-clamp-2 pt-1 border-t border-[#2f3336]">
                  {scrapedData.description}
                </p>
              )}

              {/* Custom Pitch Toggle */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setShowCustomBio(!showCustomBio)}
                  className="text-[#71767b] hover:text-[#1d9bf0] transition flex items-center gap-1"
                >
                  <Edit3 className="size-3" />
                  <span>{showCustomBio ? 'Hide custom pitch' : 'Customize pitch/shoutout'}</span>
                </button>

                {scrapedData.existingAmount ? (
                  <span className="text-[#00ba7c] font-medium font-mono">
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
                    className="w-full rounded-xl border border-[#2f3336] bg-[#16181c] p-2.5 text-xs text-[#e7e9ea] placeholder-[#71767b] outline-none focus:border-[#1d9bf0] transition resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-white hover:bg-[#eff3f4] text-black font-black text-sm transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <Zap className="size-4 fill-black" />
            <span>Outbid for {formatCurrency(bidAmount)} via Polar</span>
          </button>
        </form>
      </div>

      {/* Integrated Takeover Pill */}
      <div className="pt-3 border-t border-[#2f3336] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#71767b]">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>3-Hour VIP Takeover:</span>
          <strong className="text-[#e7e9ea] font-mono">{formatCurrency(takeoverPrice)}</strong>
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
