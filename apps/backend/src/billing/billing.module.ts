import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingWebhookController } from './webhook.controller';
import { BillingService } from './billing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [BillingController, BillingWebhookController],
  providers: [BillingService],
})
export class BillingModule {}
