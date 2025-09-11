import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'Notification updated (dev mode)' });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if it's a mark-as-read operation
    if (body.read === true) {
      const response = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // In development, just return success
        if (process.env.NODE_ENV !== 'production') {
          return NextResponse.json({ success: true, message: 'Notification marked as read (dev mode)' });
        }
        
        const err = await response.json().catch(() => ({ error: 'Failed to mark notification as read' }));
        return NextResponse.json(err, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // For other PATCH operations, use the generic endpoint
    const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'Notification updated (dev mode)' });
      }
      
      const err = await response.json().catch(() => ({ error: 'Failed to update notification' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // In development, just return success
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, message: 'Notification updated (dev mode)' });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'Notification deleted (dev mode)' });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // In development, just return success
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ success: true, message: 'Notification deleted (dev mode)' });
      }
      
      const err = await response.json().catch(() => ({ error: 'Failed to delete notification' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // In development, just return success
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ success: true, message: 'Notification deleted (dev mode)' });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
