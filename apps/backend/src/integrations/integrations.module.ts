import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { IntegrationManagerService } from './integration-manager.service';

@Module({
  imports: [ConfigModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, IntegrationManagerService],
  exports: [IntegrationsService, IntegrationManagerService],
})
export class IntegrationsModule {}
