import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { InboxMessage, InboxMessageSchema } from './schemas/inbox-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InboxMessage.name, schema: InboxMessageSchema },
    ]),
  ],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}
