import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await db.item.findMany({
      where: { status: 'APPROVED' },
      orderBy: { totalBidAmount: 'desc' },
      take: 100,
    });

    // Check active takeover
    const now = new Date();
    const activeTakeover = await db.item.findFirst({
      where: {
        isTakeover: true,
        takeoverExpiresAt: { gt: now },
        status: 'APPROVED',
      },
      orderBy: { takeoverExpiresAt: 'desc' },
    });

    const totalClicks = items.reduce((acc, cur) => acc + cur.clickCount, 0);
    const topBid = items.length > 0 ? items[0].totalBidAmount : 0;
    const takeoverPrice = Math.max(50, topBid > 0 ? topBid * 2 : 50);
    const totalTransactions = await db.bidTransaction.count({ where: { status: 'COMPLETED' } });

    return NextResponse.json({
      items,
      activeTakeover,
      stats: {
        totalItems: items.length,
        totalClicks,
        onlineVisitors: realtime.getOnlineVisitors(),
        topBid,
        takeoverPrice,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
