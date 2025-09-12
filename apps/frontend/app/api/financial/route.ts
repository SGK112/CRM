import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock data for development - cleared for production use
const DEV_MOCK_FINANCIAL = {
  invoices: [],
  payments: [],
  expenses: [],
  summary: {
    totalInvoiced: 0,
    totalPaid: 0,
    totalPending: 0,
    totalExpenses: 0,
    netProfit: 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // In local development, return mock data so the UI can load without signing in.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(DEV_MOCK_FINANCIAL);
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}/api/financial?${queryString}` : `${BACKEND_URL}/api/financial`;

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
        return NextResponse.json(DEV_MOCK_FINANCIAL);
      }

      return NextResponse.json(
        { error: 'Failed to fetch financial data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to mock data in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(DEV_MOCK_FINANCIAL);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
