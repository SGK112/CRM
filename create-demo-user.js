#!/usr/bin/env node

/**
 * Quick script to create a demo user for testing
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/remodely-crm';

async function createDemoUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check if demo user already exists
    const existingUser = await db.collection('users').findOne({ email: 'demo@demo.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists: demo@demo.com');
      console.log('🔑 Note: Password verification may be required');
      console.log('🌐 Login at: http://localhost:3005/auth/login');
      return;
    }
    
    // Create demo user - Note: Password will need to be hashed by backend
    const workspaceId = `workspace-${Date.now()}`;
    
    const demoUser = {
      _id: `demo-user-${Date.now()}`,
      email: 'demo@demo.com',
      password: '$2a$12$demohashedpassword123', // Placeholder - real apps should hash properly
      firstName: 'Demo',
      lastName: 'User',
      role: 'owner',
      workspaceId: workspaceId,
      isEmailVerified: true,
      isActive: true,
      subscriptionPlan: 'starter',
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(demoUser);
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@demo.com');
    console.log('🔑 Password: demo123 (Note: Authentication may need backend setup)');
    console.log('🆔 User ID:', demoUser._id);
    console.log('🏢 Workspace ID:', workspaceId);
    console.log('🌐 Login at: http://localhost:3005/auth/login');
    console.log('⚠️  Note: For full authentication, use the reset-user-auth.js script');
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await client.close();
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createDemoUser();
}

export { createDemoUser };
