import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true })
  name: string;

  @Prop()
  website?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ type: [String], default: [] })
  categories: string[];
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
