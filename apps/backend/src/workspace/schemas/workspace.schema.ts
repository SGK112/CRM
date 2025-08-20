import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, unique: true })
  workspaceId: string; // stable id used in JWT

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'free' })
  plan: string; // free | starter | growth | enterprise (future)

  @Prop({ default: 3 })
  seatLimit: number;

  @Prop({ default: 0 })
  employeeLimit: number; // 0 = unlimited for plan

  @Prop({ default: '' })
  brandingColor?: string;

  @Prop({ default: '' })
  logoUrl?: string;

  @Prop({ default: true })
  personalizationEnabled: boolean;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
WorkspaceSchema.index({ plan: 1 });
