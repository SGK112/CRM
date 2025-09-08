import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Mock data for development
const DEV_MOCK_FINANCIAL = {
  invoices: [
    {
      id: 1,
      client: 'Johnson Family',
      amount: 25000,
      status: 'paid',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      project: 'Kitchen Renovation',
    },
    {
      id: 2,
      client: 'Martinez Construction',
      amount: 18000,
      status: 'pending',
      date: '2024-01-20',
      dueDate: '2024-02-20',
      project: 'Office Building',
    },
    {
      id: 3,
      client: 'Smith Enterprises',
      amount: 12000,
      status: 'overdue',
      date: '2024-01-10',
      dueDate: '2024-02-10',
      project: 'Warehouse Expansion',
    },
  ],
  payments: [
    {
      id: 1,
      client: 'Johnson Family',
      amount: 25000,
      date: '2024-02-14',
      method: 'bank_transfer',
      status: 'completed',
    },
    {
      id: 2,
      client: 'Davis LLC',
      amount: 15000,
      date: '2024-02-10',
      method: 'check',
      status: 'completed',
    },
  ],
  expenses: [
    {
      id: 1,
      description: 'Materials - Lumber',
      amount: 3500,
      date: '2024-01-25',
      category: 'materials',
      project: 'Kitchen Renovation',
    },
    {
      id: 2,
      description: 'Equipment Rental',
      amount: 800,
      date: '2024-01-28',
      category: 'equipment',
      project: 'Office Building',
    },
  ],
  summary: {
    totalInvoiced: 55000,
    totalPaid: 40000,
    totalPending: 15000,
    totalExpenses: 4300,
    netProfit: 35700,
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
