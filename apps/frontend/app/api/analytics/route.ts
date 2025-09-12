import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Mock data for development
const DEV_MOCK_ANALYTICS = {
  totalRevenue: 125000,
  totalProjects: 15,
  totalClients: 8,
  completedProjects: 12,
  monthlyRevenue: [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 19000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 26000 },
  ],
  projectsByStatus: [
    { status: 'completed', count: 12 },
    { status: 'in-progress', count: 3 },
    { status: 'pending', count: 2 },
  ],
  clientRevenue: []
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock data so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_ANALYTICS);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/analytics?${queryString}` : `${BACKEND_URL}/api/analytics`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to mock data in development
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_ANALYTICS);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock data in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(DEV_MOCK_ANALYTICS);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
