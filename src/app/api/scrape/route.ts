import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrlMetadata } from '@/lib/scraper';
import { cleanDomain } from '@/lib/utils';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const { domain, cleanUrl } = cleanDomain(url);
    const existing = await db.item.findUnique({
      where: { url: cleanUrl },
    });

    const metadata = await scrapeUrlMetadata(cleanUrl);

    return NextResponse.json({
      metadata,
      existing: existing
        ? {
            id: existing.id,
            totalBidAmount: existing.totalBidAmount,
            status: existing.status,
            clickCount: existing.clickCount,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in /api/scrape:', error);
    return NextResponse.json({ error: 'Failed to scrape metadata' }, { status: 500 });
  }
}
