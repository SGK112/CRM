import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UpdateEmailConfigDto, UpdateTwilioConfigDto } from './dto/user-config.dto';

@Injectable()
export class UserConfigService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUserConfig(userId: string) {
    const user = await this.userModel.findById(userId).select('emailConfig twilioConfig').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailConfig: user.emailConfig || {},
      twilioConfig: user.twilioConfig || {},
    };
  }

  async updateEmailConfig(userId: string, updateEmailConfigDto: UpdateEmailConfigDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            emailConfig: {
              ...user.emailConfig,
              ...updateEmailConfigDto,
            },
          },
        },
        { new: true }
      )
      .select('emailConfig')
      .exec();

    return {
      success: true,
      message: 'Email configuration updated successfully',
      emailConfig: updatedUser?.emailConfig,
    };
  }

  async updateTwilioConfig(userId: string, updateTwilioConfigDto: UpdateTwilioConfigDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            twilioConfig: {
              ...user.twilioConfig,
              ...updateTwilioConfigDto,
            },
          },
        },
        { new: true }
      )
      .select('twilioConfig')
      .exec();

    return {
      success: true,
      message: 'Twilio configuration updated successfully',
      twilioConfig: updatedUser?.twilioConfig,
    };
  }
}
