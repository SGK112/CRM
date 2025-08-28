import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TwilioPhoneNumber, TwilioPhoneNumberDocument } from './schemas/twilio-phone-number.schema';
import { TwilioService } from '../services/twilio.service';

export interface AvailablePhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  postalCode: string;
  isoCountry: string;
  addressRequirements: string;
  beta: boolean;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
}

export interface PurchasePhoneNumberDto {
  phoneNumber: string;
  setAsDefault?: boolean;
}

@Injectable()
export class TwilioNumbersService {
  constructor(
    @InjectModel(TwilioPhoneNumber.name) private phoneNumberModel: Model<TwilioPhoneNumberDocument>,
    private readonly twilioService: TwilioService,
  ) {}

  async searchAvailableNumbers(workspaceId: string, areaCode?: string, contains?: string, limit = 20): Promise<AvailablePhoneNumber[]> {
    try {
      // This would integrate with Twilio's API to search for available numbers
      // For now, returning mock data with realistic phone numbers
      const mockNumbers: AvailablePhoneNumber[] = [
        {
          phoneNumber: '+1' + (areaCode || '555') + Math.random().toString().slice(2, 9),
          friendlyName: `(${areaCode || '555'}) ${Math.random().toString().slice(2, 5)}-${Math.random().toString().slice(2, 6)}`,
          locality: 'San Francisco',
          region: 'CA',
          postalCode: '94105',
          isoCountry: 'US',
          addressRequirements: 'none',
          beta: false,
          capabilities: {
            voice: true,
            sms: true,
            mms: true,
            fax: false
          }
        }
        // Generate more mock numbers...
      ];

      for (let i = 1; i < limit; i++) {
        const randomAreaCode = areaCode || ['555', '415', '510', '650', '925'][Math.floor(Math.random() * 5)];
        mockNumbers.push({
          phoneNumber: '+1' + randomAreaCode + Math.random().toString().slice(2, 9),
          friendlyName: `(${randomAreaCode}) ${Math.random().toString().slice(2, 5)}-${Math.random().toString().slice(2, 6)}`,
          locality: ['San Francisco', 'Oakland', 'San Jose', 'Palo Alto', 'Berkeley'][Math.floor(Math.random() * 5)],
          region: 'CA',
          postalCode: '9410' + Math.floor(Math.random() * 10),
          isoCountry: 'US',
          addressRequirements: 'none',
          beta: false,
          capabilities: {
            voice: true,
            sms: true,
            mms: Math.random() > 0.3,
            fax: Math.random() > 0.7
          }
        });
      }

      return mockNumbers.filter(num => 
        !contains || num.phoneNumber.includes(contains)
      );
    } catch (error) {
      console.error('Error searching available numbers:', error);
      throw new InternalServerErrorException('Failed to search available phone numbers');
    }
  }

  async purchasePhoneNumber(workspaceId: string, dto: PurchasePhoneNumberDto): Promise<TwilioPhoneNumber> {
    try {
      // Check if phone number is already purchased
      const existing = await this.phoneNumberModel.findOne({ 
        phoneNumber: dto.phoneNumber 
      });

      if (existing) {
        throw new BadRequestException('Phone number is already purchased');
      }

      // Mock Twilio purchase - in production, call Twilio API
      const mockTwilioSid = 'PN' + Math.random().toString(36).substring(2, 15);
      
      // Calculate monthly fee (mock pricing)
      const monthlyFee = 100; // $1.00 in cents

      // Create phone number record
      const phoneNumber = new this.phoneNumberModel({
        workspaceId,
        phoneNumber: dto.phoneNumber,
        twilioSid: mockTwilioSid,
        friendlyName: this.formatPhoneNumber(dto.phoneNumber),
        areaCode: dto.phoneNumber.substring(2, 5),
        city: 'San Francisco', // Mock data
        region: 'CA',
        country: 'US',
        monthlyFee,
        status: 'active',
        purchasedAt: new Date(),
        isDefault: dto.setAsDefault || false,
        capabilities: {
          voice: true,
          sms: true,
          mms: true,
          fax: false
        }
      });

      // If setting as default, update other numbers
      if (dto.setAsDefault) {
        await this.phoneNumberModel.updateMany(
          { workspaceId, isDefault: true },
          { isDefault: false }
        );
      }

      await phoneNumber.save();
      return phoneNumber;
    } catch (error) {
      console.error('Error purchasing phone number:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to purchase phone number');
    }
  }

  async getUserPhoneNumbers(workspaceId: string): Promise<TwilioPhoneNumber[]> {
    return this.phoneNumberModel.find({ workspaceId, status: 'active' }).sort({ isDefault: -1, purchasedAt: -1 });
  }

  async setDefaultPhoneNumber(workspaceId: string, phoneNumberId: string): Promise<TwilioPhoneNumber> {
    // Remove default from all numbers
    await this.phoneNumberModel.updateMany(
      { workspaceId, isDefault: true },
      { isDefault: false }
    );

    // Set new default
    const phoneNumber = await this.phoneNumberModel.findOneAndUpdate(
      { _id: phoneNumberId, workspaceId },
      { isDefault: true },
      { new: true }
    );

    if (!phoneNumber) {
      throw new BadRequestException('Phone number not found');
    }

    return phoneNumber;
  }

  async cancelPhoneNumber(workspaceId: string, phoneNumberId: string): Promise<void> {
    const phoneNumber = await this.phoneNumberModel.findOne({ 
      _id: phoneNumberId, 
      workspaceId 
    });

    if (!phoneNumber) {
      throw new BadRequestException('Phone number not found');
    }

    // Mock Twilio cancellation - in production, call Twilio API
    // await this.twilioService.releasePhoneNumber(phoneNumber.twilioSid);

    phoneNumber.status = 'cancelled';
    phoneNumber.cancelledAt = new Date();
    phoneNumber.isDefault = false;
    await phoneNumber.save();
  }

  async getPhoneNumberUsage(workspaceId: string, phoneNumberId: string, month?: string): Promise<any> {
    // Mock usage data - in production, get from Twilio
    return {
      phoneNumberId,
      month: month || new Date().toISOString().substring(0, 7),
      smsSent: Math.floor(Math.random() * 200),
      smsReceived: Math.floor(Math.random() * 150),
      voiceMinutes: Math.floor(Math.random() * 500),
      totalCost: Math.floor(Math.random() * 2000), // in cents
    };
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Convert +15551234567 to (555) 123-4567
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const areaCode = cleaned.substring(1, 4);
      const exchange = cleaned.substring(4, 7);
      const number = cleaned.substring(7);
      return `(${areaCode}) ${exchange}-${number}`;
    }
    return phoneNumber;
  }
}
