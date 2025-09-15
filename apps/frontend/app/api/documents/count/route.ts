import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Return mock count for development
      return NextResponse.json({ count: 24, recent: 6 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/documents/count${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      // Return default count on error
      return NextResponse.json({ count: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return default count on error
    return NextResponse.json({ count: 0 });
  }
}
