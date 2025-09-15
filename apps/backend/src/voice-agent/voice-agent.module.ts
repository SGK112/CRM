import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { VoiceAgentController } from './voice-agent.controller';
import { VoiceAgentService } from './voice-agent.service';
import { ElevenLabsPureCallingService } from './elevenlabs-pure-calling.service';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { EmailService } from '../services/email.service';
import { VoiceCall, VoiceCallSchema } from './schemas/voice-call.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Estimate, EstimateSchema } from '../estimates/schemas/estimate.schema';
import { AppointmentsModule } from '../appointments/appointments.module';
import { NotesService } from '../clients/notes.service';
import { Note, NoteSchema } from '../clients/schemas/note.schema';
import { ElevenLabsIntegrationService } from './elevenlabs-integration.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: VoiceCall.name, schema: VoiceCallSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Estimate.name, schema: EstimateSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
    forwardRef(() => AppointmentsModule),
  ],
  controllers: [VoiceAgentController],
  providers: [
    VoiceAgentService,
    ElevenLabsPureCallingService,
    TwilioService,
    ElevenLabsService,
    EmailService,
    NotesService,
    ElevenLabsIntegrationService,
  ],
  exports: [VoiceAgentService],
})
export class VoiceAgentModule {}
