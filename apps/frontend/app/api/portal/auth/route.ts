import { NextRequest, NextResponse } from 'next/server';

// Mock portal data - in production this would come from your database
const mockPortalData = {
  client: {
    id: 'client-123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701'
  },
  projects: {
    active: 3,
    completed: 8,
    totalValue: 125000
  },
  estimates: {
    pending: 2,
    approved: 5,
    total: 7
  },
  invoices: {
    pending: 1,
    paid: 12,
    overdue: 0,
    totalOutstanding: 8500
  },
  messages: {
    unread: 3,
    total: 24
  },
  appointments: {
    upcoming: 2,
    thisWeek: 4
  },
  notifications: [
    {
      id: '1',
      type: 'success' as const,
      title: 'Payment Received',
      message: 'Invoice #1234 has been paid',
      date: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New Estimate Available',
      message: 'Kitchen renovation estimate is ready for review',
      date: new Date(Date.now() - 86400000).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Appointment Reminder',
      message: 'Site visit scheduled for tomorrow at 2 PM',
      date: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ]
};

// Mock password storage - in production use secure hashing
const mockPasswords: Record<string, string> = {
  'client-123': 'portal2024',
  'client-456': 'secure123',
  'client-789': 'mypassword'
};

// Mock valid tokens - in production store in database with expiration
const mockTokens: Record<string, { clientId: string; expiresAt: Date }> = {
  'token-abc123': { clientId: 'client-123', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  'token-def456': { clientId: 'client-456', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, password, token } = body;

    // Authentication with token
    if (token) {
      const tokenData = mockTokens[token];

      if (!tokenData) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      if (tokenData.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }

      if (tokenData.clientId !== clientId) {
        return NextResponse.json(
          { error: 'Token not valid for this client' },
          { status: 401 }
        );
      }

      // Return portal data
      return NextResponse.json({
        ...mockPortalData,
        client: {
          ...mockPortalData.client,
          id: clientId
        }
      });
    }

    // Authentication with password
    if (password && clientId) {
      const validPassword = mockPasswords[clientId];

      if (!validPassword || validPassword !== password) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Return portal data
      return NextResponse.json({
        ...mockPortalData,
        client: {
          ...mockPortalData.client,
          id: clientId
        }
      });
    }

    return NextResponse.json(
      { error: 'Missing authentication credentials' },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
