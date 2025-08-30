import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  recommended?: boolean;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

@Injectable()
export class EnhancedBillingService {
  private readonly logger = new Logger(EnhancedBillingService.name);
  private stripe: Stripe | null = null;

  // Predefined subscription plans
  private readonly subscriptionPlans: PaymentPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: 29,
      currency: 'usd',
      interval: 'month',
      stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
      features: [
        'Up to 100 clients',
        'Basic estimates & invoices',
        'Email support',
        'Mobile app access',
        '5GB storage'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Best for growing businesses',
      price: 79,
      currency: 'usd',
      interval: 'month',
      stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
      features: [
        'Unlimited clients',
        'Advanced estimates & invoices',
        'AI-powered features',
        'Priority support',
        'Custom branding',
        '50GB storage',
        'Team collaboration'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with advanced needs',
      price: 149,
      currency: 'usd',
      interval: 'month',
      stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
      features: [
        'Everything in Professional',
        'Advanced analytics',
        'Custom integrations',
        'White-label solution',
        'Dedicated support',
        'Unlimited storage',
        'Custom workflows',
        'API access'
      ]
    }
  ];

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private config: ConfigService
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { 
        apiVersion: '2023-08-16',
        typescript: true
      });
      this.logger.log('Stripe initialized successfully');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not configured - payment features disabled');
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    return this.stripe;
  }

  // Get available subscription plans
  getSubscriptionPlans(): PaymentPlan[] {
    return this.subscriptionPlans;
  }

  // Create a customer in Stripe
  async createStripeCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    const stripe = this.ensureStripe();
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'remodely-crm',
        ...metadata
      }
    });

    this.logger.log(`Created Stripe customer: ${customer.id} for ${email}`);
    return customer;
  }

  // Create a subscription checkout session
  async createSubscriptionCheckout(params: {
    planId: string;
    customerEmail: string;
    customerName?: string;
    trialDays?: number;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionId: string; url: string; customerId?: string }> {
    const stripe = this.ensureStripe();
    
    const plan = this.subscriptionPlans.find(p => p.id === params.planId);
    if (!plan) {
      throw new BadRequestException(`Invalid plan ID: ${params.planId}`);
    }

    // Check if customer already exists
    let customer: Stripe.Customer | undefined;
    const existingCustomers = await stripe.customers.list({
      email: params.customerEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await this.createStripeCustomer(
        params.customerEmail,
        params.customerName,
        params.metadata
      );
    }

    const baseUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1
      }],
      success_url: params.successUrl || `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl || `${baseUrl}/billing/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        trial_period_days: params.trialDays || 14,
        metadata: {
          plan_id: plan.id,
          source: 'remodely-crm',
          ...params.metadata
        }
      },
      metadata: {
        plan_id: plan.id,
        customer_email: params.customerEmail,
        ...params.metadata
      }
    });

    return {
      sessionId: session.id,
      url: session.url!,
      customerId: customer.id
    };
  }

  // Create a one-time payment intent
  async createPaymentIntent(data: PaymentIntentData): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const stripe = this.ensureStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency,
      description: data.description,
      metadata: data.metadata || {},
      setup_future_usage: data.setupFutureUsage,
      receipt_email: data.customerEmail,
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id
    };
  }

  // Create a setup intent for saving payment methods
  async createSetupIntent(customerEmail: string): Promise<{ clientSecret: string; setupIntentId: string }> {
    const stripe = this.ensureStripe();

    let customer: Stripe.Customer | undefined;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await this.createStripeCustomer(customerEmail);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    return {
      clientSecret: setupIntent.client_secret!,
      setupIntentId: setupIntent.id
    };
  }

  // Get customer's payment methods
  async getCustomerPaymentMethods(customerEmail: string): Promise<Stripe.PaymentMethod[]> {
    const stripe = this.ensureStripe();

    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customers.data[0].id,
      type: 'card'
    });

    return paymentMethods.data;
  }

  // Update user subscription in database
  async updateUserSubscription(email: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
  }): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`User not found for subscription update: ${email}`);
      return null;
    }

    Object.assign(user, subscriptionData);
    await user.save();

    this.logger.log(`Updated subscription for user ${email}: ${JSON.stringify(subscriptionData)}`);
    return user;
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripe();

    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripe();

    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
  }

  // Get subscription details
  async getSubscriptionDetails(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripe();
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  // Get customer invoices
  async getCustomerInvoices(customerEmail: string, limit = 10): Promise<Stripe.Invoice[]> {
    const stripe = this.ensureStripe();

    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return [];
    }

    const invoices = await stripe.invoices.list({
      customer: customers.data[0].id,
      limit
    });

    return invoices.data;
  }

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}:`, error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const customerEmail = session.customer_details?.email || session.customer_email;
    if (!customerEmail) {
      this.logger.warn('No customer email in checkout session');
      return;
    }

    const planId = session.metadata?.plan_id;
    const plan = this.subscriptionPlans.find(p => p.id === planId);

    await this.updateUserSubscription(customerEmail, {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionPlan: plan?.id || 'starter',
      subscriptionStatus: 'trialing' // Will be updated by subscription webhook
    });
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const stripe = this.ensureStripe();
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (!customer || customer.deleted || !('email' in customer) || !customer.email) {
      this.logger.warn('Customer not found or missing email for subscription update');
      return;
    }

    const planId = subscription.metadata?.plan_id;
    
    await this.updateUserSubscription(customer.email, {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status as any,
      subscriptionPlan: planId,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const stripe = this.ensureStripe();
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (!customer || customer.deleted || !('email' in customer) || !customer.email) {
      return;
    }

    await this.updateUserSubscription(customer.email, {
      subscriptionStatus: 'canceled',
      subscriptionPlan: 'free'
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Payment succeeded - subscription should remain active
    this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const stripe = this.ensureStripe();
    
    if (invoice.customer && typeof invoice.customer === 'string') {
      const customer = await stripe.customers.retrieve(invoice.customer);
      
      if (!customer.deleted && 'email' in customer && customer.email) {
        await this.updateUserSubscription(customer.email, {
          subscriptionStatus: 'past_due'
        });
      }
    }
  }
}
