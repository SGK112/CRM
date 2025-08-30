#!/usr/bin/env node

/**
 * Stripe Test Setup Script
 * Creates products and prices for testing the monetization flow
 */

const Stripe = require('stripe');

// Use the test secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here');

async function setupStripeTestProducts() {
  console.log('🚀 Setting up Stripe test products and prices...\n');

  try {
    // Create AI Professional product
    console.log('Creating AI Professional product...');
    const aiProProduct = await stripe.products.create({
      name: 'AI Professional',
      description: 'AI-powered tools for growing construction businesses',
      metadata: {
        plan_id: 'ai-pro',
        features: 'AI tools, 500 clients, 200 projects, voice agents, design studio'
      }
    });
    console.log(`✅ AI Pro Product created: ${aiProProduct.id}`);

    // Create Enterprise product
    console.log('Creating Enterprise product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise',
      description: 'Complete solution for large construction operations',
      metadata: {
        plan_id: 'enterprise',
        features: 'Unlimited everything, custom branding, dedicated support'
      }
    });
    console.log(`✅ Enterprise Product created: ${enterpriseProduct.id}`);

    // Create AI Pro prices
    console.log('\nCreating AI Professional prices...');
    const aiProMonthly = await stripe.prices.create({
      product: aiProProduct.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'ai-pro',
        billing_cycle: 'monthly'
      }
    });
    console.log(`✅ AI Pro Monthly: ${aiProMonthly.id} - $49/month`);

    const aiProYearly = await stripe.prices.create({
      product: aiProProduct.id,
      unit_amount: 47040, // $470.40 (20% discount from $588)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'ai-pro',
        billing_cycle: 'yearly'
      }
    });
    console.log(`✅ AI Pro Yearly: ${aiProYearly.id} - $470.40/year (20% off)`);

    // Create Enterprise prices
    console.log('\nCreating Enterprise prices...');
    const enterpriseMonthly = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 14900, // $149.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan_id: 'enterprise',
        billing_cycle: 'monthly'
      }
    });
    console.log(`✅ Enterprise Monthly: ${enterpriseMonthly.id} - $149/month`);

    const enterpriseYearly = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 142560, // $1,425.60 (20% discount from $1,788)
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      metadata: {
        plan_id: 'enterprise',
        billing_cycle: 'yearly'
      }
    });
    console.log(`✅ Enterprise Yearly: ${enterpriseYearly.id} - $1,425.60/year (20% off)`);

    // Create Twilio add-on products
    console.log('\nCreating Twilio add-on products...');
    const twilioNumberProduct = await stripe.products.create({
      name: 'Twilio Phone Number',
      description: 'Dedicated phone number for SMS and voice communications',
      metadata: {
        addon_type: 'twilio_number',
        monthly_fee: '100' // $1.00
      }
    });

    const twilioNumberPrice = await stripe.prices.create({
      product: twilioNumberProduct.id,
      unit_amount: 100, // $1.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        addon_type: 'twilio_number'
      }
    });
    console.log(`✅ Twilio Number: ${twilioNumberPrice.id} - $1/month`);

    // Output environment variables
    console.log('\n🎯 Environment Variables for .env file:');
    console.log('================================================');
    console.log(`STRIPE_AI_PRO_MONTHLY_PRICE_ID=${aiProMonthly.id}`);
    console.log(`STRIPE_AI_PRO_YEARLY_PRICE_ID=${aiProYearly.id}`);
    console.log(`STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=${enterpriseMonthly.id}`);
    console.log(`STRIPE_ENTERPRISE_YEARLY_PRICE_ID=${enterpriseYearly.id}`);
    console.log(`STRIPE_TWILIO_NUMBER_PRICE_ID=${twilioNumberPrice.id}`);
    console.log('================================================');

    console.log('\n✅ Stripe test setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy the environment variables above to your .env file');
    console.log('2. Restart your development server');
    console.log('3. Test the upgrade flow at http://localhost:3000/dashboard/upgrade');
    console.log('4. Use test card: 4242 4242 4242 4242');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupStripeTestProducts();
