import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [recentTransactions, recentClicks] = await Promise.all([
      db.bidTransaction.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { item: true },
      }),
      db.clickLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { item: true },
      }),
    ]);

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

    events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(
      { events: events.slice(0, 6) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=5',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ events: [] });
  }
}

function formatTimeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
