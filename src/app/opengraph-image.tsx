import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GetTopX — The Real-Time Pay-to-Rank Spotlight for X Accounts (gettopx.lol)';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08090c',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '32px',
          }}
        />

        {/* Brand Logo & Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.5)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#08090c"
              stroke="#08090c"
              strokeWidth="2"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            GetTopX<span style={{ color: '#f59e0b' }}>.</span>
          </span>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            margin: '0 0 16px 0',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          The Real-Time Spotlight for 𝕏 Accounts
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '850px',
            margin: '0 0 40px 0',
            lineHeight: 1.4,
          }}
        >
          Outbid creators, builders, and founders to claim the #1 sovereign spotlight for your X profile.
        </p>

        {/* Bottom Pill Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '999px',
              padding: '10px 22px',
              color: '#fbbf24',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ⚡ gettopx.lol
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '10px 22px',
              color: '#e4e4e7',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            ● Live 𝕏 Profiles
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
