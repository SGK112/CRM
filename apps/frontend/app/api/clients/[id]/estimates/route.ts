import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock estimates data for testing
    const mockEstimates = [
      {
        _id: "est_1",
        clientId: params.id,
        title: "Kitchen Remodel - Phase 1",
        description: "Complete kitchen renovation including cabinets, countertops, and flooring",
        amount: 45000,
        status: "pending",
        createdAt: "2024-09-01T10:00:00.000Z",
        updatedAt: "2024-09-03T14:30:00.000Z",
        validUntil: "2024-10-01T23:59:59.000Z",
        lineItems: [
          { description: "Custom cabinets", quantity: 1, rate: 15000, amount: 15000, category: "cabinetry" },
          { description: "Granite countertops", quantity: 1, rate: 8000, amount: 8000, category: "surfaces" },
          { description: "Hardwood flooring", quantity: 1, rate: 12000, amount: 12000, category: "flooring" },
          { description: "Labor", quantity: 1, rate: 10000, amount: 10000, category: "labor" }
        ],
        quickbooksId: "qb_est_" + params.id + "_1",
        pdfUrl: "/pdfs/estimate_" + params.id + "_1.pdf",
        viewCount: 5,
        lastViewed: "2024-09-03T16:00:00.000Z",
        notes: "Client requested premium granite upgrade",
        termsAndConditions: "Payment terms: 50% deposit, 50% on completion"
      },
      {
        _id: "est_2",
        clientId: params.id,
        title: "Bathroom Renovation",
        description: "Master bathroom complete renovation",
        amount: 28000,
        status: "approved",
        createdAt: "2024-08-15T09:00:00.000Z",
        updatedAt: "2024-08-20T16:00:00.000Z",
        validUntil: "2024-09-15T23:59:59.000Z",
        lineItems: [
          { description: "Tile work", quantity: 1, rate: 8000, amount: 8000, category: "tiling" },
          { description: "Fixtures", quantity: 1, rate: 12000, amount: 12000, category: "plumbing" },
          { description: "Labor", quantity: 1, rate: 8000, amount: 8000, category: "labor" }
        ],
        quickbooksId: "qb_est_" + params.id + "_2",
        pdfUrl: "/pdfs/estimate_" + params.id + "_2.pdf",
        viewCount: 12,
        lastViewed: "2024-08-20T14:00:00.000Z",
        notes: "Approved - converting to project",
        termsAndConditions: "Standard payment terms apply"
      },
      {
        _id: "est_3",
        clientId: params.id,
        title: "Deck Construction",
        description: "New composite deck with railing",
        amount: 18500,
        status: "draft",
        createdAt: "2024-09-04T11:00:00.000Z",
        updatedAt: "2024-09-04T11:00:00.000Z",
        validUntil: "2024-10-04T23:59:59.000Z",
        lineItems: [
          { description: "Composite decking", quantity: 500, rate: 12, amount: 6000, category: "materials" },
          { description: "Railing system", quantity: 80, rate: 25, amount: 2000, category: "materials" },
          { description: "Labor and installation", quantity: 1, rate: 10500, amount: 10500, category: "labor" }
        ],
        viewCount: 0,
        notes: "Initial draft - pending client review",
        termsAndConditions: "Subject to permit approval"
      }
    ];

    return NextResponse.json(mockEstimates);
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

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/estimates`, {
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
