import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return mock data for development if backend is not available
      return NextResponse.json({
        notifications: [
          {
            id: '1',
            type: 'estimate_viewed',
            title: 'Estimate Viewed',
            message: 'Johnson Family viewed your kitchen renovation estimate',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
            clientId: '1',
            clientName: 'Johnson Family'
          },
          {
            id: '2',
            type: 'email',
            title: 'Email Sent',
            message: 'Follow-up email sent to Martinez Construction',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: true,
            clientId: '2',
            clientName: 'Martinez Construction'
          },
          {
            id: '3',
            type: 'sms',
            title: 'SMS Sent',
            message: 'Reminder SMS sent to Wilson Enterprises',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            read: true,
            clientId: '3',
            clientName: 'Wilson Enterprises'
          }
        ]
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock data for development
    return NextResponse.json({
      notifications: [
        {
          id: '1',
          type: 'estimate_viewed',
          title: 'Estimate Viewed',
          message: 'Johnson Family viewed your kitchen renovation estimate',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          clientId: '1',
          clientName: 'Johnson Family'
        }
      ]
    });
  }
}
