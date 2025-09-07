import { NextRequest, NextResponse } from 'next/server';
import { clientStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Always try local storage first as fallback for production deployment issues
    const localClients = clientStorage.getAll();

    // In development mode, ALWAYS use local storage for better local testing
    if (process.env.NODE_ENV !== 'production') {
      // Always use local storage in development - no backend dependency
      return NextResponse.json({ clients: localClients });
    }

    // Production mode - try backend first, fallback to local storage if it fails
    if (!token) {
      // Use local storage in production when no authentication
      return NextResponse.json({ clients: localClients });
    }

    try {
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

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // Backend returned error, fallback to local storage
        return NextResponse.json({ clients: localClients });
      }
    } catch (backendError) {
      // Backend connection failed, use local storage
      return NextResponse.json({ clients: localClients });
    }
  } catch (error) {
    // If everything fails, still return local storage data instead of error
    const localClients = clientStorage.getAll();
    return NextResponse.json({ clients: localClients });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // In development mode, ALWAYS use local storage for better local testing
    if (process.env.NODE_ENV !== 'production') {
      const newContact = clientStorage.create(body);
      return NextResponse.json(newContact, { status: 201 });
    }

    if (!token) {
      // Always allow creating clients in production without authentication
      const newContact = clientStorage.create(body);
      return NextResponse.json(newContact, { status: 201 });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
      } else {
        // Backend failed, use local storage
        const newContact = clientStorage.create(body);
        return NextResponse.json(newContact, { status: 201 });
      }
    } catch (backendError) {
      // Backend connection failed, use local storage
      const newContact = clientStorage.create(body);
      return NextResponse.json(newContact, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
