import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanDomain } from '@/lib/utils';
import { scrapeUrlMetadata } from '@/lib/scraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, email, amount, isTakeover, customTitle, customDescription } = body;

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
          status: 'APPROVED', // Instant approval for live bidding
        },
      });
    }

    // Create pending transaction dedicated to Polar
    const transaction = await db.bidTransaction.create({
      data: {
        itemId: item.id,
        amount: bidAmount,
        paymentProvider: 'POLAR',
        payerEmail: email,
        isTakeover: Boolean(isTakeover),
        status: 'PENDING',
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gettopx.lol';
    const polarToken = process.env.POLAR_ACCESS_TOKEN || process.env.POLAR_API_KEY;

    let checkoutUrl = `/api/webhook/payment?txId=${transaction.id}&secret=dev_instant_complete`;
    let isLivePolar = false;

    // If Polar API Token is provided, create real Polar Checkout Session
    if (polarToken && !polarToken.includes('xxxx')) {
      try {
        const polarResponse = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${polarToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(bidAmount * 100), // Polar takes amount in cents
            currency: 'usd',
            product_name: isTakeover
              ? `TopX — 3-Hour VIP Takeover (${domain})`
              : `TopX — Bid $${bidAmount} for ${domain}`,
            customer_email: email,
            metadata: {
              transactionId: transaction.id,
              itemId: item.id,
              domain: item.domain,
              url: item.url,
              isTakeover: String(Boolean(isTakeover)),
            },
            success_url: `${appUrl}/?payment=success&txId=${transaction.id}`,
          }),
        });

        if (polarResponse.ok) {
          const polarData = await polarResponse.json();
          if (polarData.url) {
            checkoutUrl = polarData.url;
            isLivePolar = true;
          }
        } else {
          console.warn('Polar API checkout creation status:', polarResponse.status, await polarResponse.text());
        }
      } catch (polarErr) {
        console.error('Error calling Polar API:', polarErr);
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      itemId: item.id,
      checkoutUrl,
      isLivePolar,
      amount: bidAmount,
      isTakeover: Boolean(isTakeover),
      item: {
        domain: item.domain,
        title: item.title,
        status: item.status,
      },
    });
  } catch (error: any) {
    console.error('Error creating bid:', error);
    const errorMessage = error?.message || 'Database or payment initialization error';
    return NextResponse.json({ error: `Failed to process bid: ${errorMessage}` }, { status: 500 });
  }
}
