import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Estimate ID is required' },
        { status: 400 }
      );
    }

    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/estimates/${id}/convert`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Estimate not found' },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({ message: 'Failed to convert estimate to invoice' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to convert estimate to invoice' },
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
