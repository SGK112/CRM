import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ClientContext {
  _id?: string;
  firstName?: string;
  lastName?: string;
  workspaceId?: string;
  purpose?: string;
  [key: string]: unknown;
}

@Injectable()
export class ElevenLabsService {
  private logger = new Logger('ElevenLabsService');

  constructor(private config: ConfigService) {}
  get apiKey() {
    return this.config.get('ELEVENLABS_API_KEY');
  }
  getDefaultVoiceId() {
    return this.config.get('ELEVENLABS_VOICE_ID') || 'placeholder_voice';
  }
  getDefaultAgentId() {
    return this.config.get('ELEVENLABS_AGENT_ID') || 'default-agent';
  }
  getStreamUrl() {
    return this.config.get('ELEVENLABS_STREAM_URL') || 'wss://api.elevenlabs.io/v1/convai/stream';
  }

  async textToSpeech(text: string) {
    if (!this.apiKey) return { simulated: true, text };
    try {
      const voiceId = this.getDefaultVoiceId();
      const resp = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text },
        {
          headers: { 'xi-api-key': this.apiKey } as Record<string, string>,
          responseType: 'arraybuffer',
        }
      );
      return { audio: resp.data };
    } catch (e: unknown) {
      const error = e as Error;
      return { error: true, message: error.message };
    }
  }

  // Create an outbound call using ElevenLabs conversational AI
  async createOutboundCall(phoneNumber: string, agentId?: string, clientContext?: ClientContext) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const actualAgentId = agentId || this.getDefaultAgentId();

    // Try the batch calling API endpoint
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/convai/conversations/phone/outbound',
        {
          agent_id: actualAgentId,
          customer_phone_number: phoneNumber,
          customer_name: clientContext?.firstName
            ? `${clientContext.firstName} ${clientContext.lastName}`
            : 'Customer',
          metadata: {
            client_id: clientContext?._id,
            workspace_id: clientContext?.workspaceId,
            purpose: clientContext?.purpose || 'sales_call',
            source: 'remodely_crm',
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        conversationId: response.data.conversation_id,
        callId: response.data.call_id,
        agentId: actualAgentId,
        status: response.data.status || 'initiated',
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      this.logger.error('ElevenLabs outbound call failed:', err.response?.data || err.message || 'Unknown error');      // Try alternative endpoint structure
      try {
        const altResponse = await axios.post(
          'https://api.elevenlabs.io/v1/conversations',
          {
            agent_id: actualAgentId,
            phone_number: phoneNumber,
            mode: 'outbound_call',
            customer_data: {
              name: clientContext?.firstName
                ? `${clientContext.firstName} ${clientContext.lastName}`
                : 'Customer',
              phone: phoneNumber,
              metadata: clientContext,
            },
          },
          {
            headers: {
              'xi-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          success: true,
          conversationId: altResponse.data.id || altResponse.data.conversation_id,
          agentId: actualAgentId,
          status: 'initiated',
        };
      } catch (altError: unknown) {
        const err = altError as { response?: { data?: { detail?: string } }; message?: string };
        this.logger.error(
          'ElevenLabs alternative outbound call failed:',
          err.response?.data || err.message || 'Unknown error'
        );
        return {
          success: false,
          error: err.response?.data?.detail || err.message || 'Unknown error',
        };
      }
    }
  }

  async createConversationalCall(phoneNumber: string, agentId?: string) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const actualAgentId = agentId || this.getDefaultAgentId();

    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/convai/conversation/phone',
        {
          agent_id: actualAgentId,
          customer_phone_number: phoneNumber,
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        conversationId: response.data.conversation_id,
        agentId: actualAgentId,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      this.logger.error(
        'ElevenLabs conversational call failed:',
        err.response?.data || err.message || 'Unknown error'
      );
      return {
        success: false,
        error: err.response?.data?.detail || err.message || 'Unknown error',
      };
    }
  }

  async getConversationStatus(conversationId: string) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      this.logger.error('Failed to get conversation status:', err.response?.data || err.message || 'Unknown error');
      throw error;
    }
  }
}
