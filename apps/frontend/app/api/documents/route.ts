import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock data for development
const DEV_MOCK_DOCUMENTS = {
  documents: [
    {
      id: 1,
      name: 'Johnson Kitchen Contract.pdf',
      type: 'contract',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      client: 'Johnson Family',
      project: 'Kitchen Renovation',
      status: 'signed',
      url: '/docs/johnson-kitchen-contract.pdf',
    },
    {
      id: 2,
      name: 'Martinez Estimate.pdf',
      type: 'estimate',
      size: '1.8 MB',
      uploadDate: '2024-01-20',
      client: 'Martinez Construction',
      project: 'Office Building',
      status: 'pending',
      url: '/docs/martinez-estimate.pdf',
    },
    {
      id: 3,
      name: 'Smith Invoice #003.pdf',
      type: 'invoice',
      size: '890 KB',
      uploadDate: '2024-01-25',
      client: 'Smith Enterprises',
      project: 'Warehouse Expansion',
      status: 'sent',
      url: '/docs/smith-invoice-003.pdf',
    },
    {
      id: 4,
      name: 'Building Permit - Johnson.pdf',
      type: 'permit',
      size: '1.2 MB',
      uploadDate: '2024-01-18',
      client: 'Johnson Family',
      project: 'Kitchen Renovation',
      status: 'approved',
      url: '/docs/building-permit-johnson.pdf',
    },
    {
      id: 5,
      name: 'Material Receipt - Lumber.pdf',
      type: 'receipt',
      size: '650 KB',
      uploadDate: '2024-01-26',
      client: null,
      project: 'Kitchen Renovation',
      status: 'filed',
      url: '/docs/material-receipt-lumber.pdf',
    },
  ],
  categories: [
    { name: 'contracts', count: 4 },
    { name: 'estimates', count: 2 },
    { name: 'invoices', count: 8 },
    { name: 'permits', count: 3 },
    { name: 'receipts', count: 12 },
    { name: 'photos', count: 45 },
  ],
  storage: {
    used: '125.6 MB',
    total: '5 GB',
    percentage: 2.5,
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
