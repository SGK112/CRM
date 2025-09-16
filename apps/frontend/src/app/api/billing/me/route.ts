import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ||
                   process.env.BACKEND_URL ||
                   'https://remodely-crm-backend.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // For local development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        subscription: {
          id: 'local-dev-subscription',
          plan: 'pro',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        plan: 'pro',
        status: 'active',
        usage: {
          contacts: 0,
          projects: 0,
          storage: 0
        },
        limits: {
          contacts: 1000,
          projects: 100,
          storage: 10000
        },
        features: ['unlimited_clients', 'ai_insights', 'custom_branding', 'api_access']
      });
    }

    // Forward both cookies and authorization headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward cookie header if present
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/billing/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If billing info doesn't exist, return default structure
      if (response.status === 404) {
        return NextResponse.json({
          subscription: null,
          plan: 'free',
          status: 'active',
          usage: {
            contacts: 0,
            projects: 0,
            storage: 0
          },
          limits: {
            contacts: 100,
            projects: 10,
            storage: 1000
          }
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch billing info' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return default billing info on error
    return NextResponse.json({
      subscription: null,
      plan: 'free',
      status: 'active',
      usage: {
        contacts: 0,
        projects: 0,
        storage: 0
      },
      limits: {
        contacts: 100,
        projects: 10,
        storage: 1000
      }
    });
  }
}
