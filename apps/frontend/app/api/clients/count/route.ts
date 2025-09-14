import { NextRequest, NextResponse } from 'next/server';
import { readContactsFromFile } from '@/lib/file-contact-store';

async function getDevClients() {
  // First try file-based store
  try {
    const fileClients = await readContactsFromFile();
    if (fileClients && fileClients.length > 0) {
      return fileClients;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reading from file store:', error);
  }
  
  // Fallback to empty array
  return [];
}

export async function GET(request: NextRequest) {
  try {
    // Get token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      // Use backend if authentication is available
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      try {
        const backendResponse = await fetch(`${backendUrl}/api/clients/count`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          // Backend returns just a number, wrap it in {count: number} format
          const count = typeof data === 'number' ? data : data.count || 0;
          return NextResponse.json({ count });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Count API: Backend connection failed:', error);
      }
    }
    
    // Fallback to development data
    const clients = await getDevClients();
    return NextResponse.json({ count: clients.length });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Count API error:', error);
    return NextResponse.json({ error: 'Failed to fetch client count' }, { status: 500 });
  }
}
