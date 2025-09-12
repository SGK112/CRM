import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Return mock overview data for testing - clientId: ${params.id}
    const mockOverview = {
      clientId: params.id,
      projectsCount: 5,
      totalValue: 125000,
      averageProjectValue: 25000,
      lastContactDate: "2024-09-01T10:30:00.000Z",
      upcomingAppointments: 2,
      pendingEstimates: 1,
      overallStatus: "Active",
      recentActivity: [
        {
          id: "1",
          type: "estimate",
          description: "Sent estimate for kitchen remodel",
          date: "2024-09-03T14:30:00.000Z"
        },
        {
          id: "2",
          type: "call",
          description: "Follow-up call completed",
          date: "2024-09-01T10:30:00.000Z"
        }
      ]
    };

    return NextResponse.json(mockOverview);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
