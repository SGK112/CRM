import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.error('No access token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(
      'Making request to:',
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/communication-status`
    );
    console.log('Access token exists:', !!accessToken);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/communication-status`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching communication capabilities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
