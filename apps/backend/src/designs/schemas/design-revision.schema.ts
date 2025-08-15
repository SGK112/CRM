import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DesignRevision {
  @Prop({ required: true, index: true }) designId: string;
  @Prop({ required: true }) index: number;
  @Prop({ type: Object, default: {} }) canvasData: Record<string, any>;
  @Prop({ default: false }) autosave: boolean;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true, index: true }) workspaceId: string;
}

export type DesignRevisionDocument = DesignRevision & Document;
export const DesignRevisionSchema = SchemaFactory.createForClass(DesignRevision);
