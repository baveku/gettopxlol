import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch last real completed transactions
    const recentTransactions = await db.bidTransaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { item: true },
    });

    // Fetch last real click logs
    const recentClicks = await db.clickLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { item: true },
    });

    const events: Array<{
      id: string;
      type: 'click' | 'bid';
      title: string;
      detail: string;
      timestamp: string;
      createdAt: Date;
    }> = [];

    recentTransactions.forEach((tx) => {
      events.push({
        id: `tx_${tx.id}`,
        type: 'bid',
        title: tx.item?.domain || 'Contender',
        detail: tx.isTakeover
          ? 'activated 3-Hour VIP Takeover'
          : `outbid with ${formatCurrency(tx.amount)}`,
        timestamp: formatTimeAgo(tx.createdAt),
        createdAt: tx.createdAt,
      });
    });

    recentClicks.forEach((click) => {
      events.push({
        id: `click_${click.id}`,
        type: 'click',
        title: click.item?.domain || 'Contender',
        detail: 'received a live click',
        timestamp: formatTimeAgo(click.createdAt),
        createdAt: click.createdAt,
      });
    });

    // Sort by newest
    events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ events: events.slice(0, 6) });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ events: [] });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
