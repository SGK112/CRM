import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ count: 0 });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      // Backend is unavailable, return default
    }

    // Always return a safe default count
    return NextResponse.json({ count: 0 });
  } catch (error) {
    // Always return a valid response, never 500
    return NextResponse.json({ count: 0 });
  }
}
