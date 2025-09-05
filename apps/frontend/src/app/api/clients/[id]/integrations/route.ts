import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock integrations status with comprehensive connection details
    const mockIntegrations = {
      sendgrid: {
        connected: true,
        contactId: "sg_contact_123",
        lastSync: new Date(Date.now() - 3600000).toISOString(),
        emailsSent: 24,
        status: "active",
        apiKeyValid: true,
        lastEmailSent: new Date(Date.now() - 7200000).toISOString(),
        suppressionStatus: "none",
        emailVerified: true
      },
      twilio: {
        connected: true,
        phoneVerified: true,
        lastSms: new Date(Date.now() - 86400000).toISOString(),
        smsCount: 12,
        voiceCallsCount: 8,
        accountSid: "AC1234567890",
        phoneNumber: "+15551234567",
        status: "active",
        lastCallMade: new Date(Date.now() - 172800000).toISOString(),
        balance: 45.67
      },
      quickbooks: {
        connected: true,
        customerId: "qb_customer_456",
        lastSync: new Date(Date.now() - 1800000).toISOString(),
        syncStatus: "success",
        companyId: "company_789",
        customerStatus: "active",
        lastInvoiceSync: new Date(Date.now() - 3600000).toISOString(),
        estimatesSynced: 5,
        invoicesSynced: 3,
        paymentsSynced: 2
      },
      googleMaps: {
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        verified: true,
        coordinates: { lat: 40.7589, lng: -73.9851 },
        address: "123 Main Street, New York, NY 10001",
        businessStatus: "OPERATIONAL",
        rating: 4.5,
        reviewCount: 23,
        lastVerified: new Date(Date.now() - 604800000).toISOString()
      },
      calendar: {
        connected: true,
        provider: "google",
        calendarId: "primary",
        lastSync: new Date(Date.now() - 900000).toISOString(),
        eventsCount: 15,
        upcomingEvents: 3,
        syncEnabled: true
      },
      stripe: {
        connected: false,
        accountId: null,
        status: "disconnected",
        lastTransaction: null,
        paymentsProcessed: 0
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { integration, action } = body;

    // Mock integration actions
    const result = {
      integration,
      action,
      success: true,
      timestamp: new Date().toISOString(),
      message: `Successfully performed ${action} on ${integration} integration`
    };

    switch (integration) {
      case 'sendgrid':
        if (action === 'sync') {
          result.message = 'Successfully synced contact with SendGrid';
        } else if (action === 'test') {
          result.message = 'Test email sent successfully';
        }
        break;
      case 'twilio':
        if (action === 'verify') {
          result.message = 'Phone number verification initiated';
        } else if (action === 'test') {
          result.message = 'Test SMS sent successfully';
        }
        break;
      case 'quickbooks':
        if (action === 'sync') {
          result.message = 'Customer data synced with QuickBooks';
        }
        break;
      case 'googleMaps':
        if (action === 'verify') {
          result.message = 'Address verified with Google Maps';
        }
        break;
      default:
        result.success = false;
        result.message = 'Unknown integration or action';
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
