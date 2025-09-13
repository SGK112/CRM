import { getDevClientsStore } from '@/lib/dev-client-store';
import { readContactsFromFile } from '@/lib/file-contact-store';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // In development mode, count from the same sources as the main clients endpoint
    if (process.env.NODE_ENV !== 'production') {
      const fileContacts = readContactsFromFile();
      const memoryContacts = getDevClientsStore();

      // Convert memory contacts to file contact format and merge (same logic as main clients endpoint)
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

      return NextResponse.json({ count: allContacts.length });
    }

    // Always use mock data as primary in production deployment
    if (!token) {
      return NextResponse.json({ count: getDevClientsStore().length });
    }

    // If we have a token, try backend but fallback to mock data if it fails
    try {
      const { searchParams } = new URL(request.url);
      const queryString = searchParams.toString();
      const url = queryString ? `${BACKEND_URL}/api/clients/count?${queryString}` : `${BACKEND_URL}/api/clients/count`;

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
        // Fallback to counting mock data
        const fileContacts = readContactsFromFile();
        const memoryContacts = getDevClientsStore();

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

        return NextResponse.json({ count: allContacts.length });
      }
    } catch (error) {
      // Fallback to counting mock data
      const fileContacts = readContactsFromFile();
      const memoryContacts = getDevClientsStore();

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

      return NextResponse.json({ count: allContacts.length });
    }
  } catch (error) {
    // Fallback to mock data count
    const fileContacts = readContactsFromFile();
    const memoryContacts = getDevClientsStore();

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

    return NextResponse.json({ count: allContacts.length });
  }
}
