import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthly = parseInt(searchParams.get('monthly') ?? '0', 10);
  const annual = parseInt(searchParams.get('annual') ?? '0', 10);

  const hasSignificantSavings = monthly > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo / brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '48px',
            color: '#94a3b8',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          ⚡ SpendLens by Credex
        </div>

        {hasSignificantSavings ? (
          <>
            <div
              style={{
                fontSize: '28px',
                color: '#64748b',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              My AI spend audit found
            </div>
            <div
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#38bdf8',
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              ${monthly.toLocaleString()}/mo
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#94a3b8',
                marginTop: '16px',
                textAlign: 'center',
              }}
            >
              in AI subscription savings
            </div>
            <div
              style={{
                marginTop: '20px',
                fontSize: '22px',
                color: '#475569',
              }}
            >
              ${annual.toLocaleString()}/year · spendlens.credex.rocks
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#f1f5f9',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              Stop overpaying for AI tools.
            </div>
            <div
              style={{
                fontSize: '28px',
                color: '#64748b',
                marginTop: '24px',
                textAlign: 'center',
                maxWidth: '700px',
              }}
            >
              Free instant audit. No login. Real dollar savings.
            </div>
          </>
        )}

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px',
            padding: '8px 20px',
            color: '#64748b',
            fontSize: '16px',
          }}
        >
          Free · No signup · Results in seconds
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
