import { NextRequest, NextResponse } from 'next/server';

// Mock data for portal dashboard
// In a real implementation, this would fetch from your database
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
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Project Update',
      message: 'Bathroom renovation is 75% complete',
      date: new Date(Date.now() - 259200000).toISOString(),
      read: true
    },
    {
      id: '5',
      type: 'success' as const,
      title: 'Welcome to Portal',
      message: 'Your client portal account has been activated',
      date: new Date(Date.now() - 345600000).toISOString(),
      read: true
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params;
    
    // Check authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    // In a real implementation, validate the token and get client ID
    // For now, we'll just check if token exists
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // In a real implementation, fetch actual client data based on clientId
    // and ensure the token is valid for this client
    if (clientId !== mockPortalData.client.id) {
      // For demo purposes, return the mock data with the requested client ID
      const portalData = {
        ...mockPortalData,
        client: {
          ...mockPortalData.client,
          id: clientId
        }
      };
      return NextResponse.json(portalData);
    }

    return NextResponse.json(mockPortalData);

  } catch (error) {
    // Log error for debugging
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
