import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['lead', 'proposal', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'lead',
  })
  status: string;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: string;

  @Prop({ required: true })
  clientId: string;

  @Prop([String])
  assignedTo: string[];

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: Number, default: 0 })
  budget: number;

  @Prop({ type: Number, default: 0 })
  actualCost: number;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
  })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  @Prop([String])
  images: string[];

  @Prop([String])
  documents: string[];

  @Prop({ required: true })
  workspaceId: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
