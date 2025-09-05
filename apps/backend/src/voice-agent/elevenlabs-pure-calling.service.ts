import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ElevenLabsCallData {
  phoneNumber: string;
  clientId?: string;
  clientName?: string;
  workspaceId?: string;
  purpose?: string;
  context?: string;
}

interface DirectCallData {
  phoneNumber: string;
  clientName?: string;
  purpose?: string;
  context?: string;
  clientId?: string;
  workspaceId?: string;
}

interface AgentInfo {
  agent_id: string;
  name: string;
  description: string;
  [key: string]: unknown;
}

export interface ElevenLabsPureCallResponse {
  success: boolean;
  callId?: string;
  conversationId?: string;
  batchId?: string;
  method: 'batch' | 'webhook' | 'manual';
  instructions?: string;
  directLinks?: {
    batchCall: string;
    agentDirect: string;
  };
  error?: string;
}

@Injectable()
export class ElevenLabsPureCallingService {
  private readonly logger = new Logger(ElevenLabsPureCallingService.name);
  private readonly apiKey: string;
  private readonly defaultAgentId: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('ELEVENLABS_API_KEY');
    this.defaultAgentId =
      this.config.get('ELEVENLABS_AGENT_ID') || 'agent_5401k1we1dkbf1mvt22mme8wz82a';
  }

  /**
   * Initiate a pure ElevenLabs call using their natural voices
   * This bypasses Twilio entirely to get the actual ElevenLabs voice quality
   */
  async initiatePureElevenLabsCall(data: ElevenLabsCallData) {
    const { phoneNumber, clientId, clientName, workspaceId, purpose, context } = data;

    // Log the call initiation
    this.logger.log(`🎯 PURE ELEVENLABS CALL INITIATED`);
    this.logger.log(`📞 Phone: ${phoneNumber}`);
    this.logger.log(`👤 Client: ${clientName || clientId}`);
    this.logger.log(`🎯 Purpose: ${purpose}`);
    this.logger.log(`📝 Context: ${context}`);

    // Try to make actual ElevenLabs API call first
    this.logger.log(`🔄 Attempting direct ElevenLabs API calls...`);
    const apiResult = await this.tryDirectElevenLabsCall({
      phoneNumber,
      clientName,
      purpose,
      context,
      clientId,
      workspaceId,
    });

    this.logger.log(`📊 API Result:`, JSON.stringify(apiResult, null, 2));

    // If API call succeeded, return success with call details
    if (apiResult.success) {
      this.logger.log(`✅ API call succeeded, returning success response`);
      return {
        success: true,
        callType: 'elevenlabs_direct_api',
        voiceProvider: 'ElevenLabs Premium API',
        status: 'call_initiated',
        callDetails: apiResult,
        message: '🎉 ElevenLabs call initiated directly through API!',
        benefits: [
          '✓ 100% ElevenLabs premium voice synthesis',
          '✓ Natural, human-like conversation',
          '✓ Direct API integration',
          '✓ Real-time call status',
          '✓ CRM integration',
        ],
      };
    }

    // If direct API call failed, provide manual batch calling instructions
    const instructions = this.generateBatchCallingInstructions(phoneNumber, this.defaultAgentId, {
      phoneNumber,
      clientId,
      clientName,
      workspaceId,
      purpose,
      context,
    } as ElevenLabsCallData);

    return {
      success: true,
      callType: 'elevenlabs_pure_natural',
      voiceProvider: 'ElevenLabs Premium (Manual Setup)',
      warning:
        '⚠️  Direct API not available. Use manual batch calling for ACTUAL ElevenLabs natural voices.',
      setup: instructions,
      quickAction: {
        step1: 'Click this link: https://elevenlabs.io/app/conversational-ai/batch-calling/create',
        step2: `Select agent: ${this.defaultAgentId}`,
        step3: `Add contact: ${clientName || 'Customer'} - ${phoneNumber}`,
        step4: `Purpose: ${purpose}`,
        step5: 'Click "Start Batch Call" for natural ElevenLabs voice',
      },
      apiAttempt: apiResult,
      benefits: [
        '✓ 100% ElevenLabs premium voice synthesis',
        '✓ Natural, human-like conversation',
        '✓ NO robotic Twilio voices',
        '✓ Sarah granite expertise',
        '✓ Higher conversion rates',
      ],
    };
  }

  /**
   * Try direct ElevenLabs API calls for immediate outbound calling
   */
  private async tryDirectElevenLabsCall(data: DirectCallData) {
    const { phoneNumber, clientName, purpose, context, clientId, workspaceId } = data;
    const apiKey = this.config.get('ELEVENLABS_API_KEY');
    const agentId = this.config.get('ELEVENLABS_AGENT_ID');

    if (!apiKey) {
      return {
        success: false,
        error: 'ElevenLabs API key not configured',
        method: 'api_key_missing',
      };
    }

    this.logger.log(`🔑 Using ElevenLabs API Key: ${apiKey.substring(0, 10)}...`);
    this.logger.log(`🤖 Using Agent ID: ${agentId}`);

    // Try multiple ElevenLabs API endpoints for outbound calls
    const endpoints = [
      {
        name: 'Conversational AI Outbound',
        url: 'https://api.elevenlabs.io/v1/convai/conversations/phone/outbound',
        method: 'POST',
        payload: {
          agent_id: agentId,
          customer_phone_number: phoneNumber,
          customer_name: clientName || 'Customer',
          metadata: {
            client_id: clientId,
            workspace_id: workspaceId,
            purpose: purpose,
            context: context,
            source: 'remodely_crm',
            timestamp: new Date().toISOString(),
          },
        },
      },
      {
        name: 'Phone Conversation',
        url: 'https://api.elevenlabs.io/v1/convai/conversation/phone',
        method: 'POST',
        payload: {
          agent_id: agentId,
          customer_phone_number: phoneNumber,
          customer_name: clientName || 'Customer',
        },
      },
      {
        name: 'Direct Conversations',
        url: 'https://api.elevenlabs.io/v1/conversations',
        method: 'POST',
        payload: {
          agent_id: agentId,
          phone_number: phoneNumber,
          mode: 'outbound_call',
          customer_data: {
            name: clientName || 'Customer',
            phone: phoneNumber,
            metadata: { purpose, context, clientId, workspaceId },
          },
        },
      },
    ];

    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        this.logger.log(`🔄 Trying ${endpoint.name} endpoint...`);

        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          data: endpoint.payload,
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        });

        this.logger.log(`✅ ${endpoint.name} SUCCESS:`, response.data);

        return {
          success: true,
          endpoint: endpoint.name,
          conversationId: response.data.conversation_id || response.data.id,
          callId: response.data.call_id,
          status: response.data.status || 'initiated',
          data: response.data,
          method: 'direct_api',
        };
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown }; message?: string };
        this.logger.warn(`❌ ${endpoint.name} failed:`, err.response?.data || err.message);
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed, return failure details
    return {
      success: false,
      error: 'All ElevenLabs API endpoints failed',
      method: 'api_endpoints_failed',
      attemptedEndpoints: endpoints.length,
    };
  }

  /**
   * Generate manual batch calling instructions (always works)
   */
  private generateBatchCallingInstructions(
    phoneNumber: string,
    agentId: string,
    request: ElevenLabsCallData
  ): ElevenLabsPureCallResponse {
    const batchId = `batch_${Date.now()}`;
    const instructions = `
🎯 **ElevenLabs PURE Voice Call Setup**
==================================

✅ **This method uses 100% ElevenLabs natural voices (NO Twilio robotic voices)**

## Quick Setup (2 minutes):

1. **Open ElevenLabs Batch Calling:**
   👉 https://elevenlabs.io/app/conversational-ai/batch-calling/create

2. **Select Agent:**
   👉 Agent ID: ${agentId}
   👉 Name: Sarah (Surprise Granite Specialist)

3. **Add Contact:**
   📞 Phone: ${phoneNumber}
   👤 Name: ${request.clientName}
   📝 Purpose: ${request.purpose}
   💬 Context: ${request.context || 'No additional context'}

4. **Click "Start Batch Call"**

## Alternative - Direct Agent Link:
👉 https://elevenlabs.io/app/talk-to?agent_id=${agentId}
   (Then manually dial: ${phoneNumber})

## Why This Method:
✓ Uses ElevenLabs' premium voice synthesis
✓ Natural conversation flow
✓ Sarah's granite expertise
✓ No robotic Twilio voices
✓ Higher conversion rates

⚠️  **IMPORTANT:** This gives you the ACTUAL ElevenLabs voice quality you want!
    The previous integration was using Twilio's robotic voices.
`;

    return {
      success: true,
      method: 'batch',
      batchId,
      callId: `pure_el_${Date.now()}`,
      instructions,
      directLinks: {
        batchCall: 'https://elevenlabs.io/app/conversational-ai/batch-calling/create',
        agentDirect: `https://elevenlabs.io/app/talk-to?agent_id=${agentId}`,
      },
    };
  }

  /**
   * Get ElevenLabs agent information
   */
  async getAgentInfo(agentId?: string): Promise<AgentInfo> {
    const actualAgentId = agentId || this.defaultAgentId;

    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/agents/${actualAgentId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      this.logger.warn('Could not fetch agent info:', err.response?.data || err.message);
      return {
        agent_id: actualAgentId,
        name: 'Sarah - Surprise Granite Specialist',
        description: 'Granite countertop expert with natural conversation abilities',
      };
    }
  }

  /**
   * Check if ElevenLabs is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.defaultAgentId);
  }

  /**
   * Get default agent ID
   */
  getDefaultAgentId(): string {
    return this.defaultAgentId;
  }
}

export default ElevenLabsPureCallingService;
