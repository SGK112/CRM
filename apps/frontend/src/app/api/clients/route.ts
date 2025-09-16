import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// BACKEND_URL for when backend is deployed
// const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
//                    process.env.BACKEND_URL ||
//                    'https://remodely-crm-backend.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Return mock clients for now since backend is not deployed
    const mockClients = [
      {
        id: 'mock_client_1',
        _id: 'mock_client_1',
        name: 'Sample Client',
        email: 'sample@example.com',
        phone: '555-0123',
        status: 'lead',
        contactType: 'client',
        createdAt: new Date().toISOString()
      }
    ];

    // Check for limit parameter to demonstrate request usage
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    if (limit) {
      return NextResponse.json(mockClients.slice(0, parseInt(limit)));
    }

    return NextResponse.json(mockClients);

    /* Backend integration code - enable when backend is deployed
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
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    */
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

    // For now, create a mock response since backend is not deployed
    // This allows contact creation to work immediately
    const mockClient = {
      id: `client_${Date.now()}`,
      _id: `client_${Date.now()}`,
      name: `${body.firstName} ${body.lastName}`.trim(),
      email: body.email,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      company: body.company,
      contactType: body.contactType || 'client',
      status: 'lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockClient);

    /* Backend integration code - enable when backend is deployed
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
      const errorData = await response.json().catch(() => ({ message: 'Failed to create client' }));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create client' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    */
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
