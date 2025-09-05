import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: false, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop()
  company?: string;

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

  @Prop()
  notes?: string;

  @Prop([String])
  tags: string[];

  @Prop([
    {
      platform: String,
      username: String,
      url: String,
    },
  ])
  socialProfiles: {
    platform: string;
    username: string;
    url: string;
  }[];

  @Prop([String])
  projects: string[];

  @Prop({ default: 'lead' })
  status: string;

  @Prop()
  source?: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  quickbooksSynced?: boolean;

  @Prop()
  quickbooksSyncDate?: Date;

  @Prop()
  quickbooksId?: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// At least one contact method validation
// Use explicit this typing instead of suppressing with ts-ignore.
ClientSchema.pre('validate', function (this: any, next) {
  if (!this.email && !this.phone) {
    // Provide synthesized email if phone exists (import path) was already handled upstream; keep defensive check
    return next(new Error('Either email or phone is required'));
  }
  next();
});

ClientSchema.index({ workspaceId: 1, isActive: 1, lastName: 1, firstName: 1 });
ClientSchema.index({ 'address.city': 1, workspaceId: 1 });
ClientSchema.index({ email: 1, workspaceId: 1 }, { unique: false });
ClientSchema.index({ phone: 1, workspaceId: 1 });
ClientSchema.index({ company: 1, workspaceId: 1 });
ClientSchema.index({ status: 1, workspaceId: 1 });
ClientSchema.index({ source: 1, workspaceId: 1 });
ClientSchema.index({ tags: 1, workspaceId: 1 });

// Text index for full-text search
ClientSchema.index(
  {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    company: 'text',
    phone: 'text',
  },
  {
    weights: {
      firstName: 10,
      lastName: 10,
      email: 5,
      company: 3,
      phone: 1,
    },
  }
);
