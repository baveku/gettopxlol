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

      // If real Polar Checkout session URL is returned, redirect to Polar checkout page immediately
      if (data.checkoutUrl && data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // In development fallback simulator mode only
      if (!data.isLivePolar) {
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
      }
    } catch (err: any) {
      console.error('Polar payment error:', err);
      alert(`Payment initialization failed: ${err.message || 'Please check your connection.'}`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#16181c] p-6 sm:p-7 shadow-2xl text-white border border-[#2f3336]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#71767b] hover:text-white p-1.5 rounded-full bg-[#202327] border border-[#2f3336] hover:bg-[#2c3136] transition"
        >
          <X className="size-4" />
        </button>

        {completed ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Confirmed!</h3>
            <p className="text-sm text-[#71767b]">
              Your 𝕏 account rank has been upgraded to the live leaderboard.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-7 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold">
                  <Zap className="size-4 fill-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white">
                  {bidData.isTakeover ? 'Activate 3-Hour Takeover' : 'Upgrade 𝕏 Rank'}
                </h3>
              </div>
              <p className="text-xs text-[#71767b]">
                Processed securely via <strong>Polar.sh</strong> (Apple Pay, Google Pay, Cards).
              </p>
            </div>

            {/* Target 𝕏 Account Summary */}
            <div className="rounded-2xl bg-[#000000] border border-[#2f3336] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={bidData.faviconUrl}
                  alt=""
                  className="size-10 rounded-full object-cover ring-2 ring-amber-400/50 bg-[#202327]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${bidData.domain}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-sm text-[#e7e9ea] truncate">{bidData.title}</p>
                  <p className="text-xs text-[#71767b] font-mono">{bidData.domain}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#2f3336] text-xs">
                <div className="flex justify-between text-[#71767b]">
                  <span>Bid Amount to Charge:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(bidData.amount)}</span>
                </div>
                {bidData.existingAmount ? (
                  <div className="flex justify-between text-[#71767b]">
                    <span>Current Accumulated Power:</span>
                    <span className="font-mono text-white">{formatCurrency(bidData.existingAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-1 border-t border-[#2f3336] font-bold text-white">
                  <span>Total Ranking Power After Payment:</span>
                  <span className="font-mono text-amber-400 text-sm">{formatCurrency(totalAfterBid)}</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-[#71767b]">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Instant real-time sync across all connected clients upon payment.</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-white hover:bg-[#eff3f4] text-black font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-black" />
                    <span>Redirecting to Polar...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Polar Checkout ({formatCurrency(bidData.amount)})</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 rounded-full text-xs text-[#71767b] hover:text-white hover:bg-[#202327] transition font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
