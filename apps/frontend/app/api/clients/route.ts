import { NextRequest, NextResponse } from 'next/server';
import { devStore } from '../dev-store';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Always use backend in development now (MongoDB integration)
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/clients${queryString ? `?${queryString}` : ''}`;

    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookie header if present
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Fallback to dev-store if backend is not accessible
      if (response.status === 401 || response.status === 500) {
        const contacts = devStore.getAllContacts();
        return NextResponse.json({
          success: true,
          data: contacts,
          count: contacts.length
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to dev-store on any error
    const contacts = devStore.getAllContacts();
    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Always try backend first, fallback to dev-store
    const body = await request.json();

    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookie header if present
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Fallback to dev-store if backend is not accessible
      if (response.status === 401 || response.status === 500) {
        const contact = devStore.createContact(body);
        return NextResponse.json({
          success: true,
          data: contact,
          message: 'Client created successfully'
        });
      }

      const errorData = await response.json().catch(() => ({ message: 'Failed to create client' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create client' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to dev-store on any error
    const body = await request.json();
    const contact = devStore.createContact(body);
    return NextResponse.json({
      success: true,
      data: contact,
      message: 'Client created successfully'
    });
  }
}