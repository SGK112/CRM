import { NextRequest, NextResponse } from 'next/server';
import { clientStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Enhanced authentication logic for development mode
    if (!token || token === 'null' || token === 'undefined' || token.length <= 10) {
      if (process.env.NODE_ENV !== 'production' || !BACKEND_URL || BACKEND_URL.includes('localhost')) {
        // Get count from shared storage
        const clients = clientStorage.getAll();
        return NextResponse.json({ count: clients.length });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For authenticated users, try backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/clients/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend fails, fall back to frontend storage in development
      if (process.env.NODE_ENV !== 'production' || !BACKEND_URL || BACKEND_URL.includes('localhost')) {
        const clients = clientStorage.getAll();
        return NextResponse.json({ count: clients.length });
      }

      return NextResponse.json(
        { error: 'Failed to get client count' },
        { status: response.status }
      );
    } catch (backendError) {
      // Backend connection failed, use frontend storage in development
      if (process.env.NODE_ENV !== 'production' || !BACKEND_URL || BACKEND_URL.includes('localhost')) {
        const clients = clientStorage.getAll();
        return NextResponse.json({ count: clients.length });
      }

      throw backendError;
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
