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

  // Primary contact person at the vendor (sales rep or account manager)
  @Prop()
  contactName?: string;

  // Internal owner / assigned purchaser on our side
  @Prop()
  internalOwnerUserId?: string;

  // Sales / account representative specific fields
  @Prop()
  salesRepName?: string;

  @Prop()
  salesRepEmail?: string;

  @Prop()
  salesRepPhone?: string;

  // Ordering process description (free-form markdown / instructions)
  @Prop()
  orderingProcess?: string;

  // Payment / net terms (e.g. Net 30, COD, Prepaid)
  @Prop()
  paymentTerms?: string;

  // Default lead time in days
  @Prop()
  leadTimeDays?: number;

  // Minimum order quantity or amount (store as string to support units; alternative could be number + unit)
  @Prop()
  minimumOrder?: string;

  // Shipping notes / logistics constraints
  @Prop()
  logisticsNotes?: string;

  // General notes (long form, markdown allowed)
  @Prop()
  notes?: string;

  // Support multiple ways to tag vendors (category-like freeform tags)
  @Prop({ type:[String], default: [] })
  tags: string[];

  // Arbitrary key/value metadata for future custom fields
  @Prop({ type: Object, default: {} })
  meta: Record<string, any>;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ type: [String], default: [] })
  categories: string[];
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
