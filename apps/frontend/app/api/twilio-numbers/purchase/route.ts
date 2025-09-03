import { NextRequest, NextResponse } from 'next/server';

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
  return raw.replace(/\/$/, '').replace(/(?:\/api)+$/, '');
}
const API_BASE = getApiBase();

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
  const response = await fetch(`${API_BASE}/twilio-numbers/purchase`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to purchase phone number' }, { status: 500 });
  }
}
