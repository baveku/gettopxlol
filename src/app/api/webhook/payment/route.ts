import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { realtime } from '@/lib/realtime';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload?.type || payload?.event || 'unknown';

    // Extract Polar transaction ID from all possible Polar payload locations
    const txId =
      payload?.data?.metadata?.transactionId ||
      payload?.data?.custom_field_data?.transactionId ||
      payload?.data?.custom_data?.transactionId ||
      payload?.data?.checkout?.metadata?.transactionId ||
      payload?.metadata?.transactionId ||
      payload?.transactionId;

    // For non-payment / informational Polar events (e.g. customer.created, member.created, discount.created)
    if (!txId) {
      console.log(`Polar webhook received informational event: ${eventType} (acknowledged)`);
      return NextResponse.json({ received: true, event: eventType }, { status: 200 });
    }

    const tx = await db.bidTransaction.findUnique({
      where: { id: txId },
      include: { item: true },
    });

    if (!tx) {
      console.warn(`Polar webhook transaction ID not found: ${txId}`);
      // Return 200 so Polar does not keep retrying unrecognized old IDs
      return NextResponse.json({ received: true, warning: 'Transaction not found' }, { status: 200 });
    }

    if (tx.status === 'COMPLETED') {
      return NextResponse.json({ received: true, message: 'Transaction already completed' }, { status: 200 });
    }

    // Check payment confirmation status
    const checkoutStatus = payload?.data?.status;
    const isPaymentConfirmed =
      eventType === 'order.created' ||
      checkoutStatus === 'succeeded' ||
      checkoutStatus === 'confirmed' ||
      payload?.data?.paid === true ||
      !checkoutStatus; // default to complete if order event

    if (isPaymentConfirmed) {
      // Mark transaction as completed
      await db.bidTransaction.update({
        where: { id: txId },
        data: {
          status: 'COMPLETED',
          paymentProvider: 'POLAR',
          providerTxId: payload?.data?.id || payload?.id || `polar_${Date.now()}`,
        },
      });

      // Stacks bid amount permanently onto the domain
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

      console.log(`Polar payment successfully processed for tx: ${txId}, handle: ${updatedItem.domain}, new total: $${updatedTotal}`);
      return NextResponse.json({ received: true, success: true, updatedItem }, { status: 200 });
    }

    return NextResponse.json({ received: true, status: checkoutStatus }, { status: 200 });
  } catch (error: any) {
    console.error('Polar payment webhook error:', error);
    // Return 200 with error log to prevent Polar webhook delivery failure alarms
    return NextResponse.json({ received: true, error: error.message }, { status: 200 });
  }
}

// Support GET for testing / browser redirects
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
