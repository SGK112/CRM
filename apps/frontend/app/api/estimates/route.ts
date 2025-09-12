import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Simple estimate interface for development mode
interface Estimate {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  subtotal: number;
  tax?: number;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Global storage for development mode
declare global {
  // eslint-disable-next-line no-var
  var __DEV_ESTIMATE_STORAGE__: Estimate[] | undefined;
}

const estimateStorage = {
  getAll(): Estimate[] {
    if (typeof global !== 'undefined') {
      global.__DEV_ESTIMATE_STORAGE__ = global.__DEV_ESTIMATE_STORAGE__ || [];
      return global.__DEV_ESTIMATE_STORAGE__;
    }
    return [];
  },

  getById(id: string): Estimate | undefined {
    const estimates = this.getAll();
    return estimates.find(estimate => estimate.id === id);
  },

  create(estimateData: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>): Estimate {
    const estimates = this.getAll();
    const newEstimate: Estimate = {
      ...estimateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    estimates.push(newEstimate);
    return newEstimate;
  },

  update(id: string, updates: Partial<Estimate>): Estimate | null {
    const estimates = this.getAll();
    const index = estimates.findIndex(estimate => estimate.id === id);
    if (index === -1) return null;

    estimates[index] = {
      ...estimates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return estimates[index];
  },

  delete(id: string): boolean {
    const estimates = this.getAll();
    const index = estimates.findIndex(estimate => estimate.id === id);
    if (index === -1) return false;

    estimates.splice(index, 1);
    return true;
  }
};

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // Development mode fallback - return local storage data if no valid token
    if (!token || process.env.NODE_ENV !== 'production') {
      const localEstimates = estimateStorage.getAll();
      if (!token) {
        return NextResponse.json(localEstimates);
      }

      // If we have a token, try backend but fallback to local if it fails
      try {
        const response = await fetch(`${BACKEND_URL}/api/estimates`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          return NextResponse.json(localEstimates);
        }
      } catch (error) {
        return NextResponse.json(localEstimates);
      }
    }

    // Production mode with valid token
    const response = await fetch(`${BACKEND_URL}/api/estimates`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch estimates' },
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

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    // Development mode fallback - create in local storage if no valid token
    if (!token || process.env.NODE_ENV !== 'production') {
      if (!token) {
        const newEstimate = estimateStorage.create(body);
        return NextResponse.json(newEstimate, { status: 201 });
      }

      // If we have a token, try backend but fallback to local if it fails
      try {
        const response = await fetch(`${BACKEND_URL}/api/estimates`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          const newEstimate = estimateStorage.create(body);
          return NextResponse.json(newEstimate, { status: 201 });
        }
      } catch (error) {
        const newEstimate = estimateStorage.create(body);
        return NextResponse.json(newEstimate, { status: 201 });
      }
    }

    // Production mode with valid token
    const response = await fetch(`${BACKEND_URL}/api/estimates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create estimate' },
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
