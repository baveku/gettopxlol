import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: NextRequest) {
  try {
    const { key, action, itemId, customData } = await req.json();

    const expectedKey = process.env.ADMIN_SECRET_KEY || 'supersecretadmin123';
    if (key !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    let updatedItem;

    switch (action) {
      case 'APPROVE':
        updatedItem = await db.item.update({
          where: { id: itemId },
          data: { status: 'APPROVED' },
        });
        break;

      case 'REJECT':
        updatedItem = await db.item.update({
          where: { id: itemId },
          data: { status: 'REJECTED' },
        });
        break;

      case 'BAN':
        updatedItem = await db.item.update({
          where: { id: itemId },
          data: { status: 'BANNED' },
        });
        break;

      case 'TOGGLE_TAKEOVER':
        const item = await db.item.findUnique({ where: { id: itemId } });
        updatedItem = await db.item.update({
          where: { id: itemId },
          data: {
            isTakeover: !item?.isTakeover,
            takeoverExpiresAt: !item?.isTakeover ? new Date(Date.now() + 3 * 3600 * 1000) : null,
          },
        });
        break;

      case 'UPDATE_DETAILS':
        updatedItem = await db.item.update({
          where: { id: itemId },
          data: {
            title: customData?.title,
            description: customData?.description,
            faviconUrl: customData?.faviconUrl,
          },
        });
        break;

      case 'DELETE':
        await db.item.delete({ where: { id: itemId } });
        realtime.broadcast({ type: 'LEADERBOARD_UPDATE' });
        return NextResponse.json({ success: true, deleted: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    realtime.broadcast({
      type: 'LEADERBOARD_UPDATE',
      item: updatedItem,
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Admin moderation error:', error);
    return NextResponse.json({ error: 'Failed to moderate item' }, { status: 500 });
  }
}
