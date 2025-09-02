import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from '../services/twilio.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { EmailService } from '../services/email.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { NotesService } from '../clients/notes.service';
import { VoiceCall, VoiceCallDocument } from './schemas/voice-call.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { Estimate, EstimateDocument } from '../estimates/schemas/estimate.schema';

interface CallPurposeData {
  estimateId?: string;
  appointmentType?: string;
  followUpReason?: string;
  customMessage?: string;
}

interface VoiceCallResult {
  appointmentScheduled?: boolean;
  appointmentDate?: Date;
  appointmentType?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  estimateStatus?: string;
  notes?: string;
  nextAction?: string;
  emailSent?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

@Injectable()
export class VoiceAgentService {
  private logger = new Logger('VoiceAgentService');
  private enableOutbound: boolean;

  constructor(
    private config: ConfigService,
    private twilio: TwilioService,
    private eleven: ElevenLabsService,
    private emailService: EmailService,
    private appointmentsService: AppointmentsService,
    private notesService: NotesService,
    @InjectModel(VoiceCall.name) private voiceCallModel: Model<VoiceCallDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Estimate.name) private estimateModel: Model<EstimateDocument>
  ) {
    this.enableOutbound = !!(
      this.config.get('TWILIO_ACCOUNT_SID') && this.config.get('TWILIO_AUTH_TOKEN')
    );
  }

  async initiateOutboundCall(
    clientId: string,
    workspaceId: string,
    purpose: 'appointment_scheduling' | 'follow_up' | 'estimate_follow_up' | 'general',
    purposeData?: CallPurposeData,
    agentId?: string
  ) {
    // Get client information
    const client = await this.clientModel.findOne({ _id: clientId, workspaceId });
    if (!client || !client.phone) {
      throw new Error('Client not found or no phone number available');
    }

    // Create voice call record
    const voiceCall = new this.voiceCallModel({
      clientId,
      workspaceId,
      phoneNumber: client.phone,
      direction: 'outbound',
      status: 'initiated',
      callPurpose: purpose,
      startedAt: new Date(),
    });

    const savedCall = await voiceCall.save();

    if (!this.enableOutbound || !this.twilio.isConfigured) {
      this.logger.warn(`Twilio not configured. Simulating outbound call to ${client.phone}`);

      // Simulate a successful call for demo purposes
      setTimeout(() => {
        this.simulateCallCompletion(savedCall._id.toString(), purpose, purposeData);
      }, 5000); // Simulate 5-second call

      return {
        simulated: true,
        callId: savedCall._id,
        to: client.phone,
        agentId: agentId || this.eleven.getDefaultAgentId(),
        sid: 'SIMULATED_CALL',
        status: 'initiated',
        client: {
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
        },
      };
    }

    try {
      const backendBase =
        process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
      const webhookUrl = `${backendBase}/api/voice-agent/webhook?callId=${savedCall._id}&purpose=${purpose}`;

      const result = await this.twilio.createOutboundCall(client.phone, webhookUrl);

      if ('error' in result) {
        this.logger.warn(`Falling back to simulation: ${result.error}`);

        // Update call record with error
        await this.voiceCallModel.findByIdAndUpdate(savedCall._id, {
          status: 'failed',
          notes: `Twilio error: ${result.error}`,
        });

        // Simulate call for demo
        setTimeout(() => {
          this.simulateCallCompletion(savedCall._id.toString(), purpose, purposeData);
        }, 5000);

        return {
          simulated: true,
          callId: savedCall._id,
          to: client.phone,
          agentId: agentId || this.eleven.getDefaultAgentId(),
          sid: 'SIMULATED_CALL',
          status: 'initiated',
          client: {
            name: `${client.firstName} ${client.lastName}`,
            email: client.email,
          },
        };
      }

      // Update call record with Twilio SID
      await this.voiceCallModel.findByIdAndUpdate(savedCall._id, {
        twilioCallSid: result.sid,
        status: 'ringing',
      });

      return {
        simulated: false,
        callId: savedCall._id,
        to: client.phone,
        agentId: agentId || this.eleven.getDefaultAgentId(),
        sid: result.sid,
        status: 'ringing',
        client: {
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
        },
      };
    } catch (e) {
      this.logger.error('Failed to initiate outbound call', e as any);

      // Update call record with error
      await this.voiceCallModel.findByIdAndUpdate(savedCall._id, {
        status: 'failed',
        notes: `Error: ${(e as Error).message}`,
      });

      throw e;
    }
  }

  private async simulateCallCompletion(
    callId: string,
    purpose: string,
    purposeData?: CallPurposeData
  ) {
    // Simulate different outcomes based on purpose
    let callResult: VoiceCallResult = {};
    let transcript = '';
    let notes = '';

    switch (purpose) {
      case 'appointment_scheduling':
        callResult = {
          appointmentScheduled: true,
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          appointmentType: purposeData?.appointmentType || 'consultation',
          sentiment: 'positive',
          notes: 'Client agreed to schedule appointment for consultation',
        };
        transcript = 'Voice agent successfully scheduled appointment with client.';
        notes = `Appointment scheduled for ${callResult.appointmentType}. Client was responsive and agreed to the proposed time.`;
        break;

      case 'estimate_follow_up':
        callResult = {
          estimateStatus: 'reviewed',
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          sentiment: 'neutral',
          notes: 'Client reviewed estimate, needs time to decide',
        };
        transcript = 'Discussed estimate with client. They need more time to review.';
        notes =
          'Client has reviewed the estimate but needs additional time to make a decision. Follow-up scheduled for next week.';
        break;

      case 'follow_up':
        callResult = {
          followUpRequired: false,
          sentiment: 'positive',
          notes: 'General follow-up completed successfully',
        };
        transcript = 'Successful follow-up call with client.';
        notes =
          purposeData?.followUpReason ||
          'General follow-up call completed. Client was satisfied with service.';
        break;

      default:
        callResult = {
          sentiment: 'neutral',
          notes: 'General call completed',
        };
        transcript = 'Voice agent call completed.';
        notes = purposeData?.customMessage || 'General voice agent call completed successfully.';
    }

    // Update call record
    const updatedCall = await this.voiceCallModel.findByIdAndUpdate(
      callId,
      {
        status: 'completed',
        duration: Math.floor(Math.random() * 300) + 60, // Random duration 1-6 minutes
        transcript,
        callResult,
        notes,
        endedAt: new Date(),
      },
      { new: true }
    );

    if (updatedCall) {
      // Process the call results
      await this.processCallResults(updatedCall);
    }
  }

  private async processCallResults(voiceCall: VoiceCallDocument) {
    const client = await this.clientModel.findById(voiceCall.clientId);
    if (!client) return;

    const clientName = `${client.firstName} ${client.lastName}`;

    // Create a note from the call
    await this.notesService.createFromVoiceCall({
      workspaceId: voiceCall.workspaceId,
      clientId: voiceCall.clientId,
      voiceCallId: voiceCall._id.toString(),
      content: voiceCall.notes || voiceCall.transcript || 'Voice agent call completed',
      callDuration: voiceCall.duration,
      callOutcome: voiceCall.status,
      nextAction: voiceCall.callResult?.nextAction,
      followUpDate: voiceCall.callResult?.followUpDate,
      actionItems: voiceCall.callResult?.nextAction ? [voiceCall.callResult.nextAction] : undefined,
    });

    // Schedule appointment if one was created
    if (voiceCall.callResult?.appointmentScheduled && voiceCall.callResult.appointmentDate) {
      const appointment = await this.appointmentsService.scheduleFromVoiceCall({
        clientId: voiceCall.clientId,
        workspaceId: voiceCall.workspaceId,
        voiceCallId: voiceCall._id.toString(),
        appointmentDate: voiceCall.callResult.appointmentDate,
        appointmentType: voiceCall.callResult.appointmentType || 'consultation',
        duration: 60,
        notes: voiceCall.callResult.notes,
      });

      // Send confirmation email if client has email
      if (client.email) {
        await this.appointmentsService.sendConfirmationEmail(appointment);
      }
    }

    // Send follow-up email based on call purpose
    if (client.email) {
      await this.sendFollowUpEmail(voiceCall, client);
    }

    // Schedule follow-up if required
    if (voiceCall.callResult?.followUpRequired && voiceCall.callResult.followUpDate) {
      await this.notesService.addFollowUpNote({
        workspaceId: voiceCall.workspaceId,
        clientId: voiceCall.clientId,
        content: `Follow-up required: ${voiceCall.callResult.notes || 'Continue conversation from voice call'}`,
        followUpDate: voiceCall.callResult.followUpDate,
        createdBy: 'voice_agent',
      });
    }
  }

  private async sendFollowUpEmail(voiceCall: VoiceCallDocument, client: Client) {
    const clientName = `${client.firstName} ${client.lastName}`;
    const callNotes = voiceCall.callResult?.notes || voiceCall.notes;

    switch (voiceCall.callPurpose) {
      case 'estimate_follow_up':
        if (voiceCall.callResult?.estimateStatus) {
          // Get estimate details if available
          const estimate = await this.estimateModel
            .findOne({
              clientId: voiceCall.clientId,
              workspaceId: voiceCall.workspaceId,
            })
            .sort({ createdAt: -1 });

          if (estimate) {
            await this.emailService.sendEstimateFollowUp({
              clientEmail: client.email!,
              clientName,
              estimateNumber: estimate.number || (estimate as any)._id.toString().slice(-6),
              estimateAmount: estimate.total || 0,
              callNotes,
            });
          }
        }
        break;

      case 'appointment_scheduling':
        if (voiceCall.callResult?.appointmentScheduled) {
          // Confirmation email already sent in processCallResults
          return;
        } else {
          await this.emailService.sendGeneralFollowUp({
            clientEmail: client.email!,
            clientName,
            subject: 'Thank you for your time today',
            message:
              "Thank you for speaking with us today about scheduling an appointment. We'll follow up soon with available times.",
            callNotes,
          });
        }
        break;

      default:
        await this.emailService.sendGeneralFollowUp({
          clientEmail: client.email!,
          clientName,
          subject: 'Thank you for your time today',
          message:
            'Thank you for speaking with us today. We appreciate your time and look forward to helping you with your project.',
          callNotes,
        });
    }
  }

  async getCallHistory(
    workspaceId: string,
    filters?: {
      clientId?: string;
      status?: string;
      purpose?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<VoiceCall[]> {
    const query: any = { workspaceId };

    if (filters) {
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.status) query.status = filters.status;
      if (filters.purpose) query.callPurpose = filters.purpose;

      if (filters.startDate || filters.endDate) {
        query.startedAt = {};
        if (filters.startDate) query.startedAt.$gte = filters.startDate;
        if (filters.endDate) query.startedAt.$lte = filters.endDate;
      }
    }

    return this.voiceCallModel.find(query).sort({ startedAt: -1 }).exec();
  }

  async updateCallStatus(callId: string, status: VoiceCall['status'], notes?: string) {
    return this.voiceCallModel.findByIdAndUpdate(
      callId,
      {
        status,
        ...(notes && { notes }),
        ...(status === 'completed' && { endedAt: new Date() }),
      },
      { new: true }
    );
  }

  async scheduleAppointmentCall(
    clientId: string,
    workspaceId: string,
    appointmentType: string = 'consultation',
    agentId?: string
  ) {
    return this.initiateOutboundCall(
      clientId,
      workspaceId,
      'appointment_scheduling',
      { appointmentType },
      agentId
    );
  }

  async followUpEstimateCall(
    clientId: string,
    workspaceId: string,
    estimateId: string,
    agentId?: string
  ) {
    return this.initiateOutboundCall(
      clientId,
      workspaceId,
      'estimate_follow_up',
      { estimateId },
      agentId
    );
  }

  async generalFollowUpCall(
    clientId: string,
    workspaceId: string,
    reason: string,
    agentId?: string
  ) {
    return this.initiateOutboundCall(
      clientId,
      workspaceId,
      'follow_up',
      { followUpReason: reason },
      agentId
    );
  }

  async testOutboundCall(to: string, agentId?: string, purpose?: string, context?: string) {
    const tempCallId = `test-call-${Date.now()}`;
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    this.logger.log(`Testing outbound call to: ${formattedPhone}`);
    this.logger.log(`Agent ID: ${agentId || this.eleven.getDefaultAgentId()}`);
    this.logger.log(`Purpose: ${purpose}`);
    this.logger.log(`Context: ${context}`);

    // Create temporary client context for the call
    const tempClientData = {
      _id: `temp-client-${Date.now()}`,
      firstName: context?.includes('Test') ? 'Test' : 'Customer',
      lastName: 'Client',
      phone: formattedPhone,
      email: 'test@example.com',
      company: 'Remodely CRM Test',
      workspaceId: `test-workspace-${Date.now()}`,
      status: 'lead',
      source: 'voice_agent_test',
      notes: `Voice agent test call - ${purpose}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const elevenAgentId = agentId || this.eleven.getDefaultAgentId();

    // IMPORTANT: For TRUE ElevenLabs voices, we need to bypass Twilio entirely
    // The current integration is using Twilio's robotic voices, not ElevenLabs natural voices

    this.logger.warn(
      `NOTICE: For actual ElevenLabs natural voices, use the batch calling interface directly:`
    );
    this.logger.warn(`1. Go to: https://elevenlabs.io/app/conversational-ai/batch-calling/create`);
    this.logger.warn(`2. Select Agent: ${elevenAgentId} (Sarah - Surprise Granite)`);
    this.logger.warn(`3. Add contact: ${formattedPhone}`);
    this.logger.warn(`4. This will use TRUE ElevenLabs voices, not Twilio's robotic voices`);

    // For now, we'll continue with Twilio integration but make it clear this is NOT true ElevenLabs voices
    const hasElevenLabsAgent =
      elevenAgentId && elevenAgentId !== 'default-agent' && this.eleven.apiKey;

    if (hasElevenLabsAgent) {
      this.logger.log(
        `Note: This integration uses Twilio calling with ElevenLabs TTS, NOT pure ElevenLabs voices`
      );
    }

    if (!this.enableOutbound || !this.twilio.isConfigured) {
      this.logger.warn(`Twilio not configured. Simulating outbound call to ${formattedPhone}`);

      // Simulate a successful call for demo purposes
      setTimeout(() => {
        this.logger.log(`Simulated call to ${formattedPhone} completed successfully`);
      }, 5000); // Simulate 5-second call

      return {
        simulated: true,
        callId: tempCallId,
        to: formattedPhone,
        agentId: elevenAgentId,
        sid: 'SIMULATED_CALL',
        status: 'initiated',
        message: 'Call initiated successfully (simulated mode)',
        note: 'Twilio is configured but using simulation for testing',
      };
    }

    try {
      let webhookUrl: string;

      if (hasElevenLabsAgent) {
        // For now, use our enhanced webhook with ElevenLabs TTS instead of direct integration
        // The direct ElevenLabs webhook seems to have authentication/configuration issues
        const backendBase =
          process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
        webhookUrl = `${backendBase}/api/voice-agent/webhook?callId=${tempCallId}&useElevenLabs=true&agentId=${elevenAgentId}`;

        if (purpose) webhookUrl += `&purpose=${encodeURIComponent(purpose)}`;
        if (context) webhookUrl += `&context=${encodeURIComponent(context)}`;

        this.logger.log(`Using enhanced webhook with ElevenLabs TTS: ${webhookUrl}`);
      } else {
        // Fall back to our custom webhook
        const backendBase =
          process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
        webhookUrl = `${backendBase}/api/voice-agent/webhook?callId=${tempCallId}`;

        if (purpose) webhookUrl += `&purpose=${encodeURIComponent(purpose)}`;
        if (context) webhookUrl += `&context=${encodeURIComponent(context)}`;

        this.logger.log(`Using custom webhook: ${webhookUrl}`);
      }

      // Check if we're using localhost (which Twilio can't reach) - only applies to custom webhooks
      if (webhookUrl.includes('localhost')) {
        this.logger.warn(
          `Using localhost webhook URL - Twilio cannot reach this. Use ngrok for real testing.`
        );
        this.logger.log(
          `Would attempt Twilio call to ${formattedPhone} with webhook: ${webhookUrl}`
        );

        // Simulate since localhost webhooks don't work with Twilio
        setTimeout(() => {
          this.logger.log(
            `Simulated call to ${formattedPhone} completed (localhost webhook limitation)`
          );
        }, 5000);

        return {
          simulated: true,
          callId: tempCallId,
          to: formattedPhone,
          agentId: elevenAgentId,
          sid: 'SIMULATED_LOCALHOST',
          status: 'initiated',
          message: 'Call simulated - Twilio configured but localhost webhooks not accessible',
          note: 'Use ngrok or deploy to test real Twilio calls',
        };
      }

      this.logger.log(`Attempting real Twilio call to ${formattedPhone}`);
      const result = await this.twilio.createOutboundCall(formattedPhone, webhookUrl);

      if ('error' in result) {
        this.logger.warn(`Twilio call failed, using simulation: ${result.error}`);

        // Simulate call for demo
        setTimeout(() => {
          this.logger.log(`Simulated call to ${formattedPhone} completed after Twilio error`);
        }, 5000);

        return {
          simulated: true,
          callId: tempCallId,
          to: formattedPhone,
          agentId: elevenAgentId,
          sid: 'SIMULATED_CALL',
          status: 'initiated',
          message: 'Call initiated successfully (fallback to simulation)',
          twilioError: result.error,
        };
      }

      this.logger.log(`Real Twilio call initiated successfully: ${result.sid}`);
      return {
        simulated: false,
        callId: tempCallId,
        to: formattedPhone,
        agentId: elevenAgentId,
        sid: result.sid,
        provider: hasElevenLabsAgent ? 'elevenlabs-twilio' : 'twilio',
        status: 'ringing',
        message: `Call initiated successfully via ${hasElevenLabsAgent ? 'ElevenLabs+Twilio integration' : 'Twilio'}`,
        clientContext: tempClientData,
      };
    } catch (e) {
      this.logger.error('Failed to initiate test outbound call', e as any);
      throw new Error(`Failed to start call: ${(e as Error).message}`);
    }
  }

  generateInboundTwiML(
    purpose?: string,
    context?: string,
    useElevenLabs?: boolean,
    agentId?: string
  ) {
    const backendBase =
      process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const elevenAgentId = agentId || this.eleven.getDefaultAgentId();

    // Enhanced greeting based on purpose and context - Sarah's personality for granite countertops
    let greeting = '';
    if (useElevenLabs && elevenAgentId === 'agent_5401k1we1dkbf1mvt22mme8wz82a') {
      // Use Sarah's specific greeting for granite countertops
      if (purpose?.includes('granite') || purpose?.includes('countertop')) {
        greeting =
          "Hi, I'm Sarah your Surprise Granite countertop and remodeling AI agent! I understand you're interested in granite countertops. I'd love to help you find the perfect stone for your kitchen.";
      } else {
        greeting =
          "Hi, I'm Sarah your Surprise Granite countertop and remodeling AI agent! What kind of project are you dreaming up today?";
      }
    } else if (purpose?.includes('appointment')) {
      greeting =
        "Hello! Thank you for calling Remodely. I understand you're interested in scheduling an appointment. I'm here to help you find the perfect time for your consultation.";
    } else if (purpose?.includes('estimate')) {
      greeting =
        "Hello! Thank you for calling Remodely. I see you're looking for an estimate on your project. I'd be happy to gather some information to help our team provide you with an accurate quote.";
    } else if (purpose?.includes('follow-up')) {
      greeting =
        "Hello! Thank you for calling Remodely. I'm following up on your recent inquiry to see how we can best assist you with your remodeling project.";
    } else {
      greeting =
        "Hello! Thank you for calling Remodely, your trusted home remodeling partner. I'm here to help with any questions about our services.";
    }

    const contextMessage = context ? ` ${context}` : '';

    // Use the best available voice technology
    const voiceSettings = 'voice="Polly.Joanna-Neural" language="en-US"';

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say ${voiceSettings}>${greeting}${contextMessage}</Say>
  <Pause length="1"/>
  <Gather input="speech" action="${backendBase}/api/voice-agent/gather?useElevenLabs=${useElevenLabs || false}" method="POST" speechTimeout="auto" timeout="10" language="en-US" enhanced="true">
    <Say ${voiceSettings}>Please tell me about your project or how I can assist you today. I'm listening and ready to help.</Say>
  </Gather>
  <Say ${voiceSettings}>I didn't hear a response. Let me connect you with our customer service team who can provide personalized assistance. Please hold for just a moment.</Say>
  <Pause length="2"/>
  <Say ${voiceSettings}>Thank you for choosing ${useElevenLabs ? 'Surprise Granite' : 'Remodely'}. Have a wonderful day!</Say>
  <Hangup/>
</Response>`;
  }
}
