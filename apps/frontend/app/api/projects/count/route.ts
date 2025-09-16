import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookie header if present
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({ count: 0, active: 0, completed: 0 });
    }

    const projects = await response.json();
    const count = Array.isArray(projects) ? projects.length : 0;
    const active = Array.isArray(projects) ? projects.filter(p => p.status === 'active' || p.status === 'in_progress').length : 0;
    const completed = Array.isArray(projects) ? projects.filter(p => p.status === 'completed').length : 0;
    
    return NextResponse.json({ count, active, completed });
  } catch (error) {
    return NextResponse.json({ count: 0, active: 0, completed: 0 });
  }
}
