import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopX — The Real-Time Pay-to-Rank Spotlight (gettopx.lol)',
  description: 'No ads, no algorithms, no gatekeepers. Just outbid your competition to claim the #1 spotlight on gettopx.lol.',
  openGraph: {
    title: 'TopX — The Real-Time Pay-to-Rank Spotlight',
    description: 'No ads, no algorithms, no gatekeepers. Just outbid your competition to claim the #1 spotlight on gettopx.lol.',
    type: 'website',
    url: 'https://gettopx.lol',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#08090c] text-zinc-100 selection:bg-amber-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
