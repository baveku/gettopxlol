'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight, Loader2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bidData: {
    url: string;
    domain: string;
    email: string;
    amount: number;
    title: string;
    description: string;
    faviconUrl: string;
    isTakeover?: boolean;
    existingAmount?: number;
  } | null;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, bidData, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !bidData) return null;

  const totalAfterBid = (bidData.existingAmount || 0) + bidData.amount;

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: bidData.url,
          email: bidData.email,
          amount: bidData.amount,
          isTakeover: bidData.isTakeover,
          customTitle: bidData.title,
          customDescription: bidData.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initialize Polar payment');
        setLoading(false);
        return;
      }

      // If real Polar Checkout session URL is returned, redirect to Polar
      if (data.isLivePolar && data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // In local dev/test mode without Polar API keys, complete instantly
      await fetch(data.checkoutUrl);
      setCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff'],
      });
      setTimeout(() => {
        onSuccess();
        onClose();
        setCompleted(false);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Polar payment error:', err);
      alert('Payment initialization failed. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1017] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white border border-white/15">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition"
        >
          <X className="size-4" />
        </button>

        {completed ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Confirmed!</h3>
            <p className="text-xs text-zinc-400">
              Your ranking power has been stacked on <strong className="text-zinc-200">{bidData.domain}</strong> and broadcast worldwide via SSE.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <Sparkles className="size-3.5" />
                <span>{bidData.isTakeover ? 'VIP Takeover' : 'Claim Spotlight'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {bidData.isTakeover ? 'Confirm 3-Hour VIP Takeover' : `Outbid for ${formatCurrency(bidData.amount)}`}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Receipt & magic edit link will be sent to <span className="text-zinc-200 font-medium">{bidData.email}</span>.
              </p>
            </div>

            {/* Target Item Summary */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
              <div className="flex items-center gap-2.5">
                {bidData.faviconUrl ? (
                  <img src={bidData.faviconUrl} alt="" className="size-6 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="size-6 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    🌐
                  </div>
                )}
                <div className="min-w-0 flex-1 truncate">
                  <p className="font-bold text-xs sm:text-sm text-white truncate">{bidData.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{bidData.domain}</p>
                </div>
              </div>

              {/* Power Breakdown */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Ranking Power:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatCurrency(totalAfterBid)}
                </span>
              </div>
            </div>

            {/* Polar.sh Payment Gateway Guarantee */}
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <div className="size-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-[11px]">
                  P
                </div>
                <div>
                  <p className="font-bold text-white text-[12px]">Polar.sh Checkout</p>
                  <p className="text-[10px] text-zinc-500">Cards, Apple Pay, Google Pay</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" /> Secure
              </span>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handlePay}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Connecting to Polar...</span>
                </>
              ) : (
                <>
                  <Zap className="size-4 fill-zinc-950" />
                  <span>Pay {formatCurrency(bidData.amount)} via Polar</span>
                  <ArrowRight className="size-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
