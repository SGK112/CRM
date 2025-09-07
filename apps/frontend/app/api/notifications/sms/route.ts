import { NextRequest, NextResponse } from 'next/server';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: NextRequest) {
  try {
    const { to, message, contactId } = await request.json();

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // Twilio API call
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: `${message}\n\n--\nSent from CRM System\nContact ID: ${contactId}`,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json();
      return NextResponse.json(
        { error: 'Failed to send SMS', details: errorData },
        { status: 500 }
      );
    }

    const twilioData = await twilioResponse.json();

    return NextResponse.json({ 
      success: true, 
      message: 'SMS sent successfully',
      messageId: twilioData.sid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
