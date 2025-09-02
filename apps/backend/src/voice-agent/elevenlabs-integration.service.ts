import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ElevenLabsCallRequest {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  agentId: string;
  purpose: string;
  context?: string;
  workspaceId: string;
}

interface ElevenLabsCallResponse {
  success: boolean;
  callId?: string;
  conversationId?: string;
  batchId?: string;
  instructions?: string;
  error?: string;
}

@Injectable()
export class ElevenLabsIntegrationService {
  constructor(private config: ConfigService) {}

  /**
   * This service helps integrate Remodely CRM with ElevenLabs batch calling
   * Since ElevenLabs batch calling is done through their dashboard,
   * this service provides the data structure and instructions for manual setup
   */
  async prepareElevenLabsCall(request: ElevenLabsCallRequest): Promise<ElevenLabsCallResponse> {
    const apiKey = this.config.get('ELEVENLABS_API_KEY');
    const agentId = request.agentId || this.config.get('ELEVENLABS_AGENT_ID');

    if (!apiKey || !agentId) {
      return {
        success: false,
        error: 'ElevenLabs API key or agent ID not configured',
      };
    }

    // Generate batch calling data for ElevenLabs dashboard
    const batchData = {
      agent_id: agentId,
      contacts: [
        {
          phone_number: request.phoneNumber,
          name: request.clientName,
          metadata: {
            client_id: request.clientId,
            workspace_id: request.workspaceId,
            purpose: request.purpose,
            context: request.context,
            source: 'remodely_crm',
            created_at: new Date().toISOString(),
          },
        },
      ],
    };

    return {
      success: true,
      batchId: `crm_batch_${Date.now()}`,
      instructions: `
## ElevenLabs Batch Calling Setup Instructions

1. Go to: https://elevenlabs.io/app/conversational-ai/batch-calling/create

2. Select Agent: ${agentId} (Sarah - Surprise Granite)

3. Add Contact:
   - Phone: ${request.phoneNumber}
   - Name: ${request.clientName}
   - Metadata: ${JSON.stringify(batchData.contacts[0].metadata, null, 2)}

4. Purpose: ${request.purpose}

5. Additional Context: ${request.context || 'N/A'}

6. Click "Start Batch Call"

This will initiate a high-quality ElevenLabs call with Sarah's voice and personality.
      `,
      callId: `crm_call_${Date.now()}`,
    };
  }

  /**
   * Alternative: Try to use ElevenLabs webhook for immediate calling
   * This would require configuring the webhook properly in ElevenLabs dashboard
   */
  async initiateWebhookCall(request: ElevenLabsCallRequest): Promise<ElevenLabsCallResponse> {
    // This would work if ElevenLabs webhook is properly configured
    // For now, return instructions for manual setup
    return {
      success: false,
      error: 'Direct API calling not available - use batch calling interface',
      instructions: 'Use the prepareElevenLabsCall method for batch calling setup',
    };
  }

  /**
   * Generate CSV for bulk ElevenLabs batch calling
   */
  generateBatchCSV(requests: ElevenLabsCallRequest[]): string {
    const headers = ['phone_number', 'name', 'client_id', 'workspace_id', 'purpose', 'context'];
    const rows = requests.map(req => [
      req.phoneNumber,
      req.clientName,
      req.clientId,
      req.workspaceId,
      req.purpose,
      req.context || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
