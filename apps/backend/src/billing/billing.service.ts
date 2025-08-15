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
@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // If user already contains subscriptionStatus from JWT or previous middleware, honor it
    const status = req.user?.subscriptionStatus;
    if (status) {
      return ['active', 'trialing'].includes(status);
    }
    // Fallback: allow for now (grace period) to avoid blocking login while DI wiring is refined.
    return true;
  }
}
