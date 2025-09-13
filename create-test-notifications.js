#!/usr/bin/env node
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

// Mock notifications data to create
const testNotifications = [
  {
    type: 'estimate_viewed',
    title: 'Estimate Viewed by Client',
    message: 'Your estimate for kitchen remodel has been viewed by Sarah Johnson.',
    priority: 'medium',
    category: 'estimate',
    metadata: {
      estimateId: 'EST-001',
      clientName: 'Sarah Johnson'
    }
  },
  {
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Payment of $5,000 received for project #PRJ-123.',
    priority: 'high',
    category: 'payment',
    metadata: {
      amount: 5000,
      projectId: 'PRJ-123'
    }
  },
  {
    type: 'new_lead',
    title: 'New Lead Generated',
    message: 'A new lead has been created from your website contact form.',
    priority: 'medium',
    category: 'client',
    metadata: {
      source: 'website',
      leadScore: 85
    }
  },
  {
    type: 'system_alert',
    title: 'Backup Completed',
    message: 'Daily system backup completed successfully.',
    priority: 'low',
    category: 'system',
    metadata: {
      backupSize: '2.4GB',
      duration: '5m 32s'
    }
  },
  {
    type: 'client_message',
    title: 'Client Message Received',
    message: 'Mike Davis sent a message regarding the bathroom renovation project.',
    priority: 'high',
    category: 'client',
    metadata: {
      clientId: 'CLIENT-456',
      projectId: 'PRJ-456'
    }
  }
];

async function createTestNotifications() {
  console.log('Creating test notifications...');

  // First, try to get a valid token by logging in
  const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password'
    })
  });

  if (!loginResponse.ok) {
    console.error('Failed to login. Please ensure the backend is running and has a test user.');
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.access_token;

  if (!token) {
    console.error('No access token received from login');
    return;
  }

  console.log('Successfully logged in. Creating notifications...');

  for (const notification of testNotifications) {
    try {
      const response = await fetch(`${API_BASE}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Created notification: ${notification.title}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create notification "${notification.title}": ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error creating notification "${notification.title}":`, error.message);
    }
  }

  console.log('\n✅ Test notifications creation completed!');
  console.log('You can now visit http://localhost:3005/dashboard/notifications to see them.');
}

createTestNotifications().catch(console.error);
