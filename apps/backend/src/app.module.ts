import { Module } from '@nestjs/common';
import { RootController } from './root.controller';
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
import { VendorsModule } from './vendors/vendors.module';
import { PricingModule } from './pricing/pricing.module';
import { EstimatesModule } from './estimates/estimates.module';
import { CatalogModule } from './catalog/catalog.module';
import { HrModule } from './hr/hr.module';
import { InvitationsModule } from './invitations/invitations.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MediaModule } from './media/media.module';
import { ShareLinksModule } from './share-links/share-links.module';
import { AiTokensModule } from './ai-tokens/ai-tokens.module';
import { CommunicationsModule } from './communications/communications.module';
import { UserConfigModule } from './user-config/user-config.module';
import { DevModule } from './dev/dev.module';
import { AdminModule } from './admin/admin.module';
import { QuickBooksModule } from './quickbooks/quickbooks.module';
import { WalletModule } from './wallet/wallet.module';
import { TwilioNumbersModule } from './twilio-numbers/twilio-numbers.module';
import { InboxModule } from './inbox/inbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
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
    InboxModule,
    DocumentsModule,
    MarketingModule,
    VoiceAgentModule,
    DesignsModule,
    AiModule,
    HealthModule,
    BillingModule,
    VendorsModule,
    PricingModule,
    EstimatesModule,
    CatalogModule,
    HrModule,
    InvitationsModule,
    WorkspaceModule,
    InvoicesModule,
    MediaModule,
    ShareLinksModule,
    AiTokensModule,
    CommunicationsModule,
    UserConfigModule,
    DevModule,
    AdminModule,
    QuickBooksModule,
    WalletModule,
    TwilioNumbersModule,
  ],
  controllers: [RootController],
})
export class AppModule {}
