// Supabase Edge Function: Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
// Set up webhook in Stripe Dashboard → Developers → Webhooks

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
    // Validate webhook secret is configured
    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured')
        return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { status: 500 })
    }

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature || '', endpointSecret)
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
    }

    console.log('Received event:', event.type)

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.client_reference_id || session.metadata?.userId
                const customerEmail = session.customer_email

                if (!userId) {
                    console.error('No userId found in session')
                    break
                }

                // Determine plan type based on mode
                const planType = session.mode === 'subscription' ? 'pro' : 'life'
                const status = session.mode === 'subscription' ? 'active' : 'lifetime'

                let currentPeriodEnd;
                let billingInterval = null;
                let stripePriceId = null;

                if (session.mode === 'subscription' && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

                    // Get price info to determine billing interval
                    if (subscription.items.data[0]?.price) {
                        const price = subscription.items.data[0].price;
                        stripePriceId = price.id;
                        if (price.recurring) {
                            billingInterval = price.recurring.interval === 'month' ? 'monthly' : 'yearly';
                        }
                    }
                } else if (session.mode === 'subscription') {
                    // Fallback if no subscription ID (unlikely)
                    currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
                } else {
                    // Lifetime
                    currentPeriodEnd = null;
                    billingInterval = 'lifetime';
                }

                // Upsert subscription record
                const { error } = await supabase
                    .from('user_subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string || null,
                        stripe_price_id: stripePriceId,
                        plan_type: planType,
                        billing_interval: billingInterval,
                        status: status,
                        current_period_start: new Date().toISOString(),
                        current_period_end: currentPeriodEnd,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id'
                    })

                if (error) {
                    console.error('Error updating subscription:', error)
                } else {
                    console.log(`Subscription created/updated for user ${userId}`)
                }
                break
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const userId = subscription.metadata?.userId

                if (!userId) {
                    console.error('No userId in subscription metadata')
                    break
                }

                // Determine plan type from price
                let planType = 'pro';
                let billingInterval = 'yearly';

                if (subscription.items.data[0]?.price) {
                    const price = subscription.items.data[0].price;
                    if (price.recurring) {
                        billingInterval = price.recurring.interval === 'month' ? 'monthly' : 'yearly';
                    }
                }

                // Map Stripe status to our status
                let status = 'active';
                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    status = 'cancelled';
                } else if (subscription.status === 'trialing') {
                    status = 'trialing';
                } else if (subscription.status === 'past_due') {
                    status = 'past_due';
                }

                const { error } = await supabase
                    .from('user_subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: subscription.customer as string,
                        stripe_subscription_id: subscription.id,
                        stripe_price_id: subscription.items.data[0]?.price?.id || null,
                        plan_type: planType,
                        billing_interval: billingInterval,
                        status: status,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'user_id'
                    })

                if (error) {
                    console.error('Error updating subscription:', error)
                } else {
                    console.log(`Subscription ${event.type} for user ${userId}`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const userId = subscription.metadata?.userId

                if (!userId) {
                    console.error('No userId in subscription metadata')
                    break
                }

                const { error } = await supabase
                    .from('user_subscriptions')
                    .update({
                        status: 'cancelled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId)

                if (error) {
                    console.error('Error cancelling subscription:', error)
                }
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), { status: 200 })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
})
