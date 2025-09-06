import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const DEV_MOCK_EVENTS = [
  {
    id: '1',
    title: 'Site Visit - Johnson Family',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3600 * 1000).toISOString(),
    description: 'Initial site visit',
    extendedProps: { type: 'site_visit', status: 'scheduled', source: 'local' }
  },
  {
    id: '2',
    title: 'Estimate Meeting - Martinez',
    start: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    description: 'Discuss estimate',
    extendedProps: { type: 'consultation', status: 'scheduled', source: 'local' }
  }
];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_EVENTS);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/appointments/calendar?${queryString}` : `${BACKEND_URL}/api/appointments/calendar`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
