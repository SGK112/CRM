#!/usr/bin/env node

/**
 * Check database for existing users to test with
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/remodely_crm';

async function checkUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');

    const db = client.db();
    const users = await db.collection('users').find({}).limit(5).toArray();

    console.log(`\n👥 Found ${users.length} users in database:`);

    if (users.length === 0) {
      console.log('❌ No users found. You may need to create a test user first.');
      console.log('\n💡 You can create a user by registering at: http://localhost:3005/auth/register');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Role: ${user.role || 'team_member'}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}`);
      });

      console.log(`\n🔑 You can test with any of these emails using their password.`);
      console.log(`📝 Update test-profile-api.js with a valid email/password combination.`);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MONGODB_URI environment variable is set correctly');
    console.log('3. Verify database credentials and connection string');
  } finally {
    await client.close();
  }
}

checkUsers();
