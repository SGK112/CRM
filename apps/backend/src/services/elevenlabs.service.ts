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

  // Create an outbound call using ElevenLabs conversational AI
  async createOutboundCall(phoneNumber: string, agentId?: string, clientContext?: any) {
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
          customer_name: clientContext?.firstName ? `${clientContext.firstName} ${clientContext.lastName}` : 'Customer',
          metadata: {
            client_id: clientContext?._id,
            workspace_id: clientContext?.workspaceId,
            purpose: clientContext?.purpose || 'sales_call',
            source: 'remodely_crm'
          }
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
        status: response.data.status || 'initiated'
      };
    } catch (error: any) {
      console.error('ElevenLabs outbound call failed:', error.response?.data || error.message);
      
      // Try alternative endpoint structure
      try {
        const altResponse = await axios.post(
          'https://api.elevenlabs.io/v1/conversations',
          {
            agent_id: actualAgentId,
            phone_number: phoneNumber,
            mode: 'outbound_call',
            customer_data: {
              name: clientContext?.firstName ? `${clientContext.firstName} ${clientContext.lastName}` : 'Customer',
              phone: phoneNumber,
              metadata: clientContext
            }
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
          status: 'initiated'
        };
      } catch (altError: any) {
        console.error('ElevenLabs alternative outbound call failed:', altError.response?.data || altError.message);
        return {
          success: false,
          error: altError.response?.data?.detail || altError.message,
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
    } catch (error: any) {
      console.error('ElevenLabs conversational call failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
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
    } catch (error: any) {
      console.error('Failed to get conversation status:', error.response?.data || error.message);
      throw error;
    }
  }
}
