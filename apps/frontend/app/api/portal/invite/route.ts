import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface InvitationRequest {
  clientId: string;
  clientName: string;
  clientEmail: string;
  invitedBy: string;
  permissions: string[];
  expiresInDays: number;
  customMessage: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InvitationRequest = await request.json();
    
    const {
      clientId,
      clientName,
      clientEmail,
      invitedBy,
      permissions,
      expiresInDays,
      customMessage
    } = body;

    // Validate required fields
    if (!clientId || !clientEmail || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, clientEmail, clientName' },
        { status: 400 }
      );
    }

    // Generate a unique invitation token
    const invitationToken = crypto.randomUUID();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);

    // Create invitation record (in real implementation, save to database)
    const invitation = {
      id: crypto.randomUUID(),
      token: invitationToken,
      clientId,
      clientName,
      clientEmail,
      invitedBy,
      permissions,
      expiresAt: expirationDate.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      usedAt: null
    };

    // Generate invitation link for universal portal
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const clientPortalId = `client-${Date.now()}`; // In production, use actual client ID
    const inviteLink = `${baseUrl}/portal?client=${clientPortalId}&token=${invitationToken}`;
    const passwordProtectedLink = `${baseUrl}/portal?client=${clientPortalId}`;

    // Store the client portal password (in production, hash this)
    const portalPassword = `portal${Math.random().toString(36).slice(2, 8)}`;
    
    // In a real implementation:
    // 1. Save invitation to database
    // 2. Save client portal password securely
    // 3. Send email using your email service (SendGrid, Mailgun, etc.)
    // 4. Log the invitation activity

    // Mock email sending
    const emailContent = {
      to: clientEmail,
      subject: `You're invited to your Client Portal - ${clientName}`,
      body: `
${customMessage}

ACCESS YOUR PORTAL:

Option 1 - Direct Link (expires in ${body.expiresInDays} days):
${inviteLink}

Option 2 - Password Protected Access:
Portal URL: ${passwordProtectedLink}
Password: ${portalPassword}

This invitation will expire on ${expirationDate.toLocaleDateString()}.

Best regards,
Your Project Team
      `.trim()
    };

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      inviteLink,
      passwordProtectedLink,
      portalPassword,
      invitation: {
        id: invitation.id,
        clientEmail,
        clientPortalId,
        expiresAt: invitation.expiresAt,
        permissions
      },
      emailContent // For demo purposes, remove in production
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
