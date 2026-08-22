import { db } from './db';
import { realtime } from './realtime';

export async function getLeaderboardData() {
  try {
    const now = new Date();

    const [items, activeTakeover, totalTransactions] = await Promise.all([
      db.item.findMany({
        where: { status: 'APPROVED' },
        orderBy: { totalBidAmount: 'desc' },
        take: 10,
        select: {
          id: true,
          url: true,
          domain: true,
          title: true,
          description: true,
          faviconUrl: true,
          followers: true,
          totalBidAmount: true,
          clickCount: true,
          createdAt: true,
          status: true,
        },
      }),
      db.item.findFirst({
        where: {
          isTakeover: true,
          takeoverExpiresAt: { gt: now },
          status: 'APPROVED',
        },
        orderBy: { takeoverExpiresAt: 'desc' },
        select: {
          id: true,
          url: true,
          domain: true,
          title: true,
          description: true,
          faviconUrl: true,
          followers: true,
          totalBidAmount: true,
          clickCount: true,
          createdAt: true,
          status: true,
        },
      }),
      db.bidTransaction.count({ where: { status: 'COMPLETED' } }),
    ]);

    const totalClicks = items.reduce((acc, cur) => acc + cur.clickCount, 0);
    const topBid = items.length > 0 ? items[0].totalBidAmount : 0;
    const takeoverPrice = Math.max(50, topBid > 0 ? topBid * 2 : 50);

    return {
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
    };
  } catch (error) {
    console.error('Error in getLeaderboardData:', error);
    return {
      items: [],
      activeTakeover: null,
      stats: {
        totalItems: 0,
        totalClicks: 0,
        onlineVisitors: 1,
        topBid: 0,
        takeoverPrice: 50,
        totalTransactions: 0,
      },
    };
  }
}
