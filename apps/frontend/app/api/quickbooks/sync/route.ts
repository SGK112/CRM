import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')

  if (!auth && process.env.NODE_ENV !== 'production') {
    let payload = {}
    try {
      payload = await req.json()
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ ok: true, synced: true, mock: true, payload })
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
  const origin = `${backendUrl}/api/quickbooks/sync`
  const res = await fetch(origin, {
    method: 'POST',
    headers: Object.fromEntries(req.headers.entries()),
    body: await req.text(),
  })

  const text = await res.text()
  return new NextResponse(text, { status: res.status, headers: res.headers })
}
