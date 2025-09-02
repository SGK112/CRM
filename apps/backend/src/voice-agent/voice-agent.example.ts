/**
 * Voice Agent CRM Integration Examples
 *
 * This file demonstrates how to use the enhanced voice agent service
 * to make calls, schedule appointments, leave notes, and send emails
 * from the CRM system.
 */

import { VoiceAgentService } from './voice-agent.service';

/**
 * Example usage of the Voice Agent CRM integration
 */
export class VoiceAgentExamples {
  constructor(private voiceAgentService: VoiceAgentService) {}

  /**
   * Example 1: Schedule an appointment call for a consultation
   */
  async scheduleConsultationCall(clientId: string, workspaceId: string) {
    try {
      const call = await this.voiceAgentService.scheduleAppointmentCall(
        clientId,
        workspaceId,
        'consultation'
      );

      console.log('Appointment call initiated:', call);
      return call;
    } catch (error) {
      console.error('Failed to schedule appointment call:', error);
      throw error;
    }
  }

  /**
   * Example 2: Follow up on an estimate
   */
  async followUpOnEstimate(clientId: string, workspaceId: string, estimateId: string) {
    try {
      const call = await this.voiceAgentService.followUpEstimateCall(
        clientId,
        workspaceId,
        estimateId
      );

      console.log('Estimate follow-up call initiated:', call);
      return call;
    } catch (error) {
      console.error('Failed to initiate estimate follow-up call:', error);
      throw error;
    }
  }

  /**
   * Example 3: General follow-up call for project update
   */
  async projectUpdateCall(clientId: string, workspaceId: string) {
    try {
      const call = await this.voiceAgentService.generalFollowUpCall(
        clientId,
        workspaceId,
        'Project status update and next steps discussion'
      );

      console.log('Project update call initiated:', call);
      return call;
    } catch (error) {
      console.error('Failed to initiate project update call:', error);
      throw error;
    }
  }

  /**
   * Example 4: Get call history for a client
   */
  async getClientCallHistory(workspaceId: string, clientId: string) {
    try {
      const calls = await this.voiceAgentService.getCallHistory(workspaceId, {
        clientId,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });

      console.log(`Found ${calls.length} calls for client:`, calls);
      return calls;
    } catch (error) {
      console.error('Failed to get call history:', error);
      throw error;
    }
  }

  /**
   * Example 5: Update call status manually
   */
  async markCallCompleted(callId: string, notes: string) {
    try {
      const updatedCall = await this.voiceAgentService.updateCallStatus(callId, 'completed', notes);

      console.log('Call marked as completed:', updatedCall);
      return updatedCall;
    } catch (error) {
      console.error('Failed to update call status:', error);
      throw error;
    }
  }

  /**
   * Example 6: Advanced CRM call with custom data
   */
  async customCRMCall(clientId: string, workspaceId: string) {
    try {
      const call = await this.voiceAgentService.initiateOutboundCall(
        clientId,
        workspaceId,
        'follow_up',
        {
          followUpReason: 'Check satisfaction with recent installation',
          estimateId: 'EST-123456',
        }
      );

      console.log('Custom CRM call initiated:', call);
      return call;
    } catch (error) {
      console.error('Failed to initiate custom CRM call:', error);
      throw error;
    }
  }
}

/**
 * API Endpoint Usage Examples
 *
 * These show how to call the voice agent endpoints from the frontend
 */
export const API_EXAMPLES = {
  // Schedule appointment call
  scheduleAppointmentCall: {
    method: 'POST',
    url: '/voice-agent/schedule-appointment-call',
    body: {
      clientId: '507f1f77bcf86cd799439011',
      workspaceId: '507f1f77bcf86cd799439012',
      appointmentType: 'consultation',
      agentId: 'agent_12345', // optional
    },
  },

  // Estimate follow-up call
  estimateFollowUp: {
    method: 'POST',
    url: '/voice-agent/estimate-follow-up-call',
    body: {
      clientId: '507f1f77bcf86cd799439011',
      workspaceId: '507f1f77bcf86cd799439012',
      estimateId: '507f1f77bcf86cd799439013',
    },
  },

  // General follow-up call
  generalFollowUp: {
    method: 'POST',
    url: '/voice-agent/general-follow-up-call',
    body: {
      clientId: '507f1f77bcf86cd799439011',
      workspaceId: '507f1f77bcf86cd799439012',
      reason: 'Check on project satisfaction and gather feedback',
    },
  },

  // Get call history
  getCallHistory: {
    method: 'GET',
    url: '/voice-agent/call-history/507f1f77bcf86cd799439012?clientId=507f1f77bcf86cd799439011&status=completed&startDate=2024-01-01',
  },

  // Custom CRM call
  customCall: {
    method: 'POST',
    url: '/voice-agent/crm-call',
    body: {
      clientId: '507f1f77bcf86cd799439011',
      workspaceId: '507f1f77bcf86cd799439012',
      callPurpose: 'follow_up',
      callData: {
        followUpReason: 'Post-project satisfaction survey',
        estimateId: 'EST-123456',
        urgency: 'medium',
      },
    },
  },
};

/**
 * Expected Automated Workflows
 *
 * When a call is completed, the system automatically:
 *
 * 1. Creates a note in the client's record with call details
 * 2. If appointment was scheduled, creates appointment and sends confirmation
 * 3. Sends appropriate follow-up emails based on call purpose
 * 4. Schedules future follow-ups if required
 * 5. Updates call status and logs all activities
 *
 * Database records created:
 * - VoiceCall: Complete call tracking with results
 * - Note: Call summary and action items
 * - Appointment: If scheduled during call
 * - Email logs: Confirmation and follow-up emails sent
 */
