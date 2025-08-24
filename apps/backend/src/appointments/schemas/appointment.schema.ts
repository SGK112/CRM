import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop()
  projectId?: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  duration: number; // in minutes

  @Prop({ required: true, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] })
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

  @Prop({ required: true, enum: ['consultation', 'estimate', 'follow_up', 'installation', 'inspection', 'other'] })
  type: 'consultation' | 'estimate' | 'follow_up' | 'installation' | 'inspection' | 'other';

  @Prop()
  location?: string;

  @Prop()
  assignedTo?: string; // userId

  @Prop()
  notes?: string;

  @Prop()
  reminderSent?: boolean;

  @Prop()
  confirmationSent?: boolean;

  @Prop()
  voiceCallId?: string; // Reference to voice call that scheduled this

  @Prop()
  createdBy?: string; // userId or 'voice_agent'

  @Prop({ type: Object })
  metadata?: {
    estimateId?: string;
    invoiceId?: string;
    priority?: 'low' | 'medium' | 'high';
    followUpRequired?: boolean;
    preferredContactMethod?: 'phone' | 'email' | 'text';
  };
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ workspaceId: 1, scheduledDate: 1 });
AppointmentSchema.index({ workspaceId: 1, clientId: 1, scheduledDate: -1 });
AppointmentSchema.index({ workspaceId: 1, assignedTo: 1, scheduledDate: 1 });
AppointmentSchema.index({ workspaceId: 1, status: 1 });
AppointmentSchema.index({ workspaceId: 1, type: 1 });
