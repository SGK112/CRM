import { NextRequest, NextResponse } from 'next/server';
import { clientStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, ALWAYS use local storage for better local testing
    if (process.env.NODE_ENV !== 'production') {
      const clients = clientStorage.getAll();
      return NextResponse.json({ count: clients.length });
    }

    // Enhanced authentication logic for development mode
    if (!token || token === 'null' || token === 'undefined' || token.length <= 10) {
      // Always use local storage in production without valid auth
      const clients = clientStorage.getAll();
      return NextResponse.json({ count: clients.length });
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

      // If backend fails, fall back to frontend storage always
      const clients = clientStorage.getAll();
      return NextResponse.json({ count: clients.length });
    } catch (backendError) {
      // Backend connection failed, use frontend storage
      const clients = clientStorage.getAll();
      return NextResponse.json({ count: clients.length });

      throw backendError;
    }
  } catch (error) {
    // Final fallback to local storage
    const clients = clientStorage.getAll();
    return NextResponse.json({ count: clients.length });
  }
}
