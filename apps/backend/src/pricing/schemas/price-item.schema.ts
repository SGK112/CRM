import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PriceItemDocument = PriceItem & Document;

@Schema({ timestamps: true })
export class PriceItem {
  @Prop({ required: true })
  sku: string; // vendor sku or internal code

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  baseCost: number; // cost from vendor list

  @Prop()
  unit?: string; // e.g., ea, sqft, hour

  @Prop({ default: 0 })
  defaultMarginPct: number; // default profit margin percentage

  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
  
  @Prop({ default: 0 })
  inventoryQty: number; // optional current on-hand quantity
}

export const PriceItemSchema = SchemaFactory.createForClass(PriceItem);
PriceItemSchema.index({ workspaceId: 1, sku: 1 }, { unique: true });
