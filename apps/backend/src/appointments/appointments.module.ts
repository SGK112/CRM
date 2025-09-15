import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsModule } from '../integrations/integrations.module';
import { EmailService } from '../services/email.service';
import { TwilioService } from '../services/twilio.service';
import { UsersModule } from '../users/users.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { UnifiedCalendarService } from './unified-calendar.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    UsersModule,
    IntegrationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    UnifiedCalendarService,
    EmailService,
    TwilioService,
  ],
  exports: [AppointmentsService, UnifiedCalendarService],
})
export class AppointmentsModule {}
