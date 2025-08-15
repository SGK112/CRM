import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DesignTemplate {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) type: string; // residential | commercial | renovation
  @Prop({ required: true }) category: string;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) features: string[];
  @Prop({ type: Object, default: {} }) baseData: Record<string, any>;
  @Prop() thumbnailUrl?: string;
  @Prop({ default: 0 }) usesCount: number;
  @Prop({ type: Date }) lastUsedAt?: Date;
  @Prop({ required: true, index: true }) workspaceId: string;
  @Prop({ default: true }) isActive: boolean;
}

export type DesignTemplateDocument = DesignTemplate & Document;
export const DesignTemplateSchema = SchemaFactory.createForClass(DesignTemplate);
