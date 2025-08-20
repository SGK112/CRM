import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShareLinkDocument = ShareLink & Document;

@Schema({ timestamps: true })
export class ShareLink {
  @Prop({ required: true }) token: string; // random
  @Prop({ required: true }) type: string; // project | file | invitation | meeting
  @Prop({ required: true }) targetId: string;
  @Prop({ required: true }) workspaceId: string;
  @Prop({ type: [String], default: [] }) permissions: string[];
  @Prop() expiresAt?: Date;
  @Prop({ default: 1 }) maxUses: number;
  @Prop({ default: 0 }) usedCount: number;
  @Prop() passwordHash?: string;
  @Prop({ required: true }) createdByUserId: string;
  @Prop() revokedAt?: Date;
  @Prop({ type: Object }) metadata?: Record<string, any>;
  @Prop({ default: false }) singleUse: boolean;
}

export const ShareLinkSchema = SchemaFactory.createForClass(ShareLink);
ShareLinkSchema.index({ token: 1 }, { unique: true });
ShareLinkSchema.index({ workspaceId: 1, targetId: 1 });
