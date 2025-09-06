import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_CLIENTS = [
  {
    id: '1',
    name: 'Johnson Family',
    email: 'contact@johnsonfamily.com',
    phone: '(555) 123-4567',
    status: 'active',
    projectsCount: 2,
    totalValue: 45000,
  },
  {
    id: '2',
    name: 'Martinez Construction',
    email: 'info@martinezconstruction.com',
    phone: '(555) 234-5678',
    status: 'active',
    projectsCount: 1,
    totalValue: 28000,
  }
];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock clients so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ clients: DEV_MOCK_CLIENTS });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
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
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    const body = await request.json();

    if (!token) {
      // Allow creating clients locally without auth by returning a fake created record.
      if (process.env.NODE_ENV !== 'production') {
        const created = { id: String(Date.now()), ...body };
        return NextResponse.json(created, { status: 201 });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create client' },
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
