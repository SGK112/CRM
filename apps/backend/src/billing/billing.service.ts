import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  // Map Stripe price IDs to internal plan codes
  private readonly priceToPlan: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || '']: 'growth',
  };

  resolvePlanFromPrice(priceId?: string | null): string | undefined {
    if (!priceId) return undefined;
    return this.priceToPlan[priceId];
  }
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async attachSubscriptionToUser(email: string, params: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  subscriptionPlan?: string; // internal code (starter, growth)
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

// Guard to require an active subscription (or trialing)
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const email = req.user?.email;
    if (!email) return false;
    const user = await this.userModel.findOne({ email }).select('subscriptionStatus');
    return ['active', 'trialing'].includes(user?.subscriptionStatus || '');
  }
}
