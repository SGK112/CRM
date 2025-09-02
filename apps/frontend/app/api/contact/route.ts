import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      inquiryType,
      message,
      newsletter,
      source,
      page,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !inquiryType || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    const inquiryData = {
      firstName,
      lastName,
      email,
      phone: phone || null,
      company: company || null,
      inquiryType,
      message,
      newsletter: newsletter || false,
      source: source || 'contact_form',
      page: page || 'contact',
      submittedAt: new Date().toISOString(),
      ipAddress:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation email to user
    // 3. Send notification to appropriate team
    // 4. Add to mailing list if newsletter was checked
    // 5. Integrate with CRM system

    console.log('Contact Form Submission:', inquiryData);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate sending emails
    await sendInquiryEmails(inquiryData);

    // Generate inquiry ID
    const inquiryId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      message: 'Message sent successfully',
      inquiryId,
      status: 'received',
      estimatedResponse: getEstimatedResponseTime(inquiryType),
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

// Simulate email sending function
async function sendInquiryEmails(inquiryData: any) {
  console.log('Sending confirmation email to:', inquiryData.email);
  console.log('Sending notification to team for:', inquiryData.inquiryType);

  // In production, implement actual email sending logic here
  /*
  // Send confirmation email to user
  await emailService.send({
    to: inquiryData.email,
    subject: 'We received your message - Remodely CRM',
    template: 'inquiry-confirmation',
    data: inquiryData
  })

  // Send notification to appropriate team
  const teamEmail = getTeamEmail(inquiryData.inquiryType)
  await emailService.send({
    to: teamEmail,
    subject: `New ${inquiryData.inquiryType} inquiry from ${inquiryData.firstName} ${inquiryData.lastName}`,
    template: 'new-inquiry-notification',
    data: inquiryData
  })
  */
}

function getTeamEmail(inquiryType: string): string {
  const emailMap: { [key: string]: string } = {
    sales: 'sales@remodely.com',
    support: 'support@remodely.com',
    partnership: 'partnerships@remodely.com',
    press: 'press@remodely.com',
    other: 'hello@remodely.com',
  };

  return emailMap[inquiryType] || 'hello@remodely.com';
}

function getEstimatedResponseTime(inquiryType: string): string {
  const responseMap: { [key: string]: string } = {
    sales: 'within 1 hour during business hours',
    support: 'within 4 hours',
    partnership: 'within 24-48 hours',
    press: 'within 24 hours',
    other: 'within 24 hours',
  };

  return responseMap[inquiryType] || 'within 24 hours';
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
