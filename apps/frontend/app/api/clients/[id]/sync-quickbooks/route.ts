import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development, allow requests without auth for testing
    if (!token && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Client synced to QuickBooks successfully (development mode)',
        data: {
          quickbooksCustomerId: `qb_customer_${params.id}`,
          syncedAt: new Date().toISOString(),
          syncStatus: 'success'
        }
      });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/sync-quickbooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to sync client to QuickBooks',
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Client synced to QuickBooks successfully',
      data
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error during QuickBooks sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support GET for checking sync status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development, return mock status
    if (!token && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        data: {
          synced: false,
          syncStatus: 'not_synced',
          quickbooksCustomerId: null,
          lastSyncDate: null
        }
      });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/quickbooks-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get QuickBooks status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
