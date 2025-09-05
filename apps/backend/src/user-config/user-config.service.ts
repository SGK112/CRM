import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UpdateEmailConfigDto, UpdatePdfTemplatesDto, UpdateTwilioConfigDto } from './dto/user-config.dto';

@Injectable()
export class UserConfigService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUserConfig(userId: string) {
    const user = await this.userModel.findById(userId).select('emailConfig twilioConfig pdfTemplates').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      emailConfig: user.emailConfig || {},
      twilioConfig: user.twilioConfig || {},
      pdfTemplates: user.pdfTemplates || { estimateTemplate: 'professional', invoiceTemplate: 'professional' },
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

  async updatePdfTemplates(userId: string, updatePdfTemplatesDto: UpdatePdfTemplatesDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            pdfTemplates: {
              estimateTemplate: 'professional',
              invoiceTemplate: 'professional',
              ...user.pdfTemplates,
              ...updatePdfTemplatesDto,
            },
          },
        },
        { new: true }
      )
      .select('pdfTemplates')
      .exec();

    return {
      success: true,
      message: 'PDF template preferences updated successfully',
      pdfTemplates: updatedUser?.pdfTemplates,
    };
  }
}
