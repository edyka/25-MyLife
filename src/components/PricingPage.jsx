import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react'
import { getTheme } from '../utils/themeConfig'
import { useUIStore } from '../stores/useUIStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { redirectToCheckout, isStripeConfigured } from '../utils/stripeConfig'

const PricingPage = ({ darkMode }) => {
  const themePreset = useUIStore(state => state.themePreset)
  const theme = getTheme(themePreset)
  const [loadingTier, setLoadingTier] = useState(null)
  const [error, setError] = useState(null)
  const [billingPeriod, setBillingPeriod] = useState('yearly') // 'yearly' or 'monthly'

  // Get current user's subscription tier
  const currentTier = usePremiumStore(state => state.tier)
  // NOTE: isLifetime is currently unused in this component (kept in store for future UX).

  // Map tier names to plan names for comparison
  const getTierForPlan = planName => {
    if (planName === 'Viventiva') return 'free'
    if (planName === 'Viventiva Pro') return 'pro'
    if (planName === 'Viventiva Life') return 'life'
    return null
  }

  // Handle checkout for paid tiers
  const handleCheckout = async (tierName, stripeProductKey) => {
    if (!stripeProductKey) return // Free tier, no checkout needed

    setLoadingTier(tierName)
    setError(null)

    try {
      if (!isStripeConfigured()) {
        setError('Payments are not yet configured. Please check back soon!')
        return
      }
      await redirectToCheckout(stripeProductKey)
    } catch (err) {
      console.error('[Checkout Error]', err)
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoadingTier(null)
    }
  }

  const tiers = [
    {
      name: 'Viventiva',
      tagline: 'Start your intentional living journey',
      price: 'Free',
      period: 'Forever',
      icon: Sparkles,
      features: [
        { text: 'Life Grid visualization (80 years)', active: true },
        { text: '4 preset moods (Happy, Sad, Losing Time, In Love)', active: true },
        { text: 'Basic life statistics', active: true },
        { text: 'Dark mode', active: true },
        { text: '1 default theme (Sunset)', active: true },
        { text: 'Secure cloud sync', active: true },
      ],
      cta: 'Start Your Journey',
      ctaStyle: 'secondary',
      highlighted: false,
      stripeProductKey: null, // Free tier
    },
    {
      name: 'Viventiva Pro',
      tagline: 'Live with intention and insight',
      price: billingPeriod === 'yearly' ? '$39.99' : '$4.99',
      period: billingPeriod === 'yearly' ? 'per year' : 'per month',
      altPeriodText: billingPeriod === 'yearly' ? 'or $4.99/month' : 'or $39.99/year (save 33%)',
      icon: Zap,
      badge: 'Most Popular',
      features: [
        { text: 'Everything in Viventiva, plus:', active: true, bold: true },
        { text: 'Unlimited custom moods', active: true },
        { text: 'All 4 theme presets', active: true },
        { text: 'Unlimited goals', active: true },
        { text: 'Export grid as PNG', active: true },
        { text: 'Priority email support', active: true },
      ],
      cta: 'Go Pro',
      ctaStyle: 'primary',
      highlighted: true,
      savings: billingPeriod === 'yearly' ? 'Save 33%' : null,
      stripeProductKey: billingPeriod === 'yearly' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
    },
    {
      name: 'Viventiva Life',
      tagline: 'Own your legacy forever',
      price: '$99',
      period: 'Lifetime',
      originalPrice: '$149',
      icon: Crown,
      badge: 'Best Value',
      features: [
        { text: 'Everything in Viventiva Pro, plus:', active: true, bold: true },
        { text: 'Lifetime access to all features', active: true },
        { text: 'Founding member badge', active: true },
        { text: 'All future updates included', active: true },
        { text: 'Early access to new features', active: true },
      ],
      cta: 'Get Lifetime Access',
      ctaStyle: 'premium',
      highlighted: false,
      stripeProductKey: 'LIFE', // Maps to STRIPE_PRODUCTS.LIFE
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-16"
      >
        <div
          className={`inline-flex items-center gap-4 px-6 py-4 rounded-full text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider mb-6 ${darkMode ? `${theme.accentBgDeep} ${theme.accentDark}` : `${theme.accentBg} ${theme.accentText600}`}`}
        >
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
          Invest in Yourself
        </div>
        <h1
          className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
        >
          Choose Your Plan
        </h1>
        <p
          className={`text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
        >
          Start free. Upgrade when you're ready to unlock deeper insights into your life's journey.
        </p>

        {/* Trust Indicators */}
        <div
          className={`flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8 text-xs sm:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            <span>Secure Cloud Sync</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            <span>Instant Access</span>
          </div>
        </div>
      </motion.div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
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
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-medium">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-20">
        {tiers.map((tier, index) => {
          const Icon = tier.icon
          const isHighlighted = tier.highlighted
          const isPro = tier.name === 'Viventiva Pro'
          const planTier = getTierForPlan(tier.name)
          const isCurrentPlan = currentTier === planTier

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col backdrop-blur-xl ${
                isHighlighted
                  ? darkMode
                    ? `bg-white/5 border border-white/10 shadow-2xl ${theme.accentShadowMd} ring-1 ${theme.accentRing}`
                    : `bg-white/60 border border-white/20 shadow-2xl ${theme.accentShadowSm} ring-1 ${theme.accentRingLight}`
                  : isPro
                    ? darkMode
                      ? `bg-gradient-to-b from-white/5 to-white/[0.02] border ${theme.accentBorder500_20} shadow-xl ${theme.accentShadowSm}`
                      : `bg-gradient-to-b from-white/70 to-white/40 border ${theme.accentBorder200_40} shadow-xl ${theme.accentShadowSm}`
                    : darkMode
                      ? 'bg-white/[0.03] border border-white/5 shadow-xl'
                      : 'bg-white/50 border border-white/20 shadow-xl'
              } ${isHighlighted ? 'md:-mt-4 md:mb-4 md:scale-105 z-10' : ''} transition-all duration-500`}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md bg-gradient-to-r ${theme.primary} text-white border border-white/20`}
                  style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {tier.badge}
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-white/20">
                  ✓ Current
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div
                  className={`inline-flex p-4 rounded-2xl mb-6 backdrop-blur-md ${
                    isPro || isHighlighted
                      ? `bg-gradient-to-br ${theme.primaryMuted} shadow-lg ${theme.accentShadowMd} border ${theme.accentBorder300_20}`
                      : darkMode
                        ? 'bg-white/5 border border-white/5'
                        : 'bg-white/30 border border-white/20'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${isPro || isHighlighted ? theme.accent : darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                  />
                </div>

                <h3
                  className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  {tier.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-3">
                  {tier.originalPrice && (
                    <span
                      className={`text-lg line-through decoration-2 ${darkMode ? 'text-slate-600 decoration-slate-600' : 'text-slate-400 decoration-slate-400'}`}
                    >
                      {tier.originalPrice}
                    </span>
                  )}
                  <span
                    className={`text-5xl font-black tracking-tight ${
                      isPro
                        ? `bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`
                        : darkMode
                          ? 'text-white'
                          : 'text-slate-900'
                    }`}
                  >
                    {tier.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}
                  >
                    {tier.period}
                  </p>
                  {tier.savings && (
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                      {tier.savings}
                    </span>
                  )}
                </div>
                {tier.monthlyPrice && (
                  <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    or {tier.monthlyPrice}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className={`h-px w-full mb-8 ${darkMode ? 'bg-white/5' : 'bg-slate-200/50'}`} />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 ${!feature.active ? 'opacity-40' : ''}`}
                  >
                    {feature.bold ? (
                      <span
                        className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        {feature.text}
                      </span>
                    ) : (
                      <>
                        <div
                          className={`mt-0.5 p-1 rounded-full backdrop-blur-sm ${
                            !feature.active
                              ? darkMode
                                ? 'bg-white/5 text-slate-500'
                                : 'bg-slate-200/50 text-slate-400'
                              : isPro || isHighlighted
                                ? `${theme.accentBgMuted} ${theme.accent} border ${theme.accentBorder500_20}`
                                : darkMode
                                  ? 'bg-white/5 text-slate-400'
                                  : 'bg-slate-200/30 text-slate-600'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
                          >
                            {feature.text}
                          </span>
                          {!feature.active && (
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
                <motion.button
                  whileHover={{ scale: loadingTier || isCurrentPlan ? 1 : 1.02 }}
                  whileTap={{ scale: loadingTier || isCurrentPlan ? 1 : 0.98 }}
                  onClick={() => !isCurrentPlan && handleCheckout(tier.name, tier.stripeProductKey)}
                  disabled={loadingTier === tier.name || isCurrentPlan}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-white/10 cursor-default'
                      : tier.ctaStyle === 'primary' || tier.ctaStyle === 'premium'
                        ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg ${theme.accentShadowLg} hover:shadow-xl border border-white/10`
                        : darkMode
                          ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          : 'bg-white/40 hover:bg-white/60 text-slate-900 border border-white/20'
                  } ${loadingTier === tier.name ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loadingTier === tier.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : (
                    tier.cta
                  )}
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`rounded-[2.5rem] p-8 md:p-12 ${darkMode ? 'bg-slate-800/30 border border-slate-700/50' : 'bg-white shadow-xl border border-slate-100'}`}
      >
        <h2
          className={`text-3xl font-black mb-12 text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}
        >
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {[
            {
              q: 'What happens to my data if I cancel?',
              a: "You keep all your data. You'll simply drop back to the free Vivid tier features. Your data remains safe in our secure cloud and won't be deleted.",
            },
            {
              q: 'Is my data really private?',
              a: 'Your data is stored securely in our cloud database (Supabase) with encryption. We use industry-standard security practices and never sell your data. You can export or delete your data anytime.',
            },
            {
              q: 'Can I switch from monthly to yearly?',
              a: "Yes! Upgrade anytime from your account settings. We'll credit any unused monthly time toward your yearly subscription.",
            },
            {
              q: 'Will the Pro price increase to $149?',
              a: "Yes. We're offering $99 to early supporters during our launch period. Current Pro users are grandfathered at their purchase price.",
            },
          ].map((faq, i) => (
            <div key={i}>
              <h3
                className={`font-bold text-lg mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}
              >
                {faq.q}
              </h3>
              <p
                className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <p className={`text-lg mb-4 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          We believe everyone deserves to live vividly.
        </p>
        <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          Questions? Email us at{' '}
          <a
            href="mailto:support@viventiva.com"
            className={`font-bold hover:underline ${darkMode ? 'text-white' : 'text-slate-900'}`}
          >
            support@viventiva.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}

export default PricingPage
