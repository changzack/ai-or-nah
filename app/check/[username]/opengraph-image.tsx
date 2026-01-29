import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AI or Nah Result'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  // Default values for unfetched results
  let aiLikelihood = 50
  let verdict = 'Unclear'
  let emoji = '🤔'
  let bgColor = '#FCD34D'

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiornah.ai'
    const res = await fetch(
      `${baseUrl}/api/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        cache: 'no-store',
      }
    )
    if (res.ok) {
      const data = await res.json()
      aiLikelihood = data.aiLikelihood || 50

      if (aiLikelihood <= 30) {
        verdict = 'Probably Real'
        emoji = '✅'
        bgColor = '#A8D5BA'
      } else if (aiLikelihood <= 60) {
        verdict = 'Unclear'
        emoji = '🤔'
        bgColor = '#FCD34D'
      } else if (aiLikelihood <= 80) {
        verdict = 'Likely Fake'
        emoji = '⚠️'
        bgColor = '#FF6B6B'
      } else {
        verdict = 'Definitely AI'
        emoji = '🤖'
        bgColor = '#FF6B6B'
      }
    }
  } catch {
    // Use defaults on error
  }

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
          position: 'relative',
        }}
      >
        {/* Username */}
        <div style={{ fontSize: 36, color: '#6B7280', marginBottom: 10 }}>
          @{username}
        </div>

        {/* Percentage */}
        <div style={{ fontSize: 120, fontWeight: 800, color: bgColor }}>
          {aiLikelihood}%
        </div>

        {/* Verdict */}
        <div style={{ fontSize: 48, fontWeight: 700, color: '#1A1A1A', marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{emoji}</span>
          <span>{verdict}</span>
        </div>

        {/* Branding */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          right: 40,
          fontSize: 24,
          color: '#9CA3AF'
        }}>
          aiornah.ai
        </div>
      </div>
    ),
    { ...size }
  )
}
