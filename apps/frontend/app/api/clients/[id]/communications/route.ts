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

    // Return mock communications data for testing - clientId: ${params.id}
    const mockCommunications = [
      {
        _id: "comm_1",
        clientId: params.id,
        type: "email",
        direction: "outbound",
        subject: "Kitchen Remodel Estimate - Ready for Review",
        content: "Hi John, your kitchen remodel estimate is ready for review. Please find the detailed breakdown attached. Let me know if you have any questions!",
        timestamp: "2024-09-03T14:30:00.000Z",
        status: "delivered",
        provider: "sendgrid",
        externalId: "sg_message_123",
        cost: 0.02,
        attachments: [
          {
            name: "Kitchen_Estimate_Sept_2024.pdf",
            url: "/attachments/kitchen_estimate.pdf",
            type: "application/pdf",
            size: 245760
          }
        ],
        metadata: {
          campaignId: "follow_up_campaign",
          templateId: "estimate_ready",
          opened: true,
          openedAt: "2024-09-03T15:45:00.000Z",
          clicked: true,
          clickedAt: "2024-09-03T16:00:00.000Z"
        }
      },
      {
        _id: "comm_2",
        type: "sms",
        direction: "inbound",
        content: "Thanks for the estimate! Looks great. When can we schedule the start date?",
        timestamp: "2024-09-03T16:15:00.000Z",
        status: "delivered",
        provider: "twilio",
        externalId: "twilio_sms_456",
        cost: 0.0075
      },
      {
        _id: "comm_3",
        type: "email",
        direction: "outbound",
        subject: "Re: Schedule start date",
        content: "Great to hear you're ready to proceed! I can schedule you for the week of September 16th. Would Monday the 16th work as a start date?",
        timestamp: "2024-09-03T16:30:00.000Z",
        status: "sent",
        provider: "sendgrid",
        externalId: "sg_message_789",
        cost: 0.02,
        metadata: {
          threadId: "thread_schedule_discussion",
          inReplyTo: "comm_2"
        }
      },
      {
        _id: "comm_4",
        type: "call",
        direction: "outbound",
        subject: "Follow-up call - Project timeline",
        content: "Discussed project timeline and material delivery schedules. Client confirmed September 16th start date works well.",
        timestamp: "2024-09-02T10:30:00.000Z",
        status: "completed",
        provider: "twilio",
        cost: 0.12,
        metadata: {
          duration: 420,
          recordingUrl: "/recordings/call_timeline_discussion.mp3",
          callSid: "CA_twilio_call_001"
        }
      },
      {
        _id: "comm_5",
        type: "system",
        direction: "outbound",
        subject: "Estimate viewed",
        content: "Client viewed the kitchen remodel estimate PDF",
        timestamp: "2024-09-03T16:00:00.000Z",
        status: "delivered",
        provider: "system",
        metadata: {
          documentId: "est_1",
          viewDuration: 180,
          downloadCount: 1
        }
      }
    ];

    return NextResponse.json(mockCommunications);
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

    const response = await fetch(`${BACKEND_URL}/api/clients/${params.id}/communications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create communication' },
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
