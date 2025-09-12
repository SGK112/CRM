import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  clientId: string;
  clientName: string;
}

const DEV_MOCK_NOTIFICATIONS: Notification[] = [];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return mock data for development if backend is not available
      return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock data for development
    return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
  }
}
