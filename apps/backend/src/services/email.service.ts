import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    this.setupTransporter();
  }

  private setupTransporter() {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: port === '465',
        auth: {
          user,
          pass,
        },
      });
      this.isConfigured = true;
    } else {
      console.log('Email service not configured - running in simulation mode');
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
  }): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('Email simulation:', {
          to: options.to,
          subject: options.subject,
          content: options.html || options.text
        });
        return true; // Simulate success for development
      }

      const fromAddress = options.from || this.configService.get('SMTP_FROM') || 'noreply@crmapp.com';
      
      const result = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation(options: {
    clientEmail: string;
    clientName: string;
    appointmentDate: Date;
    appointmentType: string;
    location?: string;
    notes?: string;
  }): Promise<boolean> {
    const { clientEmail, clientName, appointmentDate, appointmentType, location, notes } = options;
    
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Hi ${clientName},</p>
        <p>Your appointment has been confirmed for:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Appointment Details</h3>
          <p><strong>Type:</strong> ${appointmentType}</p>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>If you need to reschedule or cancel this appointment, please contact us as soon as possible.</p>
        <p>We look forward to seeing you!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent automatically by our voice agent system.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject: `Appointment Confirmation - ${formattedDate}`,
      html
    });
  }

  async sendEstimateFollowUp(options: {
    clientEmail: string;
    clientName: string;
    estimateNumber: string;
    estimateAmount: number;
    callNotes?: string;
  }): Promise<boolean> {
    const { clientEmail, clientName, estimateNumber, estimateAmount, callNotes } = options;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Estimate Follow-up</h2>
        <p>Hi ${clientName},</p>
        <p>Thank you for speaking with us today about your project.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Estimate Summary</h3>
          <p><strong>Estimate #:</strong> ${estimateNumber}</p>
          <p><strong>Total Amount:</strong> $${estimateAmount.toFixed(2)}</p>
          ${callNotes ? `<p><strong>Discussion Notes:</strong> ${callNotes}</p>` : ''}
        </div>
        
        <p>Please review the estimate and let us know if you have any questions or would like to proceed with the project.</p>
        <p>We're here to help make your vision a reality!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent following our phone conversation.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject: `Estimate Follow-up - ${estimateNumber}`,
      html
    });
  }

  async sendGeneralFollowUp(options: {
    clientEmail: string;
    clientName: string;
    subject: string;
    message: string;
    callNotes?: string;
  }): Promise<boolean> {
    const { clientEmail, clientName, subject, message, callNotes } = options;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${subject}</h2>
        <p>Hi ${clientName},</p>
        <p>${message}</p>
        
        ${callNotes ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Call Notes</h3>
            <p>${callNotes}</p>
          </div>
        ` : ''}
        
        <p>Please don't hesitate to contact us if you have any questions.</p>
        <p>Best regards,<br>Your Project Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent following our phone conversation.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      html
    });
  }

  get configured(): boolean {
    return this.isConfigured;
  }
}
