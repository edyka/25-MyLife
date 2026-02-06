// Stripe configuration for Viventiva payments
// Get your publishable key from https://dashboard.stripe.com/apikeys

import { auth } from '../lib/supabase'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return (
    STRIPE_PUBLISHABLE_KEY &&
    STRIPE_PUBLISHABLE_KEY !== 'pk_test_your-key' &&
    STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  )
}

// Stripe product configuration
// Note: These IDs should be created in your Stripe Dashboard
// Products > Create Product > Copy the Price ID
export const STRIPE_PRODUCTS = {
  PRO_YEARLY: {
    name: 'Viventiva Pro (Yearly)',
    description: 'Yearly subscription with all premium features',
    priceId: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || null,
    mode: 'subscription',
    price: 39.99,
    interval: 'year',
  },
  PRO_MONTHLY: {
    name: 'Viventiva Pro (Monthly)',
    description: 'Monthly subscription with all premium features',
    priceId: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || null,
    mode: 'subscription',
    price: 4.99,
    interval: 'month',
  },
  LIFE: {
    name: 'Viventiva Life',
    description: 'Lifetime access to all features',
    priceId: import.meta.env.VITE_STRIPE_LIFE_PRICE_ID || null,
    mode: 'payment',
    price: 99,
    interval: null,
  },
}

// Initialize Stripe
let stripePromise = null

export const getStripe = async () => {
  if (!isStripeConfigured()) {
    console.warn('[Stripe] Not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in .env')
    return null
  }

  if (!stripePromise) {
    // Dynamically import Stripe.js
    const { loadStripe } = await import('@stripe/stripe-js')
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }

  return stripePromise
}

// Create checkout session via Supabase Edge Function
export const createCheckoutSession = async (priceId, mode, successUrl, cancelUrl) => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured')
  }

  // Get the current user's JWT for authenticated Edge Function call
  const {
    data: { session },
  } = await auth.getSession()
  if (!session?.access_token) {
    throw new Error('You must be logged in to subscribe')
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      priceId,
      mode,
      successUrl: successUrl || `${window.location.origin}/?checkout=success`,
      cancelUrl: cancelUrl || `${window.location.origin}/?checkout=cancelled`,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create checkout session')
  }

  return response.json()
}

// Redirect to Stripe Checkout
export const redirectToCheckout = async plan => {
  const product = STRIPE_PRODUCTS[plan]

  if (!product || !product.priceId) {
    throw new Error(`Invalid plan or price not configured: ${plan}`)
  }

  // Get current user from Supabase
  const { user } = await auth.getCurrentUser()

  if (!user) {
    throw new Error('You must be logged in to subscribe')
  }

  // Create checkout session - returns { sessionId, url }
  // User identity is extracted from JWT server-side, not passed from client
  const { url } = await createCheckoutSession(product.priceId, product.mode)

  if (!url) {
    throw new Error('Failed to get checkout URL')
  }

  // Redirect directly to Stripe Checkout URL
  window.location.href = url
}

export default {
  isStripeConfigured,
  getStripe,
  createCheckoutSession,
  redirectToCheckout,
  STRIPE_PRODUCTS,
}
