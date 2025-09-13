#!/usr/bin/env node

const fetch = require('node-fetch');

async function debugUserPhoneStorage() {
  console.log('🔍 DEBUGGING USER PHONE STORAGE');
  console.log('================================');

  // Login to get token
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

  // Test different phone formats
  const phoneFormats = [
    '+15551234567',      // Current format
    '+1 555-123-4567',   // Formatted
    '15551234567',       // No plus
    '555-123-4567',      // No country code
    '+1 (555) 123-4567'  // Full format
  ];

  console.log('Testing multiple phone formats...\n');

  for (const phoneNumber of phoneFormats) {
    console.log(`Testing phone: "${phoneNumber}"`);

    const forgotResponse = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });

    const forgotData = await forgotResponse.json();

    if (forgotData.success) {
      console.log(`✅ SUCCESS with "${phoneNumber}"`);
      console.log(`   Message: ${forgotData.message}`);
      break;
    } else {
      console.log(`❌ Failed with "${phoneNumber}"`);
      console.log(`   Message: ${forgotData.message}`);
    }
  }

  // Check profile data one more time
  console.log('\n📋 Current user profile:');
  const profileResponse = await fetch('http://localhost:3001/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const profileData = await profileResponse.json();
  console.log(`Phone: "${profileData.phone}"`);
  console.log(`Type: ${typeof profileData.phone}`);
  console.log(`Length: ${profileData.phone ? profileData.phone.length : 'null'}`);
  console.log(`ID: ${profileData._id}`);
}

debugUserPhoneStorage().catch(console.error);
