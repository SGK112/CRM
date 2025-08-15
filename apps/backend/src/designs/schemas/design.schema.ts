import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Design {
  @Prop({ required: true }) title: string;
  @Prop() status?: string; // draft | active | archived
  @Prop({ type: String }) templateId?: string;
  @Prop({ required: true, index: true }) ownerId: string;
  @Prop({ required: true, index: true }) workspaceId: string;
  @Prop({ type: [String], default: [] }) collaborators: string[];
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop() currentRevisionId?: string;
  @Prop({ default: true }) isActive: boolean;
}

export type DesignDocument = Design & Document;
export const DesignSchema = SchemaFactory.createForClass(Design);
