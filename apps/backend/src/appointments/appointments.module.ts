import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UnifiedCalendarService } from './unified-calendar.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { GoogleCalendarService } from '../integrations/google-calendar.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    UsersModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    UnifiedCalendarService,
    EmailService,
    TwilioService,
    GoogleCalendarService,
  ],
  exports: [AppointmentsService, UnifiedCalendarService],
})
export class AppointmentsModule {}
