import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}

const PRICE_IDS = {
  'ai-pro': {
    monthly: process.env.STRIPE_AI_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_AI_PRO_YEARLY_PRICE_ID!,
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, successUrl, cancelUrl } = await request.json();

    // Validate input
    if (!planId || !billingCycle || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (planId === 'basic') {
      return NextResponse.json({ error: 'Cannot create checkout for free plan' }, { status: 400 });
    }

    // Get price ID
    const priceId =
      PRICE_IDS[planId as keyof typeof PRICE_IDS]?.[
        billingCycle as keyof (typeof PRICE_IDS)['ai-pro']
      ];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
    }

    // Get user ID from JWT token (you'll need to implement JWT verification)
    // For now, we'll use a placeholder
    const userId = 'user_placeholder'; // TODO: Extract from JWT

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: undefined, // TODO: Get from user account
      metadata: {
        userId,
        planId,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          billingCycle,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
