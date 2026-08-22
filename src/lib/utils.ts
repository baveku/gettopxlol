import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function timeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString();
}

export function cleanDomain(urlStr: string): { domain: string; cleanUrl: string } {
  try {
    let raw = urlStr.trim();
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = 'https://' + raw;
    }
    const parsed = new URL(raw);
    const domain = parsed.hostname.replace(/^www\./, '').toLowerCase();
    let pathname = parsed.pathname;
    if (pathname === '/') pathname = '';
    const cleanUrl = `${parsed.protocol}//${domain}${pathname}${parsed.search}`;
    return {
      domain,
      cleanUrl,
    };
  } catch {
    const sanitized = urlStr.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].toLowerCase();
    return {
      domain: sanitized || urlStr,
      cleanUrl: urlStr.startsWith('http') ? urlStr : `https://${urlStr}`,
    };
  }
}
