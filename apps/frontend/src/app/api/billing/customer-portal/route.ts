import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/billing/customer-portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Customer portal API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
