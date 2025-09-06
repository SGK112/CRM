import { NextRequest, NextResponse } from 'next/server';
import { projectStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Development mode fallback - return local storage data if no valid token
    if (!token || process.env.NODE_ENV !== 'production' || !BACKEND_URL || BACKEND_URL.includes('localhost')) {
      // Try to get from local storage first in dev mode
      const localProjects = projectStorage.getAll();
      if (!token) {
        return NextResponse.json(localProjects);
      }
      
      // If we have a token, try backend but fallback to local if it fails
      try {
        const response = await fetch(`${BACKEND_URL}/projects`, {
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
          // Backend failed, return local storage
          return NextResponse.json(localProjects);
        }
      } catch (error) {
        // Backend error, return local storage
        return NextResponse.json(localProjects);
      }
    }

    // Production mode with valid token
    const response = await fetch(`${BACKEND_URL}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // Development mode fallback - create in local storage if no valid token
    if (!token || process.env.NODE_ENV !== 'production') {
      if (!token) {
        const newProject = projectStorage.create(body);
        return NextResponse.json(newProject, { status: 201 });
      }
      
      // If we have a token, try backend but fallback to local if it fails
      try {
        const response = await fetch(`${BACKEND_URL}/projects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          // Backend failed, create in local storage
          const newProject = projectStorage.create(body);
          return NextResponse.json(newProject, { status: 201 });
        }
      } catch (error) {
        // Backend error, create in local storage
        const newProject = projectStorage.create(body);
        return NextResponse.json(newProject, { status: 201 });
      }
    }

    // Production mode with valid token
    const response = await fetch(`${BACKEND_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
