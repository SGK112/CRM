import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '../notifications/notifications.module';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { InboxMessage, InboxMessageSchema } from './schemas/inbox-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InboxMessage.name, schema: InboxMessageSchema }]),
    NotificationsModule,
  ],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
