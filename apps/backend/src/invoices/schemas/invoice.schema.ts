import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class InvoiceLineItem {
  @Prop() name: string;
  @Prop() description?: string;
  @Prop({ default: 1 }) quantity: number;
  @Prop({ default: 0 }) unitPrice: number;
  @Prop({ default: 0 }) total: number;
  @Prop({ default: false }) taxable: boolean;
}
export const InvoiceLineItemSchema = SchemaFactory.createForClass(InvoiceLineItem);

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true }) workspaceId: string;
  @Prop({ required: true }) number: string; // INV-1001
  @Prop({ required: true }) clientId: string;
  @Prop() projectId?: string;
  @Prop({ default: 'draft', enum: ['draft', 'sent', 'partial', 'paid', 'void'] }) status: string;
  @Prop({ type: [InvoiceLineItemSchema], default: [] }) items: InvoiceLineItem[];
  @Prop({ default: 0 }) subtotal: number;
  @Prop({ default: 0 }) taxRate: number;
  @Prop({ default: 0 }) taxAmount: number;
  @Prop({ default: 0 }) total: number;
  @Prop({ default: 0 }) depositRequired: number; // Absolute deposit amount required (optional)
  @Prop({ default: 0 }) depositPaid: number; // Amount paid toward deposit
  @Prop({ default: 0 }) balanceRemaining: number; // Computed = total - amountPaid
  @Prop({ default: false }) showDepositDetails: boolean; // Toggle to show deposit section on client-facing docs
  @Prop({ default: false }) showProfitMetrics: boolean; // Internal only; never exposed to client PDFs if false
  @Prop() estimateId?: string; // link back to source estimate
  @Prop() notes?: string;
  @Prop() dueDate?: Date;
  @Prop({ default: 0 }) amountPaid: number;
}
export type InvoiceDocument = Invoice & Document;
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ workspaceId: 1, number: 1 }, { unique: true });
