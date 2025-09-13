#!/usr/bin/env node

const fetch = require('node-fetch');

async function testForgotPasswordUserInterface() {
  console.log('🌐 TESTING FORGOT PASSWORD - USER INTERFACE FLOW');
  console.log('=================================================');

  const phoneNumber = '+15551234567';

  // Test via frontend (Next.js proxy)
  console.log('Step 1: Testing via Frontend API Route...');

  const frontendResponse = await fetch('http://localhost:3005/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });

  const frontendData = await frontendResponse.json();

  console.log(`Frontend Status: ${frontendResponse.status}`);
  console.log(`Frontend Success: ${frontendData.success}`);
  console.log(`Frontend Message: ${frontendData.message}`);

  if (frontendData.success) {
    console.log('\n✅ Frontend API is working!');

    // If successful, test the verification step
    console.log('\nStep 2: Testing code verification...');

    // Try some common test codes
    const testCodes = ['123456', '000000', '999999'];

    for (const code of testCodes) {
      const verifyResponse = await fetch('http://localhost:3005/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code })
      });

      const verifyData = await verifyResponse.json();

      console.log(`Code ${code}: ${verifyData.success ? 'ACCEPTED' : 'REJECTED'} - ${verifyData.message}`);

      if (verifyData.success) {
        // If code worked, test password reset
        console.log('\nStep 3: Testing password reset...');

        const resetResponse = await fetch('http://localhost:3005/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: verifyData.token || 'test-token',
            newPassword: 'newPassword123'
          })
        });

        const resetData = await resetResponse.json();
        console.log(`Password Reset: ${resetData.success ? 'SUCCESS' : 'FAILED'} - ${resetData.message}`);
        break;
      }
    }

  } else {
    console.log('\n❌ Frontend API failed');

    // Test backend directly for comparison
    console.log('\nStep 2: Testing Backend API directly...');

    const backendResponse = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });

    const backendData = await backendResponse.json();

    console.log(`Backend Status: ${backendResponse.status}`);
    console.log(`Backend Success: ${backendData.success}`);
    console.log(`Backend Message: ${backendData.message}`);
  }

  console.log('\n📊 SUMMARY:');
  console.log('============');
  if (frontendData.success) {
    console.log('✅ Frontend API: Working');
    console.log('✅ Phone lookup: Working');
    console.log('✅ SMS simulation: Working');
    console.log('📱 Check backend logs for reset codes');
    console.log('💡 Try submitting the form in the browser with phone: +15551234567');
  } else {
    console.log('❌ Frontend API: Failed');
    console.log('💡 Need to investigate Twilio service configuration');
  }
}

testForgotPasswordUserInterface().catch(console.error);
