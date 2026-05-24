// Supabase Edge Function: Create Stripe Checkout Session
// Deploy with: supabase functions deploy create-checkout

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { priceId, mode, userId, userEmail, successUrl, cancelUrl } = await req.json()

        if (!priceId) {
            throw new Error('Price ID is required')
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode || 'subscription', // 'subscription' or 'payment'
            success_url: successUrl || `${req.headers.get('origin')}/?checkout=success`,
            cancel_url: cancelUrl || `${req.headers.get('origin')}/?checkout=cancelled`,
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                userId,
                userEmail,
            },
            // For subscriptions, allow customer to manage their subscription
            ...(mode === 'subscription' && {
                subscription_data: {
                    metadata: {
                        userId,
                    },
                },
            }),
        })

        return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Checkout error:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                message: error.message,
                details: error.toString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
