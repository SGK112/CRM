import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
                   process.env.BACKEND_URL ||
                   'https://remodely-crm-backend.onrender.com';

export async function GET() {
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
