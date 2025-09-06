import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')

  // Dev-friendly mock when unauthenticated
  if (!auth && process.env.NODE_ENV !== 'production') {
    let payload: { eventId?: string } = {}
    try {
      payload = (await req.json()) as { eventId?: string }
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      summary: `Mock summary for ${payload?.eventId ?? 'event'}: Quick overview generated in dev.`,
      mock: true,
    })
  }

  // Forward to backend in non-dev or when auth present
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
  const origin = `${backendUrl}/api/ai/summarize`
  const res = await fetch(origin, {
    method: 'POST',
    headers: Object.fromEntries(req.headers.entries()),
    body: await req.text(),
  })

  const text = await res.text()
  return new NextResponse(text, { status: res.status, headers: res.headers })
}
