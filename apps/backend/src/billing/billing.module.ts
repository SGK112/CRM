import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingWebhookController } from './webhook.controller';
import { BillingService, ActiveSubscriptionGuard } from './billing.service';
import { EnhancedBillingController } from './enhanced-billing.controller';
import { EnhancedBillingService } from './enhanced-billing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [BillingController, BillingWebhookController, EnhancedBillingController],
  providers: [BillingService, ActiveSubscriptionGuard, EnhancedBillingService],
  exports: [ActiveSubscriptionGuard, EnhancedBillingService],
})
export class BillingModule {}
