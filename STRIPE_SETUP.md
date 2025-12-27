# Stripe Payment Setup Guide

## Quick Setup Steps

### 1. Create Stripe Account
Go to https://stripe.com and create an account.

### 2. Get API Keys
Dashboard → Developers → API Keys
- Copy **Publishable key** (starts with `pk_test_...`)
- Copy **Secret key** (starts with `sk_test_...`)

### 3. Create Products in Stripe Dashboard

**Viventiva Pro ($39.99/year)**
1. Products → Add Product
2. Name: "Viventiva Pro"
3. Price: $39.99, Recurring, Yearly
4. Copy the **Price ID** (starts with `price_...`)

**Viventiva Life ($99 lifetime)**
1. Products → Add Product
2. Name: "Viventiva Life"  
3. Price: $99, One-time
4. Copy the **Price ID** (starts with `price_...`)

### 4. Update Environment Variables

Add to your `.env` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_xxx_pro
VITE_STRIPE_LIFE_PRICE_ID=price_xxx_life
```

### 5. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### 6. Run Subscription Schema
Go to Supabase Dashboard → SQL Editor and run `supabase/subscription_schema.sql`

### 7. Set Up Webhook in Stripe
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
