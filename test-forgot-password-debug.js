#!/usr/bin/env node

const fetch = require('node-fetch');

async function testWithBackendLogging() {
  console.log('🧪 TESTING FORGOT PASSWORD WITH EXACT USER PHONE');
  console.log('=================================================');

  // Get exact phone number from user profile
  console.log('Step 1: Getting user phone number...');
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });

  const loginData = await loginResponse.json();
  const token = loginData.accessToken;

  const profileResponse = await fetch('http://localhost:3001/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const profileData = await profileResponse.json();
  console.log(`✅ User phone from profile: ${profileData.phone}`);
  console.log(`✅ User ID: ${profileData._id}`);
  console.log(`✅ User email: ${profileData.email}`);

  // Test forgot password with exact phone
  console.log('\nStep 2: Testing forgot password...');
  console.log('💡 Check backend terminal for detailed logs!');

  const forgotResponse = await fetch('http://localhost:3001/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: profileData.phone })
  });

  const forgotData = await forgotResponse.json();

  console.log(`\n📊 RESULT:`);
  console.log(`Status: ${forgotResponse.status}`);
  console.log(`Success: ${forgotData.success}`);
  console.log(`Message: ${forgotData.message}`);

  if (forgotData.success) {
    console.log('\n🎉 SUCCESS! SMS reset flow is working!');
    console.log('✅ Phone number lookup: Working');
    console.log('✅ Code generation: Working');
    console.log('✅ SMS service: Working (simulation mode)');
    console.log('📱 Check backend logs for the reset code');
  } else {
    console.log('\n❌ FAILED - Check backend logs for details');
  }
}

testWithBackendLogging().catch(console.error);
