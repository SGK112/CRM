# ElevenLabs Voice Agent Integration for Remodely CRM

## Overview
This integration allows businesses like Surprise Granite to use ElevenLabs' high-quality AI voice agent "Sarah" to make outbound calls directly from the Remodely CRM interface.

## Features
- **High-Quality Voice**: Uses ElevenLabs' premium voice synthesis for natural-sounding conversations
- **Specialist Knowledge**: Sarah is trained on granite countertop expertise and Surprise Granite processes
- **CRM Integration**: One-click calling from client profiles with automatic context passing
- **Multiple Call Types**: Consultations, follow-ups, scheduling, sales calls
- **Easy Setup**: Simple batch calling interface with detailed instructions

## Technical Architecture

### Backend Components

#### 1. ElevenLabs Integration Service (`elevenlabs-integration.service.ts`)
```typescript
interface ElevenLabsCallRequest {
  clientId: string;
  clientName: string;
  phoneNumber: string;
  agentId: string;
  purpose: string;
  context?: string;
  workspaceId: string;
}
```

#### 2. Voice Agent Controller Endpoint
- **Endpoint**: `POST /api/voice-agent/elevenlabs-call`
- **Purpose**: Generate ElevenLabs call setup instructions
- **Response**: Returns batch calling URLs and detailed instructions

### Frontend Components

#### 1. ElevenLabsCallComponent (`ElevenLabsCallComponent-Fixed.tsx`)
- **Purpose**: React component for CRM voice calling interface
- **Features**: 
  - Client information display
  - Call purpose selection
  - Context input
  - One-click call setup
  - Instruction display with quick actions

#### 2. Demo Page (`voice-agent-demo/page.tsx`)
- **Purpose**: Demonstration of full integration
- **Features**: Complete workflow example with sample client data

## Agent Configuration

### Sarah - Granite Specialist Agent
- **Agent ID**: `agent_5401k1we1dkbf1mvt22mme8wz82a`
- **Specialization**: Granite countertops, installation, pricing
- **Company Knowledge**: Surprise Granite processes and products
- **Capabilities**: 
  - Lead qualification
  - Appointment scheduling
  - Quote discussions
  - Objection handling
  - Follow-up coordination

## Usage Workflow

### 1. For Business Users (Surprise Granite Team)
1. Open client profile in CRM
2. Click "Setup ElevenLabs Call" button
3. Select call purpose from dropdown
4. Add any additional context
5. Click "Setup ElevenLabs Call"
6. Follow generated instructions to initiate call

### 2. Generated Instructions Include:
- Direct link to ElevenLabs batch calling interface
- Pre-filled contact information
- Call purpose and context
- Alternative direct agent link
- Copy-to-clipboard functionality

### 3. ElevenLabs Call Execution:
1. Visit provided batch calling URL
2. Select Sarah agent (pre-configured)
3. Contact information auto-populated
4. Click "Start Batch Call"
5. Sarah initiates high-quality outbound call

## API Integration Details

### Request Format
```json
{
  "clientId": "client_sg_001",
  "clientName": "Maria Rodriguez", 
  "phoneNumber": "4802555887",
  "workspaceId": "surprise_granite_workspace",
  "purpose": "Schedule granite countertop consultation",
  "context": "Kitchen remodel project, budget $3000-5000"
}
```

### Response Format
```json
{
  "success": true,
  "callType": "elevenlabs_batch",
  "instructions": "# ElevenLabs Call Setup for Maria Rodriguez...",
  "agentUrl": "https://elevenlabs.io/app/talk-to?agent_id=agent_5401k1we1dkbf1mvt22mme8wz82a",
  "batchUrl": "https://elevenlabs.io/app/conversational-ai/batch-calling/create",
  "clientInfo": {
    "id": "client_sg_001",
    "name": "Maria Rodriguez",
    "phone": "4802555887",
    "purpose": "Schedule granite countertop consultation",
    "context": "Kitchen remodel project, budget $3000-5000"
  }
}
```

## Environment Configuration

### Required Environment Variables
```bash
ELEVENLABS_API_KEY=sk_ea41f4ce7136e963cfa2bfc3dd6b0721f55b87c26d50920e
ELEVENLABS_AGENT_ID=agent_5401k1we1dkbf1mvt22mme8wz82a
```

## Call Purpose Templates

### Pre-configured Call Types:
1. **Schedule granite countertop consultation**
2. **Follow up on quote request**
3. **Discuss installation timeline**
4. **Address customer concerns**
5. **Book site measurement appointment**
6. **Confirm installation date**
7. **Custom purpose** (user-defined)

## Integration Benefits

### For Surprise Granite:
- **Increased Lead Response**: Immediate follow-up on new leads
- **Higher Conversion**: Natural conversations build trust
- **Cost Efficiency**: 24/7 availability without staffing costs
- **Consistent Quality**: Every call follows best practices
- **Scalability**: Handle unlimited concurrent calls

### For Customers:
- **Professional Experience**: High-quality, natural voice interactions
- **Immediate Response**: No waiting for callbacks
- **Knowledgeable Agent**: Granite expertise and company knowledge
- **Convenient Scheduling**: Easy appointment booking process

## Future Enhancements

### Planned Improvements:
1. **Direct API Integration**: Once ElevenLabs exposes outbound calling API
2. **Call Recording**: Automatic conversation logging
3. **Lead Scoring**: AI-powered lead qualification metrics
4. **Integration Webhooks**: Real-time call status updates
5. **Multi-Agent Support**: Different specialists for different call types

## Troubleshooting

### Common Issues:
1. **Agent Not Found**: Verify ELEVENLABS_AGENT_ID is correct
2. **API Key Invalid**: Check ELEVENLABS_API_KEY in environment
3. **Phone Number Format**: Ensure proper formatting (no special characters)
4. **Batch Calling Access**: Verify ElevenLabs account has batch calling enabled

### Support:
- Check ElevenLabs dashboard for agent configuration
- Verify API key permissions in ElevenLabs account settings
- Test with sample data before production use

## Demo Access

Visit the demo page at: `/voice-agent-demo`
- Shows complete integration workflow
- Sample client data for testing
- Full feature demonstration

This integration provides Surprise Granite with a powerful tool to enhance customer communication, increase sales conversion, and provide superior customer service through AI-powered voice agents.
