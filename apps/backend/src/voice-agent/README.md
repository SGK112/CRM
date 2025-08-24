# Voice Agent CRM Integration

This enhanced voice agent system provides comprehensive CRM integration capabilities, allowing you to:

- **Make automated calls** to clients from the CRM
- **Schedule appointments** through voice conversations  
- **Automatically create notes** from call transcripts
- **Send follow-up emails** based on call outcomes
- **Track call history** and results

## Features Implemented

### 🔄 **Complete Call Management**
- Outbound call initiation with CRM data context
- Call status tracking (initiated → ringing → answered → completed)
- Integration with Twilio for calling and ElevenLabs for AI voice
- Comprehensive call result processing

### 📅 **Appointment Scheduling**
- Voice agent can schedule appointments during calls
- Automatic appointment confirmation emails
- Integration with existing appointment system
- Support for different appointment types (consultation, estimate, installation, etc.)

### 📝 **Automated Note Taking**
- Call transcripts automatically converted to client notes
- Action items and follow-up tasks extracted
- Call duration, outcome, and sentiment tracking
- Searchable notes with voice call references

### 📧 **Email Automation**
- Appointment confirmation emails
- Estimate follow-up emails with call context
- General follow-up emails based on call purpose
- Customizable email templates

### 📊 **Call Analytics & History**
- Complete call history per client and workspace
- Filter by status, purpose, date range
- Call outcome tracking and reporting
- Cost tracking per call

## Database Schema

### VoiceCall
Tracks all voice agent calls with comprehensive metadata:
```typescript
{
  clientId: string;           // CRM client reference
  workspaceId: string;        // Workspace context
  phoneNumber: string;        // Client phone number
  direction: 'outbound' | 'inbound';
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed';
  callPurpose: string;        // appointment_scheduling, estimate_follow_up, etc.
  callResult: {               // Structured call outcomes
    appointmentScheduled?: boolean;
    appointmentDate?: Date;
    followUpRequired?: boolean;
    estimateStatus?: string;
    notes?: string;
  };
  transcript?: string;        // Full call transcript
  duration?: number;          // Call duration in seconds
  cost?: number;             // Call cost tracking
}
```

### Enhanced Integration
- **Appointments**: Voice calls can create and manage appointments
- **Notes**: Automatic note creation with call context
- **Clients**: Deep integration with client data
- **Estimates**: Follow-up calls linked to specific estimates

## API Endpoints

### Schedule Appointment Call
```bash
POST /voice-agent/schedule-appointment-call
{
  "clientId": "507f1f77bcf86cd799439011",
  "workspaceId": "507f1f77bcf86cd799439012", 
  "appointmentType": "consultation"
}
```

### Estimate Follow-up Call
```bash
POST /voice-agent/estimate-follow-up-call
{
  "clientId": "507f1f77bcf86cd799439011",
  "workspaceId": "507f1f77bcf86cd799439012",
  "estimateId": "507f1f77bcf86cd799439013"
}
```

### General Follow-up Call
```bash
POST /voice-agent/general-follow-up-call
{
  "clientId": "507f1f77bcf86cd799439011",
  "workspaceId": "507f1f77bcf86cd799439012",
  "reason": "Project status update"
}
```

### Get Call History
```bash
GET /voice-agent/call-history/:workspaceId?clientId=123&status=completed&startDate=2024-01-01
```

## Automated Workflows

When a voice agent call completes, the system automatically:

1. **Creates a note** in the client's record with call transcript and key points
2. **Schedules appointments** if one was arranged during the call
3. **Sends confirmation emails** for appointments
4. **Sends follow-up emails** based on call purpose (estimate follow-up, general follow-up, etc.)
5. **Schedules future follow-ups** if required
6. **Updates call status** and logs all activities

## Service Architecture

### VoiceAgentService
- `initiateOutboundCall()` - Start CRM-integrated calls
- `processCallResults()` - Handle call outcomes automatically
- `scheduleAppointmentCall()` - Specific appointment scheduling calls
- `followUpEstimateCall()` - Estimate-specific follow-ups
- `getCallHistory()` - Retrieve call analytics

### Supporting Services
- **EmailService** - Template-based email automation
- **AppointmentsService** - Appointment scheduling and management
- **NotesService** - Note creation and voice call integration
- **TwilioService** - Call handling and SMS
- **ElevenLabsService** - AI voice agent management

## Configuration Required

### Environment Variables
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_default_agent_id

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Database Collections
The system uses these MongoDB collections:
- `voicecalls` - Call tracking and results
- `appointments` - Scheduled appointments
- `notes` - Client notes with voice call integration
- `clients` - CRM client data
- `estimates` - Estimate data for follow-ups

## Frontend Integration

The voice agent can be integrated into your CRM frontend with:

1. **Client detail page** - "Call Client" buttons for different purposes
2. **Estimate view** - "Follow up via call" option
3. **Appointment calendar** - "Schedule via call" functionality
4. **Call history dashboard** - View all voice agent activities
5. **Notes integration** - Show voice call notes in client timeline

## Next Steps

To fully utilize this system:

1. **Configure services** - Set up Twilio and ElevenLabs accounts
2. **Update frontend** - Add voice agent buttons to CRM interfaces  
3. **Customize templates** - Modify email templates for your brand
4. **Train agents** - Configure AI voice agent prompts for your business
5. **Monitor usage** - Track call success rates and optimize workflows

The system is now ready to handle automated voice calls that integrate seamlessly with your CRM data, creating a complete sales and customer service automation solution.
