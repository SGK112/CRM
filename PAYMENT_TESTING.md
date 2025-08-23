# Payment System Testing Guide

## Setup for Testing

### 1. Stripe Test Environment Setup

1. **Get Stripe Test Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test)
   - Get your test publishable key (starts with `pk_test_`)
   - Get your test secret key (starts with `sk_test_`)

2. **Configure Environment Variables:**
   ```bash
   # Add to apps/backend/.env
   STRIPE_SECRET_KEY=sk_test_your_test_key_here
   STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret
   STRIPE_TRIAL_DAYS=14
   
   # Add to apps/frontend/.env.local (create if needed)
   NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_test_starter_id
   NEXT_PUBLIC_STRIPE_PRICE_GROWTH=price_test_growth_id
   ```

3. **Create Test Products in Stripe:**
   ```bash
   # In Stripe Dashboard > Products, create:
   # 1. "Starter Plan" - $49/month
   # 2. "Growth Plan" - $149/month
   # Copy the price IDs to your env vars
   ```

## Testing Scenarios

### 1. Basic Checkout Flow Test

**Test the full payment flow:**

```bash
# Start both servers
npm run dev
```

Then:
1. Navigate to `http://localhost:3000/billing/cart?plan=starter`
2. Click "Start Trial"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify redirect to success page

### 2. API Endpoint Testing

**Test billing endpoints directly:**

```bash
# Test checkout session creation
curl -X POST http://localhost:3001/billing/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_test_starter_id",
    "customerEmail": "test@example.com",
    "workspaceName": "Test Workspace"
  }'

# Test session retrieval (use session_id from above)
curl "http://localhost:3001/billing/session?id=cs_test_session_id"

# Test user subscription status (requires auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/billing/me
```

### 3. Webhook Testing

**Test Stripe webhooks locally:**

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   stripe login
   ```

2. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3001/billing/webhook
   ```

3. Trigger test events:
   ```bash
   # Test successful checkout
   stripe trigger checkout.session.completed
   
   # Test successful payment
   stripe trigger invoice.payment_succeeded
   
   # Test subscription updates
   stripe trigger customer.subscription.updated
   ```

### 4. Capability System Testing

**Test plan-based feature restrictions:**

```bash
# Test capability check for different plans
curl -H "Authorization: Bearer JWT_TOKEN" \
  -H "X-Test-Plan: free" \
  http://localhost:3001/some-protected-endpoint

curl -H "Authorization: Bearer JWT_TOKEN" \
  -H "X-Test-Plan: starter" \
  http://localhost:3001/some-protected-endpoint
```

## Test Cards and Scenarios

### Stripe Test Cards:

```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication (3D Secure)
4000 0027 6000 3184

# Insufficient funds
4000 0000 0000 9995

# Expired card
4000 0000 0000 0069
```

### Test Scenarios:

1. **Happy Path:**
   - User selects plan → successful checkout → webhook processes → user gains access

2. **Payment Failures:**
   - Declined cards → user stays on current plan
   - Failed webhooks → manual verification needed

3. **Trial Management:**
   - Trial starts → user has 14 days → trial expires → subscription activates

4. **Plan Changes:**
   - Upgrade/downgrade → proration calculations → capability updates

## Monitoring and Debugging

### 1. Check Logs:
```bash
# Backend logs
npm run dev --workspace=@remodely-crm/backend

# Look for billing-related logs
grep -i "billing\|stripe" logs/backend.log
```

### 2. Database Verification:
```javascript
// Check user subscription status in MongoDB
db.users.find({"email": "test@example.com"}, {
  "email": 1,
  "subscriptionPlan": 1,
  "subscriptionStatus": 1,
  "stripeCustomerId": 1,
  "stripeSubscriptionId": 1,
  "trialEndsAt": 1
})
```

### 3. Stripe Dashboard:
- Monitor test payments in [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- Check webhook deliveries in Events section
- Verify customer and subscription creation

## Common Issues and Solutions

### Issue: "Stripe not configured" error
**Solution:** Ensure `STRIPE_SECRET_KEY` is set in backend/.env

### Issue: Webhook signature verification fails
**Solution:** Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint secret

### Issue: Test cards not working
**Solution:** Ensure you're using test mode keys (pk_test_/sk_test_)

### Issue: Capabilities not working
**Solution:** Check that user has proper `subscriptionPlan` field in database

## Next Steps for Production

1. **Replace test keys** with live Stripe keys
2. **Set up webhook endpoints** with proper TLS
3. **Configure proper error handling** and retry logic
4. **Set up monitoring** for failed payments
5. **Implement dunning management** for failed renewals
