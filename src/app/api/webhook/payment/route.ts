import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Extract Polar transaction ID from metadata or root fields
    const txId =
      payload?.data?.metadata?.transactionId ||
      payload?.data?.custom_data?.transactionId ||
      payload?.data?.custom_field_data?.transactionId ||
      payload?.transactionId;

    if (!txId) {
      return NextResponse.json({ error: 'Transaction ID missing in Polar payload' }, { status: 400 });
    }

    const tx = await db.bidTransaction.findUnique({
      where: { id: txId },
      include: { item: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Transaction already completed' });
    }

    // Mark transaction as completed via Polar
    await db.bidTransaction.update({
      where: { id: txId },
      data: {
        status: 'COMPLETED',
        paymentProvider: 'POLAR',
        providerTxId: payload?.data?.id || payload?.id || `polar_${Date.now()}`,
      },
    });

    // Permanently stack bid amount on top of domain
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
        status: 'APPROVED',
        ...takeoverData,
      },
    });

    // Broadcast live event to all connected browsers globally
    realtime.broadcast({
      type: 'BID_COMPLETED',
      item: updatedItem,
      transaction: tx,
    });

    return NextResponse.json({ success: true, updatedItem });
  } catch (error) {
    console.error('Polar payment webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Support GET for testing / simulated checkout completion
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const txId = searchParams.get('txId');

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
        paymentProvider: 'POLAR',
        providerTxId: `polar_sim_${Date.now()}`,
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
        status: 'APPROVED',
        ...takeoverData,
      },
    });

    realtime.broadcast({
      type: 'BID_COMPLETED',
      item: updatedItem,
      transaction: tx,
    });
  }

  return NextResponse.redirect(new URL(`/?payment=success&txId=${txId}`, req.url));
}
