import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private logger = new Logger('TwilioService');
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken && /^AC[0-9a-fA-F]{32}$/.test(accountSid)) {
      this.client = twilio(accountSid, authToken);
    } else if (accountSid || authToken) {
      this.logger.warn('Twilio credentials present but invalid format; running in simulation mode.');
    }
  }

  get isConfigured(): boolean {
    return !!this.client && !!this.fromNumber;
  }

  get from(): string | undefined {
    return this.fromNumber;
  }

  async createOutboundCall(
    to: string,
    webhookUrl: string
  ): Promise<{ sid: string } | { error: string }> {
    if (!this.client || !this.fromNumber) {
      return { error: 'Twilio not configured' };
    }

    const result = await this.client.calls.create({
      to,
      from: this.fromNumber,
      url: webhookUrl,
    });
    return { sid: result.sid };
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.client) {
        this.logger.log('🔧 Twilio not configured - SMS simulation mode');
        this.logger.log(`📱 Simulated SMS to ${to}: ${message}`);
        return true; // Simulate success for development
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      this.logger.log('✅ SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send SMS:', error);
      return false;
    }
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your CRM password reset code is: ${code}. This code expires in 10 minutes.`;

    if (!this.client) {
      this.logger.log('🔧 Twilio not configured - SMS simulation mode');
      this.logger.log(`📱 Simulated SMS to ${phoneNumber}: ${message}`);
      this.logger.log(`🔑 Reset Code: ${code}`);
      // Return true for development to simulate successful SMS
      return true;
    }

    return this.sendSMS(phoneNumber, message);
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your CRM verification code is: ${code}. This code expires in 10 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  generateRandomCode(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
}
