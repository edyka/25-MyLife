import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Feature gates for each subscription tier
const FEATURE_GATES = {
  free: {
    customMoodLimit: 4, // 4 free moods
    customMoods: false, // Unlimited custom moods
    goalLimit: 0,
    advancedStats: false,
    premiumThemes: false,
    pdfExport: false,
    pngExport: false, // Export grid as PNG
    unlimitedGoals: false,
    aiInsights: false,
    lifeInsights: false,
    orderPrints: false,
    prioritySupport: false,
    milestones: false,
    milestoneTimeline: false,
    foundingMember: false,
    voteOnFeatures: false,
    privateCommunity: false,
  },
  pro: {
    customMoodLimit: Infinity,
    customMoods: true, // Unlimited custom moods
    goalLimit: Infinity,
    advancedStats: true,
    premiumThemes: true,
    pdfExport: true,
    pngExport: true, // Export grid as PNG
    unlimitedGoals: true,
    aiInsights: false, // Coming soon
    lifeInsights: true,
    orderPrints: true,
    prioritySupport: true,
    milestones: true,
    milestoneTimeline: false,
    foundingMember: false,
    voteOnFeatures: false,
    privateCommunity: false,
  },
  life: {
    customMoodLimit: Infinity,
    customMoods: true, // Unlimited custom moods
    goalLimit: Infinity,
    advancedStats: true,
    premiumThemes: true,
    pdfExport: true,
    pngExport: true, // Export grid as PNG
    unlimitedGoals: true,
    aiInsights: true,
    lifeInsights: true,
    orderPrints: true,
    prioritySupport: true,
    milestones: true,
    milestoneTimeline: true,
    foundingMember: true,
    voteOnFeatures: true,
    privateCommunity: true,
  },
}

export const usePremiumStore = create((set, get) => ({
  // Subscription tier: 'free', 'pro', or 'life'
  tier: 'free',

  // Subscription metadata from Supabase
  subscriptionData: null,
  subscriptionLoading: false,
  subscriptionError: null,

  // Actions
  setTier: tier => set({ tier }),

  // Fetch subscription from Supabase using secure RPC function
  // This validates tier server-side, preventing localStorage manipulation
  fetchSubscription: async userId => {
    if (!userId) {
      set({ tier: 'free', subscriptionData: null, subscriptionLoading: false })
      return
    }

    set({ subscriptionLoading: true, subscriptionError: null })

    try {
      if (!supabase) {
        set({ tier: 'free', subscriptionData: null, subscriptionLoading: false })
        return
      }
      // Use secure RPC function that validates server-side
      const { data, error } = await supabase.rpc('get_current_user_tier')

      if (error) {
        // If RPC doesn't exist yet, fall back to direct query
        if (error.code === 'PGRST202') {
          console.log('[Premium] RPC not found, using fallback query')
          return get().fetchSubscriptionFallback(userId)
        }
        console.error('[Premium] Error fetching subscription:', error)
        set({
          tier: 'free',
          subscriptionData: null,
          subscriptionLoading: false,
          subscriptionError: error.message,
        })
        return
      }

      if (!data || !data.tier) {
        // No subscription = free tier
        console.log('[Premium] No subscription found, using free tier')
        set({ tier: 'free', subscriptionData: null, subscriptionLoading: false })
        return
      }

      console.log(`[Premium] Subscription loaded (server-validated): ${data.tier}`, data)
      set({
        tier: data.tier,
        subscriptionData: data,
        subscriptionLoading: false,
      })
    } catch (err) {
      console.error('[Premium] Error:', err)
      set({
        tier: 'free',
        subscriptionData: null,
        subscriptionLoading: false,
        subscriptionError: err.message,
      })
    }
  },

  // Fallback for when RPC function isn't deployed yet
  fetchSubscriptionFallback: async userId => {
    try {
      if (!supabase) {
        set({ tier: 'free', subscriptionData: null, subscriptionLoading: false })
        return
      }
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        set({
          tier: 'free',
          subscriptionData: null,
          subscriptionLoading: false,
          subscriptionError: error.message,
        })
        return
      }

      if (!data) {
        set({ tier: 'free', subscriptionData: null, subscriptionLoading: false })
        return
      }

      const isActive = data.status === 'active' || data.status === 'trialing'
      const isLifetime = data.status === 'lifetime'
      const isNotExpired =
        !data.current_period_end || new Date(data.current_period_end) > new Date()

      let tier = 'free'
      if (isLifetime || data.plan_type === 'life') {
        tier = 'life'
      } else if ((isActive && isNotExpired) || data.plan_type === 'pro') {
        tier = isActive && isNotExpired ? 'pro' : 'free'
      }

      set({
        tier,
        subscriptionData: data,
        subscriptionLoading: false,
      })
    } catch (err) {
      set({
        tier: 'free',
        subscriptionData: null,
        subscriptionLoading: false,
        subscriptionError: err.message,
      })
    }
  },

  // Clear subscription (on logout)
  clearSubscription: () =>
    set({
      tier: 'free',
      subscriptionData: null,
      subscriptionLoading: false,
      subscriptionError: null,
    }),

  // Check if user has access to a feature
  hasFeature: featureName => {
    const { tier } = get()
    const features = FEATURE_GATES[tier] || FEATURE_GATES.free
    return features[featureName] !== undefined ? features[featureName] : false
  },

  // Get feature limit (e.g., customMoodLimit)
  getFeatureLimit: featureName => {
    const { tier } = get()
    const features = FEATURE_GATES[tier] || FEATURE_GATES.free
    return features[featureName]
  },

  // Check if user is on free tier
  isFree: () => get().tier === 'free',

  // Check if user is premium (pro or life)
  isPremium: () => {
    const tier = get().tier
    return tier === 'pro' || tier === 'life'
  },

  // Check if user has lifetime access
  isLifetime: () => get().tier === 'life',

  // Get subscription expiry date (or null for lifetime)
  getExpiryDate: () => {
    const { subscriptionData, tier } = get()
    if (tier === 'life') return null // Lifetime never expires
    return subscriptionData?.current_period_end
      ? new Date(subscriptionData.current_period_end)
      : null
  },
}))

// Export feature gates for reference
export { FEATURE_GATES }
