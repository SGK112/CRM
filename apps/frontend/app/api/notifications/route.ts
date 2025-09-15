import { NextRequest, NextResponse } from 'next/server';
import { createBackendHeaders, getBackendUrl } from '../utils/backend';

export const dynamic = 'force-dynamic';

const BACKEND_URL = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Return mock notifications data for development
      return NextResponse.json({
        success: true,
        data: [
          {
            id: '1',
            title: 'Welcome to Remodely',
            message: 'Your CRM is ready to use!',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'New Project Update',
            message: 'Kitchen renovation project has been updated',
            type: 'project',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        count: 2,
        unread: 1
      });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/notifications${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: createBackendHeaders(request),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
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
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'POST',
      headers: createBackendHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create notification' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create notification' },
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
