import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ 
    type: String, 
    enum: ['owner', 'admin', 'sales_associate', 'project_manager', 'team_member', 'client'],
    default: 'team_member'
  })
  role: string;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  // Subscription / Billing
  @Prop()
  stripeCustomerId?: string;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop()
  subscriptionPlan?: string; // e.g., starter, growth

  @Prop()
  subscriptionStatus?: string; // active, trialing, past_due, canceled, incomplete

  @Prop()
  trialEndsAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
