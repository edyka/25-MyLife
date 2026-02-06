import { Target, Moon, Sun, Home, Sparkles, LogOut, Crown } from './icons'

// Import optimized life selectors
import { useLifeStore } from '../stores/useLifeStore'
import { useUIStore } from '../stores/useUIStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { getTheme } from '../utils/themeConfig'
import { useLogout } from '../hooks/useLogout'

// Mobile uses 3 tabs: Home, Goals, Premium (Settings via user icon)
const MOBILE_TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'premium', label: 'Pro', icon: Sparkles },
]

// Desktop uses 3 tabs (settings is in top bar)
const DESKTOP_TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'premium', label: 'Premium', icon: Sparkles, badge: true },
]

const TabNavigation = ({
  currentTab,
  setCurrentTab,
  darkMode,
  showWeeks,
  setShowWeeks,
  setDarkMode,
}) => {
  // Get current age and user name from optimized selectors
  const currentWeek = useLifeStore(state => state.currentWeek)
  const userName = useLifeStore(state => state.userName)
  const currentAge = Math.floor((currentWeek - 1) / 52)

  const themePreset = useUIStore(state => state.themePreset)
  const setCurrentPage = useUIStore(state => state.setCurrentPage)
  const theme = getTheme(themePreset)

  // Get subscription tier
  const tier = usePremiumStore(state => state.tier)
  const subscriptionLoading = usePremiumStore(state => state.subscriptionLoading)

  const { handleLogout } = useLogout()

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav
        className={`hidden md:flex w-full flex-col items-center border-b transition-all duration-500 sticky top-0 z-30 ${
          darkMode
            ? 'premium-card-dark border-slate-700/30 backdrop-blur-lg'
            : 'premium-card border-slate-200/30 backdrop-blur-lg'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="w-full max-w-7xl px-6 py-4 min-h-[64px] grid grid-cols-[auto_1fr_auto] items-center">
          {/* Left side - Brand Logo and User */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('settings')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              aria-label="Open settings"
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-lg ${theme.shadow} flex items-center justify-center group`}
                >
                  <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"
                      ></div>
                    ))}
                  </div>
                </div>
                {/* Premium indicator on logo */}
                {!subscriptionLoading && tier !== 'free' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                )}
                {(subscriptionLoading || tier === 'free') && (
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-md animate-pulse`}
                  ></div>
                )}
              </div>
              <div>
                <h3
                  className={`text-lg font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
                >
                  {userName ? `${userName}'s Life` : 'Viventiva'}
                </h3>
                <p
                  className={`text-[10px] font-medium leading-none ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Age: {currentAge}y
                  {!subscriptionLoading && tier !== 'free' && (
                    <span className="ml-1.5 text-amber-500">
                      ✦ {tier === 'life' ? 'Lifetime' : 'Pro'}
                    </span>
                  )}
                </p>
              </div>
            </button>
          </div>

          {/* center tabs */}
          <div className="flex justify-center gap-2 items-center">
            {DESKTOP_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentTab(key)}
                className={`px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 focus:outline-none flex flex-col items-center justify-center h-14 hover:scale-105 ${
                  currentTab === key
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg ${theme.shadow}`
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
              </button>
            ))}
          </div>

          {/* right controls */}
          <div className="flex items-center gap-4 justify-end">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {showWeeks ? 'Weeks' : 'Months'}
              </span>
              <button
                role="switch"
                aria-checked={showWeeks}
                onClick={() => setShowWeeks(!showWeeks)}
                className={`${
                  showWeeks
                    ? `bg-gradient-to-r ${theme.primary}`
                    : darkMode
                      ? 'bg-slate-700/50'
                      : 'bg-slate-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg`}
              >
                <span className="sr-only">Toggle weeks/months</span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${showWeeks ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-md ${
                darkMode
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200'
                  : 'bg-gradient-to-r from-white to-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-semibold">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              aria-label="Logout"
              onClick={handleLogout}
              className={`px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-md bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Compact with user info */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${
          darkMode
            ? 'bg-slate-900/98 border-slate-700/50 backdrop-blur-xl'
            : 'bg-white/98 border-slate-200 backdrop-blur-xl'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around py-1.5">
          {/* Navigation tabs */}
          {MOBILE_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = currentTab === key
            return (
              <button
                key={key}
                onClick={() => setCurrentTab(key)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                    : darkMode
                      ? 'text-slate-400 active:text-white'
                      : 'text-slate-500 active:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[9px] font-semibold mt-0.5 ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
              </button>
            )
          })}

          {/* User icon - navigates to Settings (at end) */}
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              currentTab === 'settings'
                ? `bg-gradient-to-r ${theme.primary} text-white shadow-md`
                : darkMode
                  ? 'text-slate-400 active:text-white'
                  : 'text-slate-500 active:text-slate-900'
            }`}
          >
            <div
              className={`w-5 h-5 ${currentTab === 'settings' ? 'bg-white/20' : `bg-gradient-to-br ${theme.iconBg}`} rounded-md flex items-center justify-center`}
            >
              <div className="grid grid-cols-3 gap-[0.5px] w-2.5 h-2.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white/90 rounded-[0.5px]"></div>
                ))}
              </div>
            </div>
            <span
              className={`text-[9px] font-semibold mt-0.5 ${currentTab === 'settings' ? 'text-white' : ''}`}
            >
              {userName || 'You'}
              {!subscriptionLoading && tier !== 'free' && (tier === 'life' ? ' 👑' : ' ⚡')}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default TabNavigation
