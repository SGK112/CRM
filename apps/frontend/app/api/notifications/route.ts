import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEV_MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'estimate_viewed',
    title: 'Estimate Viewed',
    message: 'Johnson Family viewed your kitchen renovation estimate',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    clientId: '1',
    clientName: 'Johnson Family',
  },
  {
    id: '2',
    type: 'email',
    title: 'Email Sent',
    message: 'Follow-up email sent to Martinez Construction',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    clientId: '2',
    clientName: 'Martinez Construction',
  },
];

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
