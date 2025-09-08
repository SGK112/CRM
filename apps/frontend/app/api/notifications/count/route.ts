import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_COUNT = 3; // Mock count for development

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock count so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ count: DEV_MOCK_COUNT });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to getting all notifications and counting them
      const notificationsResponse = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const notifications = notificationsData.notifications || notificationsData;
        const count = Array.isArray(notifications) ? notifications.length : 0;
        return NextResponse.json({ count });
      }

      return NextResponse.json(
        { error: 'Failed to fetch notification count' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock count in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ count: DEV_MOCK_COUNT });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
