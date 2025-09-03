import { NextRequest, NextResponse } from 'next/server';

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
  return raw.replace(/\/$/, '').replace(/(?:\/api)+$/, '');
}
const API_BASE = getApiBase();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get('areaCode');
    const contains = searchParams.get('contains');
    const limit = searchParams.get('limit') || '20';

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const apiUrl = new URL(`${API_BASE}/twilio-numbers/available`);
    if (areaCode) apiUrl.searchParams.append('areaCode', areaCode);
    if (contains) apiUrl.searchParams.append('contains', contains);
    apiUrl.searchParams.append('limit', limit);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search available numbers' },
      { status: 500 }
    );
  }
}
