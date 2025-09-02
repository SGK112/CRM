import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoiceCallDocument = VoiceCall & Document;

@Schema({ timestamps: true })
export class VoiceCall {
  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, enum: ['outbound', 'inbound'] })
  direction: 'outbound' | 'inbound';

  @Prop({
    required: true,
    enum: ['initiated', 'ringing', 'answered', 'busy', 'failed', 'completed', 'no-answer'],
  })
  status: 'initiated' | 'ringing' | 'answered' | 'busy' | 'failed' | 'completed' | 'no-answer';

  @Prop()
  twilioCallSid?: string;

  @Prop()
  elevenlabsAgentId?: string;

  @Prop()
  duration?: number; // in seconds

  @Prop()
  recording?: string; // URL to recording

  @Prop()
  transcript?: string;

  @Prop()
  callPurpose?: string; // e.g., 'appointment_scheduling', 'follow_up', 'estimate_follow_up'

  @Prop({ type: Object })
  callResult?: {
    appointmentScheduled?: boolean;
    appointmentDate?: Date;
    appointmentType?: string;
    followUpRequired?: boolean;
    followUpDate?: Date;
    estimateStatus?: string;
    notes?: string;
    nextAction?: string;
  };

  @Prop()
  notes?: string;

  @Prop()
  initiatedBy?: string; // userId who initiated the call

  @Prop()
  cost?: number; // Call cost in cents

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  endedAt?: Date;
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);

VoiceCallSchema.index({ workspaceId: 1, clientId: 1, startedAt: -1 });
VoiceCallSchema.index({ workspaceId: 1, status: 1 });
VoiceCallSchema.index({ workspaceId: 1, callPurpose: 1 });
VoiceCallSchema.index({ twilioCallSid: 1 }, { unique: true, sparse: true });
