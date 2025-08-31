import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InboxMessageDocument = InboxMessage & Document;

@Schema({ timestamps: true })
export class InboxMessage {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['email', 'notification', 'sms', 'system'] })
  type: 'email' | 'notification' | 'sms' | 'system';

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  sender: string; // Email address, phone number, or system name

  @Prop()
  senderName: string; // Display name for the sender

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isStarred: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @Prop()
  threadId: string; // Group related messages together

  @Prop()
  replyTo: string; // Email/phone to reply to

  @Prop()
  externalId: string; // External message ID (Gmail ID, Twilio SID, etc.)

  @Prop()
  relatedEntityId: string; // Client ID, Project ID, etc.

  @Prop()
  relatedEntityType: string; // 'client', 'project', 'estimate', etc.

  @Prop({ type: Object })
  metadata: {
    attachments?: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      url: string;
    }>;
    labels?: string[];
    originalHeaders?: Record<string, string>;
    estimateAmount?: number;
    appointmentDate?: Date;
    clientInfo?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    actionUrl?: string; // URL for notification actions
    actionLabel?: string; // Button text for actions
  };

  @Prop()
  lastActivity: Date;

  @Prop()
  scheduledFor: Date; // For scheduled messages
}

export const InboxMessageSchema = SchemaFactory.createForClass(InboxMessage);

// Indexes for better performance
InboxMessageSchema.index({ workspaceId: 1, userId: 1, createdAt: -1 });
InboxMessageSchema.index({ workspaceId: 1, userId: 1, isRead: 1 });
InboxMessageSchema.index({ workspaceId: 1, userId: 1, threadId: 1 });
InboxMessageSchema.index({ workspaceId: 1, userId: 1, type: 1 });
InboxMessageSchema.index({ externalId: 1 });
