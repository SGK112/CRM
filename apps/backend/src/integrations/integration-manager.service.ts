import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IntegrationConfig {
  name: string;
  type: 'email' | 'sms' | 'payment' | 'storage' | 'social';
  isConfigured: boolean;
  requiresUserAuth: boolean;
  setupInstructions?: string;
  connectUrl?: string;
}

@Injectable()
export class IntegrationManagerService {
  private readonly logger = new Logger(IntegrationManagerService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Get available integrations with their setup status
   * This shows users what they can connect without technical jargon
   */
  async getAvailableIntegrations(userId: string) {
    // Return user-friendly integrations that don't require technical setup
    const userIntegrations = await this.getUserIntegrations(userId);

    return [
      {
        name: 'Gmail',
        type: 'email',
        isConfigured: userIntegrations.email?.provider === 'gmail',
        requiresUserAuth: true,
        setupInstructions:
          'Send professional emails directly from your existing Gmail account. One-click connection - no passwords or technical setup required.',
        connectUrl: '/api/integrations/email/connect/gmail',
      },
      {
        name: 'Outlook',
        type: 'email',
        isConfigured: userIntegrations.email?.provider === 'outlook',
        requiresUserAuth: true,
        setupInstructions:
          'Send emails through your Outlook account directly from the CRM. Simple one-click authorization.',
        connectUrl: '/api/integrations/email/connect/outlook',
      },
      {
        name: 'Text Messaging',
        type: 'sms',
        isConfigured: true, // We handle this with master account - always available
        requiresUserAuth: false,
        setupInstructions:
          'Send appointment reminders and updates via text message. Ready to use immediately - no setup required!',
      },
      {
        name: 'Credit Card Processing',
        type: 'payment',
        isConfigured: userIntegrations.payment?.provider === 'stripe',
        requiresUserAuth: true,
        setupInstructions:
          'Accept credit card payments directly through the CRM. Connect your business bank account in one step.',
        connectUrl: '/api/integrations/stripe/connect',
      },
      {
        name: 'Project Photos',
        type: 'storage',
        isConfigured: true, // We handle this with master account - always available
        requiresUserAuth: false,
        setupInstructions:
          'Store unlimited project photos securely in the cloud. Ready to use immediately - no setup required!',
      },
    ];
  }

  /**
   * Get user's connected integrations status
   */
  private async getUserIntegrations(userId: string) {
    // TODO: Query database for user's connected integrations
    // For now, simulate that no integrations are connected
    return {
      email: {
        isConfigured: false,
        provider: null,
      },
      payment: {
        isConfigured: false,
        provider: null,
      },
      storage: {
        isConfigured: true, // We provide this via master account
        provider: 'cloudinary',
      },
      sms: {
        isConfigured: true, // We provide this via master account
        provider: 'twilio',
      },
    };
  }

  /**
   * Get integration status for communications
   * This determines what communication methods are available
   */
  async getCommunicationCapabilities(userId: string) {
    const userEmailConfig = await this.getUserEmailConfig(userId);
    const systemEmailConfig = this.getSystemEmailConfig();
    const smsConfig = this.getSystemSmsConfig();

    return {
      email: {
        available: userEmailConfig.isConfigured || systemEmailConfig.isConfigured,
        method: userEmailConfig.isConfigured ? 'user_account' : 'system_account',
        provider: userEmailConfig.provider || 'system',
      },
      sms: {
        available: smsConfig.isConfigured,
        method: 'system_account',
        provider: 'twilio',
      },
      recommendedSetup: this.getRecommendedSetup(userEmailConfig, systemEmailConfig, smsConfig),
    };
  }

  private async getUserEmailConfig(userId: string) {
    // TODO: Check if user has connected Gmail/Outlook
    return {
      isConfigured: false,
      provider: null,
    };
  }

  private getSystemEmailConfig() {
    // Check if the CRM has system-wide email configured
    const hasSystemEmail =
      this.configService.get('SMTP_HOST') && this.configService.get('SMTP_USER');

    return {
      isConfigured: hasSystemEmail,
      provider: hasSystemEmail ? 'system_smtp' : null,
    };
  }

  private getSystemSmsConfig() {
    // Check if the CRM has system-wide SMS configured
    const hasSystemSms =
      this.configService.get('TWILIO_ACCOUNT_SID') && this.configService.get('TWILIO_AUTH_TOKEN');

    return {
      isConfigured: hasSystemSms,
      provider: hasSystemSms ? 'twilio' : null,
    };
  }

  private getRecommendedSetup(userEmail: any, systemEmail: any, sms: any) {
    const recommendations = [];

    if (!userEmail.isConfigured && !systemEmail.isConfigured) {
      recommendations.push({
        type: 'email',
        priority: 'high',
        title: 'Connect your email',
        description: 'Connect Gmail or Outlook to send professional emails to clients',
        action: 'Connect Email Account',
        actionUrl: '/integrations/email/connect',
      });
    }

    if (!sms.isConfigured) {
      recommendations.push({
        type: 'sms',
        priority: 'medium',
        title: 'Enable text messaging',
        description: 'Send appointment reminders and updates via text',
        action: 'Contact Support',
        actionUrl: '/support/sms-setup',
      });
    }

    return recommendations;
  }

  /**
   * Handle OAuth callback for email providers
   */
  async handleEmailOAuthCallback(provider: 'gmail' | 'outlook', code: string, userId: string) {
    this.logger.log(`Handling ${provider} OAuth callback for user ${userId}`);

    try {
      switch (provider) {
        case 'gmail':
          return await this.connectGmail(code, userId);
        case 'outlook':
          return await this.connectOutlook(code, userId);
        default:
          throw new Error(`Unsupported email provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to connect ${provider}:`, error);
      throw error;
    }
  }

  private async connectGmail(code: string, userId: string) {
    // TODO: Implement Gmail OAuth flow
    // 1. Exchange code for access token
    // 2. Store encrypted tokens in user record
    // 3. Validate connection by sending test email

    this.logger.log(`Gmail connection simulated for user ${userId}`);
    return {
      success: true,
      provider: 'gmail',
      message: 'Gmail connected successfully',
    };
  }

  private async connectOutlook(code: string, userId: string) {
    // TODO: Implement Outlook OAuth flow
    // 1. Exchange code for access token
    // 2. Store encrypted tokens in user record
    // 3. Validate connection by sending test email

    this.logger.log(`Outlook connection simulated for user ${userId}`);
    return {
      success: true,
      provider: 'outlook',
      message: 'Outlook connected successfully',
    };
  }
}
