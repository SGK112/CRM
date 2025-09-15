import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory mock until real backend is wired
const mockEvents = [
  {
    id: 'm-1',
    title: 'Strategy Meeting',
    start: new Date(Date.now() + 2 * 3600_000).toISOString(),
    end: new Date(Date.now() + 3 * 3600_000).toISOString(),
    extendedProps: { status: 'scheduled', type: 'meeting', source: 'local' }
  },
  {
    id: 'm-2',
    title: 'Client Consultation',
    start: new Date(Date.now() + 25 * 3600_000).toISOString(),
    end: new Date(Date.now() + 26 * 3600_000).toISOString(),
    extendedProps: { status: 'confirmed', type: 'consultation', source: 'local' }
  }
];

export async function GET() {
  return NextResponse.json(mockEvents);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newEvent = {
      id: `m-${Date.now()}`,
      title: body.title || 'Untitled',
      start: body.startDateTime || body.start,
      end: body.endDateTime || body.end,
      extendedProps: {
        status: body.status || 'scheduled',
        type: body.appointmentType || body.type || 'meeting',
        source: body.source || 'local'
      }
    };
    mockEvents.push(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
