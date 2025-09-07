import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development, return mock status to allow UI testing
    if (!token && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        enabled: true,
        connected: true,
        companyName: 'Development Company',
        lastSync: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        autoSync: true,
        syncSettings: {
          customers: true,
          items: true,
          estimates: true,
          invoices: true,
          payments: true
        }
      });
    }

    if (!token) {
      return NextResponse.json({ 
        enabled: false,
        connected: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/quickbooks/sync/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        enabled: false,
        connected: false,
        error: 'Failed to get QuickBooks status'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data || data);

  } catch (error) {
    return NextResponse.json({
      enabled: false,
      connected: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
