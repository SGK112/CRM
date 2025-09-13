#!/usr/bin/env node

// Simple test to check 2FA endpoints with token from browser
const speakeasy = require('speakeasy');

// Generate a test secret and token for manual testing
const secret = speakeasy.generateSecret({
  name: 'Test CRM',
  issuer: 'Remodely'
});

console.log('🔐 2FA Test Information:');
console.log('=======================');
console.log('Secret (Base32):', secret.base32);
console.log('OTPAUTH URL:', secret.otpauth_url);
console.log('');

// Generate current token
const token = speakeasy.totp({
  secret: secret.base32,
  encoding: 'base32'
});

console.log('Current TOTP Token:', token);
console.log('');

// Generate next few tokens for testing
console.log('Next few tokens (30-second intervals):');
for (let i = 0; i < 3; i++) {
  const futureToken = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
    time: Date.now() + (i * 30000)
  });
  console.log(`Token in ${i * 30}s:`, futureToken);
}

console.log('');
console.log('🧪 Manual Testing Instructions:');
console.log('1. Go to http://localhost:3005/dashboard/settings/profile');
console.log('2. Click "Enable 2FA" button');
console.log('3. Use any authenticator app to scan the QR code');
console.log('4. Enter the 6-digit code from your app');
console.log('5. Save the backup codes safely');
console.log('6. Test disabling 2FA with your password');
console.log('');
console.log('✅ 2FA packages are properly installed and working!');
