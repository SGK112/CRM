#!/usr/bin/env node

/**
 * Communications Configuration and Test Helper
 * Checks environment setup and provides testing instructions
 */

/* eslint-disable no-console */
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'joshb@surprisegranite.com';
const TEST_PHONE = '+14802555887';

async function checkServerHealth() {
  console.log('🏥 Checking server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      console.log('✅ Backend server is running');
      return true;
    } else {
      console.log('❌ Backend server returned error');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend server is not reachable');
    console.log('💡 Make sure to run: npm run dev');
    return false;
  }
}

async function checkCommunicationsConfig() {
  console.log('\n📧 Checking communications configuration...');
  try {
    const response = await fetch(`${BASE_URL}/api/communications/status`);
    if (response.status === 401) {
      console.log('⚠️ Communications status requires authentication');
      console.log('💡 This is normal - you need to login first');
      return;
    }

    const data = await response.json();
    console.log('📊 Communications Status:');
    console.log(`  Email configured: ${data.email?.configured || false}`);
    console.log(`  Email provider: ${data.email?.provider || 'Not configured'}`);
    console.log(`  SMS configured: ${data.sms?.configured || false}`);
    console.log(`  SMS phone: ${data.sms?.phoneNumber || 'Not configured'}`);
  } catch (error) {
    console.log('❌ Could not check communications status');
  }
}

function printConfigurationInstructions() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 CONFIGURATION REQUIRED FOR FULL TESTING');
  console.log('='.repeat(70));

  console.log('\n🔧 To enable EMAIL communications, add to your .env file:');
  console.log('\n📧 Option 1: SendGrid (Recommended)');
  console.log('SENDGRID_API_KEY=your_sendgrid_api_key_here');
  console.log('SENDGRID_FROM_EMAIL=noreply@yourcompany.com');
  console.log('SENDGRID_FROM_NAME=Your Company Name');

  console.log('\n📧 Option 2: SMTP (Gmail example)');
  console.log('SMTP_HOST=smtp.gmail.com');
  console.log('SMTP_PORT=587');
  console.log('SMTP_USER=your-email@gmail.com');
  console.log('SMTP_PASS=your-app-password');
  console.log('SMTP_FROM=your-email@gmail.com');
  console.log('SMTP_FROM_NAME=Your Name');

  console.log('\n🔧 To enable SMS communications, add to your .env file:');
  console.log('\n📱 Twilio Configuration');
  console.log('TWILIO_ACCOUNT_SID=your_twilio_account_sid');
  console.log('TWILIO_AUTH_TOKEN=your_twilio_auth_token');
  console.log('TWILIO_PHONE_NUMBER=+1234567890');

  console.log('\n' + '='.repeat(70));
  console.log('📝 STEP-BY-STEP SETUP INSTRUCTIONS');
  console.log('='.repeat(70));

  console.log('\n🎯 For SendGrid (Free tier available):');
  console.log('1. Go to https://sendgrid.com/');
  console.log('2. Sign up for a free account');
  console.log('3. Go to Settings > API Keys');
  console.log('4. Create a new API key with "Full Access"');
  console.log('5. Add the API key to your .env file');
  console.log('6. Verify a sender email address in SendGrid');

  console.log('\n🎯 For Gmail SMTP:');
  console.log('1. Enable 2-factor authentication on your Google account');
  console.log('2. Go to Google Account settings > Security');
  console.log('3. Generate an "App Password" for this application');
  console.log('4. Use the app password in SMTP_PASS (not your regular password)');

  console.log('\n🎯 For Twilio SMS (Free trial available):');
  console.log('1. Go to https://www.twilio.com/');
  console.log('2. Sign up for a free account ($15 trial credit)');
  console.log('3. Get your Account SID and Auth Token from the dashboard');
  console.log('4. Get a Twilio phone number');
  console.log('5. Add the credentials to your .env file');

  console.log('\n' + '='.repeat(70));
  console.log('🧪 AFTER CONFIGURATION - RUN THESE TESTS');
  console.log('='.repeat(70));

  console.log('\n1. Restart your development server:');
  console.log('   npm run dev');

  console.log('\n2. Register a new account:');
  console.log(`   Visit: http://localhost:3005/auth/register`);
  console.log(`   Use email: ${TEST_EMAIL}`);

  console.log('\n3. Test email verification:');
  console.log('   - Check your email for verification message');
  console.log('   - Click the verification link');

  console.log('\n4. Test SMS (forgot password):');
  console.log(`   - Go to login page and click "Forgot Password"`);
  console.log(`   - Enter phone: ${TEST_PHONE}`);
  console.log('   - Check your phone for SMS code');

  console.log('\n5. Test authenticated features:');
  console.log('   - Login to the dashboard');
  console.log('   - Try the communications test endpoints in API docs');
  console.log(`   - Visit: http://localhost:3001/api/docs`);
}

async function runBasicTests() {
  console.log('🧪 COMMUNICATIONS SYSTEM CHECK');
  console.log('='.repeat(50));

  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    return;
  }

  await checkCommunicationsConfig();
  printConfigurationInstructions();

  console.log('\n' + '='.repeat(70));
  console.log('💡 QUICK START');
  console.log('='.repeat(70));
  console.log('\nTo test basic functionality without email/SMS setup:');
  console.log('1. Visit http://localhost:3005/auth/register');
  console.log('2. Register with any email (verification will show dev URL)');
  console.log('3. Use the dev verification URL to verify your account');
  console.log('4. Login and explore the dashboard');
  console.log('\nFull email/SMS testing requires provider configuration above.');
}

if (require.main === module) {
  runBasicTests().catch(console.error);
}

module.exports = { runBasicTests, TEST_EMAIL, TEST_PHONE };
