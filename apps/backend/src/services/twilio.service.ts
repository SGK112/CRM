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

    // Skip configuration if using placeholder values
    if (accountSid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || 
        authToken === 'your-twilio-auth-token-here' ||
        !accountSid || !authToken) {
      this.logger.log('🔧 Twilio credentials not provided - running in simulation mode');
      return;
    }

    // Updated regex to handle both 30 and 32 character Account SIDs
    if (/^AC[0-9a-fA-F]{30,34}$/.test(accountSid)) {
      try {
        this.client = twilio(accountSid, authToken);
        
        // Verify the phone number format
        if (this.fromNumber && !/^\+\d{10,15}$/.test(this.fromNumber)) {
          this.logger.warn(`⚠️  Invalid Twilio phone number format: ${this.fromNumber}. Should be +1234567890`);
          this.fromNumber = undefined;
        }
        
        this.logger.log('✅ Twilio client initialized successfully');
        if (this.fromNumber) {
          this.logger.log(`📱 Twilio phone number configured: ${this.fromNumber}`);
        } else {
          this.logger.warn('⚠️  Twilio phone number not configured');
        }
      } catch (error) {
        this.logger.error('❌ Failed to initialize Twilio client:', error);
      }
    } else {
      this.logger.warn('⚠️  Invalid Twilio Account SID format; running in simulation mode.');
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
      // Validate phone number format
      if (!to || !/^\+\d{10,15}$/.test(to)) {
        this.logger.error(`❌ Invalid phone number format: ${to}. Should be +1234567890`);
        return false;
      }

      if (!this.client || !this.fromNumber) {
        this.logger.log('🔧 Twilio not configured - SMS simulation mode');
        this.logger.log(`📱 Simulated SMS to ${to}: ${message}`);
        return true; // Simulate success for development
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      this.logger.log(`✅ SMS sent successfully to ${to} - SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your CRM password reset code is: ${code}. This code expires in 10 minutes.`;

    if (!this.client || !this.fromNumber) {
      this.logger.log('🔧 Twilio not configured - SMS simulation mode');
      this.logger.log(`📱 Simulated password reset SMS to ${phoneNumber}: ${message}`);
      this.logger.log(`🔑 Reset Code: ${code}`);
      return true; // Return true for development to simulate successful SMS
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
