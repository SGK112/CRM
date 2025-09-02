import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { InboxModule } from '../inbox/inbox.module';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
    ]),
    InboxModule,
  ],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, EmailService, TwilioService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
