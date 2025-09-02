import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TwilioNumbersController } from './twilio-numbers.controller';
import { TwilioNumbersService } from './twilio-numbers.service';
import { TwilioPhoneNumber, TwilioPhoneNumberSchema } from './schemas/twilio-phone-number.schema';
import { TwilioService } from '../services/twilio.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TwilioPhoneNumber.name, schema: TwilioPhoneNumberSchema }]),
  ],
  controllers: [TwilioNumbersController],
  providers: [TwilioNumbersService, TwilioService],
  exports: [TwilioNumbersService],
})
export class TwilioNumbersModule {}
