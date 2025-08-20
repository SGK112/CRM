import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiTokenBalanceDocument = AiTokenBalance & Document;

@Schema({ timestamps: true })
export class AiTokenBalance {
  @Prop({ required: true, unique: true }) workspaceId: string;
  @Prop({ default: 0 }) purchased: number; // total purchased tokens
  @Prop({ default: 0 }) consumed: number; // total consumed tokens
  @Prop({ default: 0 }) bonus: number; // promotional / trial tokens
  @Prop({ default: 0 }) reserved: number; // reserved for in-flight operations
}

export const AiTokenBalanceSchema = SchemaFactory.createForClass(AiTokenBalance);
AiTokenBalanceSchema.index({ workspaceId: 1 });
