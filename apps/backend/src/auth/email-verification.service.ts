import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailService } from '../services/email.service';
import * as crypto from 'crypto';

interface EmailVerificationToken {
  token: string;
  userId: string;
  email: string;
  expires: Date;
  createdAt: Date;
}

@Injectable()
export class EmailVerificationService {
  // In-memory storage for tokens (in production, use Redis or database)
  private verificationTokens = new Map<string, EmailVerificationToken>();
  private readonly logger = new Logger('EmailVerificationService');

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async sendVerificationEmail(user: { id: string; email: string; firstName: string }): Promise<{ success: boolean; verificationUrl?: string }> {
    try {
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store token
      this.verificationTokens.set(token, {
        token,
        userId: user.id,
        email: user.email,
        expires,
        createdAt: new Date(),
      });

      // Clean up expired tokens
      this.cleanupExpiredTokens();

      // Create verification URL - handle different environments
      // Default to the actual dev frontend port (3005) when not explicitly set
      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        'http://localhost:3005';
      const baseUrl = frontendUrl;
      const verificationUrl = `${baseUrl.replace(/\/$/, '')}/auth/verify-email?token=${token}`;

      // Send verification email
  const emailSent = await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address - Remodely CRM',
        html: this.getVerificationEmailTemplate(user.firstName, verificationUrl),
      });

      // Log link in dev to assist debugging
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(`[EmailVerification] Verification link for ${user.email}: ${verificationUrl}`);
      }

  return { success: emailSent, verificationUrl: process.env.NODE_ENV !== 'production' ? verificationUrl : undefined };
    } catch (error) {
      this.logger.error('Failed to send verification email', error?.stack || String(error));
  return { success: false };
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string; user?: { id: string; email: string; firstName: string; lastName: string; isEmailVerified: boolean } }> {
    try {
      const tokenData = this.verificationTokens.get(token);

      if (!tokenData) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      if (new Date() > tokenData.expires) {
        this.verificationTokens.delete(token);
        return { success: false, message: 'Verification token has expired' };
      }

      // Update user as verified in database
      const user = await this.userModel.findByIdAndUpdate(
        tokenData.userId,
        { 
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
        { new: true }
      );

  if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Remove used token
      this.verificationTokens.delete(token);

      return {
        success: true,
        message: 'Email verified successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      };
    } catch (error) {
      this.logger.error('Failed to verify email', error?.stack || String(error));
      return { success: false, message: 'Failed to verify email' };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Send new verification email
      const emailResult = await this.sendVerificationEmail({
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
      });
      if (emailResult.success) {
        const resp: { success: boolean; message: string; verificationUrl?: string } = {
          success: true,
          message: 'Verification email sent successfully',
        };
        if (emailResult.verificationUrl) resp.verificationUrl = emailResult.verificationUrl;
        return resp;
      }
      return { success: false, message: 'Failed to send verification email' };
    } catch (error) {
      this.logger.error('Failed to resend verification email', error?.stack || String(error));
      return { success: false, message: 'Failed to send verification email' };
    }
  }

  async checkVerificationStatus(userId: string): Promise<{ isVerified: boolean; email?: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { isVerified: false };
      }

      return {
        isVerified: user.isEmailVerified,
        email: user.email,
      };
    } catch (error) {
      this.logger.error('Failed to check verification status', error?.stack || String(error));
      return { isVerified: false };
    }
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.verificationTokens.entries()) {
      if (now > data.expires) {
        this.verificationTokens.delete(token);
      }
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Remodely CRM</h1>
          <p style="color: #6b7280; margin: 5px 0;">Professional CRM for Remodeling Contractors</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin: 0 0 20px 0;">Welcome to Remodely CRM, ${firstName}!</h2>
          
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for signing up! To complete your registration and start using all the features of Remodely CRM, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">
            ${verificationUrl}
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border: 1px solid #fbbf24;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What's Next?</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Connect your email and calendar accounts</li>
            <li>Import your existing client data</li>
            <li>Start creating estimates and invoices</li>
            <li>Try our AI-powered features (with paid plan)</li>
            <li>Set up voice agents for client communication</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This verification link will expire in 24 hours. If you didn't create an account with Remodely CRM, 
            please ignore this email.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
            © 2025 Remodely CRM. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}
