import { Module } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, TwilioService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
