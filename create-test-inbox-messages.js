const { MongoClient, ObjectId } = require('mongodb');

async function createTestInboxMessages() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://CARI:%4011560Ndysart@cluster1.s4iodnn.mongodb.net/remodely-crm?retryWrites=true&w=majority&appName=Cluster1';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    
    // Get the first user and workspace for testing
    const user = await db.collection('users').findOne({ email: 'admin@remodely.ai' });
    if (!user) {
      console.log('Admin user not found. Please create admin user first.');
      return;
    }

    console.log('User found:', { id: user._id, email: user.email, workspaceId: user.workspaceId });

    let workspace = await db.collection('workspaces').findOne({ _id: user.workspaceId });
    if (!workspace) {
      console.log('Workspace not found. Checking all workspaces...');
      const allWorkspaces = await db.collection('workspaces').find({}).toArray();
      console.log('Available workspaces:', allWorkspaces.map(w => ({ id: w._id, name: w.name })));
      
      // Check if workspaceId is a string and try ObjectId
      if (typeof user.workspaceId === 'string') {
        try {
          const workspaceObjectId = new ObjectId(user.workspaceId);
          workspace = await db.collection('workspaces').findOne({ _id: workspaceObjectId });
          console.log('Found workspace with ObjectId:', workspace ? { id: workspace._id, name: workspace.name } : 'Not found');
        } catch (err) {
          console.log('Invalid ObjectId format');
        }
      }
      
      // If still no workspace, create one
      if (!workspace) {
        console.log('Creating a new workspace...');
        const newWorkspace = {
          _id: user.workspaceId,
          name: 'Remodely CRM',
          ownerId: user._id,
          settings: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await db.collection('workspaces').insertOne(newWorkspace);
        workspace = newWorkspace;
        console.log('Created workspace:', { id: workspace._id, name: workspace.name });
      }
    }

    // Create test inbox messages
    const testMessages = [
      {
        type: 'email',
        subject: 'Welcome to Remodely CRM',
        content: 'Thank you for signing up for Remodely CRM! We\'re excited to help you manage your remodeling projects more efficiently.',
        sender: 'support@remodely.ai',
        senderName: 'Remodely Support',
        workspaceId: workspace._id,
        userId: user._id,
        isRead: false,
        isStarred: false,
        isArchived: false,
        priority: 'normal',
        metadata: {
          actionUrl: '/dashboard/settings',
          actionLabel: 'Complete Setup'
        },
        createdAt: new Date(),
        lastActivity: new Date()
      },
      {
        type: 'notification',
        subject: 'New Project Estimate Request',
        content: 'You have a new estimate request from John Smith for a kitchen remodel project.',
        sender: 'system',
        senderName: 'System Notification',
        workspaceId: workspace._id,
        userId: user._id,
        isRead: false,
        isStarred: true,
        isArchived: false,
        priority: 'high',
        metadata: {
          clientInfo: {
            id: 'sample-client-id',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1234567890'
          },
          actionUrl: '/dashboard/estimates',
          actionLabel: 'View Estimate'
        },
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        lastActivity: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        type: 'sms',
        subject: 'SMS from Client',
        content: 'Hi! I\'m interested in getting a quote for bathroom renovation. When would be a good time to schedule a consultation?',
        sender: '+1234567890',
        senderName: 'Jane Doe',
        workspaceId: workspace._id,
        userId: user._id,
        isRead: true,
        isStarred: false,
        isArchived: false,
        priority: 'normal',
        metadata: {
          clientInfo: {
            id: 'sample-client-id-2',
            name: 'Jane Doe',
            phone: '+1234567890'
          }
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'system',
        subject: 'Database Backup Complete',
        content: 'Your weekly database backup has been completed successfully. All your data is safely backed up.',
        sender: 'system',
        senderName: 'System',
        workspaceId: workspace._id,
        userId: user._id,
        isRead: true,
        isStarred: false,
        isArchived: false,
        priority: 'low',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        type: 'email',
        subject: 'Invoice Payment Received',
        content: 'Great news! We\'ve received payment for invoice #INV-001 from ABC Construction Company. The payment of $5,250.00 has been processed.',
        sender: 'billing@remodely.ai',
        senderName: 'Billing Department',
        workspaceId: workspace._id,
        userId: user._id,
        isRead: false,
        isStarred: false,
        isArchived: false,
        priority: 'normal',
        metadata: {
          actionUrl: '/dashboard/invoices',
          actionLabel: 'View Invoice'
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    const result = await db.collection('inboxmessages').insertMany(testMessages);
    console.log(`✅ Created ${result.insertedCount} test inbox messages`);
    console.log('Test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await client.close();
  }
}

createTestInboxMessages();
