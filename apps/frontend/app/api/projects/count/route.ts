import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_COUNT = 0; // No demo projects - production ready

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Always return safe default when no token
    if (!token) {
      return NextResponse.json({ count: DEV_MOCK_COUNT });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // Fallback to getting all projects and counting them
      const projectsResponse = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projects = Array.isArray(projectsData) ? projectsData : [];
        return NextResponse.json({ count: projects.length });
      }
    } catch (backendError) {
      // Backend is unavailable, return default
    }

    // Always return a safe default count
    return NextResponse.json({ count: DEV_MOCK_COUNT });
  } catch (error) {
    // Always return a valid response, never 500
    return NextResponse.json({ count: DEV_MOCK_COUNT });
  }
}
