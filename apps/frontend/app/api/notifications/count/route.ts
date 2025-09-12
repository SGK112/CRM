import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_COUNT = 0; // No demo notifications - production ready

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // For production deployment, return 0 count when no token
    if (!token) {
      return NextResponse.json({ count: DEV_MOCK_COUNT });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If count endpoint fails, try to get all notifications
      const notificationsResponse = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const notifications = notificationsData.notifications || notificationsData;
        const count = Array.isArray(notifications) ? notifications.length : 0;
        return NextResponse.json({ count });
      }
    } catch (backendError) {
      // Backend is unavailable, return default
      // In production, silently handle backend unavailability
    }

    // Return default count when backend is unavailable
    return NextResponse.json({ count: DEV_MOCK_COUNT });
  } catch (error) {
    // Always return a valid response, never 500
    return NextResponse.json({ count: DEV_MOCK_COUNT });
  }
}
