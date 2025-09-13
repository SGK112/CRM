#!/usr/bin/env node

const fetch = require('node-fetch');

async function testDirectBackendForgotPassword() {
  console.log('🧪 TESTING BACKEND FORGOT PASSWORD DIRECTLY');
  console.log('============================================');

  // Test with exact phone number from profile
  const phoneNumber = '+15551234567';

  console.log(`📱 Testing forgot password for: ${phoneNumber}`);
  console.log('📋 Watching backend logs for detailed information...');

  const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });

  const data = await response.json();

  console.log('\n📊 RESULT:');
  console.log(`HTTP Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Message: ${data.message}`);

  if (data.success) {
    console.log('\n✅ SUCCESS! Forgot password flow is working!');

    // Test code verification with a fake code
    console.log('\n🔑 Testing code verification with fake code...');
    const verifyResponse = await fetch('http://localhost:3001/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        code: '123456' // fake code
      })
    });

    const verifyData = await verifyResponse.json();
    console.log(`Verify Status: ${verifyResponse.status}`);
    console.log(`Verify Success: ${verifyData.success}`);
    console.log(`Verify Message: ${verifyData.message}`);

  } else {
    console.log('\n❌ Failed - check backend terminal for logs');
  }
}

testDirectBackendForgotPassword().catch(console.error);
