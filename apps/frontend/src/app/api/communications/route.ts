import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type CommunicationType = 'email' | 'notification' | 'message' | 'task';
type PriorityType = 'low' | 'normal' | 'high' | 'urgent';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/communications/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return mock data for development if backend is not available
      return NextResponse.json([
        {
          id: '1',
          type: 'email',
          title: 'Project Estimate Approved',
          content: 'Great news! Your estimate for the kitchen renovation has been approved. We can proceed with the project next week.',
          sender: {
            name: 'Sarah Johnson',
            email: 'sarah@client.com',
            avatar: 'SJ',
          },
          status: 'unread',
          priority: 'high',
          folderId: 'inbox',
          tags: ['approved', 'kitchen'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            projectId: 'proj-001',
            clientId: 'client-001',
          },
        },
        {
          id: '2',
          type: 'notification',
          title: 'New Message from Team',
          content: 'Mike has updated the project timeline. Please review the changes.',
          sender: {
            name: 'System',
            avatar: 'SYS',
          },
          status: 'read',
          priority: 'normal',
          folderId: 'inbox',
          tags: ['team', 'update'],
          metadata: {
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            projectId: 'proj-001',
          },
        },
      ]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock data for development
    return NextResponse.json([
      {
        id: '1',
        type: 'email',
        title: 'Project Estimate Approved',
        content: 'Great news! Your estimate for the kitchen renovation has been approved. We can proceed with the project next week.',
        sender: {
          name: 'Sarah Johnson',
          email: 'sarah@client.com',
          avatar: 'SJ',
        },
        status: 'unread',
        priority: 'high',
        folderId: 'inbox',
        tags: ['approved', 'kitchen'],
        metadata: {
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          projectId: 'proj-001',
          clientId: 'client-001',
        },
      },
    ]);
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);

  // Handle draft requests
  if (url.pathname.endsWith('/draft')) {
    try {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { type, title, content, recipient, priority, tags, status, folderId } = body;

      // Create draft data
      const draftData = {
        type,
        title: title || 'Untitled Draft',
        content,
        recipient,
        priority: priority || 'normal',
        tags: tags || [],
        status: 'draft',
        folderId: 'drafts',
      };

      // For now, create a mock draft response
      const mockDraft = {
        id: Date.now().toString(),
        type: type as CommunicationType,
        title: draftData.title,
        content: draftData.content,
        sender: {
          name: 'You',
          avatar: 'YOU',
        },
        recipient: recipient ? { email: recipient } : undefined,
        status: 'draft' as const,
        priority: draftData.priority as PriorityType,
        folderId: 'drafts',
        tags: draftData.tags,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      return NextResponse.json(mockDraft);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to save draft' },
        { status: 500 }
      );
    }
  }

  // Handle regular communication requests
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    // Extract basic fields
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const recipient = formData.get('recipient') as string;

    // Handle different communication types
    if (type === 'email' && recipient) {
      // Send email via backend
      const emailData = {
        email: recipient, // Send the actual email address
        subject: title,
        message: content,
      };

      const response = await fetch(`${BACKEND_URL}/api/communications/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result);
    }

    if (type === 'message' && recipient) {
      // Send SMS via backend
      const smsData = {
        phone: recipient, // Send the actual phone number
        message: content,
      };

      const response = await fetch(`${BACKEND_URL}/api/communications/sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to send SMS' },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json(result);
    }

    // For other types, create a mock response for now
    const mockCommunication = {
      id: Date.now().toString(),
      type: type as CommunicationType,
      title,
      content,
      sender: {
        name: 'You',
        avatar: 'YOU',
      },
      status: 'sent' as const,
      priority: priority as PriorityType,
      folderId: 'sent',
      tags,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(mockCommunication);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const communicationId = pathParts[pathParts.length - 1];

  if (!communicationId || communicationId === 'communications') {
    return NextResponse.json({ error: 'Invalid communication ID' }, { status: 400 });
  }

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, content, recipient, priority, tags, status, folderId } = body;

    // Update draft data
    const updatedDraft = {
      id: communicationId,
      type: type as CommunicationType,
      title: title || 'Untitled Draft',
      content,
      sender: {
        name: 'You',
        avatar: 'YOU',
      },
      recipient: recipient ? { email: recipient } : undefined,
      status: status || 'draft',
      priority: priority || 'normal',
      folderId: folderId || 'drafts',
      tags: tags || [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(updatedDraft);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}
