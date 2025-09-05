import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Return mock integrations status for client: ${params.id}
    const mockIntegrations = {
      sendgrid: {
        connected: true,
        contactId: "sg_" + params.id,
        lastSync: "2024-09-04T12:00:00.000Z",
        emailsSent: 15,
        status: "active",
        listIds: ["list_main", "list_prospects"]
      },
      twilio: {
        connected: true,
        phoneVerified: true,
        lastSms: "2024-09-03T14:30:00.000Z",
        smsCount: 8,
        status: "active",
        phoneNumber: "+1234567890"
      },
      quickbooks: {
        connected: true,
        customerId: "qb_customer_" + params.id,
        lastSync: "2024-09-04T08:00:00.000Z",
        syncStatus: "success" as const,
        companyId: "qb_company_123",
        accountingData: {
          totalInvoiced: 125000,
          totalPaid: 98000,
          outstanding: 27000
        }
      },
      googleMaps: {
        placeId: "ChIJ" + params.id,
        verified: true,
        coordinates: { lat: 39.7817, lng: -89.6501 },
        businessHours: {
          monday: "9:00 AM - 5:00 PM",
          tuesday: "9:00 AM - 5:00 PM",
          wednesday: "9:00 AM - 5:00 PM",
          thursday: "9:00 AM - 5:00 PM",
          friday: "9:00 AM - 5:00 PM",
          saturday: "Closed",
          sunday: "Closed"
        }
      },
      calendar: {
        googleCalendar: {
          connected: true,
          calendarId: "primary",
          lastSync: "2024-09-04T10:00:00.000Z",
          upcomingEvents: 3
        },
        outlook: {
          connected: false
        }
      },
      notifications: {
        push: {
          enabled: true,
          deviceTokens: ["device_token_123"]
        },
        webhook: {
          enabled: true,
          url: "https://client-webhook.example.com/updates",
          lastTriggered: "2024-09-04T11:30:00.000Z"
        }
      }
    };

    return NextResponse.json(mockIntegrations);
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
    const body = await request.json();

    // Mock updating integration settings
    const updatedIntegration = {
      integration: body.integration,
      settings: body.settings,
      clientId: params.id,
      updatedAt: new Date().toISOString(),
      status: "updated"
    };

    return NextResponse.json(updatedIntegration);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
