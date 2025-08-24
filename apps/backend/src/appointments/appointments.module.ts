import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [AppointmentsService, EmailService, TwilioService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
