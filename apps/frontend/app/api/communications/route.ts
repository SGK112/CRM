import { NextRequest, NextResponse } from 'next/server';

// Mock communications data for development
const mockCommunications = [
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
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      projectId: 'proj-001',
    },
  },
  {
    id: '3',
    type: 'message',
    title: 'Quick Question About Materials',
    content: 'Hi, I wanted to ask about the tile options for the bathroom. Do we have samples available?',
    sender: {
      name: 'David Chen',
      email: 'david@client.com',
      avatar: 'DC',
    },
    status: 'unread',
    priority: 'normal',
    folderId: 'inbox',
    tags: ['materials', 'bathroom'],
    metadata: {
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      clientId: 'client-002',
    },
  },
  {
    id: '4',
    type: 'task',
    title: 'Follow up with client',
    content: 'Call John Smith to discuss the final contract details and payment schedule.',
    sender: {
      name: 'You',
      avatar: 'YOU',
    },
    status: 'starred',
    priority: 'urgent',
    folderId: 'inbox',
    tags: ['follow-up', 'contract'],
    metadata: {
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Due tomorrow
      clientId: 'client-003',
    },
  },
];

export async function GET() {
  try {
    // In a real implementation, you would:
    // 1. Authenticate the user
    // 2. Query the database for communications
    // 3. Apply filters, sorting, pagination
    // 4. Return the results

    // For now, return mock data
    return NextResponse.json(mockCommunications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract basic fields
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const recipient = formData.get('recipient') as string;
    const priority = formData.get('priority') as string;
    const tagsJson = formData.get('tags') as string;
    const tags = tagsJson ? JSON.parse(tagsJson) : [];

    // Extract attachments
    const attachments: any[] = [];
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (key.startsWith('attachment_') && value instanceof File) {
        attachments.push({
          name: value.name,
          size: value.size,
          type: value.type,
          url: `/uploads/${value.name}`, // In a real app, you'd save the file and get the actual URL
        });
      }
    });

    // In a real implementation, you would:
    // 1. Validate the request data
    // 2. Authenticate the user
    // 3. Save attachments to storage
    // 4. Save the communication to the database
    // 5. Send notifications if needed
    // 6. Return the created communication

    // For now, create a mock response
    const newCommunication = {
      id: Date.now().toString(),
      type: type as any,
      title,
      content,
      sender: {
        name: 'You',
        avatar: 'YOU',
      },
      recipient: recipient ? {
        name: recipient.split('@')[0],
        email: recipient,
      } : undefined,
      status: 'unread',
      priority: priority as any,
      folderId: 'sent',
      tags,
      attachments,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(newCommunication, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    );
  }
}
