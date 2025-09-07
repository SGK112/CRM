import { NextRequest, NextResponse } from 'next/server';
import { projectStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, ALWAYS use local storage for better local testing
    if (process.env.NODE_ENV !== 'production') {
      const localProjects = projectStorage.getAll();
      return NextResponse.json(localProjects);
    }

    // Always use local storage as primary in production deployment
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
  } catch (error) {
    // Final fallback to local storage
    const localProjects = projectStorage.getAll();
    return NextResponse.json(localProjects);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // In development mode, ALWAYS use local storage for better local testing
    if (process.env.NODE_ENV !== 'production') {
      const newProject = projectStorage.create(body);
      return NextResponse.json(newProject, { status: 201 });
    }

    // Development mode fallback - create in local storage if no valid token
    if (!token) {
      const newProject = projectStorage.create(body);
      return NextResponse.json(newProject, { status: 201 });
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
