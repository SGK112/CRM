import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal';

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true, default: 'TON' })
  currency: 'TON' | 'USD';

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'confirmed' | 'failed';

  @Prop()
  txHash?: string;

  @Prop()
  clientId?: string;

  @Prop()
  projectId?: string;

  @Prop()
  invoiceId?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  confirmedAt?: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
