import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      // Return default theme when no token
      return NextResponse.json({
        success: true,
        theme: 'dark', // Default theme
        data: { theme: 'dark' }
      });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/theme`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      // Backend is unavailable, return default
    }

    // Return default theme when backend is unavailable
    return NextResponse.json({
      success: true,
      theme: 'dark',
      data: { theme: 'dark' }
    });
  } catch (error) {
    // Always return a valid theme response
    return NextResponse.json({
      success: true,
      theme: 'dark',
      data: { theme: 'dark' }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the access token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/user/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save theme');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save theme',
      },
      { status: 500 }
    );
  }
}
