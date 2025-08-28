import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: false })
  tonAddress?: string;

  @Prop({ default: false })
  isConnected: boolean;

  @Prop({ default: '0' })
  balance: string;

  @Prop({ default: 'mainnet' })
  network: 'mainnet' | 'testnet';

  @Prop()
  lastConnected?: Date;

  @Prop()
  lastBalanceUpdate?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
