import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VoiceAgentController } from './voice-agent.controller';
import { VoiceAgentService } from './voice-agent.service';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';

@Module({
  imports: [ConfigModule],
  controllers: [VoiceAgentController],
  providers: [VoiceAgentService, TwilioService, ElevenLabsService],
  exports: [VoiceAgentService],
})
export class VoiceAgentModule {}
