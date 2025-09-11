import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'All notifications marked as read (dev mode)' });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'All notifications marked as read (dev mode)' });
      }
      
      const err = await response.json().catch(() => ({ error: 'Failed to mark all notifications as read' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // In development, just return success
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, message: 'All notifications marked as read (dev mode)' });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
