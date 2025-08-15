import { Controller, Post, Req, Res, Headers, HttpCode, Logger } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('billing')
export class BillingWebhookController {
  private readonly stripe: Stripe | null;
  private readonly logger = new Logger(BillingWebhookController.name);
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  constructor(private billingService: BillingService) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
    } else {
      this.stripe = null;
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured, ignoring webhook');
      return res.sendStatus(200);
    }
    let event: Stripe.Event;
    try {
  const rawBody = (req as any).body instanceof Buffer ? (req as any).body : (req as any).rawBody;
      if (!this.webhookSecret) {
        this.logger.error('Missing STRIPE_WEBHOOK_SECRET');
        return res.status(400).send('Missing webhook secret');
      }
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        this.logger.log(`Checkout session completed: ${session.id}`);
        try {
          const customerId = session.customer as string | undefined;
          const subscriptionId = session.subscription as string | undefined;
          const plan = session.metadata?.plan;
          const trialEnd = session.expires_at ? new Date(session.expires_at * 1000) : undefined;
          const email = session.customer_details?.email;
          if (email) {
            await this.billingService.attachSubscriptionToUser(email, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionPlan: plan,
              subscriptionStatus: 'trialing',
              trialEndsAt: trialEnd,
            });
          }
        } catch (err: any) {
          this.logger.error(`Failed to persist checkout.session.completed: ${err.message}`);
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.log(`Invoice paid: ${invoice.id}`);
        try {
          const subscriptionId = invoice.subscription as string | undefined;
          const customerId = invoice.customer as string | undefined;
          const email = invoice.customer_email || undefined;
          if (email) {
            await this.billingService.attachSubscriptionToUser(email, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
            });
          }
        } catch (err: any) {
          this.logger.error(`Failed to persist invoice.paid: ${err.message}`);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        this.logger.log(`Subscription event: ${event.type} ${sub.id}`);
        try {
          const email = (sub as any).customer_email; // may not be present
          if (email) {
            await this.billingService.attachSubscriptionToUser(email, {
              stripeCustomerId: sub.customer as string,
              stripeSubscriptionId: sub.id,
              subscriptionPlan: (sub.items.data[0]?.price?.id) || undefined,
              subscriptionStatus: sub.status,
              trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
            });
          }
        } catch (err: any) {
          this.logger.error(`Failed to persist subscription lifecycle: ${err.message}`);
        }
        break;
      }
      default:
        this.logger.debug(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  }
}
