import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  HttpException,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { VoiceAgentService } from './voice-agent.service';
import {
  ElevenLabsPureCallingService,
  ElevenLabsPureCallResponse,
} from './elevenlabs-pure-calling.service';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { ElevenLabsIntegrationService } from './elevenlabs-integration.service';

interface OutboundCallDto {
  to: string;
  agentId?: string;
  purpose?: string;
  context?: string;
}

interface CRMOutboundCallDto {
  clientId: string;
  workspaceId: string;
  callPurpose: 'appointment_scheduling' | 'estimate_follow_up' | 'follow_up' | 'general';
  agentId?: string;
  callData?: any;
}

interface AppointmentCallDto {
  clientId: string;
  workspaceId: string;
  appointmentType?: string;
  agentId?: string;
}

interface EstimateFollowUpDto {
  clientId: string;
  workspaceId: string;
  estimateId: string;
  agentId?: string;
}

interface GeneralFollowUpDto {
  clientId: string;
  workspaceId: string;
  reason: string;
  agentId?: string;
}

interface CallHistoryQuery {
  clientId?: string;
  status?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
}

@Controller('voice-agent')
export class VoiceAgentController {
  constructor(
    private voiceAgent: VoiceAgentService,
    private elevenLabsPureCalling: ElevenLabsPureCallingService,
    private twilio: TwilioService,
    private eleven: ElevenLabsService,
    private config: ConfigService,
    private elevenIntegration: ElevenLabsIntegrationService
  ) {}

  @Post('outbound')
  async createOutbound(@Body() body: OutboundCallDto) {
    if (!body.to) throw new HttpException('Destination number required', HttpStatus.BAD_REQUEST);

    // For testing purposes, create a temporary client record
    const tempClientData = {
      _id: 'temp-client-' + Date.now(),
      firstName: 'Test',
      lastName: 'Client',
      phone: body.to,
      email: 'test@example.com',
    };

    // Create a temporary voice call for testing
    return this.voiceAgent.testOutboundCall(body.to, body.agentId, body.purpose, body.context);
  }

  @Post('elevenlabs-pure-call')
  async createPureElevenLabsCall(@Body() body: any) {
    console.log('🚀 CONTROLLER: createPureElevenLabsCall method called');
    console.log('🔧 ElevenLabsPureCallingService instance:', this.elevenLabsPureCalling);
    console.log('📦 Request payload:', JSON.stringify(body, null, 2));

    try {
      const result = await this.elevenLabsPureCalling.initiatePureElevenLabsCall(body);
      return result;
    } catch (error) {
      console.error('❌ Controller error:', error);
      throw error;
    }
  }

  @Post('elevenlabs-widget-call')
  async createElevenLabsWidgetCall(@Body() body: any) {
    console.log('🎯 WIDGET CONTROLLER: ElevenLabs widget call requested');
    console.log('� Widget payload:', JSON.stringify(body, null, 2));

    const { phoneNumber, clientName, purpose, context, agentId } = body;
    const resolvedAgentId = agentId || this.eleven.getDefaultAgentId();

    // Generate the widget configuration
    const widgetConfig = {
      success: true,
      callType: 'elevenlabs_widget',
      voiceProvider: 'ElevenLabs ConvAI Widget',
      agentId: resolvedAgentId,
      widget: {
        embedCode: `<elevenlabs-convai agent-id="${resolvedAgentId}"></elevenlabs-convai>`,
        scriptSrc: 'https://unpkg.com/@elevenlabs/convai-widget-embed',
        instructions: [
          '1. Widget will load automatically when embedded',
          '2. User can start voice conversation directly in browser',
          '3. No phone call needed — direct browser-to-agent communication',
          '4. The agent will handle the conversation naturally',
        ],
        clientInfo: {
          name: clientName || 'Customer',
          phone: phoneNumber,
          purpose: purpose || 'General inquiry',
          context: context || 'Customer interaction via CRM',
        },
      },
      advantages: [
        '✅ Instant connection - no phone call setup required',
        '✅ Natural ElevenLabs voice (Sarah)',
        '✅ Browser-based - works on any device',
        '✅ Real-time conversation',
        '✅ No Twilio or complex API management needed',
      ],
    };

    console.log('🎉 Widget configuration generated:', widgetConfig);
    return widgetConfig;
  }

  // Return ElevenLabs batch calling instructions (white-label friendly)
  @Post('elevenlabs-call')
  async createElevenLabsCall(@Body() body: any): Promise<any> {
    const { clientId, clientName, phoneNumber, workspaceId, purpose, context, agentId } =
      body || {};
    if (!clientId || !workspaceId || !phoneNumber || !clientName || !purpose) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    const result = await this.elevenIntegration.prepareElevenLabsCall({
      clientId,
      clientName,
      phoneNumber,
      workspaceId,
      purpose,
      context,
      agentId,
    });
    return result;
  }

  @Post('crm-call')
  async createCRMCall(@Body() body: CRMOutboundCallDto) {
    if (!body.clientId || !body.workspaceId || !body.callPurpose) {
      throw new HttpException(
        'Client ID, workspace ID, and call purpose required',
        HttpStatus.BAD_REQUEST
      );
    }

    return this.voiceAgent.initiateOutboundCall(
      body.clientId,
      body.workspaceId,
      body.callPurpose,
      body.callData,
      body.agentId
    );
  }

  @Post('schedule-appointment-call')
  async scheduleAppointmentCall(@Body() body: AppointmentCallDto) {
    if (!body.clientId || !body.workspaceId) {
      throw new HttpException('Client ID and workspace ID required', HttpStatus.BAD_REQUEST);
    }

    return this.voiceAgent.scheduleAppointmentCall(
      body.clientId,
      body.workspaceId,
      body.appointmentType,
      body.agentId
    );
  }

  @Post('estimate-follow-up-call')
  async estimateFollowUpCall(@Body() body: EstimateFollowUpDto) {
    if (!body.clientId || !body.workspaceId || !body.estimateId) {
      throw new HttpException(
        'Client ID, workspace ID, and estimate ID required',
        HttpStatus.BAD_REQUEST
      );
    }

    return this.voiceAgent.followUpEstimateCall(
      body.clientId,
      body.workspaceId,
      body.estimateId,
      body.agentId
    );
  }

  @Post('general-follow-up-call')
  async generalFollowUpCall(@Body() body: GeneralFollowUpDto) {
    if (!body.clientId || !body.workspaceId || !body.reason) {
      throw new HttpException(
        'Client ID, workspace ID, and reason required',
        HttpStatus.BAD_REQUEST
      );
    }

    return this.voiceAgent.generalFollowUpCall(
      body.clientId,
      body.workspaceId,
      body.reason,
      body.agentId
    );
  }

  @Get('call-history/:workspaceId')
  async getCallHistory(
    @Param('workspaceId') workspaceId: string,
    @Query() query: CallHistoryQuery
  ) {
    if (!workspaceId) {
      throw new HttpException('Workspace ID required', HttpStatus.BAD_REQUEST);
    }

    const filters: any = {};
    if (query.clientId) filters.clientId = query.clientId;
    if (query.status) filters.status = query.status;
    if (query.purpose) filters.purpose = query.purpose;
    if (query.startDate) filters.startDate = new Date(query.startDate);
    if (query.endDate) filters.endDate = new Date(query.endDate);

    return this.voiceAgent.getCallHistory(workspaceId, filters);
  }

  @Post('update-call-status/:callId')
  async updateCallStatus(
    @Param('callId') callId: string,
    @Body() body: { status: string; notes?: string }
  ) {
    if (!callId || !body.status) {
      throw new HttpException('Call ID and status required', HttpStatus.BAD_REQUEST);
    }

    return this.voiceAgent.updateCallStatus(callId, body.status as any, body.notes);
  }

  @Post('webhook')
  async inboundWebhook(
    @Res() res: Response,
    @Query('callId') callId?: string,
    @Query('purpose') purpose?: string,
    @Query('context') context?: string,
    @Query('useElevenLabs') useElevenLabs?: string,
    @Query('agentId') agentId?: string
  ) {
    const useEL = useElevenLabs === 'true';
    const twiml = this.voiceAgent.generateInboundTwiML(purpose, context, useEL, agentId);
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Post('gather')
  async handleGather(@Body() body: any, @Res() res: Response, @Query('callId') callId?: string) {
    const speechResult = body.SpeechResult || '';
    const confidence = body.Confidence || 0;

    // Log the speech input for debugging
    console.log('Speech input received:', speechResult, 'Confidence:', confidence);

    // Generate response based on speech input
    let response = '';

    if (
      speechResult.toLowerCase().includes('appointment') ||
      speechResult.toLowerCase().includes('schedule')
    ) {
      response = `Great! I'd be happy to help you schedule an appointment. We have availability this week for consultations. 
                 Our team will follow up with you within 24 hours to confirm your preferred time. 
                 Is there anything specific you'd like to discuss during your consultation?`;
    } else if (
      speechResult.toLowerCase().includes('estimate') ||
      speechResult.toLowerCase().includes('quote')
    ) {
      response = `I understand you're interested in getting an estimate. We provide free estimates for all our services. 
                 Our team will contact you within one business day to schedule a consultation and site visit. 
                 Thank you for considering Remodely for your project!`;
    } else if (
      speechResult.toLowerCase().includes('help') ||
      speechResult.toLowerCase().includes('question')
    ) {
      response = `I'm here to help! Our customer service team is available to answer any questions you may have. 
                 Someone will reach out to you shortly to assist with your inquiry. 
                 Thank you for calling Remodely!`;
    } else if (speechResult.trim() === '' || confidence < 0.5) {
      response = `I'm sorry, I didn't quite catch that. Let me connect you with our customer service team 
                 who can better assist you. Thank you for calling Remodely!`;
    } else {
      response = `Thank you for sharing that information. I've noted your request: "${speechResult}". 
                 Our team will review your message and get back to you within 24 hours. 
                 Is there anything else I can help you with today?`;
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${response}</Say>
  <Pause length="2"/>
  <Gather input="speech" action="${process.env.BACKEND_BASE_URL || 'http://localhost:3001'}/api/voice-agent/final" method="POST" speechTimeout="auto" timeout="8" language="en-US" enhanced="true">
    <Say voice="Polly.Joanna-Neural" language="en-US">Is there anything else I can help you with today? You can say 'goodbye' if you're all set, or tell me about any other questions you have.</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural" language="en-US">Thank you for calling Remodely. Our team will be in touch soon. Have a great day!</Say>
  <Hangup/>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Post('final')
  async handleFinal(@Body() body: any, @Res() res: Response) {
    const speechResult = body.SpeechResult || '';

    console.log('Final speech input:', speechResult);

    let response = '';

    if (
      speechResult.toLowerCase().includes('goodbye') ||
      speechResult.toLowerCase().includes('bye') ||
      speechResult.toLowerCase().includes('thank')
    ) {
      response =
        'Thank you for calling Remodely! We look forward to working with you. Have a wonderful day!';
    } else if (
      speechResult.toLowerCase().includes('yes') ||
      speechResult.toLowerCase().includes('more')
    ) {
      response =
        'I understand you have additional questions. Our customer service team will contact you shortly to provide detailed assistance. Thank you!';
    } else if (speechResult.trim() !== '') {
      response = `I've noted your additional comment: "${speechResult}". Our team will include this in their follow-up. Thank you for calling Remodely!`;
    } else {
      response =
        'Thank you for calling Remodely. Our team will be in touch soon. Have a great day!';
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${response}</Say>
  <Hangup/>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Get('status')
  health() {
    const backendBase =
      process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const webhookUrl = `${backendBase}/api/voice-agent/webhook`;
    return {
      ok: true,
      feature: 'voice-agent',
      twilio: {
        configured: this.twilio.isConfigured,
        from: this.twilio.from || null,
      },
      elevenlabs: {
        configured: !!this.eleven.apiKey,
        agentId: this.eleven.getDefaultAgentId(),
      },
      inbound: {
        webhookUrl,
      },
    };
  }
}
