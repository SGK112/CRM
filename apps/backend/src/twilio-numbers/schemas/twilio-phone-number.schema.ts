import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TwilioPhoneNumberDocument = TwilioPhoneNumber & Document;

@Schema({ timestamps: true })
export class TwilioPhoneNumber {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  twilioSid: string;

  @Prop({ required: true })
  friendlyName: string;

  @Prop()
  areaCode?: string;

  @Prop()
  city?: string;

  @Prop()
  region?: string;

  @Prop()
  country: string;

  @Prop({ required: true })
  monthlyFee: number; // in cents

  @Prop({ default: 'active' })
  status: 'active' | 'suspended' | 'cancelled';

  @Prop({ required: true })
  purchasedAt: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Object })
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
}

export const TwilioPhoneNumberSchema = SchemaFactory.createForClass(TwilioPhoneNumber);
