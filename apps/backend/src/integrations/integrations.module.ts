import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { GoogleCalendarService } from './google-calendar.service';
import { IntegrationManagerService } from './integration-manager.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, IntegrationManagerService, GoogleCalendarService],
  exports: [IntegrationsService, IntegrationManagerService, GoogleCalendarService],
})
export class IntegrationsModule {}
