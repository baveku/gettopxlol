import * as cheerio from 'cheerio';
import { cleanXHandle, cleanDomain } from './utils';

export interface ScrapedMetadata {
  url: string;
  domain: string;
  title: string;
  description: string;
  faviconUrl: string;
  ogImageUrl?: string;
  followers?: string;
  isXProfile?: boolean;
}

export async function scrapeUrlMetadata(rawUrl: string): Promise<ScrapedMetadata> {
  const trimmed = rawUrl.trim();
  const isX =
    trimmed.startsWith('@') ||
    trimmed.includes('x.com') ||
    trimmed.includes('twitter.com') ||
    !trimmed.includes('.');

  if (isX) {
    const { handle, rawHandle, profileUrl } = cleanXHandle(rawUrl);
    const defaultAvatar = `https://unavatar.io/x/${rawHandle}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const fxRes = await fetch(`https://api.fxtwitter.com/${rawHandle}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (fxRes.ok) {
        const fxData = await fxRes.json();
        const user = fxData.user;
        if (user) {
          const rawAvatar = user.avatar_url || defaultAvatar;
          const highResAvatar = rawAvatar.replace('_normal.', '_400x400.');
          const followersFormatted = formatFollowers(user.followers || 0);

          return {
            url: profileUrl,
            domain: handle,
            title: user.name || handle,
            description: user.description || `Official X profile of ${handle}. Follow on X (Twitter).`,
            faviconUrl: highResAvatar,
            ogImageUrl: highResAvatar,
            followers: followersFormatted,
            isXProfile: true,
          };
        }
      }
    } catch (err) {
      console.warn('FxTwitter API fetch failed, falling back to unavatar:', err);
    }

    return {
      url: profileUrl,
      domain: handle,
      title: handle,
      description: `Official X profile of ${handle}. Follow on X (Twitter).`,
      faviconUrl: defaultAvatar,
      ogImageUrl: defaultAvatar,
      isXProfile: true,
    };
  }

  const { domain, cleanUrl } = cleanDomain(rawUrl);
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (GetTopXBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        url: cleanUrl,
        domain,
        title: domain,
        description: `Visit ${domain} on GetTopX.`,
        faviconUrl: defaultFavicon,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      domain;

    title = title.trim().substring(0, 100);

    let description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      `Discover ${domain} on GetTopX.`;

    description = description.trim().substring(0, 300);

    let ogImageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    let faviconUrl =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      defaultFavicon;

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
      title,
      description,
      faviconUrl: faviconUrl || defaultFavicon,
      ogImageUrl,
    };
  } catch {
    return {
      url: cleanUrl,
      domain,
      title: domain,
      description: `Visit ${domain} on GetTopX.`,
      faviconUrl: defaultFavicon,
    };
  }
}

function formatFollowers(count: number): string {
  if (!count) return '';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace('.0', '')}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
  }
  return `${count}`;
}
