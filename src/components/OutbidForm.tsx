'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, cleanDomain } from '@/lib/utils';
import { Swords, Plus, Minus, Flame, Shield, Globe, Sparkles, Loader2, Zap } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface OutbidFormProps {
  topBid: number;
  onBidSuccess: () => void;
  presetTargetRankAmount?: number | null;
  onClearPreset?: () => void;
}

export function OutbidForm({
  topBid,
  onBidSuccess,
  presetTargetRankAmount,
  onClearPreset,
}: OutbidFormProps) {
  const [bidAmount, setBidAmount] = useState<number>(topBid + 1);
  const [urlInput, setUrlInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    description: string;
    faviconUrl: string;
    existingAmount?: number;
  } | null>(null);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  useEffect(() => {
    if (presetTargetRankAmount) {
      setBidAmount(presetTargetRankAmount);
    } else {
      setBidAmount(topBid + 1);
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
    setBidAmount((prev) => Math.max(1, prev + delta));
  };

  const handleQuickBoost = (add: number) => {
    setBidAmount((prev) => prev + add);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      alert('Enter your challenger URL to enter the arena');
      return;
    }
    if (!emailInput.trim()) {
      alert('Enter email for battle reports and receipts');
      return;
    }
    setShowPaymentModal(true);
  };

  const { domain, cleanUrl } = cleanDomain(urlInput || 'yourproduct.com');
  const isDethroning = (scrapedData?.existingAmount || 0) + bidAmount > topBid;

  return (
    <section id="forge" className="scroll-mt-8 mb-12">
      <div className="relative mx-auto max-w-2xl rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-xl">
        
        {/* Glow Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Zap className="size-3.5 fill-amber-400" />
            <span>The War Forge — Enter Combat</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center justify-center gap-2">
            <span>Strike for</span>
            <span className="text-amber-400 underline decoration-amber-500 decoration-wavy decoration-2">
              {formatCurrency(bidAmount)}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {isDethroning ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Flame className="size-4 text-emerald-400" />
                This strike will DETHRONE the King and claim #1 Rank!
              </span>
            ) : (
              <span>
                Your strike amount determines your placement on the arena combat board.
              </span>
            )}
          </p>
        </div>

        {/* Quick Stepper & Boost Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleAdjustBid(-10)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            -$10
          </button>
          <button
            type="button"
            onClick={() => handleAdjustBid(-1)}
            className="size-8 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-300 hover:border-slate-700 transition"
          >
            <Minus className="size-4" />
          </button>

          <div className="px-4 py-1.5 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-400 font-mono font-black text-lg sm:text-xl">
            {formatCurrency(bidAmount)}
          </div>

          <button
            type="button"
            onClick={() => handleAdjustBid(1)}
            className="size-8 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-300 hover:border-slate-700 transition"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleQuickBoost(100)}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
          >
            +$100
          </button>
          <button
            type="button"
            onClick={() => handleQuickBoost(1000)}
            className="rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-xs font-black text-amber-300 hover:brightness-125 transition"
          >
            +$1,000 🔥
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 pointer-events-none">
                {isScraping ? (
                  <Loader2 className="size-4 animate-spin text-amber-400" />
                ) : scrapedData?.faviconUrl ? (
                  <img src={scrapedData.faviconUrl} alt="" className="size-4 rounded object-cover" />
                ) : (
                  <Globe className="size-4" />
                )}
              </span>
              <input
                type="text"
                placeholder="Product URL (e.g. trycomp.ai)"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>

            <div className="sm:w-56">
              <input
                type="email"
                placeholder="War report email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Scraped Preview */}
          {scrapedData && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs flex items-start gap-3 animate-in fade-in">
              <img src={scrapedData.faviconUrl} alt="" className="size-8 rounded-lg bg-slate-900 p-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-amber-200 truncate">{scrapedData.title}</p>
                <p className="text-slate-400 line-clamp-1 mt-0.5">{scrapedData.description}</p>
                {scrapedData.existingAmount ? (
                  <p className="text-emerald-400 font-semibold mt-1">
                    🛡️ Veteran Fighter with {formatCurrency(scrapedData.existingAmount)} existing power! Total power will be {formatCurrency(scrapedData.existingAmount + bidAmount)}.
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Swords className="size-5" />
            <span>Unleash Strike for {formatCurrency(bidAmount)}</span>
          </button>
        </form>

      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bidData={{
          url: cleanUrl,
          domain,
          email: emailInput,
          amount: bidAmount,
          title: scrapedData?.title || domain,
          description: scrapedData?.description || `Gladiator entry for ${domain}`,
          faviconUrl: scrapedData?.faviconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          existingAmount: scrapedData?.existingAmount || 0,
        }}
        onSuccess={() => {
          onBidSuccess();
          if (onClearPreset) onClearPreset();
        }}
      />
    </section>
  );
}
