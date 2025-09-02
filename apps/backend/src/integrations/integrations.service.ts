import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export interface IntegrationConfig {
  enabled: boolean;
  credentials: Record<string, string>;
}

@Injectable()
export class IntegrationsService {
  constructor(private configService: ConfigService) {}

  getGoogleConfig(): IntegrationConfig {
    return {
      enabled: !!(
        this.configService.get('GOOGLE_CLIENT_ID') && this.configService.get('GOOGLE_CLIENT_SECRET')
      ),
      credentials: {
        clientId: this.configService.get('GOOGLE_CLIENT_ID', ''),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
        redirectUri: this.configService.get('GOOGLE_REDIRECT_URI', ''),
      },
    };
  }

  getStripeConfig(): IntegrationConfig {
    return {
      enabled: !!(
        this.configService.get('STRIPE_SECRET_KEY') &&
        this.configService.get('STRIPE_PUBLISHABLE_KEY')
      ),
      credentials: {
        secretKey: this.configService.get('STRIPE_SECRET_KEY', ''),
        publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY', ''),
        webhookSecret: this.configService.get('STRIPE_WEBHOOK_SECRET', ''),
      },
    };
  }

  getTwilioConfig(): IntegrationConfig {
    return {
      enabled: !!(
        this.configService.get('TWILIO_ACCOUNT_SID') && this.configService.get('TWILIO_AUTH_TOKEN')
      ),
      credentials: {
        accountSid: this.configService.get('TWILIO_ACCOUNT_SID', ''),
        authToken: this.configService.get('TWILIO_AUTH_TOKEN', ''),
        phoneNumber: this.configService.get('TWILIO_PHONE_NUMBER', ''),
      },
    };
  }

  getCloudinaryConfig(): IntegrationConfig {
    return {
      enabled: !!(
        this.configService.get('CLOUDINARY_CLOUD_NAME') &&
        this.configService.get('CLOUDINARY_API_KEY')
      ),
      credentials: {
        cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME', ''),
        apiKey: this.configService.get('CLOUDINARY_API_KEY', ''),
        apiSecret: this.configService.get('CLOUDINARY_API_SECRET', ''),
      },
    };
  }

  getSendGridConfig(): IntegrationConfig {
    return {
      enabled: !!this.configService.get('SENDGRID_API_KEY'),
      credentials: {
        apiKey: this.configService.get('SENDGRID_API_KEY', ''),
        fromEmail: this.configService.get('SENDGRID_FROM_EMAIL', ''),
        fromName: this.configService.get('SENDGRID_FROM_NAME', ''),
      },
    };
  }

  getOpenAIConfig(): IntegrationConfig {
    return {
      enabled: !!this.configService.get('OPENAI_API_KEY'),
      credentials: {
        apiKey: this.configService.get('OPENAI_API_KEY', ''),
      },
    };
  }

  getAllIntegrations() {
    return {
      google: this.getGoogleConfig(),
      stripe: this.getStripeConfig(),
      twilio: this.getTwilioConfig(),
      cloudinary: this.getCloudinaryConfig(),
      sendgrid: this.getSendGridConfig(),
      openai: this.getOpenAIConfig(),
    };
  }

  getIntegrationStatus() {
    const integrations = this.getAllIntegrations();
    return Object.entries(integrations).map(([name, config]) => ({
      name,
      enabled: config.enabled,
      configured: config.enabled && Object.values(config.credentials).every(val => val !== ''),
    }));
  }
}
