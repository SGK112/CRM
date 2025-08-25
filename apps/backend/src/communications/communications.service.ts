import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { SendEmailDto, SendSmsDto } from './dto/communications.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class CommunicationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getServiceStatus(workspaceId: string) {
    // Check if email and SMS services are configured for this workspace
    const user = await this.userModel.findOne({ workspaceId }).exec();
    
    return {
      email: {
        configured: !!(user?.emailConfig?.smtpHost && user?.emailConfig?.smtpUser),
        provider: user?.emailConfig?.provider || 'Not configured'
      },
      sms: {
        configured: !!(user?.twilioConfig?.accountSid && user?.twilioConfig?.authToken),
        phoneNumber: user?.twilioConfig?.phoneNumber || 'Not configured'
      }
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
        replyTo: user.email
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
        status: 'sent'
      });

      return {
        success: true,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email sending error:', error);
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
      const result = await this.twilioService.sendSMS(
        client.phone,
        sendSmsDto.message
      );

      // Log communication
      await this.logCommunication({
        type: 'sms',
        clientId: sendSmsDto.clientId,
        userId,
        workspaceId,
        message: sendSmsDto.message,
        sentAt: new Date(),
        status: result ? 'sent' : 'failed'
      });

      return {
        success: result,
        message: result ? 'SMS sent successfully' : 'Failed to send SMS'
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }

  async sendTemplatedEmail(data: any, workspaceId: string, userId: string) {
    // Implementation for templated emails (appointments, estimates, etc.)
    // This would use the existing EmailService templates
    try {
      const { type, clientId, ...templateData } = data;
      
      const client = await this.clientModel.findById(clientId).exec();
      if (!client) {
        throw new BadRequestException('Client not found');
      }

      let result;
      switch (type) {
        case 'appointment':
          result = await this.emailService.sendAppointmentConfirmation({
            clientEmail: client.email,
            ...templateData
          });
          break;
        case 'estimate':
          result = await this.emailService.sendEstimateFollowUp({
            clientEmail: client.email,
            ...templateData
          });
          break;
        case 'followup':
          result = await this.emailService.sendGeneralFollowUp({
            clientEmail: client.email,
            ...templateData
          });
          break;
        default:
          throw new BadRequestException('Invalid email template type');
      }

      return {
        success: result,
        message: result ? 'Templated email sent successfully' : 'Failed to send templated email'
      };
    } catch (error) {
      console.error('Templated email error:', error);
      throw new InternalServerErrorException('Failed to send templated email');
    }
  }

  private formatEmailBody(message: string, user: any, client: any): string {
    // Format the email with signature and professional layout
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
          </div>
        </div>
      </div>
    `;
  }

  private async logCommunication(data: any) {
    // This would save to a communications log collection
    // For now, just console.log - you can implement proper logging later
    console.log('Communication logged:', data);
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
        from: user.emailConfig?.fromEmail || user.email
      };

      const result = await this.emailService.sendEmail(emailData);

      return {
        success: result,
        message: result ? 'Test email sent successfully' : 'Failed to send test email'
      };
    } catch (error) {
      console.error('Test email error:', error);
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
        message: result ? 'Test SMS sent successfully' : 'Failed to send test SMS'
      };
    } catch (error) {
      console.error('Test SMS error:', error);
      throw new InternalServerErrorException('Failed to send test SMS');
    }
  }
}
