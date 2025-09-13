#!/usr/bin/env node

const fetch = require('node-fetch');
const speakeasy = require('speakeasy');

// Test Configuration
const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3005';

// Test user credentials
let authToken = '';
let userId = '';
let twoFactorSecret = '';
let backupCodes = [];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  return { response, data };
}

// Test login and get auth token
async function testLogin() {
  info('Testing login...');

  const { response, data } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });

  if (response.ok && data.access_token) {
    authToken = data.access_token;
    userId = data.user.id;
    success(`Login successful. User ID: ${userId}`);
    return true;
  } else {
    error('Login failed. Creating test user...');
    return await createTestUser();
  }
}

// Create test user if login fails
async function createTestUser() {
  const { response, data } = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    })
  });

  if (response.ok && data.access_token) {
    authToken = data.access_token;
    userId = data.user.id;
    success('Test user created and logged in');
    return true;
  } else {
    error('Failed to create test user');
    return false;
  }
}

// Test 2FA setup
async function test2FASetup() {
  info('Testing 2FA setup...');

  const { response, data } = await apiRequest('/api/users/2fa/setup', {
    method: 'POST'
  });

  if (response.ok && data.secret && data.qrCode) {
    twoFactorSecret = data.secret;
    success('2FA setup successful');
    success(`Secret: ${data.secret}`);
    success(`QR Code length: ${data.qrCode.length} characters`);

    // Verify QR code contains expected data
    if (data.qrCode.startsWith('data:image/png;base64,')) {
      success('QR code format is correct');
    } else {
      error('QR code format is incorrect');
    }

    return true;
  } else {
    error('2FA setup failed');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test 2FA verification and enabling
async function test2FAVerification() {
  info('Testing 2FA verification...');

  if (!twoFactorSecret) {
    error('No 2FA secret available for testing');
    return false;
  }

  // Generate a valid TOTP token
  const token = speakeasy.totp({
    secret: twoFactorSecret,
    encoding: 'base32'
  });

  info(`Generated token: ${token}`);

  const { response, data } = await apiRequest('/api/users/2fa/verify-setup', {
    method: 'POST',
    body: JSON.stringify({
      token: token
    })
  });

  if (response.ok && data.backupCodes) {
    backupCodes = data.backupCodes;
    success('2FA verification and enabling successful');
    success(`Backup codes generated: ${data.backupCodes.length} codes`);
    data.backupCodes.forEach((code, index) => {
      info(`  Backup code ${index + 1}: ${code}`);
    });
    return true;
  } else {
    error('2FA verification failed');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test 2FA token verification after it's enabled
async function test2FATokenVerification() {
  info('Testing 2FA token verification (after enabled)...');

  if (!twoFactorSecret) {
    error('No 2FA secret available for testing');
    return false;
  }

  // Generate a new valid TOTP token
  const token = speakeasy.totp({
    secret: twoFactorSecret,
    encoding: 'base32'
  });

  const { response, data } = await apiRequest('/api/users/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({
      token: token
    })
  });

  if (response.ok && data.valid) {
    success('2FA token verification successful');
    return true;
  } else {
    error('2FA token verification failed');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test backup codes retrieval
async function testBackupCodes() {
  info('Testing backup codes retrieval...');

  const { response, data } = await apiRequest('/api/users/2fa/backup-codes', {
    method: 'GET'
  });

  if (response.ok && data.backupCodes) {
    success(`Retrieved ${data.backupCodes.length} backup codes`);
    return true;
  } else {
    error('Failed to retrieve backup codes');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test backup codes regeneration
async function testBackupCodesRegeneration() {
  info('Testing backup codes regeneration...');

  const { response, data } = await apiRequest('/api/users/2fa/regenerate-backup-codes', {
    method: 'POST'
  });

  if (response.ok && data.backupCodes) {
    success(`Regenerated ${data.backupCodes.length} backup codes`);
    // Update our backup codes
    backupCodes = data.backupCodes;
    return true;
  } else {
    error('Failed to regenerate backup codes');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test frontend API routes
async function testFrontendAPIRoutes() {
  info('Testing frontend API routes...');

  // Test frontend 2FA setup route
  const setupResponse = await fetch(`${FRONTEND_BASE}/api/users/2fa/setup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (setupResponse.ok) {
    success('Frontend 2FA setup route working');
  } else {
    error('Frontend 2FA setup route failed');
  }

  // Test frontend 2FA verification route
  const token = speakeasy.totp({
    secret: twoFactorSecret,
    encoding: 'base32'
  });

  const verifyResponse = await fetch(`${FRONTEND_BASE}/api/users/2fa/verify-setup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });

  if (verifyResponse.ok) {
    success('Frontend 2FA verification route working');
  } else {
    error('Frontend 2FA verification route failed');
  }

  return true;
}

// Test 2FA disable
async function test2FADisable() {
  info('Testing 2FA disable...');

  const { response, data } = await apiRequest('/api/users/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({
      password: 'password123'
    })
  });

  if (response.ok && data.message) {
    success('2FA disable successful');
    return true;
  } else {
    error('2FA disable failed');
    error(JSON.stringify(data, null, 2));
    return false;
  }
}

// Test error scenarios
async function testErrorScenarios() {
  info('Testing error scenarios...');

  // Test invalid token
  const { response: invalidResponse, data: invalidData } = await apiRequest('/api/users/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({
      token: '000000'
    })
  });

  if (!invalidResponse.ok && invalidData.message) {
    success('Invalid token properly rejected');
  } else {
    error('Invalid token was not properly rejected');
  }

  // Test wrong password for disable
  const { response: wrongPasswordResponse } = await apiRequest('/api/users/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({
      password: 'wrongpassword'
    })
  });

  if (!wrongPasswordResponse.ok) {
    success('Wrong password for disable properly rejected');
  } else {
    error('Wrong password for disable was not properly rejected');
  }

  return true;
}

// Main test function
async function runTests() {
  log(`${colors.bold}🧪 Starting comprehensive 2FA testing...${colors.reset}`);
  console.log('='.repeat(60));

  try {
    // Login test
    if (!(await testLogin())) {
      error('Login test failed, stopping tests');
      return;
    }

    console.log('');

    // 2FA Setup tests
    if (await test2FASetup()) {
      if (await test2FAVerification()) {
        await test2FATokenVerification();
        await testBackupCodes();
        await testBackupCodesRegeneration();
        await testFrontendAPIRoutes();
        await testErrorScenarios();

        // Test disable as the final step
        await test2FADisable();
      }
    }

    console.log('');
    console.log('='.repeat(60));
    success('🎉 All 2FA tests completed!');

  } catch (err) {
    error(`Test error: ${err.message}`);
    console.error(err);
  }
}

// Run the tests
runTests();
