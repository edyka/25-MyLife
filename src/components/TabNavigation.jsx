// No longer using useState - hamburger menu removed
import { Target, Moon, Sun, Home, Sparkles, LogOut, Crown, Zap } from "lucide-react";
import { Switch } from "@headlessui/react";

// Import optimized life selectors
import { useLifeStore } from "../stores/useLifeStore";
import { useUIStore } from "../stores/useUIStore";
import { usePremiumStore } from "../stores/usePremiumStore";
import { getTheme } from "../utils/themeConfig";
import { auth, database } from "../lib/supabase";

const TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "goals", label: "Goals", icon: Target },
  { key: "premium", label: "Premium", icon: Sparkles, badge: true },
];

const TabNavigation = ({
  currentTab,
  setCurrentTab,
  darkMode,
  showWeeks,
  setShowWeeks,
  setDarkMode,
}) => {
  // Get current age and user name from optimized selectors
  const currentWeek = useLifeStore(state => state.currentWeek);
  const userName = useLifeStore(state => state.userName);
  const currentAge = Math.floor((currentWeek - 1) / 52);

  const themePreset = useUIStore((state) => state.themePreset);
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);
  const theme = getTheme(themePreset);

  // Get subscription tier
  const tier = usePremiumStore((state) => state.tier);
  const subscriptionLoading = usePremiumStore((state) => state.subscriptionLoading);

  // Tier badge config
  const tierConfig = {
    free: { label: 'FREE', icon: null, color: 'bg-slate-500', textColor: 'text-slate-500' },
    pro: { label: 'PRO', icon: Zap, color: 'bg-gradient-to-r from-blue-500 to-purple-500', textColor: 'text-blue-500' },
    life: { label: 'LIFETIME', icon: Crown, color: 'bg-gradient-to-r from-amber-500 to-orange-500', textColor: 'text-amber-500' },
  };
  const currentTier = tierConfig[tier] || tierConfig.free;



  const handleLogout = async () => {
    console.log('[Viventiva] Logout initiated');

    // CRITICAL: Force sync all pending data to Supabase before logout
    // Wait up to 5 seconds to ensure data is saved, but don't block logout forever
    const syncPromise = (async () => {
      try {
        const { user } = await auth.getCurrentUser();

        if (!user) {
          console.warn('[Viventiva] No user found, skipping sync');
          return;
        }

        console.log('[Viventiva] Force syncing data to Supabase before logout...');

        // Import stores
        const milestoneStoreModule = await import('../stores/useMilestoneStore');
        const selectionStoreModule = await import('../stores/useSelectionStore');
        const useMilestoneStore = milestoneStoreModule.useMilestoneStore;
        const useSelectionStore = selectionStoreModule.useSelectionStore;

        // Get current state
        const milestoneStore = useMilestoneStore.getState();
        const selectionStore = useSelectionStore.getState();

        // Force sync milestones (don't wait for debounce)
        const milestoneData = {
          milestones: milestoneStore.milestones || {},
          customMoods: milestoneStore.customMoods || {},
          customCategories: milestoneStore.customCategories || {}
        };

        const weekCount = Object.keys(milestoneData.milestones || {}).length;
        console.log('[Viventiva] Force syncing milestones:', weekCount, 'weeks');
        console.log('[Viventiva] Milestone data structure:', {
          milestones: weekCount,
          customMoods: Object.keys(milestoneData.customMoods || {}).length,
          customCategories: Object.keys(milestoneData.customCategories || {}).length,
          sampleWeek: weekCount > 0 ? Object.keys(milestoneData.milestones)[0] : null
        });

        const { error: milestonesError } = await database.saveMilestones(user.id, milestoneData);
        if (milestonesError) {
          console.error('[Viventiva] Error force syncing milestones:', milestonesError);
          throw new Error(`Failed to save milestones: ${milestonesError.message}`);
        } else {
          console.log('[Viventiva] Milestones force synced successfully:', weekCount, 'weeks saved');

          // Verify the save by reading it back
          const { data: verifyData, error: verifyError } = await database.getMilestones(user.id);
          if (!verifyError && verifyData?.milestones_data) {
            const savedCount = verifyData.milestones_data.milestones
              ? Object.keys(verifyData.milestones_data.milestones || {}).length
              : Object.keys(verifyData.milestones_data || {}).length;
            console.log('[Viventiva] Verified milestones saved:', savedCount, 'weeks in Supabase');
            if (savedCount !== weekCount) {
              console.warn('[Viventiva] WARNING: Week count mismatch! Expected:', weekCount, 'Got:', savedCount);
            }
          } else {
            console.warn('[Viventiva] Could not verify milestones save:', verifyError);
          }
        }

        // Force sync selections
        const selectionsData = {
          selectedWeeks: Array.from(selectionStore.selectedWeeks || new Set()),
          pinnedWeeks: Array.from(selectionStore.pinnedWeeks || new Set()),
          selectedColor: selectionStore.selectedColor
        };

        console.log('[Viventiva] Force syncing selections:', {
          selectedWeeks: selectionsData.selectedWeeks.length,
          pinnedWeeks: selectionsData.pinnedWeeks.length,
          selectedColor: selectionsData.selectedColor
        });

        const { error: selectionsError } = await database.saveSelections(user.id, selectionsData);
        if (selectionsError) {
          console.error('[Viventiva] Error force syncing selections:', selectionsError);
          // Don't throw - selections are less critical than milestones
        } else {
          console.log('[Viventiva] Selections force synced successfully');
        }

        // Force sync goals
        try {
          const goals = milestoneStore.goals || [];
          console.log('[Viventiva] Force syncing goals:', goals.length);
          const { error: goalsError } = await database.saveGoals(user.id, goals);
          if (goalsError) {
            console.error('[Viventiva] Error force syncing goals:', goalsError);
          } else {
            console.log('[Viventiva] Goals force synced successfully');
          }
        } catch (goalsError) {
          console.error('[Viventiva] Error in goals sync block:', goalsError);
        }

        // Force sync settings
        try {
          const { useUIStore } = await import('../stores/useUIStore');
          await useUIStore.getState().syncSettingsToSupabase();
          console.log('[Viventiva] Settings force synced successfully');
        } catch (settingsError) {
          console.error('[Viventiva] Error force syncing settings:', settingsError);
          // Don't throw - settings are less critical
        }

        console.log('[Viventiva] All data synced successfully, proceeding with logout');
      } catch (error) {
        console.error('[Viventiva] Error force syncing before logout:', error);
        // Don't throw - we still want to logout even if sync fails
      }
    })();

    // Wait up to 5 seconds for sync to complete, then proceed with logout anyway
    try {
      await Promise.race([
        syncPromise,
        new Promise(resolve => setTimeout(() => {
          console.warn('[Viventiva] Sync timeout after 5 seconds, proceeding with logout');
          resolve();
        }, 5000))
      ]);
    } catch (error) {
      console.error('[Viventiva] Sync error, proceeding with logout:', error);
    }

    // Set logout flag IMMEDIATELY to prevent auth listener from re-authenticating
    sessionStorage.setItem('viventiva_logging_out', 'true');

    // Clear authentication flags
    localStorage.removeItem('viventiva_authenticated');
    localStorage.removeItem('viventiva_profile_complete');
    localStorage.removeItem('viventiva_just_logged_in');

    // Clear all user-specific data
    localStorage.removeItem('memento-vivere-life');
    localStorage.removeItem('memento-vivere-milestones');
    localStorage.removeItem('memento-vivere-selections'); // Also clear selections
    localStorage.removeItem('viventiva-premium'); // Clear subscription cache

    // Clear Zustand stores to ensure clean state
    try {
      // Import stores dynamically to avoid circular dependencies
      const milestoneStoreModule = await import('../stores/useMilestoneStore');
      const selectionStoreModule = await import('../stores/useSelectionStore');
      const useMilestoneStore = milestoneStoreModule.useMilestoneStore;
      const useSelectionStore = selectionStoreModule.useSelectionStore;

      useMilestoneStore.getState().clearMilestones();
      useMilestoneStore.getState().setCustomMoods({});
      useMilestoneStore.getState().setCustomCategories({});
      useSelectionStore.getState().clearAllSelections();
    } catch (e) {
      console.warn('[Viventiva] Could not clear stores:', e);
    }

    // Clear user name from store
    try {
      const store = useLifeStore.getState();
      if (store.setUserName) {
        store.setUserName('');
      }
    } catch (e) {
      console.warn('[Viventiva] Could not clear username:', e);
    }

    // Clear all Supabase auth keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('sb-') || key.includes('supabase.auth') || key.includes('viventiva-auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('[Viventiva] Clearing key:', key);
      localStorage.removeItem(key);
    });

    // Call auth.signOut() but don't wait for it - redirect immediately
    auth.signOut().then(() => {
      console.log('[Viventiva] Supabase signOut completed');
    }).catch((error) => {
      console.error('[Viventiva] Supabase signOut error (ignored):', error);
    });

    // Redirect immediately (use setTimeout to ensure it happens even if there are pending promises)
    console.log('[Viventiva] Redirecting to home...');
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className={`hidden md:flex w-full flex-col items-center border-b transition-all duration-500 sticky top-0 z-30 ${darkMode
        ? "premium-card-dark border-slate-700/30 backdrop-blur-lg"
        : "premium-card border-slate-200/30 backdrop-blur-lg"
        }`}>
        <div className="w-full max-w-7xl px-6 py-4 min-h-[64px] grid grid-cols-[auto_1fr_auto] items-center">
          {/* Left side - Brand Logo and User */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('settings')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              aria-label="Open settings"
            >
              <div className="relative">
                <div className={`w-10 h-10 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-lg ${theme.shadow} flex items-center justify-center group`}>
                  <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"></div>
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
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-md animate-pulse`}></div>
                )}
              </div>
              <div>
                <h3 className={`text-lg font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                  {userName ? `${userName}'s Life` : 'Viventiva'}
                </h3>
                <p className={`text-[10px] font-medium leading-none ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Age: {currentAge}y{!subscriptionLoading && tier !== 'free' && <span className="ml-1.5 text-amber-500">✦ {tier === 'life' ? 'Lifetime' : 'Pro'}</span>}
                </p>
              </div>
            </button>
          </div>

          {/* center tabs */}
          <div className="flex justify-center gap-2 items-center">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentTab(key)}
                className={`px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 focus:outline-none flex flex-col items-center justify-center h-14 hover:scale-105 ${currentTab === key
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg ${theme.shadow}`
                  : darkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
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
              <span className={`text-xs font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                {showWeeks ? "Weeks" : "Months"}
              </span>
              <Switch
                checked={showWeeks}
                onChange={setShowWeeks}
                className={`${showWeeks
                  ? `bg-gradient-to-r ${theme.primary}`
                  : darkMode ? "bg-slate-700/50" : "bg-slate-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-lg`}
              >
                <span className="sr-only">Toggle weeks/months</span>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${showWeeks ? "translate-x-5" : "translate-x-0"}`} />
              </Switch>
            </div>
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-md ${darkMode
                ? "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200"
                : "bg-gradient-to-r from-white to-slate-50 text-slate-700 border border-slate-200"
                }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-semibold">{darkMode ? "Light" : "Dark"}</span>
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

      {/* Mobile Top Bar - Minimal header with quick actions */}
      <nav className={`md:hidden w-full flex items-center justify-between px-3 py-2 border-b sticky top-0 z-30 ${darkMode
        ? "premium-card-dark border-slate-700/30 backdrop-blur-lg"
        : "premium-card border-slate-200/30 backdrop-blur-lg"
        }`}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${theme.iconBg} rounded-xl shadow-lg flex items-center justify-center`}>
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white/90 rounded-[1px]"></div>
              ))}
            </div>
          </div>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {userName ? userName : 'Viventiva'}
          </span>
          {/* Mobile Subscription Badge */}
          {!subscriptionLoading && tier !== 'free' && (
            <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${currentTier.color}`}>
              {tier === 'life' ? '👑' : '⚡'}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {/* Weeks/Months toggle */}
          <button
            onClick={() => setShowWeeks(!showWeeks)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${showWeeks
              ? `bg-gradient-to-r ${theme.primary} text-white`
              : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
          >
            {showWeeks ? 'W' : 'M'}
          </button>
          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-lg ${darkMode
              ? 'bg-slate-800 text-yellow-400'
              : 'bg-slate-100 text-slate-600'
              }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`p-1.5 rounded-lg bg-gradient-to-r ${theme.primary} text-white`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom ${darkMode
        ? "bg-slate-900/95 border-slate-800 backdrop-blur-lg"
        : "bg-white/95 border-slate-200 backdrop-blur-lg"
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = currentTab === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentTab(key)}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-200 min-w-[64px] ${isActive
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                  : darkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default TabNavigation;

