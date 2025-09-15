import { NextRequest, NextResponse } from 'next/server';
import { devStore } from '../../dev-store';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Always try backend first, fallback to dev-store
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

    const response = await fetch(`${BACKEND_URL}/api/clients/${id}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback to dev-store if backend is not accessible
    if (response.status === 401 || response.status === 500 || response.status === 404) {
      const storedContact = devStore.getContact(id);
      if (storedContact) {
        return NextResponse.json({
          success: true,
          data: storedContact
        });
      }

      // If not found in store either, return 404
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Client not found' },
      { status: response.status }
    );
  } catch (error) {
    // Fallback to dev-store on any error
    const { id } = params;
    const storedContact = devStore.getContact(id);
    if (storedContact) {
      return NextResponse.json({
        success: true,
        data: storedContact
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Update contact in development store
      const updated = devStore.updateContact(id, body);
      
      if (!updated) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Client updated successfully'
      });
    }

    // Production mode - proxy to backend
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

    const response = await fetch(`${BACKEND_URL}/api/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update client' },
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Delete contact from development store
      const deleted = devStore.deleteContact(id);
      
      if (!deleted) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Client deleted successfully'
      });
    }

    // Production mode - proxy to backend
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

    const response = await fetch(`${BACKEND_URL}/api/clients/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete client' },
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