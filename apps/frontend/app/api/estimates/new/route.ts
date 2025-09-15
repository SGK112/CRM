import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      const body = await request.json();
      // Return mock created estimate for development
      return NextResponse.json({
        success: true,
        estimate: {
          id: `est-${Date.now()}`,
          number: `EST-${Math.floor(Math.random() * 10000)}`,
          ...body,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/estimates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to create estimate' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create estimate',
      },
      { status: 500 }
    );
  }
}