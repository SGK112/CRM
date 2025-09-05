import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For testing purposes, return mock data without authentication
    const mockClient = {
      _id: params.id,
      type: 'client',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-123-4567',
      company: 'Smith Construction',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      notes: 'Excellent client, always pays on time. Looking to renovate bathroom and kitchen. Very detail-oriented and appreciates quality work.',
      tags: ['Premium Client', 'Renovation', 'Repeat Customer', 'Referral Source'],
      status: 'active',
      source: 'Referral',
      createdAt: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
      updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      lastContactDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago

      // Business metrics
      totalProjects: 3,
      totalValue: 75000,
      averageProjectValue: 25000,
      rating: 4.8,

      // Integration data
      quickbooksId: 'qb_customer_456',
      googleMapsPlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      twilioSmsEnabled: true,
      sendgridContactId: 'sg_contact_123',
      emailVerified: true,

      // Client-specific fields
      preferredContactMethod: 'email',

      // Communication preferences
      communicationPreferences: {
        email: true,
        sms: true,
        voiceCall: false,
        push: true,
        marketing: true
      },

      // Custom fields
      customFields: {
        projectType: 'Residential Renovation',
        budget: '$50,000 - $100,000',
        timeline: '3-4 months',
        specialRequirements: 'Eco-friendly materials preferred'
      },

      // Emergency contact
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+1-555-123-4568',
        relationship: 'Spouse'
      }
    };

    return NextResponse.json(mockClient);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
      method: 'PATCH',
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sync-quickbooks') {
      const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/sync-quickbooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to sync client to QuickBooks' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
