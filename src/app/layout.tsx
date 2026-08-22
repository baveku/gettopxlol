import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gettopx.lol'),
  title: {
    default: 'TopX — The Real-Time Pay-to-Rank Spotlight',
    template: '%s · TopX',
  },
  description:
    'TopX (gettopx.lol) is a sovereign meritocratic leaderboard where products outbid the competition in real time to capture global spotlight attention. No ads, no blackbox algorithms.',
  keywords: [
    'TopX',
    'gettopx.lol',
    'pay to rank',
    'leaderboard',
    'startup spotlight',
    'indie hackers',
    'viral attention',
    'polar payment',
    'meritocratic advertising',
  ],
  authors: [{ name: 'TopX Team', url: 'https://gettopx.lol' }],
  creator: 'TopX',
  publisher: 'TopX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'TopX — The Real-Time Pay-to-Rank Spotlight',
    description:
      'No ads, no algorithms, no gatekeepers. Outbid your competitors in real time to claim the #1 spotlight on gettopx.lol.',
    url: 'https://gettopx.lol',
    siteName: 'TopX',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopX — The Real-Time Pay-to-Rank Spotlight',
    description:
      'No ads, no algorithms, no gatekeepers. Outbid your competitors in real time to claim the #1 spotlight on gettopx.lol.',
    creator: '@gettopxlol',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#08090c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#08090c] text-zinc-100 selection:bg-amber-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
