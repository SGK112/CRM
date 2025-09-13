import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TwoFactorService } from '../auth/two-factor.service';
import { UsersService } from './users.service';

export const dynamic = 'force-dynamic';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    const userId = req.user.sub || req.user._id;
    return await this.usersService.findById(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      company?: string;
      jobTitle?: string;
      bio?: string;
      emailSignatureHtml?: string;
      emailSignatureText?: string;
      customTheme?: string;
      timezone?: string;
      language?: string;
    }
  ) {
    const userId = req.user.sub || req.user._id;
    const updatedUser = await this.usersService.updateProfile(userId, updateData);

    return {
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updatePassword(
    @Request() req,
    @Body()
    passwordData: {
      currentPassword: string;
      newPassword: string;
    }
  ) {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }

    if (passwordData.newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    const userId = req.user.sub || req.user._id;

    try {
      await this.usersService.updatePassword(
        userId,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('notifications')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Request() req,
    @Body()
    preferences: {
      emailNotifications?: {
        newLeads?: boolean;
        appointmentUpdates?: boolean;
        estimateUpdates?: boolean;
        paymentNotifications?: boolean;
      };
      pushNotifications?: {
        newLeads?: boolean;
        messages?: boolean;
        appointmentReminders?: boolean;
      };
    }
  ) {
    const userId = req.user.sub || req.user._id;
    const updatedUser = await this.usersService.updateNotificationPreferences(userId, preferences);

    return {
      success: true,
      message: 'Notification preferences updated successfully',
      user: updatedUser,
    };
  }

  // Two-Factor Authentication Endpoints

  @Post('2fa/setup')
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Returns QR code and secret for 2FA setup' })
  async setup2FA(@Request() req) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const { secret, otpauthUrl } = this.twoFactorService.generateSecret(user.email);
    const qrCodeDataURL = await this.twoFactorService.generateQRCode(otpauthUrl);

    // Store the secret temporarily (not enabled yet)
    await this.usersService.updateTwoFactorSecret(userId, secret);

    return {
      success: true,
      message: '2FA setup initiated',
      data: {
        secret,
        qrCodeDataURL,
        otpauthUrl,
      },
    };
  }

  @Post('2fa/verify-setup')
  @ApiOperation({ summary: 'Verify and enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async verify2FASetup(
    @Request() req,
    @Body() body: { token: string }
  ) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const isValidToken = this.twoFactorService.verifyToken(body.token, user.twoFactorSecret);

    if (!isValidToken) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes();

    // Enable 2FA
    await this.usersService.enable2FA(userId, backupCodes);

    return {
      success: true,
      message: 'Two-factor authentication enabled successfully',
      data: {
        backupCodes,
      },
    };
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(
    @Request() req,
    @Body() body: { password: string; token?: string }
  ) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify current password
    const isValidPassword = await this.usersService.verifyPassword(userId, body.password);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // If 2FA is enabled, require TOTP token
    if (user.twoFactorSecret && body.token) {
      const isValidToken = this.twoFactorService.verifyToken(body.token, user.twoFactorSecret);
      if (!isValidToken) {
        throw new BadRequestException('Invalid verification code');
      }
    }

    // Disable 2FA
    await this.usersService.disable2FA(userId);

    return {
      success: true,
      message: 'Two-factor authentication disabled successfully',
    };
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA token for login' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  async verify2FA(
    @Request() req,
    @Body() body: { token: string }
  ) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    const isValidToken = this.twoFactorService.verifyToken(body.token, user.twoFactorSecret);

    if (!isValidToken) {
      throw new BadRequestException('Invalid verification code');
    }

    return {
      success: true,
      message: 'Verification code is valid',
    };
  }

  @Get('2fa/backup-codes')
  @ApiOperation({ summary: 'Get backup codes' })
  @ApiResponse({ status: 200, description: 'Returns backup codes' })
  async getBackupCodes(@Request() req) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    return {
      success: true,
      data: {
        backupCodes: user.twoFactorBackupCodes || [],
      },
    };
  }

  @Post('2fa/regenerate-backup-codes')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'New backup codes generated' })
  async regenerateBackupCodes(
    @Request() req,
    @Body() body: { password: string }
  ) {
    const userId = req.user.sub || req.user._id;
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    // Verify current password
    const isValidPassword = await this.usersService.verifyPassword(userId, body.password);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Generate new backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes();
    await this.usersService.updateBackupCodes(userId, backupCodes);

    return {
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes,
      },
    };
  }
}
