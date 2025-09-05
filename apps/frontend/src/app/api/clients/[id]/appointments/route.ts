import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock appointments data with detailed scheduling info
    const mockAppointments = [
      {
        _id: "apt_1",
        title: "Initial Consultation",
        description: "Meet to discuss bathroom renovation project scope and requirements",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        status: "scheduled",
        type: "consultation",
        location: "Client's home - 123 Main St, Anytown, ST 12345",
        notes: "Bring measuring tools and material samples",
        reminder: {
          email: true,
          sms: true,
          timeBeforeMinutes: 1440
        }
      },
      {
        _id: "apt_2",
        title: "Site Visit & Measurements",
        description: "Detailed measurements and final project assessment",
        startTime: new Date(Date.now() + 259200000).toISOString(),
        endTime: new Date(Date.now() + 259200000 + 7200000).toISOString(),
        status: "confirmed",
        type: "site_visit",
        location: "Client's home - 123 Main St, Anytown, ST 12345",
        notes: "Final measurements for estimate",
        reminder: {
          email: true,
          sms: false,
          timeBeforeMinutes: 720
        }
      },
      {
        _id: "apt_3",
        title: "Project Review Meeting",
        description: "Review final estimates and contract details",
        startTime: new Date(Date.now() - 172800000).toISOString(),
        endTime: new Date(Date.now() - 172800000 + 3600000).toISOString(),
        status: "completed",
        type: "meeting",
        location: "Office conference room",
        notes: "Contract signed, project approved",
        reminder: {
          email: true,
          sms: true,
          timeBeforeMinutes: 60
        }
      },
      {
        _id: "apt_4",
        title: "Follow-up Call",
        description: "Check on project satisfaction",
        startTime: new Date(Date.now() + 604800000).toISOString(),
        endTime: new Date(Date.now() + 604800000 + 1800000).toISOString(),
        status: "scheduled",
        type: "call",
        location: "Phone call",
        notes: "Post-project satisfaction survey",
        reminder: {
          email: false,
          sms: true,
          timeBeforeMinutes: 30
        }
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
      title: body.title || "New Appointment",
      description: body.description || "",
      startTime: body.startTime || new Date(Date.now() + 86400000).toISOString(),
      endTime: body.endTime || new Date(Date.now() + 86400000 + 3600000).toISOString(),
      status: "scheduled",
      type: body.type || "meeting",
      location: body.location || "",
      notes: body.notes || "",
      reminder: body.reminder || {
        email: true,
        sms: false,
        timeBeforeMinutes: 60
      }
    };

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
