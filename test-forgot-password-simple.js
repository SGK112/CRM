#!/usr/bin/env node

const fetch = require('node-fetch');

async function createTestUser() {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+1 555-123-4567',
    password: 'password123',
    workspaceName: 'Test Workspace'
  };

  console.log('Creating test user for forgot password testing...');

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test user created successfully');
      console.log(`User ID: ${data.user?.id}`);
      console.log(`Email: ${data.user?.email}`);
      console.log(`Phone: ${data.user?.phone}`);
      return data.user;
    } else {
      console.log('⚠️  User might already exist or registration failed');
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    return null;
  }
}

async function testForgotPasswordWithUser() {
  console.log('\nTesting forgot password with existing user...');

  const phoneNumber = '+1 555-123-4567';

  try {
    const response = await fetch('http://localhost:3005/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Forgot password request successful!');
      console.log(`Message: ${data.message}`);

      // Test verification with dummy code
      console.log('\nTesting verification with dummy code...');
      const verifyResponse = await fetch('http://localhost:3005/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: '123456' })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        console.log('✅ Invalid code properly rejected');
        console.log(`Error: ${verifyData.message}`);
      } else {
        console.log('⚠️  Invalid code was accepted (unexpected)');
      }

    } else {
      console.log('❌ Forgot password request failed');
      console.log(`Error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function runTest() {
  // First create a test user
  await createTestUser();

  // Then test forgot password
  await testForgotPasswordWithUser();

  console.log('\n📝 Note: Check backend terminal for SMS simulation logs');
  console.log('The SMS code should be displayed in the backend console');
}

runTest();
