import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_COUNT = 3; // Mock count for development

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Development mode fallback - return mock count if no valid token
    if (!token || process.env.NODE_ENV !== 'production') {
      if (!token) {
        return NextResponse.json({ count: DEV_MOCK_COUNT });
      }

      // If we have a token, try backend but fallback to mock if it fails
      try {
        const response = await fetch(`${BACKEND_URL}/api/projects/count`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          // Backend failed, return mock count
          return NextResponse.json({ count: DEV_MOCK_COUNT });
        }
      } catch (error) {
        // Backend error, return mock count
        return NextResponse.json({ count: DEV_MOCK_COUNT });
      }
    }

    // Production mode with valid token
    const response = await fetch(`${BACKEND_URL}/api/projects/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to getting all projects and counting them
      const projectsResponse = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projects = Array.isArray(projectsData) ? projectsData : [];
        return NextResponse.json({ count: projects.length });
      }

      return NextResponse.json(
        { error: 'Failed to fetch project count' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock count in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ count: DEV_MOCK_COUNT });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
