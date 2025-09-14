import { NextRequest, NextResponse } from 'next/server';

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
  return raw.replace(/\/$/, '').replace(/(?:\/api)+$/, '');
}

const API_BASE = getApiBase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch both inbox messages and notifications in parallel
    const queryString = searchParams.toString();
    
    const [inboxResponse, notificationsResponse] = await Promise.all([
      fetch(`${API_BASE}/api/inbox${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${API_BASE}/api/notifications`, {
        method: 'GET',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      })
    ]);

    let inboxData = [];
    let notificationsData = [];

    // Handle inbox response
    if (inboxResponse.ok) {
      inboxData = await inboxResponse.json();
    }

    // Handle notifications response
    if (notificationsResponse.ok) {
      const notifications = await notificationsResponse.json();
      // Transform notifications to match inbox format
      notificationsData = notifications.map((notification: any) => ({
        id: `notification_${notification.id}`,
        type: 'notification',
        subject: notification.title,
        content: notification.message,
        sender: {
          name: 'System',
          email: 'system@crm.com',
          avatar: 'SY'
        },
        timestamp: notification.created_at || notification.timestamp,
        isRead: notification.isRead || false,
        isStarred: false,
        category: notification.category || 'general',
        priority: notification.priority || 'normal',
        originalNotification: notification
      }));
    }

    // Combine and sort by timestamp
    const combinedMessages = [...inboxData, ...notificationsData];
    combinedMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(combinedMessages);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE}/api/inbox`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'Backend request failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
