import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommunicationsController],
  providers: [CommunicationsService, EmailService, TwilioService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
