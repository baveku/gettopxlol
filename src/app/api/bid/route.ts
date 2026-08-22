import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanDomain } from '@/lib/utils';
import { scrapeUrlMetadata } from '@/lib/scraper';
import { getOrCreatePolarProductId } from '@/lib/polar';

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
          followers: scraped.followers || null,
          email,
          totalBidAmount: 0,
          status: 'APPROVED',
        },
      });
    }

    // Create pending transaction
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

    if (polarToken && !polarToken.includes('xxxx')) {
      try {
        const productId = await getOrCreatePolarProductId(polarToken);

        const polarResponse = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${polarToken.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: [productId],
            amount: Math.round(bidAmount * 100), // Polar expects cents
            currency: 'usd',
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
          // Fallback to standard checkouts endpoint
          const standardResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${polarToken.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              products: [productId],
              amount: Math.round(bidAmount * 100),
              currency: 'usd',
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

          if (standardResponse.ok) {
            const stdData = await standardResponse.json();
            if (stdData.url) {
              checkoutUrl = stdData.url;
              isLivePolar = true;
            }
          } else {
            const errText = await standardResponse.text();
            console.error('Polar API Error:', standardResponse.status, errText);
            return NextResponse.json({
              error: `Polar Checkout Error (${standardResponse.status}): ${errText || 'Invalid Polar configuration.'}`
            }, { status: 400 });
          }
        }
      } catch (polarErr: any) {
        console.error('Error calling Polar API:', polarErr);
        return NextResponse.json({
          error: `Failed to connect to Polar API: ${polarErr.message}`
        }, { status: 500 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'POLAR_ACCESS_TOKEN is missing in Vercel Environment Variables. Please set your Polar token in Vercel settings.'
      }, { status: 400 });
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
