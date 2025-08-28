import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // 'estimate_viewed', 'payment_received', 'new_lead', etc.

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  relatedId: string; // ID of related estimate, invoice, client, etc.

  @Prop()
  relatedType: string; // 'estimate', 'invoice', 'client', etc.

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
