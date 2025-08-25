import { Controller, Get, Post, Query, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { IntegrationManagerService } from './integration-manager.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly integrationManager: IntegrationManagerService
  ) {}

  @Get('status')
  getIntegrationStatus() {
    return this.integrationsService.getIntegrationStatus();
  }

  @Get('config')
  getAllIntegrations() {
    const integrations = this.integrationsService.getAllIntegrations();
    
    // Remove sensitive credentials from the response
    return Object.entries(integrations).reduce((acc, [name, config]) => {
      acc[name] = {
        enabled: config.enabled,
        configured: config.enabled && Object.values(config.credentials).every(val => val !== ''),
        fields: Object.keys(config.credentials).map(key => ({
          name: key,
          configured: !!config.credentials[key],
        })),
      };
      return acc;
    }, {} as Record<string, any>);
  }

  // NEW USER-FRIENDLY ENDPOINTS

  @Get('available')
  async getAvailableIntegrations(@Req() req: any) {
    return this.integrationManager.getAvailableIntegrations(req.user.id);
  }

  @Get('communication-status')
  async getCommunicationCapabilities(@Req() req: any) {
    return this.integrationManager.getCommunicationCapabilities(req.user.id);
  }

  @Get('email/connect/:provider')
  async initiateEmailConnection(@Param('provider') provider: 'gmail' | 'outlook') {
    // Return OAuth URL for the provider
    const oauthUrls = {
      gmail: this.buildGmailOAuthUrl(),
      outlook: this.buildOutlookOAuthUrl()
    };

    return {
      provider,
      oauthUrl: oauthUrls[provider],
      instructions: `You will be redirected to ${provider} to authorize email access`
    };
  }

  @Get('email/callback/:provider')
  async handleEmailCallback(
    @Param('provider') provider: 'gmail' | 'outlook',
    @Query('code') code: string,
    @Req() req: any
  ) {
    if (!code) {
      return { success: false, message: 'Authorization code is required' };
    }

    return this.integrationManager.handleEmailOAuthCallback(provider, code, req.user.id);
  }

  @Post('stripe/connect')
  async initiateStripeConnection(@Req() req: any) {
    // Generate Stripe Connect OAuth URL
    const clientId = process.env.STRIPE_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/integrations/stripe/callback`;
    
    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${redirectUri}&state=${req.user.id}`;

    return {
      provider: 'stripe',
      oauthUrl: stripeOAuthUrl,
      instructions: 'You will be redirected to Stripe to connect your payment account'
    };
  }

  private buildGmailOAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/api/integrations/email/callback/gmail`;
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent`;
  }

  private buildOutlookOAuthUrl(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/api/integrations/email/callback/outlook`;
    const scopes = [
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/User.Read'
    ].join(' ');

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&response_mode=query`;
  }
}
