import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/notifications/count`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return fallback data if backend is unavailable
      return NextResponse.json({ count: 0 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return fallback data on any error
    return NextResponse.json({ count: 0 });
  }
}
