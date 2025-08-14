import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';

@Injectable()
export class VoiceAgentService {
  private logger = new Logger('VoiceAgentService');
  private enableOutbound: boolean;
  constructor(
    private config: ConfigService,
    private twilio: TwilioService,
    private eleven: ElevenLabsService,
  ) {
    this.enableOutbound = !!(this.config.get('TWILIO_ACCOUNT_SID') && this.config.get('TWILIO_AUTH_TOKEN'));
  }

  async initiateOutboundCall(to: string, agentId?: string) {
    if (!this.enableOutbound) {
      this.logger.warn(`Twilio not configured. Simulating outbound call to ${to}`);
      return { simulated: true, to, agentId: agentId || this.eleven.getDefaultAgentId(), sid: 'SIMULATED_CALL', status: 'initiated' };
    }
    try {
      // TODO integrate real twilio call creation
      return { simulated: true, to, agentId: agentId || this.eleven.getDefaultAgentId(), sid: 'TWILIO_CALL_SID_PLACEHOLDER', status: 'initiated' };
    } catch (e) {
      this.logger.error('Failed to initiate outbound call', e as any);
      throw e;
    }
  }

  generateInboundTwiML() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="alice">Connecting you to the AI voice assistant.</Say>\n  <Pause length="1"/>\n  <Say voice="alice">Real-time streaming coming soon.</Say>\n</Response>`;
  }
}
