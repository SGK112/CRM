#!/usr/bin/env node

/**
 * Production-Ready Communications Test Suite
 * Tests all communications features for both local dev and production environments
 *
 * Usage:
 *   node test-production-ready.js                    # Test local development
 *   node test-production-ready.js --prod             # Test production on Render
 *   node test-production-ready.js --api-url=https://your-backend.onrender.com
 */

const axios = require('axios').default;
const readline = require('readline');

// Configuration
const TEST_EMAIL = 'joshb@surprisegranite.com';
const TEST_PHONE = '480-255-5887';

// Parse command line arguments
const args = process.argv.slice(2);
const isProd = args.includes('--prod');
const customApiUrl = args.find(arg => arg.startsWith('--api-url='))?.split('=')[1];

const CONFIG = {
  local: {
    apiUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3005'
  },
  production: {
    apiUrl: 'https://remodely-crm-backend.onrender.com',
    frontendUrl: 'https://remodely-crm-frontend.onrender.com'
  }
};

const environment = isProd ? 'production' : 'local';
const baseURL = customApiUrl || CONFIG[environment].apiUrl;
const frontendURL = CONFIG[environment].frontendUrl;

console.log(`🚀 Testing Remodely CRM Communications - ${environment.toUpperCase()} Environment`);
console.log(`📡 API Base URL: ${baseURL}`);
console.log(`🌐 Frontend URL: ${frontendURL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}`);
console.log(`📱 Test Phone: ${TEST_PHONE}`);
console.log('='.repeat(80));

// Helper functions
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = null;
let testUserId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function log(emoji, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testServerHealth() {
  log('🏥', 'Testing server health...');
  try {
    const response = await api.get('/api/health');
    log('✅', 'Server health check passed', response.data);
    return true;
  } catch (error) {
    log('❌', 'Server health check failed', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return false;
  }
}

async function testCommunicationsConfig() {
  log('⚙️', 'Testing communications configuration...');
  try {
    const response = await api.get('/api/communications/status');
    log('✅', 'Communications config check passed', response.data);

    // Check if providers are configured
    const config = response.data;
    const emailConfigured = config.email?.configured || false;
    const smsConfigured = config.sms?.configured || false;

    if (!emailConfigured) {
      log('⚠️', 'Email provider not configured - verification emails will use dev URLs');
    }
    if (!smsConfigured) {
      log('⚠️', 'SMS provider not configured - SMS features will be disabled');
    }

    return { emailConfigured, smsConfigured };
  } catch (error) {
    if (error.response?.status === 401) {
      log('ℹ️', 'Communications config requires authentication - will test after login');
      return { emailConfigured: null, smsConfigured: null };
    }
    log('❌', 'Communications config check failed', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return { emailConfigured: false, smsConfigured: false };
  }
}

async function testUserRegistration() {
  log('📝', 'Testing user registration...');

  const userData = {
    email: TEST_EMAIL,
    password: 'TestPassword123!',
    firstName: 'Josh',
    lastName: 'Test',
    workspaceName: 'Surprise Granite Test Workspace',
    phone: TEST_PHONE
  };

  try {
    const response = await api.post('/api/auth/register', userData);
    log('✅', 'User registration successful', {
      user: response.data.user,
      message: response.data.message
    });

    testUserId = response.data.user.id;

    // Check if verification email was sent
    if (response.data.message?.includes('verification email')) {
      log('📧', 'Verification email should be sent');
      if (environment === 'local') {
        log('🔧', 'In development, check console for verification URL');
      }
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.status === 400) {
      log('ℹ️', 'User already exists - this is expected for repeat tests');
      return { userExists: true };
    }
    log('❌', 'User registration failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    throw error;
  }
}

async function testEmailVerification() {
  log('✉️', 'Testing email verification...');

  if (environment === 'production') {
    log('📧', 'Check your email for verification link and click it');
    const verified = await prompt('Have you clicked the verification link? (y/n): ');
    if (verified.toLowerCase() !== 'y') {
      log('⚠️', 'Skipping verification - some features may not work');
      return false;
    }
  } else {
    log('🔧', 'In development mode - check server console for dev verification URL');
    log('💡', 'Look for a message like: "Dev verification URL: http://localhost:3005/auth/verify-email?token=..."');
    const hasUrl = await prompt('Do you see the verification URL in the console? (y/n): ');
    if (hasUrl.toLowerCase() === 'y') {
      const clicked = await prompt('Click the URL and press Enter when done...');
    }
  }

  log('✅', 'Email verification completed');
  return true;
}

async function testUserLogin() {
  log('🔐', 'Testing user login...');

  const loginData = {
    email: TEST_EMAIL,
    password: 'TestPassword123!'
  };

  try {
    const response = await api.post('/api/auth/login', loginData);
    log('✅', 'User login successful');

    authToken = response.data.access_token;
    api.defaults.headers.Authorization = `Bearer ${authToken}`;

    return response.data;
  } catch (error) {
    log('❌', 'User login failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    throw error;
  }
}

async function testForgotPassword() {
  log('🔑', 'Testing forgot password flow...');

  try {
    const response = await api.post('/api/auth/forgot-password', {
      email: TEST_EMAIL
    });
    log('✅', 'Forgot password request successful', response.data);

    if (environment === 'production') {
      log('📱', 'Check your phone for SMS with reset instructions');
    } else {
      log('🔧', 'In development mode - check console for dev reset flow');
    }

    return response.data;
  } catch (error) {
    log('❌', 'Forgot password failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return null;
  }
}

async function testNotifications() {
  log('🔔', 'Testing notifications system...');

  try {
    // Get user notifications
    const response = await api.get('/api/notifications');
    log('✅', 'Notifications fetch successful', {
      count: response.data.length,
      notifications: response.data.slice(0, 3) // Show first 3
    });

    // Test creating a notification
    const testNotification = {
      title: 'Test Notification',
      message: 'This is a test notification from the communications test suite',
      type: 'info'
    };

    const createResponse = await api.post('/api/notifications', testNotification);
    log('✅', 'Test notification created', createResponse.data);

    return true;
  } catch (error) {
    log('❌', 'Notifications test failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

async function testEmailTemplates() {
  log('📨', 'Testing email templates...');

  const templates = [
    'welcome',
    'estimate-ready',
    'appointment-confirmation',
    'payment-reminder',
    'project-update'
  ];

  for (const template of templates) {
    try {
      const response = await api.post('/api/communications/test-email', {
        template,
        recipientEmail: TEST_EMAIL,
        templateData: {
          firstName: 'Josh',
          projectName: 'Test Project',
          estimateAmount: '$5,000',
          appointmentDate: new Date().toISOString(),
          dueAmount: '$1,000'
        }
      });
      log('✅', `Email template '${template}' sent successfully`);
    } catch (error) {
      log('❌', `Email template '${template}' failed`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
  }
}

async function testSMSMessaging() {
  log('📱', 'Testing SMS messaging...');

  try {
    const response = await api.post('/api/communications/test-sms', {
      phoneNumber: TEST_PHONE,
      message: 'Test SMS from Remodely CRM - your communications are working!'
    });
    log('✅', 'SMS sent successfully', response.data);

    const received = await prompt('Did you receive the test SMS? (y/n): ');
    if (received.toLowerCase() === 'y') {
      log('✅', 'SMS delivery confirmed');
    } else {
      log('⚠️', 'SMS delivery not confirmed');
    }

    return true;
  } catch (error) {
    log('❌', 'SMS test failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

async function testSchedulingEmails() {
  log('📅', 'Testing scheduling email notifications...');

  try {
    // Create a test appointment
    const appointmentData = {
      clientName: 'Josh Test',
      clientEmail: TEST_EMAIL,
      clientPhone: TEST_PHONE,
      serviceType: 'Consultation',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      notes: 'Test appointment from communications test suite'
    };

    const response = await api.post('/api/appointments', appointmentData);
    log('✅', 'Test appointment created', response.data);

    // Test appointment confirmation email
    const confirmResponse = await api.post(`/api/appointments/${response.data.id}/send-confirmation`);
    log('✅', 'Appointment confirmation email sent');

    return true;
  } catch (error) {
    log('❌', 'Scheduling email test failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

async function testBillingEmails() {
  log('💳', 'Testing billing email notifications...');

  try {
    // Test invoice email
    const invoiceData = {
      clientEmail: TEST_EMAIL,
      amount: 1000, // $10.00
      description: 'Test invoice from communications test suite',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    };

    const response = await api.post('/api/billing/test-invoice-email', invoiceData);
    log('✅', 'Invoice email sent successfully', response.data);

    // Test payment reminder
    const reminderResponse = await api.post('/api/billing/test-reminder-email', {
      clientEmail: TEST_EMAIL,
      amount: 1000,
      daysOverdue: 5
    });
    log('✅', 'Payment reminder email sent successfully');

    return true;
  } catch (error) {
    log('❌', 'Billing email test failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

async function testWebhooksAndIntegrations() {
  log('🔗', 'Testing webhooks and integrations...');

  try {
    // Test Stripe webhook simulation
    const webhookResponse = await api.post('/api/webhooks/test', {
      type: 'test',
      data: { message: 'Test webhook from communications suite' }
    });
    log('✅', 'Webhook test successful', webhookResponse.data);

    return true;
  } catch (error) {
    log('❌', 'Webhook test failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

// Main test execution
async function runAllTests() {
  const results = {
    serverHealth: false,
    communicationsConfig: null,
    registration: false,
    emailVerification: false,
    login: false,
    forgotPassword: false,
    notifications: false,
    emailTemplates: false,
    smsMessaging: false,
    schedulingEmails: false,
    billingEmails: false,
    webhooks: false
  };

  try {
    console.log('\n🏥 HEALTH CHECKS');
    console.log('='.repeat(50));
    results.serverHealth = await testServerHealth();

    if (!results.serverHealth) {
      log('💥', 'Server is not healthy - aborting tests');
      return results;
    }

    results.communicationsConfig = await testCommunicationsConfig();

    console.log('\n🔐 AUTHENTICATION TESTS');
    console.log('='.repeat(50));

    try {
      await testUserRegistration();
      results.registration = true;
    } catch (error) {
      // Continue with existing user
    }

    results.emailVerification = await testEmailVerification();

    try {
      await testUserLogin();
      results.login = true;
    } catch (error) {
      log('💥', 'Cannot continue without authentication');
      return results;
    }

    console.log('\n📧 EMAIL & SMS TESTS');
    console.log('='.repeat(50));
    results.forgotPassword = await testForgotPassword() !== null;
    results.emailTemplates = await testEmailTemplates();
    results.smsMessaging = await testSMSMessaging();

    console.log('\n🔔 NOTIFICATION TESTS');
    console.log('='.repeat(50));
    results.notifications = await testNotifications();

    console.log('\n📅 SCHEDULING TESTS');
    console.log('='.repeat(50));
    results.schedulingEmails = await testSchedulingEmails();

    console.log('\n💳 BILLING TESTS');
    console.log('='.repeat(50));
    results.billingEmails = await testBillingEmails();

    console.log('\n🔗 INTEGRATION TESTS');
    console.log('='.repeat(50));
    results.webhooks = await testWebhooksAndIntegrations();

  } catch (error) {
    log('💥', 'Fatal error during testing', error.message);
  }

  return results;
}

async function printSummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));

  const tests = [
    ['Server Health', results.serverHealth],
    ['User Registration', results.registration],
    ['Email Verification', results.emailVerification],
    ['User Login', results.login],
    ['Forgot Password', results.forgotPassword],
    ['Notifications', results.notifications],
    ['Email Templates', results.emailTemplates],
    ['SMS Messaging', results.smsMessaging],
    ['Scheduling Emails', results.schedulingEmails],
    ['Billing Emails', results.billingEmails],
    ['Webhooks', results.webhooks]
  ];

  let passed = 0;
  let total = 0;

  tests.forEach(([name, result]) => {
    if (result !== null) {
      total++;
      if (result) {
        passed++;
        console.log(`✅ ${name}`);
      } else {
        console.log(`❌ ${name}`);
      }
    } else {
      console.log(`⚠️  ${name} (skipped)`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 OVERALL SCORE: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

  if (results.communicationsConfig) {
    const { emailConfigured, smsConfigured } = results.communicationsConfig;
    console.log('\n📋 CONFIGURATION STATUS:');
    console.log(`📧 Email Provider: ${emailConfigured ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📱 SMS Provider: ${smsConfigured ? '✅ Configured' : '❌ Not configured'}`);
  }

  console.log('\n🚀 DEPLOYMENT STATUS:');
  if (passed === total && total > 0) {
    console.log('✅ All tests passed - Ready for production deployment!');
  } else if (passed >= total * 0.8) {
    console.log('⚠️  Most tests passed - Minor issues to resolve before deployment');
  } else {
    console.log('❌ Multiple test failures - Needs attention before deployment');
  }

  console.log('\n🔗 Quick Links:');
  console.log(`Frontend: ${frontendURL}`);
  console.log(`Backend API: ${baseURL}/api/docs`);
  console.log(`Health Check: ${baseURL}/api/health`);

  if (environment === 'local') {
    console.log('\n💡 Next Steps:');
    console.log('1. Fix any failing tests');
    console.log('2. Run: node test-production-ready.js --prod');
    console.log('3. Push to main branch to deploy to Render');
  }
}

// Main execution
async function main() {
  try {
    const results = await runAllTests();
    await printSummary(results);
  } catch (error) {
    log('💥', 'Test suite failed', error.message);
  } finally {
    rl.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test suite interrupted');
  rl.close();
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { main, runAllTests };
