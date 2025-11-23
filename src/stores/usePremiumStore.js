import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FEATURE_GATES = {
    free: {
        customMoodLimit: 3,
        advancedStats: false,
        premiumThemes: false,
        pdfExport: false,
        unlimitedGoals: false,
        aiInsights: false,
        customCSS: false
    },
    vivente: {
        customMoodLimit: Infinity,
        advancedStats: true,
        premiumThemes: true,
        pdfExport: true,
        unlimitedGoals: true,
        aiInsights: false,
        customCSS: false
    },
    pro: {
        customMoodLimit: Infinity,
        advancedStats: true,
        premiumThemes: true,
        pdfExport: true,
        unlimitedGoals: true,
        aiInsights: true,
        customCSS: true
    }
};

export const usePremiumStore = create(
    persist(
        (set, get) => ({
            tier: 'free', // 'free', 'vivente', or 'pro'

            // Actions
            setTier: (tier) => set({ tier }),

            // Check if user has access to a feature
            hasFeature: (featureName) => {
                const { tier } = get();
                const features = FEATURE_GATES[tier];
                return features[featureName] !== undefined ? features[featureName] : false;
            },

            // Get feature limit (e.g., customMoodLimit)
            getFeatureLimit: (featureName) => {
                const { tier } = get();
                const features = FEATURE_GATES[tier];
                return features[featureName];
            },

            // Check if user is on free tier
            isFree: () => get().tier === 'free',

            // Check if user is premium (vivente or pro)
            isPremium: () => {
                const tier = get().tier;
                return tier === 'vivente' || tier === 'pro';
            },

            // Mock upgrade function (for demo purposes)
            // In production, this would integrate with Stripe/Paddle
            mockUpgrade: (newTier) => {
                console.log(`[Premium] Mock upgrade to ${newTier}`);
                set({ tier: newTier });
            }
        }),
        {
            name: 'viventiva-premium',
            partialize: (state) => ({
                tier: state.tier
            })
        }
    )
);
