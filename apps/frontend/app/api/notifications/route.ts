import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEV_MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'estimate_viewed',
    title: 'Estimate Viewed',
    message: 'Johnson Family viewed your kitchen renovation estimate #EST-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    clientId: '1',
    clientName: 'Johnson Family',
    priority: 'medium',
    category: 'estimate'
  },
  {
    id: '2',
    type: 'email',
    title: 'Email Sent',
    message: 'Follow-up email sent to Martinez Construction',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    clientId: '2',
    clientName: 'Martinez Construction',
    priority: 'low',
    category: 'email'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $4,500 received for Invoice #INV-2024-0123',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: false,
    clientId: '3',
    clientName: 'Davis Construction',
    priority: 'high',
    category: 'payment'
  },
  {
    id: '4',
    type: 'client_message',
    title: 'New Client Message',
    message: 'Smith Family sent a message: "Can we schedule the final walkthrough?"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: false,
    clientId: '4',
    clientName: 'Smith Family',
    priority: 'medium',
    category: 'client'
  },
  {
    id: '5',
    type: 'system_alert',
    title: 'System Backup Complete',
    message: 'Daily system backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    priority: 'low',
    category: 'system'
  },
  {
    id: '6',
    type: 'project_update',
    title: 'Project Milestone Reached',
    message: 'Bathroom renovation project reached 75% completion',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
    clientId: '5',
    clientName: 'Wilson Family',
    priority: 'medium',
    category: 'project'
  },
  {
    id: '7',
    type: 'invoice_paid',
    title: 'Invoice Payment Overdue',
    message: 'Invoice #INV-2024-0118 is 5 days overdue',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: false,
    clientId: '6',
    clientName: 'Thompson LLC',
    priority: 'urgent',
    category: 'payment'
  },
  {
    id: '8',
    type: 'estimate_created',
    title: 'New Estimate Created',
    message: 'Estimate #EST-1002 created for deck installation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    read: true,
    clientId: '7',
    clientName: 'Brown Family',
    priority: 'low',
    category: 'estimate'
  }
];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If backend fails, return development mock data when possible
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
      }

      const err = await response.json().catch(() => ({ error: 'Failed to fetch notifications' }));
      return NextResponse.json(err, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ notifications: DEV_MOCK_NOTIFICATIONS });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
