#!/usr/bin/env node

/**
 * Get Stripe publishable key for the test account
 */

const Stripe = require('stripe');

// Use the test secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here');

async function getPublishableKey() {
  try {
    // The publishable key follows a pattern based on the secret key
    const secretKey = process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here';
    const accountId = secretKey.match(/sk_test_(\w+)/)[1];
    const publishableKey = `pk_test_${accountId}`;

    console.log('🔑 Stripe Test Keys:');
    console.log('===================');
    console.log(`Secret Key: ${secretKey}`);
    console.log(`Publishable Key: ${publishableKey}`);
    console.log('===================');

    // Test the connection
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.id}`);
    console.log(`Account email: ${account.email}`);
    console.log(`Country: ${account.country}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getPublishableKey();
