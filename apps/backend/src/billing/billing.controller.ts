import { Body, Controller, Post, Get, Query, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('billing')
export class BillingController {
  private stripe: Stripe;
  private trialDays: number;

  constructor(private config: ConfigService) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) {
      // Stripe not configured; create a placeholder that will throw on usage
      // We avoid embedding any secret-like pattern to satisfy push protection
      throw new Error('STRIPE_SECRET_KEY not set');
    }
    this.stripe = new Stripe(secret, { apiVersion: '2023-08-16' });
    this.trialDays = parseInt(this.config.get<string>('STRIPE_TRIAL_DAYS') || '14', 10);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: { priceId: string; customerEmail?: string; workspaceName?: string }) {
    if (!this.config.get('STRIPE_SECRET_KEY')) {
      throw new BadRequestException('Stripe not configured');
    }
    if (!body.priceId) throw new BadRequestException('Missing priceId');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [ { price: body.priceId, quantity: 1 } ],
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
    if (!this.config.get('STRIPE_SECRET_KEY')) {
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
      trial_end: (session as any).trial_end || null,
    };
  }
}
