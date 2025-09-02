import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class EstimateLineItem {
  @Prop({ type: Types.ObjectId, ref: 'PriceItem' })
  priceItemId?: string;

  @Prop()
  sku?: string; // denormalized for quick reference

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: 0 })
  baseCost: number; // cost per unit

  @Prop({ default: 50 })
  marginPct: number; // percent over cost (line-level override)

  @Prop({ default: 0 })
  sellPrice: number; // computed (quantity * cost * (1 + marginPct/100))

  @Prop({ default: false })
  taxable: boolean;
}

export const EstimateLineItemSchema = SchemaFactory.createForClass(EstimateLineItem);

@Schema({ timestamps: true })
export class Estimate {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  number: string; // e.g. EST-1001

  @Prop({ required: true })
  clientId: string;

  @Prop()
  projectId?: string;

  @Prop({
    default: 'draft',
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
  })
  status: string;

  @Prop({ type: [EstimateLineItemSchema], default: [] })
  items: EstimateLineItem[];

  @Prop({ default: 0 })
  subtotalCost: number;

  @Prop({ default: 0 })
  subtotalSell: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 'percent' })
  discountType: string; // percent | fixed

  @Prop({ default: 0 })
  discountValue: number; // value representing percentage or fixed amount

  @Prop({ default: 0 })
  taxRate: number; // percent

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  total: number;

  @Prop({ default: 0 })
  totalMargin: number; // subtotalSell - subtotalCost (before discounts/tax)

  @Prop()
  notes?: string;
}

export type EstimateDocument = Estimate & Document;
export const EstimateSchema = SchemaFactory.createForClass(Estimate);
EstimateSchema.index({ workspaceId: 1, number: 1 }, { unique: true });
