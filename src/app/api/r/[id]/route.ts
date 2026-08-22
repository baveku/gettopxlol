import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const referrer = request.headers.get('referer') || '';

    // Create a 1-way anonymized hash for anti-bot / rate-limit detection
    const ipHash = crypto.createHash('sha256').update(ip + new Date().toISOString().slice(0, 10)).digest('hex');

    const item = await db.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment click count atomically in DB
    const updated = await db.item.update({
      where: { id },
      data: {
        clickCount: { increment: 1 },
      },
    });

    // Record click log asynchronously
    await db.clickLog.create({
      data: {
        itemId: item.id,
        ipHash,
        userAgent,
        referrer,
      },
    });

    // Broadcast click to all connected SSE clients worldwide
    realtime.broadcast({
      type: 'CLICK_UPDATE',
      itemId: item.id,
      newClickCount: updated.clickCount,
    });

    // Clean destination redirect
    let destUrl = item.url;
    if (!destUrl.startsWith('http://') && !destUrl.startsWith('https://')) {
      destUrl = `https://${destUrl}`;
    }

    try {
      const parsed = new URL(destUrl);
      if (!parsed.searchParams.has('utm_source')) {
        parsed.searchParams.set('utm_source', 'topx');
      }
      return NextResponse.redirect(parsed.toString(), 302);
    } catch {
      return NextResponse.redirect(destUrl, 302);
    }
  } catch (error) {
    console.error('Redirect tracking error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
