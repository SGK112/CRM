import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment extends Document {
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

  @Prop({ required: true, min: 15, max: 480 })
  duration: number; // in minutes

  @Prop({ 
    required: true, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  })
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';

  @Prop({ 
    required: true, 
    enum: ['consultation', 'estimate', 'follow_up', 'installation', 'inspection', 'site_visit', 'meeting', 'other'] 
  })
  type: 'consultation' | 'estimate' | 'follow_up' | 'installation' | 'inspection' | 'site_visit' | 'meeting' | 'other';

  @Prop()
  location?: string;

  @Prop()
  assignedTo?: string; // userId

  @Prop()
  notes?: string;

  @Prop({ default: false })
  reminderSent?: boolean;

  @Prop({ default: false })
  confirmationSent?: boolean;

  @Prop()
  voiceCallId?: string; // Reference to voice call that scheduled this

  @Prop()
  createdBy?: string; // userId or 'voice_agent'

  @Prop({ type: Array, default: [] })
  attendees?: string[]; // Array of user IDs

  @Prop({ type: Object })
  metadata?: {
    estimateId?: string;
    invoiceId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    followUpRequired?: boolean;
    preferredContactMethod?: 'phone' | 'email' | 'text';
    tags?: string[];
    customFields?: Record<string, string | number | boolean | Date>;
  };

  @Prop({ type: Object })
  recurrence?: {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number; // Every X days/weeks/months/years
    endDate?: Date;
    maxOccurrences?: number;
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  };

  @Prop({ type: Object })
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    reminderTimes?: number[]; // Minutes before appointment
  };
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Enhanced indexes for better query performance
AppointmentSchema.index({ workspaceId: 1, scheduledDate: 1 });
AppointmentSchema.index({ workspaceId: 1, clientId: 1, scheduledDate: -1 });
AppointmentSchema.index({ workspaceId: 1, assignedTo: 1, scheduledDate: 1 });
AppointmentSchema.index({ workspaceId: 1, status: 1 });
AppointmentSchema.index({ workspaceId: 1, type: 1 });
AppointmentSchema.index({ workspaceId: 1, 'metadata.priority': 1 });
AppointmentSchema.index({ scheduledDate: 1, status: 1 }); // For reminder queries
AppointmentSchema.index({ workspaceId: 1, title: 'text', description: 'text' }); // Text search
