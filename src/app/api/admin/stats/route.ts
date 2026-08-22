import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'supersecretadmin123';

    if (key !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [items, transactions, clickCount] = await Promise.all([
      db.item.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      db.bidTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { item: { select: { domain: true, title: true } } },
      }),
      db.clickLog.count(),
    ]);

    const totalRevenue = transactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingCount = items.filter((i) => i.status === 'PENDING').length;
    const approvedCount = items.filter((i) => i.status === 'APPROVED').length;

    return NextResponse.json({
      items,
      transactions,
      stats: {
        totalRevenue,
        totalClicks: clickCount,
        pendingCount,
        approvedCount,
        totalItems: items.length,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
