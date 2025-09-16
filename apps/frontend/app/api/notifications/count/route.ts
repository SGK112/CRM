import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ count: 0, unread: 0 });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const notifications = await response.json();
        const count = Array.isArray(notifications) ? notifications.length : 0;
        const unread = Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0;
        return NextResponse.json({ count, unread });
      }
    } catch (backendError) {
      // Backend is unavailable, return default
    }

    // Always return a safe default count
    return NextResponse.json({ count: 0, unread: 0 });
  } catch (error) {
    // Always return a valid response, never 500
    return NextResponse.json({ count: 0, unread: 0 });
  }
}
