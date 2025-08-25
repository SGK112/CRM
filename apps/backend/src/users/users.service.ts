import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userModel.findById(id).select('-password').exec();
    } catch (error) {
      return null;
    }
  }

  async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select('-password').exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
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

  async updateNotificationPreferences(userId: string, preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    marketing?: boolean;
  }): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: { notificationPreferences: preferences } },
        { new: true }
      ).select('-password').exec();

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
