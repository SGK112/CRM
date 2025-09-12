import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
  priority: string;
  category: string;
}

const DEV_MOCK_NOTIFICATIONS: Notification[] = [];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend fails, return development mock data when possible
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
      }

      const err = await response.json().catch(() => ({ error: 'Failed to fetch notifications' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
