import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

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
}
