import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI or Nah - Detect AI-Generated Instagram Accounts'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FDF6E9',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: '#1A1A1A' }}>
          AI or Nah
        </div>
        <div style={{ fontSize: 36, color: '#6B7280', marginTop: 20 }}>
          Detect AI-Generated Instagram Accounts
        </div>
      </div>
    ),
    { ...size }
  )
}
