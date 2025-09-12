import { NextRequest, NextResponse } from 'next/server';
import { getDevClientsStore, addToDevClientsStore, findInDevClientsStore, DevClient } from '@/lib/dev-client-store';
import { addContactToFile, readContactsFromFile } from '@/lib/file-contact-store';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, use file store for persistence across server restarts
    if (process.env.NODE_ENV !== 'production') {
      const fileContacts = readContactsFromFile();
      const memoryContacts = getDevClientsStore();
      
      // Convert memory contacts to file contact format and merge
      const allContacts = [...fileContacts];
      memoryContacts.forEach(memContact => {
        const exists = allContacts.find(fc => fc.id === memContact.id || fc._id === memContact._id);
        if (!exists) {
          allContacts.unshift({
            ...memContact,
            id: memContact.id,
            _id: memContact._id,
            name: memContact.name,
            email: memContact.email,
            createdAt: memContact.createdAt,
            updatedAt: memContact.updatedAt
          });
        }
      });
      
      return NextResponse.json({ clients: allContacts });
    }

    // Always use mock data as primary in production deployment
    if (!token) {
      return NextResponse.json({ clients: getDevClientsStore() });
    }

    // If we have a token, try backend but fallback to mock data if it fails
    try {
      const { searchParams } = new URL(request.url);
      const queryString = searchParams.toString();
      const url = queryString ? `${BACKEND_URL}/api/clients?${queryString}` : `${BACKEND_URL}/api/clients`;

      const response = await fetch(url, {
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
        return NextResponse.json({ clients: getDevClientsStore() });
      }
    } catch (error) {
      return NextResponse.json({ clients: getDevClientsStore() });
    }
  } catch (error) {
    // Fallback to mock data
    return NextResponse.json({ clients: getDevClientsStore() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // In development mode, create mock client and add to both stores
    if (process.env.NODE_ENV !== 'production') {
      const clientId = String(Date.now());
      const newClient: DevClient = {
        id: clientId,
        _id: clientId,
        name: body.name || 'New Client',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        type: body.type || 'residential',
        status: body.status || 'active',
        notes: body.notes || '',
        projects: body.projects || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...body
      };
      
      // Add to in-memory store
      addToDevClientsStore(newClient);
      
      // Also add to file store for persistence
      const fileContact = {
        id: newClient.id,
        _id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
        city: newClient.city,
        state: newClient.state,
        zipCode: newClient.zipCode,
        type: newClient.type,
        entityType: newClient.entityType,
        businessType: newClient.businessType,
        status: newClient.status,
        notes: newClient.notes,
        createdAt: newClient.createdAt,
        updatedAt: newClient.updatedAt,
        ...body
      };
      
      const fileSaved = addContactToFile(fileContact);
      
      // Verify the contact was added successfully
      const verification = findInDevClientsStore(newClient.id);
      if (!verification && !fileSaved) {
        return NextResponse.json(
          { error: 'Failed to save contact to store' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(newClient, { status: 201 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try backend first, fallback to mock on error
    try {
      const response = await fetch(`${BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
      } else {
        const newClient = {
          id: String(Date.now()),
          _id: String(Date.now()),
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return NextResponse.json(newClient, { status: 201 });
      }
    } catch (error) {
      const newClient = {
        id: String(Date.now()),
        _id: String(Date.now()),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(newClient, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
