'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, ShieldCheck, Sparkles, X, ArrowRight, Loader2, Zap, CreditCard } from 'lucide-react';
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
  const [provider, setProvider] = useState<'SIMULATOR' | 'POLAR' | 'LEMONSQUEEZY'>('SIMULATOR');
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
          provider: provider === 'SIMULATOR' ? 'DEV_SIMULATOR' : provider,
          customTitle: bidData.title,
          customDescription: bidData.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initialize payment');
        setLoading(false);
        return;
      }

      if (provider === 'SIMULATOR') {
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
        }, 2000);
      } else {
        alert(`In production, this redirects directly to ${provider} Hosted Checkout Session.\nSimulating completion now!`);
        await fetch(data.checkoutUrl);
        setCompleted(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          setCompleted(false);
          setLoading(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment processing failed. Please try again.');
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
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Confirmed</h3>
            <p className="text-xs text-zinc-300">
              Your bid of <strong className="text-amber-400">{formatCurrency(bidData.amount)}</strong> for{' '}
              <strong className="text-white">{bidData.domain}</strong> has been applied.
            </p>
            <p className="text-[11px] text-zinc-500">
              Your link is now active on the live leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                <Sparkles className="size-3" />
                <span>{bidData.isTakeover ? '3-Hour Takeover VIP' : 'Outbid Checkout'}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-mono">
                {formatCurrency(bidData.amount)}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Targeting: <strong className="text-zinc-200">{bidData.domain}</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/95 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Existing Ranking Total:</span>
                <span className="font-mono text-zinc-200">{formatCurrency(bidData.existingAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-400">
                <span>New Addition:</span>
                <span>+{formatCurrency(bidData.amount)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total Ranking Power:</span>
                <span className="text-amber-400 font-mono">{formatCurrency(totalAfterBid)}</span>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">
                Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('SIMULATOR')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    provider === 'SIMULATOR'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <Zap className="size-4 mb-1 text-amber-400" />
                  <span>Dev Instant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('POLAR')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    provider === 'POLAR'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="size-4 mb-1" />
                  <span>Polar.sh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('LEMONSQUEEZY')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition ${
                    provider === 'LEMONSQUEEZY'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                      : 'border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="size-4 mb-1" />
                  <span>LemonSqueezy</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handlePay}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-zinc-100 py-3.5 px-4 text-sm font-bold text-zinc-950 shadow-md transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay {formatCurrency(bidData.amount)}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
