#!/usr/bin/env node

/**
 * Comprehensive Communications Test Suite
 * Tests all communication features end-to-end using real contact info
 * Email: joshb@surprisegranite.com
 * Phone: 480-255-5887
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fetch = require('node-fetch');
const readline = require('readline');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3005';
const TEST_EMAIL = 'joshb@surprisegranite.com';
const TEST_PHONE = '+14802555887'; // E.164 format for Twilio
const TEST_USER = {
  email: TEST_EMAIL,
  password: 'TestPassword123!',
  firstName: 'Josh',
  lastName: 'Test',
  workspaceName: 'Test Communications Workspace',
  phone: TEST_PHONE
};

let authToken = null;
let testUserId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise(resolve => rl.question(question, resolve));

// Utility functions
const makeRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    console.log(`📡 ${options.method || 'GET'} ${endpoint}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (Object.keys(data).length > 0) {
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    }
    console.log('');

    return { response, data, ok: response.ok };
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    return { error, ok: false };
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const section = (title) => {
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 ${title}`);
  console.log('='.repeat(60));
};

const testStep = (description) => {
  console.log(`\n🔹 ${description}`);
};

// Test functions
async function testHealthCheck() {
  section('HEALTH CHECK');

  testStep('Testing backend health endpoint');
  const health = await makeRequest('/api/health');
  if (health.ok) {
    console.log('✅ Backend is healthy');
  } else {
    console.log('❌ Backend health check failed');
    throw new Error('Backend not available');
  }

  testStep('Testing frontend availability');
  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('⚠️ Frontend returned non-200 status');
    }
  } catch (error) {
    console.log('❌ Frontend not accessible');
  }
}

async function testRegistrationAndEmailVerification() {
  section('REGISTRATION & EMAIL VERIFICATION');

  testStep('Registering new user account');
  const registration = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });

  if (registration.ok) {
    console.log('✅ Registration successful');
    testUserId = registration.data.user?.id;

    if (registration.data.verificationUrl) {
      console.log(`📧 Verification URL (dev mode): ${registration.data.verificationUrl}`);
      console.log('💡 In production, this would be sent via email');

      // Extract token from verification URL
      const tokenMatch = registration.data.verificationUrl.match(/token=([^&]+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];

        testStep('Testing email verification with token');
        const verification = await makeRequest('/api/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token })
        });

        if (verification.ok && verification.data.success) {
          console.log('✅ Email verification successful');
        } else {
          console.log('❌ Email verification failed');
        }
      }
    }
  } else if (registration.data.message?.includes('already exists')) {
    console.log('⚠️ User already exists, will test login instead');
    testUserId = 'existing-user';
  } else {
    console.log('❌ Registration failed');
  }
}

async function testLogin() {
  section('LOGIN TESTING');

  testStep('Testing user login');
  const login = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_USER.password
    })
  });

  if (login.ok && login.data.access_token) {
    authToken = login.data.access_token;
    console.log('✅ Login successful');
    console.log(`🔑 Auth token obtained: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ Login failed');
    console.log('💡 You may need to register first or check credentials');
  }
}

async function testForgotPassword() {
  section('FORGOT PASSWORD WORKFLOW');

  testStep('Testing forgot password SMS sending');
  const forgotPassword = await makeRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: TEST_PHONE })
  });

  if (forgotPassword.ok) {
    console.log('✅ Password reset SMS request sent');
    console.log('📱 Check your phone for the reset code');

    const code = await prompt('Enter the reset code you received (or press Enter to skip): ');
    if (code.trim()) {
      testStep('Testing reset code verification');
      const verifyCode = await makeRequest('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: TEST_PHONE, code: code.trim() })
      });

      if (verifyCode.ok && verifyCode.data.token) {
        console.log('✅ Reset code verified');

        testStep('Testing password reset with token');
        const resetPassword = await makeRequest('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            token: verifyCode.data.token,
            newPassword: TEST_USER.password + '1'
          })
        });

        if (resetPassword.ok) {
          console.log('✅ Password reset successful');
          console.log('💡 Password was temporarily changed and should be changed back');

          // Change password back
          await makeRequest('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              token: verifyCode.data.token,
              newPassword: TEST_USER.password
            })
          });
        }
      } else {
        console.log('❌ Reset code verification failed');
      }
    } else {
      console.log('⏭️ Skipping reset code verification');
    }
  } else {
    console.log('❌ Forgot password SMS failed');
    console.log('💡 This may be due to Twilio not being configured');
  }
}

async function testCommunicationsStatus() {
  section('COMMUNICATIONS STATUS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Checking communications service status');
  const status = await makeRequest('/api/communications/status');

  if (status.ok) {
    console.log('✅ Communications status retrieved');
    console.log(`📧 Email configured: ${status.data.email?.configured}`);
    console.log(`📧 Email provider: ${status.data.email?.provider}`);
    console.log(`📱 SMS configured: ${status.data.sms?.configured}`);
    console.log(`📱 SMS phone: ${status.data.sms?.phoneNumber}`);
  } else {
    console.log('❌ Failed to get communications status');
  }
}

async function testEmailCommunications() {
  section('EMAIL COMMUNICATIONS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Testing direct email sending');
  const testEmail = await makeRequest('/api/communications/test-email', {
    method: 'POST',
    body: JSON.stringify({ testEmail: TEST_EMAIL })
  });

  if (testEmail.ok) {
    console.log('✅ Test email sent successfully');
    console.log('📧 Check your email inbox for the test message');
  } else {
    console.log('❌ Test email failed');
    console.log('💡 This may be due to email service not being configured');
  }

  testStep('Testing email verification resend');
  const resendVerification = await makeRequest('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email: TEST_EMAIL })
  });

  if (resendVerification.ok) {
    console.log('✅ Verification email resend attempted');
    if (resendVerification.data.verificationUrl) {
      console.log(`🔗 Dev verification URL: ${resendVerification.data.verificationUrl}`);
    }
  } else {
    console.log('❌ Verification email resend failed');
  }
}

async function testSMSCommunications() {
  section('SMS COMMUNICATIONS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Testing direct SMS sending');
  const testSMS = await makeRequest('/api/communications/test-sms', {
    method: 'POST',
    body: JSON.stringify({ testPhone: TEST_PHONE })
  });

  if (testSMS.ok) {
    console.log('✅ Test SMS sent successfully');
    console.log('📱 Check your phone for the test message');
  } else {
    console.log('❌ Test SMS failed');
    console.log('💡 This may be due to Twilio not being configured');
  }
}

async function testNotifications() {
  section('NOTIFICATIONS SYSTEM');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Getting notification count');
  const notificationCount = await makeRequest('/api/notifications/count');

  if (notificationCount.ok) {
    console.log('✅ Notification count retrieved');
    console.log(`📬 Unread notifications: ${notificationCount.data.unreadCount || 0}`);
  }

  testStep('Getting notifications list');
  const notifications = await makeRequest('/api/notifications');

  if (notifications.ok) {
    console.log('✅ Notifications list retrieved');
    console.log(`📋 Total notifications: ${notifications.data.length || 0}`);
  }
}

async function testBillingCommunications() {
  section('BILLING COMMUNICATIONS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Checking billing status');
  const billingStatus = await makeRequest('/api/billing/me');

  if (billingStatus.ok) {
    console.log('✅ Billing status retrieved');
  } else if (billingStatus.response?.status === 401) {
    console.log('⚠️ Billing endpoint requires authentication');
  } else {
    console.log('❌ Billing status check failed');
    console.log('💡 This may be due to Stripe not being configured');
  }

  testStep('Getting subscription info');
  const subscription = await makeRequest('/api/api/billing/subscription');

  if (subscription.ok) {
    console.log('✅ Subscription info retrieved');
  } else {
    console.log('⚠️ Subscription info not available (expected if no active subscription)');
  }
}

async function testTemplatedEmails() {
  section('TEMPLATED EMAIL COMMUNICATIONS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  // First, we need to create a test client to send templated emails to
  testStep('Creating test client for templated emails');
  const testClient = await makeRequest('/api/clients', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Client',
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      address: '123 Test St, Test City, TS 12345'
    })
  });

  if (testClient.ok) {
    const clientId = testClient.data._id;
    console.log('✅ Test client created');

    testStep('Testing appointment confirmation email');
    const appointmentEmail = await makeRequest('/api/communications/email/template', {
      method: 'POST',
      body: JSON.stringify({
        type: 'appointment',
        clientId: clientId,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        appointmentType: 'Consultation',
        location: '123 Business St, City, ST 12345',
        notes: 'Please bring property plans if available'
      })
    });

    if (appointmentEmail.ok) {
      console.log('✅ Appointment confirmation email sent');
    } else {
      console.log('❌ Appointment email failed');
    }

    testStep('Testing estimate follow-up email');
    const estimateEmail = await makeRequest('/api/communications/email/template', {
      method: 'POST',
      body: JSON.stringify({
        type: 'estimate',
        clientId: clientId,
        estimateNumber: 'EST-TEST-001',
        estimateAmount: 15000,
        callNotes: 'Discussed timeline and material preferences'
      })
    });

    if (estimateEmail.ok) {
      console.log('✅ Estimate follow-up email sent');
    } else {
      console.log('❌ Estimate email failed');
    }

    testStep('Testing general follow-up email');
    const followupEmail = await makeRequest('/api/communications/email/template', {
      method: 'POST',
      body: JSON.stringify({
        type: 'followup',
        clientId: clientId,
        subject: 'Following up on your project',
        message: 'Hi! Just wanted to check in and see if you have any questions about your upcoming project.',
        callNotes: 'Client expressed interest in eco-friendly materials'
      })
    });

    if (followupEmail.ok) {
      console.log('✅ General follow-up email sent');
    } else {
      console.log('❌ Follow-up email failed');
    }

    // Clean up test client
    testStep('Cleaning up test client');
    await makeRequest(`/api/clients/${clientId}`, { method: 'DELETE' });
    console.log('🧹 Test client removed');
  } else {
    console.log('❌ Failed to create test client for templated emails');
  }
}

async function testIntegrationEndpoints() {
  section('INTEGRATION STATUS');

  if (!authToken) {
    console.log('⚠️ Skipping - no auth token available');
    return;
  }

  testStep('Checking integrations status');
  const integrationsStatus = await makeRequest('/api/integrations/status');

  if (integrationsStatus.ok) {
    console.log('✅ Integrations status retrieved');
  }

  testStep('Checking communication integration status');
  const commIntegrationStatus = await makeRequest('/api/integrations/communication-status');

  if (commIntegrationStatus.ok) {
    console.log('✅ Communication integration status retrieved');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Communications Test Suite');
  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  console.log(`📱 Test Phone: ${TEST_PHONE}`);
  console.log(`🌐 Backend URL: ${BASE_URL}`);
  console.log(`🖥️ Frontend URL: ${FRONTEND_URL}`);

  try {
    await testHealthCheck();
    await testRegistrationAndEmailVerification();
    await testLogin();
    await testCommunicationsStatus();
    await testEmailCommunications();
    await testSMSCommunications();
    await testNotifications();
    await testBillingCommunications();
    await testTemplatedEmails();
    await testForgotPassword();
    await testIntegrationEndpoints();

    section('TEST SUMMARY');
    console.log('✅ All communication tests completed!');
    console.log('');
    console.log('📋 What to check:');
    console.log('   📧 Email inbox: joshb@surprisegranite.com');
    console.log('   📱 Phone messages: 480-255-5887');
    console.log('   🌐 Frontend: http://localhost:3005');
    console.log('   📚 API Docs: http://localhost:3001/api/docs');
    console.log('');
    console.log('💡 Configure email/SMS services for full functionality:');
    console.log('   - Set SENDGRID_API_KEY for email');
    console.log('   - Set TWILIO credentials for SMS');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the test suite
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  TEST_EMAIL,
  TEST_PHONE,
  BASE_URL,
  FRONTEND_URL
};
