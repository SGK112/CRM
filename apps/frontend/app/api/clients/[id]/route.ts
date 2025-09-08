import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock client data for development
const DEV_MOCK_CLIENTS = [
  {
    id: '1',
    _id: '1',
    name: 'Johnson Family',
    email: 'johnson@example.com',
    phone: '(555) 123-4567',
    address: '123 Oak Street, New York, NY 10001',
    type: 'residential',
    status: 'active',
    notes: 'Preferred customer - always pays on time',
    projects: ['1', '3'],
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-09-05T14:30:00Z'
  },
  {
    id: '2',
    _id: '2',
    name: 'Martinez Construction',
    email: 'contact@martinez-construction.com',
    phone: '(555) 987-6543',
    address: '456 Pine Avenue, Los Angeles, CA 90210',
    type: 'commercial',
    status: 'active',
    notes: 'Large commercial projects - net 30 payment terms',
    projects: ['2'],
    createdAt: '2024-08-20T09:15:00Z',
    updatedAt: '2024-09-02T11:20:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Find client in mock data
    const client = DEV_MOCK_CLIENTS.find(c => c.id === params.id || c._id === params.id);

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        if (client) {
          return NextResponse.json(client);
        }
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try backend first, fallback to mock data
    try {
      const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
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
        if (client) {
          return NextResponse.json(client);
        }
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      if (client) {
        return NextResponse.json(client);
      }
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // Enhanced authentication logic for development mode
    if (!token || token === 'null' || token === 'undefined' || token.length <= 10) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Updating contact in mock data:', params.id);

        // Find the existing contact
        const existingContact = DEV_MOCK_CLIENTS.find(c => c.id === params.id || c._id === params.id);

        if (!existingContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        // Update the contact with new data
        const updatedContact = {
          ...existingContact,
          ...body,
          id: params.id, // Preserve the ID
          updatedAt: new Date().toISOString(),
        };

        console.log('[DEV MODE] Contact updated successfully:', updatedContact);
        return NextResponse.json(updatedContact);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For authenticated users, try backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend fails, fall back to mock data in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Backend update failed, using mock data fallback');

        const existingContact = DEV_MOCK_CLIENTS.find(c => c.id === params.id || c._id === params.id);

        if (!existingContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        const updatedContact = {
          ...existingContact,
          ...body,
          id: params.id,
          updatedAt: new Date().toISOString(),
        };

        console.log('[DEV MODE] Contact updated successfully via fallback:', updatedContact);
        return NextResponse.json(updatedContact);
      }

      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: response.status }
      );
    } catch (backendError) {
      // Backend connection failed, use mock data in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Backend unreachable, using mock data:', backendError);

        const existingContact = DEV_MOCK_CLIENTS.find(c => c.id === params.id || c._id === params.id);

        if (!existingContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        const updatedContact = {
          ...existingContact,
          ...body,
          id: params.id,
          updatedAt: new Date().toISOString(),
        };

        console.log('[DEV MODE] Contact updated successfully via fallback:', updatedContact);
        return NextResponse.json(updatedContact);
      }

      throw backendError;
    }
  } catch (error) {
    console.error('[API] Error updating contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sync-quickbooks') {
      const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/sync-quickbooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to sync client to QuickBooks' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
