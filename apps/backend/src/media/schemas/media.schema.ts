import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true }) workspaceId: string;
  @Prop() projectId?: string;
  @Prop({ required: true }) uploaderUserId: string;
  @Prop({ required: true }) provider: string; // cloudinary | s3
  @Prop({ required: true }) originalFilename: string;
  @Prop({ required: true }) mimeType: string;
  @Prop({ required: true }) bytes: number;
  @Prop() width?: number;
  @Prop() height?: number;
  @Prop({ required: true }) hash: string; // sha256 for dedupe
  @Prop({ required: true }) publicId: string; // cloudinary public_id or s3 key
  @Prop({ default: 'workspace', enum: ['public','workspace','restricted'] }) access: string;
  @Prop({ type: [Object], default: [] }) variants: { type: string; url: string; width?: number; height?: number; }[];
  @Prop() description?: string;
  @Prop() tags?: string[];
  @Prop({ default: false }) deleted: boolean;
  @Prop() deletedAt?: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ workspaceId: 1, projectId: 1 });
MediaSchema.index({ hash: 1, workspaceId: 1 });
