import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estimate, EstimateSchema } from './schemas/estimate.schema';
import { EstimatesService } from './estimates.service';
import { EmailService } from '../services/email.service';
import { EstimatesController } from './estimates.controller';
import { AIEstimateService } from './ai-estimate.service';
import { AIEstimateController } from './ai-estimate.controller';
import { PriceItem, PriceItemSchema } from '../pricing/schemas/price-item.schema';
import { InvoicesModule } from '../invoices/invoices.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Estimate.name, schema: EstimateSchema },
      { name: PriceItem.name, schema: PriceItemSchema },
    ]),
    // Needed so EstimatesController can inject InvoicesService for conversions
    InvoicesModule,
    // Needed for AI services
    AiModule,
  ],
  providers: [EstimatesService, AIEstimateService, EmailService],
  controllers: [EstimatesController, AIEstimateController],
  exports: [EstimatesService, AIEstimateService]
})
export class EstimatesModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

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
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;
  private useSendGrid: boolean = false;
  private useSendGridAPI: boolean = false;

  constructor(private configService: ConfigService) {
    this.setupTransporter();
  }

  private setupTransporter() {
    // First try SendGrid Web API
    const sendGridApiKey = this.configService.get('SENDGRID_API_KEY');
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
      this.isConfigured = true;
      this.useSendGridAPI = true;
      return;
    }
    // Fallback to generic SMTP
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: port === '465',
        auth: { user, pass },
      });
      this.isConfigured = true;
    } else {
      this.isConfigured = false;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        console.log('Email simulation:', {
          to: options.to,
          subject: options.subject,
          content: options.html || options.text,
          attachments: options.attachments,
        });
        return true; // Simulate success for development
      }

      if (this.useSendGridAPI) {
        // Use SendGrid Web API
        const fromEmail = options.from ||
          this.configService.get('SENDGRID_FROM_EMAIL') ||
          this.configService.get('SMTP_FROM') ||
          'noreply@crmapp.com';
        const fromName = this.configService.get('SENDGRID_FROM_NAME') || 'Remodely CRM';
        const msg: any = {
          to: options.to,
          from: {
            email: fromEmail,
            name: fromName,
          },
          subject: options.subject,
          html: options.html,
          text: options.text,
        };
        if (options.attachments) {
          msg.attachments = options.attachments.map(att => ({
            content: att.content.toString('base64'),
            filename: att.filename,
            type: 'application/pdf',
            disposition: 'attachment',
          }));
        }
        const result = await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid API:', result[0].statusCode);
        return true;
      } else {
        // Use SMTP fallback
        const fromAddress = options.from || this.configService.get('SMTP_FROM') || 'noreply@crmapp.com';
        const mailOptions: any = {
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        };
        if (options.attachments) {
          mailOptions.attachments = options.attachments;
        }
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully via SMTP:', result.messageId);
        return true;
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  get configured(): boolean {
    return this.isConfigured;
  }
}
