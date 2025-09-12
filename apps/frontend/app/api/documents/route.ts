import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock data for development
const DEV_MOCK_DOCUMENTS = {
  documents: [],
  categories: [
    { name: 'contracts', count: 0 },
    { name: 'estimates', count: 0 },
    { name: 'invoices', count: 0 },
    { name: 'permits', count: 0 },
    { name: 'receipts', count: 0 },
    { name: 'photos', count: 0 },
  ],
  storage: {
    used: '0 MB',
    total: '5 GB',
    percentage: 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock data so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_DOCUMENTS);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/documents?${queryString}` : `${BACKEND_URL}/api/documents`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to mock data in development
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_DOCUMENTS);
      }

      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock data in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(DEV_MOCK_DOCUMENTS);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      // In development, simulate successful upload
      if (process.env.NODE_ENV !== 'production') {
        const file = formData.get('file') as File;
        if (file) {
          return NextResponse.json({
            success: true,
            document: {
              id: Date.now(),
              name: file.name,
              type: 'upload',
              size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              uploadDate: new Date().toISOString().split('T')[0],
              status: 'uploaded',
              url: `/docs/${file.name}`,
            },
          });
        }
      }

      return NextResponse.json(
        { error: 'Failed to upload document' },
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
