import { NextRequest, NextResponse } from 'next/server';

// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourcrm.com';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, content, contactId } = await request.json();

    if (!SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      );
    }

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, content' },
        { status: 400 }
      );
    }

    // SendGrid API call
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: FROM_EMAIL, name: 'CRM System' },
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">CRM Message</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
                  <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">${content}</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    This message was sent from your CRM system.
                    Contact ID: ${contactId}
                  </p>
                </div>
              </div>
            `,
          },
        ],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      }),
    });

    if (!sendGridResponse.ok) {
      const errorData = await sendGridResponse.text();
      console.error('SendGrid error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the notification for tracking
    console.log(`Email sent to ${to} for contact ${contactId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
