import { NextRequest, NextResponse } from 'next/server';
import { clientStorage } from '@/lib/shared-storage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, always use local storage first
    if (process.env.NODE_ENV !== 'production') {
      // If no token, definitely use local storage
      if (!token) {
        const client = clientStorage.getById(params.id);
        if (client) {
          return NextResponse.json(client);
        }
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
      
      // If token exists, try backend first, fall back to local storage
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
        }
      } catch (error) {
        // Backend failed, fall back to local storage
      }
      
      // Fallback to local storage for development
      const client = clientStorage.getById(params.id);
      if (client) {
        return NextResponse.json(client);
      }
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Production mode - require valid token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Client not found' },
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
        console.log('[DEV MODE] Updating contact in frontend storage:', params.id);
        
        // Find the existing contact
        const existingContact = clientStorage.getById(params.id);
        
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

        // Update in storage
        const updated = clientStorage.update(params.id, updatedContact);
        
        if (updated) {
          console.log('[DEV MODE] Contact updated successfully:', updated);
          return NextResponse.json(updated);
        } else {
          return NextResponse.json(
            { error: 'Failed to update contact' },
            { status: 500 }
          );
        }
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

      // If backend fails, fall back to frontend storage in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Backend update failed, using frontend storage fallback');
        
        const existingContact = clientStorage.getById(params.id);
        
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

        const updated = clientStorage.update(params.id, updatedContact);
        
        if (updated) {
          console.log('[DEV MODE] Contact updated successfully via fallback:', updated);
          return NextResponse.json(updated);
        }
      }

      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: response.status }
      );
    } catch (backendError) {
      // Backend connection failed, use frontend storage in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Backend unreachable, using frontend storage:', backendError);
        
        const existingContact = clientStorage.getById(params.id);
        
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

        const updated = clientStorage.update(params.id, updatedContact);
        
        if (updated) {
          console.log('[DEV MODE] Contact updated successfully via fallback:', updated);
          return NextResponse.json(updated);
        }
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
