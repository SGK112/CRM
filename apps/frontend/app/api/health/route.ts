import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Backend health check failed' },
        { status: response.status }
      );
    }

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : { status: 'ok' };
    } catch (parseError) {
      // If it's not JSON, assume it's a simple OK response
      data = { status: 'ok' };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
