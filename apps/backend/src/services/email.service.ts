import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private transporter?: nodemailer.Transporter;
  private isConfigured = false;
  private useSendGridAPI = false;

  constructor(private readonly configService: ConfigService) {
    this.setupTransporter();
  }

  private setupTransporter() {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
      this.useSendGridAPI = true;
      this.isConfigured = true;
      return;
    }
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: port === '465',
        auth: { user, pass },
      });
      this.isConfigured = true;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        // Surface a clear warning to avoid masking delivery problems
        // Configure SENDGRID_API_KEY (preferred) or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in env.
        // Optionally set SENDGRID_FROM_EMAIL or SMTP_FROM for the sender address.
        // Returning false ensures callers can surface a helpful error to the UI/logs.
        this.logger.warn(
          '[EmailService] Email provider is not configured. Set SENDGRID_API_KEY or SMTP_* env vars to enable email delivery.'
        );
        return false;
      }

      if (this.useSendGridAPI) {
        const fromEmail =
          options.from ||
          this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
          this.configService.get<string>('SMTP_FROM') ||
          'noreply@crmapp.com';
        const fromName = this.configService.get<string>('SENDGRID_FROM_NAME') || 'Remodely CRM';
        const msg: sgMail.MailDataRequired = {
          to: options.to,
          from: { email: fromEmail, name: fromName },
          subject: options.subject,
          html: options.html,
          text: options.text,
        };
        if (options.attachments?.length) {
          msg.attachments = options.attachments.map(att => ({
            content: att.content.toString('base64'),
            filename: att.filename,
            type: 'application/pdf',
            disposition: 'attachment',
          }));
        }
        await sgMail.send(msg);
        return true;
      }

      if (this.transporter) {
        const from =
          options.from || this.configService.get<string>('SMTP_FROM') || 'noreply@crmapp.com';
        await this.transporter.sendMail({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          attachments: options.attachments,
        } as nodemailer.SendMailOptions);
        return true;
      }

      return false;
    } catch {
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
      timeZoneName: 'short',
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
      html,
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
      html,
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
        ${
          callNotes
            ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Call Notes</h3>
            <p>${callNotes}</p>
          </div>
        `
            : ''
        }
        <p>Please don't hesitate to contact us if you have any questions.</p>
        <p>Best regards,<br>Your Project Team</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent following our phone conversation.</p>
        </div>
      </div>
    `;
    return this.sendEmail({ to: clientEmail, subject, html });
  }

  get configured(): boolean {
    return this.isConfigured;
  }

  get provider(): 'sendgrid' | 'smtp' | 'none' {
    if (this.useSendGridAPI) return 'sendgrid';
    if (this.transporter) return 'smtp';
    return 'none';
  }
}
