import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanDomain } from '@/lib/utils';
import { scrapeUrlMetadata } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email, amount, isTakeover, provider = 'DEV_SIMULATOR', customTitle, customDescription } = body;

    if (!url || !email || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid URL, email, and bid amount are required' }, { status: 400 });
    }

    const { domain, cleanUrl } = cleanDomain(url);
    const bidAmount = Number(amount);

    // Find or create item
    let item = await db.item.findUnique({
      where: { url: cleanUrl },
    });

    if (!item) {
      const scraped = await scrapeUrlMetadata(cleanUrl);
      item = await db.item.create({
        data: {
          url: cleanUrl,
          domain,
          title: customTitle || scraped.title || domain,
          description: customDescription || scraped.description || `Visit ${domain}`,
          faviconUrl: scraped.faviconUrl,
          ogImageUrl: scraped.ogImageUrl,
          email,
          totalBidAmount: 0,
          status: 'PENDING', // All new bids start pending approval
        },
      });
    }

    // Create pending transaction
    const transaction = await db.bidTransaction.create({
      data: {
        itemId: item.id,
        amount: bidAmount,
        paymentProvider: provider,
        payerEmail: email,
        isTakeover: Boolean(isTakeover),
        status: 'PENDING',
      },
    });

    // In a live environment with Polar/LemonSqueezy, we create a hosted checkout session here.
    // For universal local demo & testing, we provide a simulation checkout URL.
    const checkoutUrl = `/api/webhook/payment?txId=${transaction.id}&secret=dev_instant_complete`;

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      itemId: item.id,
      checkoutUrl,
      amount: bidAmount,
      isTakeover: Boolean(isTakeover),
      item: {
        domain: item.domain,
        title: item.title,
        status: item.status,
      },
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json({ error: 'Failed to process bid' }, { status: 500 });
  }
}
