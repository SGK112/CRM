import { NextRequest, NextResponse } from 'next/server';
import { clientStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, always use local storage first
    if (process.env.NODE_ENV !== 'production') {
      // If no token, definitely use local storage
      if (!token) {
        return NextResponse.json({ clients: clientStorage.getAll() });
      }
      
      // If token exists, try backend first, fall back to local storage
      try {
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = queryString ? `${BACKEND_URL}/api/clients?${queryString}` : `${BACKEND_URL}/api/clients`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (error) {
        // Backend failed, fall back to local storage
      }
      
      // Fallback to local storage for development
      return NextResponse.json({ clients: clientStorage.getAll() });
    }

    // Production mode - require valid token OR fallback to development mode
    if (!token) {
      // Fallback to development mode behavior in production if no backend configured
      if (!BACKEND_URL || BACKEND_URL.includes('localhost')) {
        return NextResponse.json({ clients: clientStorage.getAll() });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/clients?${queryString}` : `${BACKEND_URL}/api/clients`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
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

    if (!token) {
      if (process.env.NODE_ENV !== 'production' || !BACKEND_URL || BACKEND_URL.includes('localhost')) {
        // Create contact using shared storage
        const newContact = clientStorage.create(body);
        return NextResponse.json(newContact, { status: 201 });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create client' },
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
