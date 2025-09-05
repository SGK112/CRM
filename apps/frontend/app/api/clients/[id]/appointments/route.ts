import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Return mock appointments data for client: ${params.id}
    const mockAppointments = [
      {
        _id: "apt_1",
        title: "Site Visit - Kitchen Measurement",
        description: "Initial site visit to measure kitchen space and discuss requirements",
        startTime: "2024-09-10T10:00:00.000Z",
        endTime: "2024-09-10T11:30:00.000Z",
        status: "scheduled",
        type: "site_visit",
        location: "123 Main St, Springfield, IL 62701",
        notes: "Bring measuring tools and tablet for photos",
        reminder: {
          email: true,
          sms: true,
          timeBeforeMinutes: 60
        }
      },
      {
        _id: "apt_2",
        title: "Project Consultation",
        description: "Discuss project timeline, materials, and budget",
        startTime: "2024-09-15T14:00:00.000Z",
        endTime: "2024-09-15T15:00:00.000Z",
        status: "confirmed",
        type: "consultation",
        location: "Office - Conference Room B",
        notes: "Bring material samples and estimate documents"
      },
      {
        _id: "apt_3",
        title: "Follow-up Call",
        description: "Check on project progress and address any questions",
        startTime: "2024-09-05T09:00:00.000Z",
        endTime: "2024-09-05T09:30:00.000Z",
        status: "completed",
        type: "call",
        notes: "Discussed timeline concerns - all resolved"
      }
    ];

    return NextResponse.json(mockAppointments);
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
    const body = await request.json();

    // Mock creating a new appointment
    const newAppointment = {
      _id: `apt_${Date.now()}`,
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      status: "scheduled",
      type: body.type || "meeting",
      location: body.location,
      notes: body.notes,
      clientId: params.id,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
