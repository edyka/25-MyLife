import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Crown, Loader2, Sparkles } from 'lucide-react'
import { useUIStore } from '../stores/useUIStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { getTheme } from '../utils/themeConfig'
import { redirectToCheckout, isStripeConfigured } from '../utils/stripeConfig'

const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const darkMode = useUIStore(state => state.darkMode)
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)
  const currentTier = usePremiumStore(state => state.tier)

  const [loadingTier, setLoadingTier] = useState(null)
  const [error, setError] = useState(null)
  const [billingPeriod, setBillingPeriod] = useState('yearly')

  const handleUpgrade = async stripeProductKey => {
    if (!stripeProductKey) return

    if (!isStripeConfigured()) {
      setError('Payments are not yet configured. Please check back soon!')
      return
    }

    setLoadingTier(stripeProductKey)
    setError(null)

    try {
      await redirectToCheckout(stripeProductKey)
    } catch (err) {
      console.error('[Upgrade Error]', err)
      setError(err.message || 'Failed to start checkout')
      setLoadingTier(null)
    }
  }

  if (!isOpen) return null

  const tiers = [
    {
      name: 'Free',
      tagline: 'Start your journey',
      price: 'Free',
      period: 'Forever',
      icon: Sparkles,
      features: [
        { text: 'Life Grid visualization', active: true },
        { text: '4 preset moods', active: true },
        { text: 'Basic life statistics', active: true },
        { text: 'Dark mode', active: true },
        { text: '1 default theme', active: true },
        { text: 'Secure cloud sync', active: true },
      ],
      cta: 'Current Plan',
      stripeProductKey: null,
      tierKey: 'free',
    },
    {
      name: 'Pro',
      tagline: 'Live with intention',
      price: billingPeriod === 'yearly' ? '$39.99' : '$4.99',
      period: billingPeriod === 'yearly' ? 'per year' : 'per month',
      altPrice: billingPeriod === 'yearly' ? 'or $4.99/month' : 'or $39.99/year',
      icon: Zap,
      badge: 'Most Popular',
      savings: billingPeriod === 'yearly' ? 'Save 33%' : null,
      features: [
        { text: 'Everything in Free, plus:', active: true, bold: true },
        { text: 'Unlimited custom moods', active: true },
        { text: 'All 4 theme presets', active: true },
        { text: 'Unlimited goals', active: true },
        { text: 'Export grid as PNG', active: true },
        { text: 'Priority email support', active: true },
      ],
      cta: 'Go Pro',
      stripeProductKey: billingPeriod === 'yearly' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
      highlighted: true,
      tierKey: 'pro',
    },
    {
      name: 'Life',
      tagline: 'Own your legacy',
      price: '$99',
      originalPrice: '$149',
      period: 'Lifetime',
      icon: Crown,
      badge: 'Best Value',
      features: [
        { text: 'Everything in Pro, plus:', active: true, bold: true },
        { text: 'Lifetime access to all features', active: true },
        { text: 'Founding member badge', active: true },
        { text: 'All future updates included', active: true },
        { text: 'Early access to new features', active: true },
      ],
      cta: 'Get Lifetime',
      stripeProductKey: 'LIFE',
      tierKey: 'life',
    },
  ]

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`w-full max-w-5xl my-8 rounded-3xl shadow-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 p-6 border-b ${darkMode ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-white/95'} backdrop-blur-md flex items-center justify-between rounded-t-3xl`}
          >
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Unlock Premium Features
              </h2>
              {feature && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature} requires a premium subscription
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-black/5 transition-colors ${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center pt-6">
            <div
              className={`inline-flex items-center p-1 rounded-full ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}
            >
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                    : darkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                    : darkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    billingPeriod === 'yearly'
                      ? 'bg-white/20 text-white'
                      : 'bg-green-500/10 text-green-500'
                  }`}
                >
                  Save 33%
                </span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-medium">
              {error}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(tier => {
              const Icon = tier.icon
              const isLoading = loadingTier === tier.stripeProductKey
              const isCurrentPlan = currentTier === tier.tierKey
              const isPro = tier.name === 'Pro'
              const isLife = tier.name === 'Life'

              return (
                <motion.div
                  key={tier.name}
                  whileHover={{ y: -4 }}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col ${
                    tier.highlighted
                      ? darkMode
                        ? 'bg-gradient-to-b from-white/10 to-white/5 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                        : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200 shadow-lg shadow-emerald-500/10'
                      : isLife
                        ? darkMode
                          ? 'bg-gradient-to-b from-purple-500/10 to-pink-500/5 border-purple-500/30'
                          : 'bg-gradient-to-b from-purple-50 to-pink-50 border-purple-200'
                        : darkMode
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-slate-50 border-slate-200'
                  } ${tier.highlighted ? 'md:scale-105 z-10' : ''}`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                        isLife
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : `bg-gradient-to-r ${theme.primary}`
                      }`}
                    >
                      {tier.badge}
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-3 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      ✓ Current
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl mb-4 w-fit ${
                      isPro || tier.highlighted
                        ? `bg-gradient-to-br ${theme.primary}`
                        : isLife
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : darkMode
                            ? 'bg-slate-700'
                            : 'bg-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isPro || isLife || tier.highlighted ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-600'}`}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                  >
                    Viventiva {tier.name}
                  </h3>
                  <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      {tier.originalPrice && (
                        <span
                          className={`text-sm line-through ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}
                        >
                          {tier.originalPrice}
                        </span>
                      )}
                      <span
                        className={`text-3xl font-black ${
                          isPro
                            ? `bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`
                            : isLife
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'
                              : darkMode
                                ? 'text-white'
                                : 'text-slate-900'
                        }`}
                      >
                        {tier.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {tier.period}
                      </span>
                      {tier.savings && (
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          {tier.savings}
                        </span>
                      )}
                    </div>
                    {tier.altPrice && (
                      <p
                        className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}
                      >
                        {tier.altPrice}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div
                    className={`h-px w-full mb-4 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}
                  />

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {tier.features.map((featureItem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {featureItem.bold ? (
                          <span
                            className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
                          >
                            {featureItem.text}
                          </span>
                        ) : (
                          <>
                            <Check
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                isPro || tier.highlighted
                                  ? 'text-emerald-500'
                                  : isLife
                                    ? 'text-purple-500'
                                    : 'text-green-500'
                              }`}
                            />
                            <span
                              className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              {featureItem.text}
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => handleUpgrade(tier.stripeProductKey)}
                    disabled={isLoading || isCurrentPlan}
                    whileHover={{ scale: isLoading || isCurrentPlan ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading || isCurrentPlan ? 1 : 0.98 }}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? darkMode
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : 'bg-slate-200 text-slate-500 cursor-default'
                        : isLife
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                          : isPro || tier.highlighted
                            ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl`
                            : darkMode
                              ? 'bg-slate-700 hover:bg-slate-600 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      tier.cta
                    )}
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default UpgradeModal
