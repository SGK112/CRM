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
    default: 'team_member',
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

  // Email signature (per-user)
  @Prop()
  emailSignatureHtml?: string; // preferred rich signature

  @Prop()
  emailSignatureText?: string; // fallback plain-text signature

  // Google OAuth tokens (for Calendar sync; optional)
  @Prop({
    type: {
      accessToken: String,
      refreshToken: String,
      scope: String,
      tokenType: String,
      expiryDate: Number,
    },
  })
  googleAuth?: {
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    tokenType?: string;
    expiryDate?: number; // ms since epoch
  };

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

  // Communication Configuration
  @Prop({
    type: {
      provider: String, // 'gmail', 'outlook', 'smtp'
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
      fromEmail: String,
      fromName: String,
      secure: { type: Boolean, default: true },
    },
  })
  emailConfig?: {
    provider?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    secure?: boolean;
  };

  @Prop({
    type: {
      accountSid: String,
      authToken: String,
      phoneNumber: String,
      webhookUrl: String,
    },
  })
  twilioConfig?: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
    webhookUrl?: string;
  };

  // PDF Template Preferences
  @Prop({
    type: {
      estimateTemplate: { type: String, enum: ['professional', 'modern', 'classic'], default: 'professional' },
      invoiceTemplate: { type: String, enum: ['professional', 'modern', 'classic'], default: 'professional' },
    },
  })
  pdfTemplates?: {
    estimateTemplate?: 'professional' | 'modern' | 'classic';
    invoiceTemplate?: 'professional' | 'modern' | 'classic';
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes to support seat counting and role queries
UserSchema.index({ workspaceId: 1, role: 1 });
UserSchema.index({ workspaceId: 1, isActive: 1 });
