import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock client data for testing the UI
  const mockClient = {
    _id: params.id,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    company: "Doe Construction",
    address: {
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      country: "USA"
    },
    notes: "Important client with multiple ongoing projects.",
    tags: ["VIP", "Commercial", "Returning"],
    status: "Active",
    source: "Website",
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2024-09-04T18:00:00.000Z",
    lastContactDate: "2024-09-01T10:30:00.000Z",
    totalProjects: 5,
    totalValue: 125000,
    averageProjectValue: 25000
  };

  return NextResponse.json(mockClient);
}
