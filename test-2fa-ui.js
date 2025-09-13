#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function test2FAFeatures() {
  console.log('🚀 Starting comprehensive UI testing...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless testing
      slowMo: 100 // Slow down by 100ms for visibility
    });

    const page = await browser.newPage();

    // Navigate to profile page
    console.log('📍 Navigating to profile page...');
    await page.goto('http://localhost:3005/dashboard/settings/profile');

    // Wait for page to load
    await page.waitForSelector('[data-testid="profile-form"]', { timeout: 10000 });
    console.log('✅ Profile page loaded successfully');

    // Test password visibility icons
    console.log('👁️  Testing password visibility icons...');

    // Check if password fields exist
    const passwordFields = await page.$$('input[type="password"]');
    console.log(`Found ${passwordFields.length} password fields`);

    // Check if eye icons exist
    const eyeIcons = await page.$$('[data-testid="password-toggle"]');
    console.log(`Found ${eyeIcons.length} password toggle icons`);

    if (eyeIcons.length > 0) {
      // Click the first eye icon to test visibility toggle
      await eyeIcons[0].click();
      console.log('✅ Password visibility toggle clicked');

      // Check if password field type changed
      const passwordFieldType = await page.evaluate(() => {
        const field = document.querySelector('input[type="text"], input[type="password"]');
        return field ? field.type : null;
      });
      console.log(`Password field type after toggle: ${passwordFieldType}`);
    }

    // Test phone number formatting
    console.log('📱 Testing phone number formatting...');

    const phoneField = await page.$('input[placeholder*="phone"], input[name*="phone"]');
    if (phoneField) {
      await phoneField.click();
      await phoneField.clear();
      await phoneField.type('5551234567');

      const phoneValue = await phoneField.evaluate(input => input.value);
      console.log(`Phone value after typing: ${phoneValue}`);

      if (phoneValue.includes('+1') && phoneValue.includes('-')) {
        console.log('✅ Phone number formatting is working');
      } else {
        console.log('⚠️  Phone number formatting may need adjustment');
      }
    } else {
      console.log('⚠️  Phone field not found');
    }

    // Test 2FA button
    console.log('🔐 Testing 2FA button...');

    const twoFAButton = await page.$('button:has-text("Enable 2FA"), button:has-text("Disable 2FA")');
    if (twoFAButton) {
      const buttonText = await twoFAButton.evaluate(btn => btn.textContent);
      console.log(`Found 2FA button: ${buttonText}`);
      console.log('✅ 2FA button is present');
    } else {
      console.log('⚠️  2FA button not found');
    }

    console.log('🎉 UI testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
async function runTests() {
  try {
    await test2FAFeatures();
  } catch (error) {
    if (error.message.includes('puppeteer')) {
      console.log('📝 Puppeteer not installed, running manual checks...');
      console.log('');
      console.log('🧪 Manual Testing Checklist:');
      console.log('==========================');
      console.log('');
      console.log('✅ Password Visibility Icons:');
      console.log('  1. Go to: http://localhost:3005/dashboard/settings/profile');
      console.log('  2. Look for eye icons next to password fields');
      console.log('  3. Click eye icons to toggle password visibility');
      console.log('  4. Verify passwords show/hide correctly');
      console.log('');
      console.log('✅ Phone Number Formatting:');
      console.log('  1. Find the phone number field');
      console.log('  2. Type: 5551234567');
      console.log('  3. Should format to: +1 555-123-4567');
      console.log('');
      console.log('✅ 2FA Functionality:');
      console.log('  1. Look for "Enable 2FA" or "Disable 2FA" button');
      console.log('  2. Click "Enable 2FA" to start setup');
      console.log('  3. QR code should appear in modal');
      console.log('  4. Enter 6-digit code from authenticator app');
      console.log('  5. Backup codes should be displayed');
      console.log('  6. Test disabling with password');
      console.log('');
      console.log('🌐 Open this URL to test: http://localhost:3005/dashboard/settings/profile');
    } else {
      console.error('Test error:', error);
    }
  }
}

runTests();
