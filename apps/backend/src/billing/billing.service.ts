import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async attachSubscriptionToUser(email: string, params: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    trialEndsAt?: Date;
  }) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`User not found for subscription attach: ${email}`);
      return null;
    }
    Object.assign(user, params);
    await user.save();
    this.logger.log(`Updated subscription for user ${email}`);
    return user;
  }
}
