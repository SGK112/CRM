import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock data for development
const DEV_MOCK_ADMIN = {
  users: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-28',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-27',
      createdAt: '2024-01-05',
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      role: 'user',
      status: 'inactive',
      lastLogin: '2024-01-20',
      createdAt: '2024-01-10',
    },
  ],
  systemStats: {
    totalUsers: 3,
    activeUsers: 2,
    totalProjects: 15,
    totalClients: 8,
    storageUsed: '125.6 MB',
    storageTotal: '5 GB',
    uptime: '99.9%',
    lastBackup: '2024-01-28 02:00:00',
  },
  activityLog: [
    {
      id: 1,
      user: 'John Smith',
      action: 'Created new project',
      target: 'Kitchen Renovation - Johnson Family',
      timestamp: '2024-01-28 14:30:00',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      action: 'Updated client information',
      target: 'Martinez Construction',
      timestamp: '2024-01-28 13:15:00',
      ip: '192.168.1.101',
    },
    {
      id: 3,
      user: 'John Smith',
      action: 'Generated invoice',
      target: 'Invoice #003 - Smith Enterprises',
      timestamp: '2024-01-28 11:45:00',
      ip: '192.168.1.100',
    },
  ],
  settings: {
    companyName: 'ABC Construction',
    companyEmail: 'info@abcconstruction.com',
    companyPhone: '(555) 123-4567',
    timeZone: 'America/New_York',
    currency: 'USD',
    invoicePrefix: 'INV',
    estimatePrefix: 'EST',
    backupFrequency: 'daily',
    maxFileSize: '10MB',
    allowedFileTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock data so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_ADMIN);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/admin?${queryString}` : `${BACKEND_URL}/api/admin`;

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
        return NextResponse.json(DEV_MOCK_ADMIN);
      }

      return NextResponse.json(
        { error: 'Failed to fetch admin data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock data in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(DEV_MOCK_ADMIN);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/admin`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // In development, simulate successful update
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          message: 'Settings updated successfully',
          data: { ...DEV_MOCK_ADMIN.settings, ...body },
        });
      }

      return NextResponse.json(
        { error: 'Failed to update admin settings' },
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
