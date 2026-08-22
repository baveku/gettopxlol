import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const txId = payload?.data?.custom_data?.transactionId || payload?.transactionId;

    if (!txId) {
      return NextResponse.json({ error: 'Transaction ID missing' }, { status: 400 });
    }

    const tx = await db.bidTransaction.findUnique({
      where: { id: txId },
      include: { item: true },
    });

    if (!tx || tx.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Transaction already completed or not found' });
    }

    // Mark transaction complete
    await db.bidTransaction.update({
      where: { id: txId },
      data: {
        status: 'COMPLETED',
        providerTxId: payload?.id || `tx_${Date.now()}`,
      },
    });

    // Update cumulative item total
    const updatedTotal = tx.item.totalBidAmount + tx.amount;
    const takeoverData = tx.isTakeover
      ? {
          isTakeover: true,
          takeoverExpiresAt: new Date(Date.now() + 3 * 3600 * 1000), // 3 hours takeover
        }
      : {};

    const updatedItem = await db.item.update({
      where: { id: tx.itemId },
      data: {
        totalBidAmount: updatedTotal,
        ...takeoverData,
      },
    });

    // Broadcast live event to all connected browsers
    realtime.broadcast({
      type: 'BID_COMPLETED',
      item: updatedItem,
      transaction: tx,
    });

    return NextResponse.json({ success: true, updatedItem });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Support GET for instant dev testing simulator
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const txId = searchParams.get('txId');
  const secret = searchParams.get('secret');

  if (!txId) {
    return NextResponse.json({ error: 'Missing txId' }, { status: 400 });
  }

  const tx = await db.bidTransaction.findUnique({
    where: { id: txId },
    include: { item: true },
  });

  if (!tx) {
    return NextResponse.redirect(new URL('/?error=transaction_not_found', req.url));
  }

  if (tx.status !== 'COMPLETED') {
    await db.bidTransaction.update({
      where: { id: txId },
      data: {
        status: 'COMPLETED',
        providerTxId: `sim_${Date.now()}`,
      },
    });

    const updatedTotal = tx.item.totalBidAmount + tx.amount;
    const takeoverData = tx.isTakeover
      ? {
          isTakeover: true,
          takeoverExpiresAt: new Date(Date.now() + 3 * 3600 * 1000),
        }
      : {};

    const updatedItem = await db.item.update({
      where: { id: tx.itemId },
      data: {
        totalBidAmount: updatedTotal,
        ...takeoverData,
      },
    });

    realtime.broadcast({
      type: 'BID_COMPLETED',
      item: updatedItem,
      transaction: tx,
    });
  }

  // Redirect back to home with success message
  return NextResponse.redirect(
    new URL(`/?success=bid_placed&domain=${encodeURIComponent(tx.item.domain)}&amount=${tx.amount}&status=${tx.item.status}`, req.url)
  );
}
