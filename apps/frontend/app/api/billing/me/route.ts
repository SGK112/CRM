import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    // Check for development mode
    if (process.env.NODE_ENV === 'development') {
      // Return mock subscription data for development
      return NextResponse.json({
        success: true,
        subscription: {
          id: 'dev-sub-123',
          status: 'active',
          plan: {
            id: 'pro',
            name: 'Pro Plan',
            price: 49,
            currency: 'usd',
            interval: 'month',
            features: [
              'Unlimited contacts',
              'AI-powered insights',
              'Priority support',
              'Advanced reporting',
              'Team collaboration'
            ]
          },
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        },
        usage: {
          contacts: 25,
          projects: 8,
          monthlyLimit: 1000
        }
      });
    }

    // Production mode - proxy to backend
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/billing/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch billing information' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch billing information',
      },
      { status: 500 }
    );
  }
}