import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useUIStore } from '../stores/useUIStore'
import { getTheme } from '../utils/themeConfig'
import { isFoundingPriceAvailable } from '../utils/stripeConfig'
import { trackEvent } from '../utils/analytics'

const DISMISS_KEY = 'viventiva_upgrade_nudge_dismissed'

/**
 * Aha-moment upgrade nudge — shown under the life grid the moment a free user
 * sees their weeks laid out. Leads with the Lifetime offer (the best-converting
 * tier), with Annual as the secondary option. Dismissible and remembered.
 */
const UpgradeNudge = ({ isGuestMode = false }) => {
  const tier = usePremiumStore(state => state.tier)
  const darkMode = useUIStore(state => state.darkMode)
  const themePreset = useUIStore(state => state.themePreset)
  const setCurrentTab = useUIStore(state => state.setCurrentTab)
  const theme = getTheme(themePreset)

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  // Only nudge free, signed-in users who haven't dismissed it.
  if (isGuestMode || tier !== 'free' || dismissed) return null

  const founding = isFoundingPriceAvailable()
  const lifetimePrice = founding ? '$79' : '$99'

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // Storage unavailable — the nudge simply reappears next session.
    }
  }

  const handleUpgrade = () => {
    trackEvent('upgrade_prompt_click', { source: 'home_aha_banner' })
    setCurrentTab('premium')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={`relative mx-auto w-full max-w-5xl sm:max-w-6xl rounded-2xl border p-4 sm:p-5 backdrop-blur-xl shadow-lg ${
          darkMode ? 'bg-white/[0.04] border-white/10' : 'bg-white/70 border-slate-200/70'
        }`}
      >
        <button
          onClick={handleDismiss}
          aria-label="Dismiss upgrade suggestion"
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${
            darkMode
              ? 'text-slate-500 hover:text-white hover:bg-white/10'
              : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pr-6">
          <div
            className={`hidden sm:flex p-3 rounded-2xl shrink-0 bg-gradient-to-br ${theme.primaryMuted} border ${theme.accentBorder300_20}`}
          >
            <Sparkles className={`w-6 h-6 ${theme.accent}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base sm:text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}
            >
              This is your one life — about 4,000 weeks.
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
            >
              Own every one of them. Lifetime access for a single payment of {lifetimePrice} — no
              subscription — or go Annual at $39.99.
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            className={`shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${theme.primary} shadow-lg ${theme.accentShadowLg} hover:shadow-xl transition-all`}
          >
            See your options
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UpgradeNudge
