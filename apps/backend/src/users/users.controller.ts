import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

export const dynamic = 'force-dynamic';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
      emailSignatureHtml?: string;
      emailSignatureText?: string;
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
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
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
}
