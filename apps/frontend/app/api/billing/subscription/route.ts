import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock response for development
    return NextResponse.json({
      plan: 'basic',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get subscription status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'cancel') {
      return NextResponse.json({ success: true });
    }

    if (action === 'reactivate') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform subscription action' }, { status: 500 });
  }
}
