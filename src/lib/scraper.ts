import * as cheerio from 'cheerio';
import { cleanDomain } from './utils';

export interface ScrapedMetadata {
  url: string;
  domain: string;
  title: string;
  description: string;
  faviconUrl: string;
  ogImageUrl?: string;
}

export async function scrapeUrlMetadata(rawUrl: string): Promise<ScrapedMetadata> {
  const { domain, cleanUrl } = cleanDomain(rawUrl);
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (OutrankBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        url: cleanUrl,
        domain,
        title: domain,
        description: `Visit ${domain}`,
        faviconUrl: defaultFavicon,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title resolution
    let title = $('meta[property="og:title"]').attr('content')
      || $('meta[name="twitter:title"]').attr('content')
      || $('title').text()
      || domain;

    title = title.trim().substring(0, 100);

    // Description resolution
    let description = $('meta[property="og:description"]').attr('content')
      || $('meta[name="twitter:description"]').attr('content')
      || $('meta[name="description"]').attr('content')
      || `Discover ${domain} - High quality product and services.`;

    description = description.trim().substring(0, 300);

    // OG Image
    let ogImageUrl = $('meta[property="og:image"]').attr('content')
      || $('meta[name="twitter:image"]').attr('content');

    if (ogImageUrl && !ogImageUrl.startsWith('http')) {
      try {
        ogImageUrl = new URL(ogImageUrl, cleanUrl).toString();
      } catch {
        ogImageUrl = undefined;
      }
    }

    // Favicon resolution
    let faviconUrl = $('link[rel="apple-touch-icon"]').attr('href')
      || $('link[rel="icon"]').attr('href')
      || $('link[rel="shortcut icon"]').attr('href')
      || defaultFavicon;

    if (faviconUrl && !faviconUrl.startsWith('http')) {
      try {
        faviconUrl = new URL(faviconUrl, cleanUrl).toString();
      } catch {
        faviconUrl = defaultFavicon;
      }
    }

    return {
      url: cleanUrl,
      domain,
      title: title || domain,
      description: description || `Welcome to ${domain}`,
      faviconUrl: faviconUrl || defaultFavicon,
      ogImageUrl,
    };
  } catch (error) {
    console.error('Error scraping metadata for', cleanUrl, error);
    return {
      url: cleanUrl,
      domain,
      title: domain,
      description: `Visit ${domain}`,
      faviconUrl: defaultFavicon,
    };
  }
}
