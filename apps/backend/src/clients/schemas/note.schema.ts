import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  clientId: string;

  @Prop()
  projectId?: string;

  @Prop()
  appointmentId?: string;

  @Prop()
  voiceCallId?: string;

  @Prop()
  estimateId?: string;

  @Prop()
  invoiceId?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['call_note', 'meeting_note', 'follow_up', 'general', 'voice_agent', 'system'] })
  type: 'call_note' | 'meeting_note' | 'follow_up' | 'general' | 'voice_agent' | 'system';

  @Prop()
  createdBy?: string; // userId or 'voice_agent'

  @Prop([String])
  tags: string[];

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: Object })
  metadata?: {
    callDuration?: number;
    callOutcome?: string;
    nextAction?: string;
    followUpDate?: Date;
    sentiment?: 'positive' | 'neutral' | 'negative';
    actionItems?: string[];
  };
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.index({ workspaceId: 1, clientId: 1, createdAt: -1 });
NoteSchema.index({ workspaceId: 1, type: 1, createdAt: -1 });
NoteSchema.index({ workspaceId: 1, createdBy: 1 });
NoteSchema.index({ workspaceId: 1, tags: 1 });
NoteSchema.index({ workspaceId: 1, priority: 1 });

// Text search index
NoteSchema.index({ 
  content: 'text' 
}, { 
  weights: { 
    content: 1
  } 
});
