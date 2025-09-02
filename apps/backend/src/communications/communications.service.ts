import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { SendEmailDto, SendSmsDto } from './dto/communications.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger('CommunicationsService');
  constructor(
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async getServiceStatus(workspaceId: string) {
    // Check if email and SMS services are configured for this workspace
    const user = await this.userModel.findOne({ workspaceId }).exec();

    const globalEmailConfigured = this.emailService.configured;
    const globalEmailProvider = this.emailService.provider;

    return {
      email: {
        configured:
          globalEmailConfigured || !!(user?.emailConfig?.smtpHost && user?.emailConfig?.smtpUser),
        provider:
          user?.emailConfig?.provider ||
          (globalEmailProvider !== 'none' ? globalEmailProvider : 'Not configured'),
      },
      sms: {
        configured: !!(user?.twilioConfig?.accountSid && user?.twilioConfig?.authToken),
        phoneNumber: user?.twilioConfig?.phoneNumber || 'Not configured',
      },
    };
  }

  async sendEmail(sendEmailDto: SendEmailDto, workspaceId: string, userId: string) {
    try {
      // Get client details
      const client = await this.clientModel.findById(sendEmailDto.clientId).exec();
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      // Get user details for sender info
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Prepare email data
      const emailData = {
        to: client.email,
        subject: sendEmailDto.subject,
        html: this.formatEmailBody(sendEmailDto.message, user, client),
        from: user.emailConfig?.fromEmail || user.email,
        replyTo: user.email,
      };

      // Send email
      const result = await this.emailService.sendEmail(emailData);

      // Log communication (you might want to create a communications log schema)
      await this.logCommunication({
        type: 'email',
        clientId: sendEmailDto.clientId,
        userId,
        workspaceId,
        subject: sendEmailDto.subject,
        message: sendEmailDto.message,
        sentAt: new Date(),
        status: result ? 'sent' : 'failed',
      });

      return {
        success: result,
        message: result
          ? 'Email sent successfully'
          : 'Failed to send email (provider not configured or error)',
      };
    } catch (error) {
      this.logger.error('Email sending error', error?.stack || String(error));
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendSms(sendSmsDto: SendSmsDto, workspaceId: string, userId: string) {
    try {
      // Get client details
      const client = await this.clientModel.findById(sendSmsDto.clientId).exec();
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      if (!client.phone) {
        throw new BadRequestException('Client does not have a phone number');
      }

      // Get user details for Twilio config
      const user = await this.userModel.findById(userId).exec();
      if (!user?.twilioConfig?.accountSid) {
        throw new BadRequestException('Twilio not configured for this user');
      }

      // Send SMS
      const result = await this.twilioService.sendSMS(client.phone, sendSmsDto.message);

      // Log communication
      await this.logCommunication({
        type: 'sms',
        clientId: sendSmsDto.clientId,
        userId,
        workspaceId,
        message: sendSmsDto.message,
        sentAt: new Date(),
        status: result ? 'sent' : 'failed',
      });

      return {
        success: result,
        message: result ? 'SMS sent successfully' : 'Failed to send SMS',
      };
    } catch (error) {
      this.logger.error('SMS sending error', error?.stack || String(error));
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }

  async sendTemplatedEmail(
    data: {
      type: 'appointment' | 'estimate' | 'followup';
      clientId: string;
      clientName?: string;
      appointmentDate?: Date;
      appointmentType?: string;
      location?: string;
      notes?: string;
      estimateNumber?: string;
      estimateAmount?: number;
      subject?: string;
      message?: string;
      callNotes?: string;
    },
    workspaceId: string
  ) {
    // userId is reserved for future per-user template selection and audit logging
    // Implementation for templated emails (appointments, estimates, etc.)
    // This would use the existing EmailService templates
    try {
      const { type, clientId, ...templateData } = data;

      const client = await this.clientModel
        .findOne({
          _id: clientId,
          workspaceId: workspaceId,
        })
        .exec();
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      let result: boolean;
      switch (type) {
        case 'appointment':
          if (!templateData.appointmentDate || !templateData.appointmentType) {
            throw new BadRequestException(
              'Missing appointmentDate or appointmentType for appointment email'
            );
          }
          result = await this.emailService.sendAppointmentConfirmation({
            clientEmail: client.email,
            clientName: templateData.clientName || `${client.firstName} ${client.lastName}`.trim(),
            appointmentDate: templateData.appointmentDate,
            appointmentType: templateData.appointmentType,
            location: templateData.location,
            notes: templateData.notes,
          });
          break;
        case 'estimate':
          if (!templateData.estimateNumber || typeof templateData.estimateAmount !== 'number') {
            throw new BadRequestException(
              'Missing estimateNumber or estimateAmount for estimate email'
            );
          }
          result = await this.emailService.sendEstimateFollowUp({
            clientEmail: client.email,
            clientName: templateData.clientName || `${client.firstName} ${client.lastName}`.trim(),
            estimateNumber: templateData.estimateNumber,
            estimateAmount: templateData.estimateAmount,
            callNotes: templateData.callNotes,
          });
          break;
        case 'followup':
          if (!templateData.subject || !templateData.message) {
            throw new BadRequestException('Missing subject or message for followup email');
          }
          result = await this.emailService.sendGeneralFollowUp({
            clientEmail: client.email,
            clientName: templateData.clientName || `${client.firstName} ${client.lastName}`.trim(),
            subject: templateData.subject,
            message: templateData.message,
            callNotes: templateData.callNotes,
          });
          break;
        default:
          throw new BadRequestException('Invalid email template type');
      }

      return {
        success: result,
        message: result ? 'Templated email sent successfully' : 'Failed to send templated email',
      };
    } catch (error) {
      this.logger.error('Templated email error', error?.stack || String(error));
      throw new InternalServerErrorException('Failed to send templated email');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatEmailBody(message: string, user: any, client: any): string {
    // Format the email with signature and professional layout
    const signatureHtml =
      user.emailSignatureHtml ||
      (user.emailSignatureText ? user.emailSignatureText.replace(/\n/g, '<br>') : '');
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p>Dear ${client.firstName} ${client.lastName},</p>
          
          <div style="margin: 20px 0; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0;"><strong>${user.firstName} ${user.lastName}</strong></p>
            <p style="margin: 5px 0; color: #6c757d;">${user.email}</p>
            <p style="margin: 0; color: #6c757d;">${user.phone || ''}</p>
      ${signatureHtml ? `<div style="margin-top: 12px; color: #374151;">${signatureHtml}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async logCommunication(data: any) {
    // This would save to a communications log collection
    // For now, just console.log - you can implement proper logging later
    this.logger.debug(`Communication logged: ${JSON.stringify(data)}`);
  }

  async sendTestEmail(testEmail: string, userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const emailData = {
        to: testEmail,
        subject: 'Test Email from CRM',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Test Email</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <p>Sent from your CRM system.</p>
          </div>
        `,
        from: user.emailConfig?.fromEmail || user.email,
      };

      const result = await this.emailService.sendEmail(emailData);

      return {
        success: result,
        message: result ? 'Test email sent successfully' : 'Failed to send test email',
      };
    } catch (error) {
      this.logger.error('Test email error', error?.stack || String(error));
      throw new InternalServerErrorException('Failed to send test email');
    }
  }

  async sendTestSms(testPhone: string, userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user?.twilioConfig?.accountSid) {
        throw new BadRequestException('Twilio not configured for this user');
      }

      const result = await this.twilioService.sendSMS(
        testPhone,
        'This is a test SMS from your CRM system to verify your Twilio configuration is working correctly.'
      );

      return {
        success: result,
        message: result ? 'Test SMS sent successfully' : 'Failed to send test SMS',
      };
    } catch (error) {
      this.logger.error('Test SMS error', error?.stack || String(error));
      throw new InternalServerErrorException('Failed to send test SMS');
    }
  }
}
