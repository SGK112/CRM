import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userModel.findById(id).select('-password').exec();
    } catch (error) {
      return null;
    }
  }

  async updateProfile(
    userId: string,
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
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedNewPassword;
      await user.save();
      return true;
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }

  async updateNotificationPreferences(
    userId: string,
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
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: { notificationPreferences: preferences } },
          { new: true }
        )
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return false;
      }
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      return false;
    }
  }

  async updateTwoFactorSecret(userId: string, secret: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $set: { twoFactorSecret: secret }
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async enable2FA(userId: string, backupCodes: string[]): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              twoFactorEnabled: true,
              twoFactorBackupCodes: backupCodes,
              twoFactorEnabledAt: new Date(),
            }
          },
          { new: true }
        )
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async disable2FA(userId: string): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              twoFactorEnabled: false,
            },
            $unset: {
              twoFactorSecret: '',
              twoFactorBackupCodes: '',
              twoFactorEnabledAt: '',
            }
          },
          { new: true }
        )
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async updateBackupCodes(userId: string, backupCodes: string[]): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: { twoFactorBackupCodes: backupCodes } },
          { new: true }
        )
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
