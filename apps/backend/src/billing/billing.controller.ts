import {
    BadRequestException, Body,
    Controller, Get, Injectable, Logger, Post, Query, Req, UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  private stripe: Stripe | null = null;
  private trialDays: number;

  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secret) {
      this.stripe = new Stripe(secret, { apiVersion: '2023-08-16' });
    } else {
      // Log once (could integrate Nest Logger if desired)
      // Avoid throwing so auth & other modules still work without billing configured.
      this.logger?.warn?.(
        '[Billing] STRIPE_SECRET_KEY not set – billing endpoints will return configuration errors until provided.'
      );
    }
    this.trialDays = parseInt(this.config.get<string>('STRIPE_TRIAL_DAYS') || '14', 10);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: { priceId: string; customerEmail?: string; workspaceName?: string }
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    if (!body.priceId) throw new BadRequestException('Missing priceId');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: body.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: this.trialDays,
        metadata: {
          workspaceName: body.workspaceName || '',
        },
      },
      customer_email: body.customerEmail,
      success_url: `${this.config.get('FRONTEND_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/billing/cancel`,
      billing_address_collection: 'auto',
      automatic_tax: { enabled: true },
    });

    return { id: session.id, url: session.url };
  }

  @Get('session')
  async getCheckoutSession(@Query('id') id: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    if (!id) throw new BadRequestException('Missing id');
    const session = await this.stripe.checkout.sessions.retrieve(id);
    return {
      id: session.id,
      status: session.status,
      mode: session.mode,
      customer_email: session.customer_details?.email || session.customer_email,
      subscription: session.subscription,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      trial_end: (session as Stripe.Checkout.Session & { trial_end?: number }).trial_end || null,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@Req() req) {
    const email = req.user?.email;
    if (!email) throw new BadRequestException('Missing user context');
    const user = await this.userModel
      .findOne({ email })
      .select(
        'stripeCustomerId stripeSubscriptionId subscriptionPlan subscriptionStatus trialEndsAt'
      );
    return {
      customerId: user?.stripeCustomerId || null,
      subscriptionId: user?.stripeSubscriptionId || null,
      plan: user?.subscriptionPlan || null,
      status: user?.subscriptionStatus || null,
      trialEndsAt: user?.trialEndsAt || null,
    };
  }
}
