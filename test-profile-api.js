#!/usr/bin/env node

/**
 * Test script for Profile API endpoints
 * This script tests the user profile management functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3005';

// Test credentials (you may need to adjust these)
const TEST_EMAIL = 'demo@example.com';
const TEST_PASSWORD = 'password123';

let authToken = null;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login() {
  console.log('🔐 Testing authentication...');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    authToken = data.accessToken || data.access_token;

    if (!authToken) {
      throw new Error('No access token received from login');
    }

    console.log('✅ Authentication successful');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

async function testGetProfile() {
  console.log('\n📊 Testing GET /api/users/profile...');

  try {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GET profile failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Profile retrieved successfully');
    console.log('📋 Profile data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Get profile failed:', error.message);
    throw error;
  }
}

async function testUpdateProfile() {
  console.log('\n📝 Testing PATCH /api/users/profile...');

  try {
    const updateData = {
      firstName: 'Test',
      lastName: 'User',
      phone: '+1-555-0123',
      company: 'Test Company Inc.',
      jobTitle: 'Senior Developer',
      bio: 'This is a test bio updated by the API test script.',
      timezone: 'America/Los_Angeles',
      language: 'en',
      customTheme: 'dark',
    };

    const response = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`PATCH profile failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Profile updated successfully');
    console.log('📋 Updated profile:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Update profile failed:', error.message);
    throw error;
  }
}

async function testUpdateNotifications() {
  console.log('\n🔔 Testing PATCH /api/users/notifications...');

  try {
    const notificationData = {
      emailNotifications: {
        newLeads: true,
        appointmentUpdates: false,
        estimateUpdates: true,
        paymentNotifications: true,
      },
      pushNotifications: {
        newLeads: false,
        messages: true,
        appointmentReminders: true,
      },
    };

    const response = await fetch(`${BASE_URL}/api/users/notifications`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error(`PATCH notifications failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Notification preferences updated successfully');
    console.log('📋 Updated notifications:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Update notifications failed:', error.message);
    throw error;
  }
}

async function testFrontendApi() {
  console.log('\n🌐 Testing Frontend API routes...');

  try {
    const response = await fetch(`${FRONTEND_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Frontend API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Frontend API working correctly');
    console.log('📋 Frontend response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Frontend API failed:', error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting Profile API Tests...\n');

  try {
    // Test authentication
    await login();
    await delay(1000);

    // Test backend endpoints
    await testGetProfile();
    await delay(1000);

    await testUpdateProfile();
    await delay(1000);

    await testUpdateNotifications();
    await delay(1000);

    // Test frontend API
    await testFrontendApi();

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Authentication works');
    console.log('✅ Profile retrieval works');
    console.log('✅ Profile updates work');
    console.log('✅ Notification preferences work');
    console.log('✅ Frontend API proxy works');
    console.log('\n🔗 You can now test the UI at: http://localhost:3005/dashboard/settings/profile#profile');

  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Make sure the backend server is running on port 3001');
    console.log('2. Make sure the frontend server is running on port 3005');
    console.log('3. Check if the test credentials exist in the database');
    console.log('4. Verify the database connection is working');
    process.exit(1);
  }
}

// Run the tests
runTests();
