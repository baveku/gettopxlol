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

export function cleanXHandle(inputStr: string): {
  handle: string;
  rawHandle: string;
  profileUrl: string;
  domain: string;
  cleanUrl: string;
} {
  let raw = inputStr.trim().replace(/^@+/, '');
  // Remove protocol and domain if present
  raw = raw.replace(/^https?:\/\//i, '');
  raw = raw.replace(/^(?:www\.)?(?:twitter\.com|x\.com)\/?/i, '');
  
  // Strip query strings and trailing slashes
  raw = raw.split('?')[0].split('/')[0].trim();
  const rawHandle = raw.toLowerCase().replace(/[^a-z0-9_]/gi, '');
  const handle = `@${rawHandle}`;
  const profileUrl = `https://x.com/${rawHandle}`;

  return {
    handle,
    rawHandle,
    profileUrl,
    domain: handle,
    cleanUrl: profileUrl,
  };
}

export function cleanDomain(urlStr: string): { domain: string; cleanUrl: string } {
  // If input looks like an X handle or X URL, delegate to cleanXHandle
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('@') || trimmed.includes('x.com') || trimmed.includes('twitter.com') || !trimmed.includes('.')) {
    const xResult = cleanXHandle(urlStr);
    return {
      domain: xResult.handle,
      cleanUrl: xResult.profileUrl,
    };
  }

  try {
    let raw = trimmed;
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
    const sanitized = trimmed.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].toLowerCase();
    return {
      domain: sanitized || trimmed,
      cleanUrl: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
    };
  }
}
