import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from JWT token
    const userId = 'user_placeholder'; // Extract from JWT

    // TODO: Get customer ID from your database using userId
    // For now, we'll return a mock response

    // In production, you would:
    // 1. Get the user's Stripe customer ID from your database
    // 2. Retrieve their active subscriptions
    // 3. Return the current plan status

    return NextResponse.json({
      plan: 'basic',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: 'Failed to get subscription status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    // TODO: Get user ID from JWT token
    const userId = 'user_placeholder';

    if (action === 'cancel') {
      // TODO: Cancel user's subscription
      // const stripe = getStripe();
      // const subscription = await stripe.subscriptions.update(subscriptionId, {
      //   cancel_at_period_end: true
      // });

      return NextResponse.json({ success: true });
    }

    if (action === 'reactivate') {
      // TODO: Reactivate user's subscription
      // const stripe = getStripe();
      // const subscription = await stripe.subscriptions.update(subscriptionId, {
      //   cancel_at_period_end: false
      // });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json({ error: 'Failed to perform subscription action' }, { status: 500 });
  }
}
