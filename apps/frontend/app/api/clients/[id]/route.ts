import { NextRequest, NextResponse } from 'next/server';
import { findInDevClientsStore, updateInDevClientsStore, removeFromDevClientsStore } from '@/lib/dev-client-store';
import { findContactInFile, updateContactInFile, removeContactFromFile } from '@/lib/file-contact-store';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Find client in memory store first, then file store
    let client = findInDevClientsStore(params.id);
    if (!client) {
      const fileClient = findContactInFile(params.id);
      if (fileClient) {
        // Convert file contact to dev client format for response
        client = {
          ...fileClient,
          projects: [],
          firstName: typeof fileClient.firstName === 'string' ? fileClient.firstName : undefined,
          lastName: typeof fileClient.lastName === 'string' ? fileClient.lastName : undefined
        };
      }
    }

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
        // Development mode: updating contact in shared store

        // Find the existing contact
        const existingContact = findInDevClientsStore(params.id);

        if (!existingContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        // Update the contact with new data
        const updatedContact = updateInDevClientsStore(params.id, body);

        if (!updatedContact) {
          return NextResponse.json(
            { error: 'Failed to update contact' },
            { status: 500 }
          );
        }

        // Development mode: contact updated successfully
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

      // If backend fails, fall back to shared store in development
      if (process.env.NODE_ENV !== 'production') {
        // Development mode: backend update failed, using shared store fallback

        const updatedContact = updateInDevClientsStore(params.id, body);

        if (!updatedContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        // Development mode: contact updated successfully via fallback
        return NextResponse.json(updatedContact);
      }

      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: response.status }
      );
    } catch (backendError) {
      // Backend connection failed, use shared store in development
      if (process.env.NODE_ENV !== 'production') {
        // Development mode: backend unreachable, using shared store

        const updatedContact = updateInDevClientsStore(params.id, body);

        if (!updatedContact) {
          return NextResponse.json(
            { error: 'Contact not found' },
            { status: 404 }
          );
        }

        // Development mode: contact updated successfully via fallback
        return NextResponse.json(updatedContact);
      }

      throw backendError;
    }
  } catch (error) {
    // Error updating contact - could be logged to monitoring service in production
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

    // In development mode, allow deletion from shared store
    if (process.env.NODE_ENV !== 'production') {
      const deleted = removeFromDevClientsStore(params.id);
      const fileDeleted = removeContactFromFile(params.id);

      if (!deleted && !fileDeleted) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: 'Client deleted successfully' });
    }

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
  { params: _params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // No sync actions supported - redirect to settings
    return NextResponse.json({
      error: 'Sync preferences should be configured in settings'
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
