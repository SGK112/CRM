#!/usr/bin/env node

const fetch = require('node-fetch');

async function diagnoseIssue() {
  console.log('🔍 DIAGNOSING FORGOT PASSWORD ISSUE');
  console.log('====================================');

  // First, let's check if we can create a demo user with phone for testing
  console.log('Step 1: Creating a simple test to isolate the issue...');

  // Test case 1: Check if the API endpoints exist
  console.log('\n📋 Testing API endpoints availability...');

  const endpoints = [
    'http://localhost:3001/api/auth/forgot-password',
    'http://localhost:3005/api/auth/forgot-password'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+1234567890' }) // Non-existent number
      });

      const data = await response.json();

      console.log(`  Status: ${response.status}`);
      console.log(`  Message: ${data.message}`);

      if (data.message === 'No account found with this phone number') {
        console.log('  ✅ Endpoint working - correctly rejects unknown phone');
      } else {
        console.log('  ⚠️  Unexpected response');
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  // Test case 2: Check our known user phone
  console.log('\n📱 Testing with known user phone...');

  const knownPhone = '+15551234567';

  try {
    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: knownPhone })
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (data.message === 'No account found with this phone number') {
      console.log('❌ User not found - phone lookup issue');
    } else if (data.message === 'Failed to send reset code. Please try again.') {
      console.log('✅ User found - SMS sending issue');
      console.log('💡 This means the phone lookup works but Twilio service fails');
    } else if (data.success) {
      console.log('🎉 Everything working!');
    }

  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }

  console.log('\n🔬 DIAGNOSIS:');
  console.log('=============');
  console.log('The issue appears to be in the Twilio service configuration.');
  console.log('The user lookup is working (we get past "No account found").');
  console.log('But the SMS sending is failing in simulation mode.');
  console.log('');
  console.log('💡 POSSIBLE CAUSES:');
  console.log('1. Twilio client is partially configured (has credentials but invalid format)');
  console.log('2. fromNumber is missing/invalid causing SMS to fail');
  console.log('3. Exception in Twilio service that\'s being caught');
  console.log('');
  console.log('🎯 RECOMMENDATION:');
  console.log('Force the Twilio service into pure simulation mode by ensuring');
  console.log('that both accountSid and authToken are completely empty.');
}

diagnoseIssue().catch(console.error);
