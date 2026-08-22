'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, timeAgo } from '@/lib/utils';
import {
  ShieldAlert,
  Check,
  X,
  Ban,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Lock,
  ExternalLink,
  Eye,
  Trash2,
  DollarSign,
  MousePointerClick,
  Layers,
  Clock,
} from 'lucide-react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>('supersecretadmin123');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED'>('PENDING');

  const fetchAdminData = async (keyToUse: string = adminKey) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToUse }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setItems(data.items);
        setTransactions(data.transactions);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerate = async (itemId: string, action: 'APPROVE' | 'REJECT' | 'BAN' | 'DELETE' | 'TOGGLE_TAKEOVER') => {
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          itemId,
          action,
        }),
      });

      if (res.ok) {
        await fetchAdminData(adminKey);
      } else {
        const err = await res.json();
        alert(err.error || 'Action failed');
      }
    } catch (error) {
      console.error('Moderation error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md mt-20 p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-4">
        <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold">Admin Moderation Portal</h2>
        <p className="text-xs text-stone-500">
          Enter admin secret key to review pending bids and moderate links.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAdminData(adminKey);
          }}
          className="space-y-3"
        >
          <input
            type="password"
            placeholder="Admin Secret Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-white py-2.5 text-sm font-bold shadow hover:bg-primary/90 transition"
          >
            {loading ? 'Authenticating...' : 'Unlock Portal'}
          </button>
        </form>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-primary transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Live Leaderboard</span>
          </Link>
          <span className="text-stone-300">/</span>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldAlert className="size-5 text-primary" />
            <span>Moderation Center</span>
          </h1>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white dark:bg-stone-900 px-3 py-1 text-xs font-semibold hover:text-primary transition"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
              <DollarSign className="size-4 text-emerald-500" />
              <span>Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
              <Clock className="size-4 text-amber-500" />
              <span>Pending Queue</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingCount} items
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
              <Layers className="size-4 text-primary" />
              <span>Active Approved</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {stats.approvedCount} items
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
              <MousePointerClick className="size-4 text-blue-500" />
              <span>Total Clicks Logged</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {stats.totalClicks} clicks
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        {(['PENDING', 'APPROVED', 'ALL', 'REJECTED', 'BANNED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            {f} {f === 'PENDING' && stats?.pendingCount > 0 && `(${stats.pendingCount})`}
          </button>
        ))}
      </div>

      {/* Moderation Items Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-stone-800 dark:text-stone-200">
            Submissions Queue ({filteredItems.length})
          </h2>
          <span className="text-xs text-stone-400">
            Pending submissions are hidden from the live leaderboard until approved
          </span>
        </div>

        <div className="divide-y divide-stone-200/80 dark:divide-stone-800">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-400">
              No items found in filter "{filter}".
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-950/50 transition">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-lg bg-stone-100 dark:bg-stone-800 p-1 flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                    {item.faviconUrl ? (
                      <img src={item.faviconUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{item.domain[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-white truncate">
                        {item.domain}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.isTakeover && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          TAKEOVER VIP
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1">
                      {item.description || item.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                      <span>Owner: <strong className="text-stone-600 dark:text-stone-300">{item.email}</strong></span>
                      <span>•</span>
                      <span>Total Bid: <strong className="text-primary">{formatCurrency(item.totalBidAmount)}</strong></span>
                      <span>•</span>
                      <span>Clicks: <strong>{item.clickCount}</strong></span>
                      <span>•</span>
                      <span>{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                    title="Preview Target URL"
                  >
                    <ExternalLink className="size-4" />
                  </a>

                  {item.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleModerate(item.id, 'APPROVE')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                    >
                      <Check className="size-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {item.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleModerate(item.id, 'REJECT')}
                      className="inline-flex items-center gap-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-700 text-stone-700 dark:text-stone-200 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      <X className="size-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleModerate(item.id, 'BAN')}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Ban Domain"
                  >
                    <Ban className="size-4" />
                  </button>

                  <button
                    onClick={() => handleModerate(item.id, 'DELETE')}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Transactions Log */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-4">
        <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200 mb-3">
          Recent Bid Transactions
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center py-1.5 border-b border-stone-100 dark:border-stone-800/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{formatCurrency(tx.amount)}</span>
                <span className="text-stone-600 dark:text-stone-300">for {tx.item?.domain}</span>
                <span className="text-stone-400">({tx.payerEmail})</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold">{tx.paymentProvider}</span>
                <span>{timeAgo(tx.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
