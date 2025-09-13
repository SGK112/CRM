import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorService {
  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(userEmail: string): { secret: string; qrCodeUrl: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: 'Remodely CRM',
      length: 32,
    });

    return {
      secret: secret.base32!,
      qrCodeUrl: secret.otpauth_url!,
      otpauthUrl: secret.otpauth_url!,
    };
  }

  /**
   * Generate QR code data URL for the secret
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token against a secret
   */
  verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps of variance (60 seconds each)
    });
  }

  /**
   * Generate a backup code (for account recovery)
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate a current TOTP token (for testing purposes)
   */
  generateToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }
}
