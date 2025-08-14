import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ElevenLabsService {
  constructor(private config: ConfigService) {}
  get apiKey() { return this.config.get('ELEVENLABS_API_KEY'); }
  getDefaultVoiceId() { return this.config.get('ELEVENLABS_VOICE_ID') || 'placeholder_voice'; }
  getDefaultAgentId() { return this.config.get('ELEVENLABS_AGENT_ID') || 'default-agent'; }
  getStreamUrl() { return this.config.get('ELEVENLABS_STREAM_URL') || 'wss://api.elevenlabs.io/v1/convai/stream'; }

  async textToSpeech(text: string) {
    if (!this.apiKey) return { simulated: true, text };
    try {
      const voiceId = this.getDefaultVoiceId();
      const resp = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, { text }, {
        headers: { 'xi-api-key': this.apiKey } as any,
        responseType: 'arraybuffer'
      });
      return { audio: resp.data };
    } catch (e:any) {
      return { error: true, message: e.message };
    }
  }
}
