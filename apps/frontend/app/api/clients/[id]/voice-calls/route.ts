import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Return mock voice calls data for client: ${params.id}
    const mockVoiceCalls = [
      {
        _id: "call_1",
        type: "outbound",
        duration: 240,
        timestamp: "2024-09-04T14:30:00.000Z",
        status: "completed",
        recordingUrl: "/audio/call_1.mp3",
        transcript: "Called to follow up on kitchen remodel project. Client confirmed they're ready to proceed with the estimate.",
        summary: "Successful follow-up call. Client ready to proceed.",
        followUpRequired: false,
        cost: 0.12,
        provider: "twilio"
      },
      {
        _id: "call_2",
        type: "inbound",
        duration: 180,
        timestamp: "2024-09-02T10:15:00.000Z",
        status: "completed",
        recordingUrl: "/audio/call_2.mp3",
        transcript: "Client called with questions about timeline and materials.",
        summary: "Client inquiry about project details.",
        followUpRequired: true,
        cost: 0.08,
        provider: "twilio"
      },
      {
        _id: "call_3",
        type: "outbound",
        duration: 0,
        timestamp: "2024-09-01T16:00:00.000Z",
        status: "no-answer",
        followUpRequired: true,
        cost: 0.05,
        provider: "elevenlabs"
      }
    ];

    return NextResponse.json(mockVoiceCalls);
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

    // Mock creating a new voice call
    const newCall = {
      _id: `call_${Date.now()}`,
      type: body.type || "outbound",
      duration: 0,
      timestamp: new Date().toISOString(),
      status: "initiated",
      provider: body.provider || "twilio",
      clientId: params.id
    };

    return NextResponse.json(newCall, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
