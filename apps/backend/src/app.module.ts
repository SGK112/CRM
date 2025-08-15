import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ChatModule } from './chat/chat.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DocumentsModule } from './documents/documents.module';
import { MarketingModule } from './marketing/marketing.module';
import { VoiceAgentModule } from './voice-agent/voice-agent.module';
import { DesignsModule } from './designs/designs.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/remodely-crm'),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    ProjectsModule,
    ClientsModule,
    AppointmentsModule,
    ChatModule,
    IntegrationsModule,
    NotificationsModule,
    DocumentsModule,
  MarketingModule,
  VoiceAgentModule,
  DesignsModule,
  AiModule,
  HealthModule,
  BillingModule,
  ],
})
export class AppModule {}
