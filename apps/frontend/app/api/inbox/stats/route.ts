import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Return mock inbox stats for development
      return NextResponse.json({
        success: true,
        stats: {
          unread: 3,
          total: 12,
          urgent: 1,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    // Production mode - proxy to backend
    const cookieStore = cookies();
    let token = cookieStore.get('token')?.value;
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.toLowerCase().startsWith('bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/inbox/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch inbox stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch inbox stats',
      },
      { status: 500 }
    );
  }
}