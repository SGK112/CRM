import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch('http://localhost:3001/twilio-numbers/my-numbers', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}
