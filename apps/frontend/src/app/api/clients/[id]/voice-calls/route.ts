import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock voice calls data with comprehensive details
    const mockVoiceCalls = [
      {
        _id: "vc_1",
        type: "outbound",
        duration: 245,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
        recordingUrl: "https://example.com/recording1.mp3",
        transcript: "Called to follow up on estimate for bathroom renovation. Client expressed interest in moving forward with the project and wants to schedule an on-site visit next week.",
        summary: "Positive response to estimate, ready to schedule site visit",
        followUpRequired: true,
        cost: 0.12,
        provider: "twilio"
      },
      {
        _id: "vc_2",
        type: "inbound",
        duration: 180,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: "completed",
        recordingUrl: "https://example.com/recording2.mp3",
        transcript: "Client called to ask about timeline for kitchen remodel. Discussed project phases and estimated completion date.",
        summary: "Timeline inquiry for kitchen remodel project",
        followUpRequired: false,
        cost: 0.09,
        provider: "twilio"
      },
      {
        _id: "vc_3",
        type: "outbound",
        duration: 0,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: "no-answer",
        followUpRequired: true,
        cost: 0.05,
        provider: "elevenlabs"
      },
      {
        _id: "vc_4",
        type: "outbound",
        duration: 320,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        status: "completed",
        recordingUrl: "https://example.com/recording4.mp3",
        transcript: "Initial consultation call. Discussed project scope, budget range, and client preferences. Scheduled estimate appointment.",
        summary: "Initial consultation - scheduled estimate appointment",
        followUpRequired: false,
        cost: 0.16,
        provider: "twilio"
      }
    ];

    return NextResponse.json(mockVoiceCalls);
  } catch (error) {
    console.error('Error fetching voice calls:', error);
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

    // Mock creating a new outbound call
    const newCall = {
      _id: `vc_${Date.now()}`,
      type: "outbound",
      duration: 0,
      timestamp: new Date().toISOString(),
      status: "initiated",
      provider: body.provider || "twilio",
      cost: 0
    };

    return NextResponse.json(newCall, { status: 201 });
  } catch (error) {
    console.error('Error creating voice call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
