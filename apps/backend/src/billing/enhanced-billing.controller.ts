import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  Req,
  BadRequestException,
  UseGuards,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancedBillingService, PaymentIntentData } from './enhanced-billing.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Controller('api/billing')
export class EnhancedBillingController {
  private readonly logger = new Logger(EnhancedBillingController.name);
  private stripe: Stripe | null = null;

  constructor(
    private enhancedBillingService: EnhancedBillingService,
    private config: ConfigService
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2023-08-16' });
    }
  }

  // Get available subscription plans
  @Get('plans')
  getPlans() {
    return {
      success: true,
      plans: this.enhancedBillingService.getSubscriptionPlans(),
    };
  }

  // Create subscription checkout session
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req,
    @Body()
    body: {
      planId: string;
      trialDays?: number;
      successUrl?: string;
      cancelUrl?: string;
    }
  ) {
    try {
      const user = req.user;
      const result = await this.enhancedBillingService.createSubscriptionCheckout({
        planId: body.planId,
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        trialDays: body.trialDays,
        successUrl: body.successUrl,
        cancelUrl: body.cancelUrl,
        metadata: {
          userId: user.id,
          workspaceId: user.workspaceId,
        },
      });

      return {
        success: true,
        sessionId: result.sessionId,
        url: result.url,
        customerId: result.customerId,
      };
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Create one-time payment intent
  @Post('payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Req() req,
    @Body()
    body: {
      amount: number;
      currency?: string;
      description: string;
      savePaymentMethod?: boolean;
    }
  ) {
    try {
      const user = req.user;
      const paymentData: PaymentIntentData = {
        amount: body.amount,
        currency: body.currency || 'usd',
        description: body.description,
        customerEmail: user.email,
        setupFutureUsage: body.savePaymentMethod ? 'off_session' : undefined,
        metadata: {
          userId: user.id,
          workspaceId: user.workspaceId,
        },
      };

      const result = await this.enhancedBillingService.createPaymentIntent(paymentData);

      return {
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Setup intent for saving payment methods
  @Post('setup-intent')
  @UseGuards(JwtAuthGuard)
  async createSetupIntent(@Req() req) {
    try {
      const user = req.user;
      const result = await this.enhancedBillingService.createSetupIntent(user.email);

      return {
        success: true,
        clientSecret: result.clientSecret,
        setupIntentId: result.setupIntentId,
      };
    } catch (error) {
      this.logger.error('Error creating setup intent:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Get customer's saved payment methods
  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  async getPaymentMethods(@Req() req) {
    try {
      const user = req.user;
      const paymentMethods = await this.enhancedBillingService.getCustomerPaymentMethods(
        user.email
      );

      return {
        success: true,
        paymentMethods: paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card
            ? {
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year,
              }
            : null,
          created: pm.created,
        })),
      };
    } catch (error) {
      this.logger.error('Error fetching payment methods:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Get current subscription details
  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@Req() req) {
    try {
      const user = req.user;

      // Get subscription details from Stripe if subscription ID exists
      let stripeSubscription = null;
      if (user.stripeSubscriptionId) {
        try {
          stripeSubscription = await this.enhancedBillingService.getSubscriptionDetails(
            user.stripeSubscriptionId
          );
        } catch (error) {
          this.logger.warn(
            `Failed to fetch Stripe subscription ${user.stripeSubscriptionId}:`,
            error.message
          );
        }
      }

      const plans = this.enhancedBillingService.getSubscriptionPlans();
      const currentPlan =
        plans.find(p => p.id === user.subscriptionPlan) || plans.find(p => p.id === 'starter');

      return {
        success: true,
        subscription: {
          plan: currentPlan,
          status: user.subscriptionStatus || 'active',
          trialEndsAt: user.trialEndsAt,
          currentPeriodEnd: stripeSubscription?.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false,
          stripeSubscriptionId: user.stripeSubscriptionId,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching subscription:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Cancel subscription
  @Delete('subscription')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req, @Body() body: { immediately?: boolean }) {
    try {
      const user = req.user;

      if (!user.stripeSubscriptionId) {
        throw new BadRequestException('No active subscription found');
      }

      const subscription = await this.enhancedBillingService.cancelSubscription(
        user.stripeSubscriptionId,
        body.immediately || false
      );

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      };
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Reactivate subscription
  @Put('subscription/reactivate')
  @UseGuards(JwtAuthGuard)
  async reactivateSubscription(@Req() req) {
    try {
      const user = req.user;

      if (!user.stripeSubscriptionId) {
        throw new BadRequestException('No subscription found');
      }

      const subscription = await this.enhancedBillingService.reactivateSubscription(
        user.stripeSubscriptionId
      );

      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      };
    } catch (error) {
      this.logger.error('Error reactivating subscription:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Get customer invoices
  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  async getInvoices(@Req() req, @Query('limit') limit?: string) {
    try {
      const user = req.user;
      const invoiceLimit = limit ? parseInt(limit, 10) : 10;

      const invoices = await this.enhancedBillingService.getCustomerInvoices(
        user.email,
        invoiceLimit
      );

      return {
        success: true,
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          created: new Date(invoice.created * 1000),
          pdfUrl: invoice.invoice_pdf,
          hostedUrl: invoice.hosted_invoice_url,
          number: invoice.number,
          description: invoice.description,
        })),
      };
    } catch (error) {
      this.logger.error('Error fetching invoices:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Webhook endpoint for Stripe events
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const endpointSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) {
      this.logger.warn(
        'STRIPE_WEBHOOK_SECRET not configured - webhook signature verification disabled'
      );
    }

    let event: Stripe.Event;

    try {
      const signature = req.headers['stripe-signature'];

      if (endpointSecret && signature) {
        // Verify webhook signature
        event = this.stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      } else {
        // Parse event without verification (not recommended for production)
        event = req.body;
      }

      // Handle the event
      await this.enhancedBillingService.handleWebhookEvent(event);

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error.message);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }

  // Get checkout session details
  @Get('checkout-session/:sessionId')
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      return {
        success: true,
        session: {
          id: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email || session.customer_email,
          amountTotal: session.amount_total,
          currency: session.currency,
          subscription: session.subscription,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching checkout session:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Create portal session for customer to manage subscription
  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortalSession(@Req() req, @Body() body: { returnUrl?: string }) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const user = req.user;

      // Find Stripe customer
      const customers = await this.stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        throw new BadRequestException('No Stripe customer found');
      }

      const baseUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: body.returnUrl || `${baseUrl}/billing`,
      });

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      this.logger.error('Error creating portal session:', error);
      throw new BadRequestException(error.message);
    }
  }
}
