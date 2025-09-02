import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AiTokensModule } from './ai-tokens/ai-tokens.module';
import { AiModule } from './ai/ai.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { CatalogModule } from './catalog/catalog.module';
import { ChatModule } from './chat/chat.module';
import { ClientsModule } from './clients/clients.module';
import { CommunicationsModule } from './communications/communications.module';
import { DesignsModule } from './designs/designs.module';
import { DevModule } from './dev/dev.module';
import { DocumentsModule } from './documents/documents.module';
import { EstimatesModule } from './estimates/estimates.module';
import { HealthModule } from './health/health.module';
import { HrModule } from './hr/hr.module';
import { InboxModule } from './inbox/inbox.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { InvitationsModule } from './invitations/invitations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MarketingModule } from './marketing/marketing.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PricingModule } from './pricing/pricing.module';
import { ProjectsModule } from './projects/projects.module';
import { QuickBooksModule } from './quickbooks/quickbooks.module';
import { RootController } from './root.controller';
import { ShareLinksModule } from './share-links/share-links.module';
import { TwilioNumbersModule } from './twilio-numbers/twilio-numbers.module';
import { UserConfigModule } from './user-config/user-config.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { VoiceAgentModule } from './voice-agent/voice-agent.module';
import { WalletModule } from './wallet/wallet.module';
import { WorkspaceModule } from './workspace/workspace.module';

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
