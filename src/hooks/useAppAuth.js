import { useState, useEffect, useRef } from 'react'
import { auth } from '../lib/supabase'
import { dataService } from '../services/dataService'

const isDev = process.env.NODE_ENV === 'development'

// Detect mobile at module load time (won't change during session)
const isMobile =
  typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const AUTH_TIMEOUT = isMobile ? 3000 : 5000
const BACKEND_TIMEOUT = isMobile ? 1500 : 3000

export const useAppAuth = setCurrentPage => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [isBackendAvailable, setIsBackendAvailable] = useState(true)
  const userDataLoadRef = useRef({ userId: null, promise: null, loadId: null })
  const authTimeoutRef = useRef(null)

  // Check backend health on mount (non-blocking, silent on mobile)
  // Skip on mobile Safari to prevent privacy warning
  useEffect(() => {
    // Skip backend check on mobile - it can trigger Safari's privacy warning
    if (isMobile) return

    const checkBackend = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT)

        const status = await auth.checkConnection()
        clearTimeout(timeoutId)

        if (!status.online) {
          if (isDev) console.error('[Viventiva] Backend connection failed:', status)
          setIsBackendAvailable(false)
        }
      } catch {
        // Silently ignore - don't trigger any warnings
        // Backend availability will be determined by actual auth attempts
      }
    }
    checkBackend()
  }, [])

  // Safety timeout - ensure authLoading doesn't stay true forever
  // Shorter timeout on mobile for better UX (3s mobile, 5s desktop)
  useEffect(() => {
    authTimeoutRef.current = setTimeout(() => {
      if (authLoading) {
        if (isDev) console.warn('[Viventiva] Auth timeout - setting authLoading to false')
        setAuthLoading(false)
      }
    }, AUTH_TIMEOUT)

    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
      }
    }
  }, [authLoading])

  const loadUserData = async currentUser => {
    if (!currentUser) return

    if (userDataLoadRef.current.userId === currentUser.id && userDataLoadRef.current.promise) {
      return await userDataLoadRef.current.promise
    }

    const loadId = Symbol('load')
    userDataLoadRef.current.loadId = loadId

    const loadPromise = (async () => {
      setDataLoading(true)
      try {
        // Early return if user switched during load
        if (userDataLoadRef.current.loadId !== loadId) return
        const { useLifeStore } = await import('../stores/useLifeStore')
        const { useMilestoneStore } = await import('../stores/useMilestoneStore')
        const { useSelectionStore } = await import('../stores/useSelectionStore')
        const { useUIStore } = await import('../stores/useUIStore')
        const { usePremiumStore } = await import('../stores/usePremiumStore')

        // Use DataService for optimized parallel loading and caching
        const { profile, milestones, selections, settings, errors } = await dataService.getUserData(
          currentUser.id
        )

        if (errors) {
          console.warn('[Viventiva Auth] Some data failed to load:', errors)
        }

        // Check if profile exists in database
        const hasDbProfile = profile?.data && profile.data.birth_day

        // Fallback: check if user has local profile data (from previous successful onboarding)
        const lifeStore = useLifeStore.getState()
        const hasLocalProfile = lifeStore.birthDay && lifeStore.birthMonth && lifeStore.birthYear
        const localProfileComplete = localStorage.getItem('viventiva_profile_complete') === 'true'

        if (hasDbProfile) {
          // Use database profile (primary source)
          const pData = profile.data
          lifeStore.setBirthData(pData.birth_day, pData.birth_month, pData.birth_year)
          lifeStore.setLifeExpectancy(pData.life_expectancy || 80)

          if (pData.name) {
            lifeStore.setUserName(pData.name)
          } else if (currentUser.user_metadata?.full_name) {
            lifeStore.setUserName(currentUser.user_metadata.full_name)
          }

          // Set Milestones
          const milestoneStore = useMilestoneStore.getState()
          if (milestones?.data?.milestones_data) {
            const mData = milestones.data.milestones_data
            milestoneStore.setMilestones(mData.milestones || {})
            milestoneStore.setCustomMoods(mData.customMoods || {})
            milestoneStore.setCustomCategories(mData.customCategories || {})
          } else {
            milestoneStore.setMilestones({})
            milestoneStore.setCustomMoods({})
            milestoneStore.setCustomCategories({})
          }

          // Set Selections
          const selectionStore = useSelectionStore.getState()
          if (selections?.data?.selections_data) {
            const sData = selections.data.selections_data
            selectionStore.setSelectedWeeks(new Set(sData.selectedWeeks || []))
            selectionStore.setPinnedWeeks(new Set(sData.pinnedWeeks || []))
            selectionStore.setSelectedColor(sData.selectedColor || null)
          } else {
            selectionStore.clearAllSelections()
          }

          // Set UI Settings
          if (settings?.data?.settings_data) {
            const uiSettings = settings.data.settings_data
            const uiStore = useUIStore.getState()
            // Use individual setters since Zustand doesn't expose set() on getState()
            if (uiSettings.darkMode !== undefined) uiStore.setDarkMode(uiSettings.darkMode)
            if (uiSettings.themePreset !== undefined) uiStore.setThemePreset(uiSettings.themePreset)
            if (uiSettings.gridLayout !== undefined) uiStore.setGridLayout(uiSettings.gridLayout)
            if (uiSettings.pastWeekStyle !== undefined)
              uiStore.setPastWeekStyle(uiSettings.pastWeekStyle)
          }

          setNeedsProfileSetup(false)
          localStorage.setItem('viventiva_authenticated', 'true')
          localStorage.setItem('viventiva_profile_complete', 'true')

          // Fetch subscription
          try {
            await usePremiumStore.getState().fetchSubscription(currentUser.id)
          } catch (e) {
            console.error('[Viventiva Data] Error loading subscription:', e)
          }
        } else if (hasLocalProfile && localProfileComplete) {
          // Fallback: user has local profile data but database profile is missing/failed
          // This can happen if database sync failed previously
          console.warn('[Viventiva Auth] Using local profile data - database profile missing')

          // User already has local data, skip onboarding
          setNeedsProfileSetup(false)
          localStorage.setItem('viventiva_authenticated', 'true')

          // Try to sync local profile to database in the background
          const { database } = await import('../lib/supabase')
          database
            .saveUserProfile(currentUser.id, {
              name: lifeStore.userName || currentUser.user_metadata?.full_name || 'User',
              birthDay: lifeStore.birthDay,
              birthMonth: lifeStore.birthMonth,
              birthYear: lifeStore.birthYear,
              lifeExpectancy: lifeStore.lifeExpectancy,
            })
            .then(result => {
              if (result.error) {
                console.error(
                  '[Viventiva Auth] Failed to sync local profile to database:',
                  result.error
                )
              } else {
                if (isDev)
                  console.log('[Viventiva Auth] Successfully synced local profile to database')
              }
            })
            .catch(error => {
              console.error('[Viventiva Auth] Error syncing profile to database:', error)
            })

          // Fetch subscription
          try {
            await usePremiumStore.getState().fetchSubscription(currentUser.id)
          } catch (e) {
            console.error('[Viventiva Data] Error loading subscription:', e)
          }
        } else {
          // New user - needs profile setup
          setNeedsProfileSetup(true)

          // IMPORTANT: Clear subscription for new users to prevent inheriting old cached tier
          const premiumStore = usePremiumStore.getState()
          premiumStore.clearSubscription()

          const lifeStore = useLifeStore.getState()

          // Try multiple metadata fields for the name
          const meta = currentUser.user_metadata
          const nameToSet = meta?.full_name || meta?.first_name || meta?.name

          if (nameToSet) {
            lifeStore.setUserName(nameToSet)
          } else if (currentUser.email) {
            const nameFromEmail = currentUser.email.split('@')[0]
            lifeStore.setUserName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1))
          }

          // Fetch subscription for new user (will return free if none exists)
          try {
            await premiumStore.fetchSubscription(currentUser.id)
          } catch (e) {
            console.error('[Viventiva Data] Error loading subscription for new user:', e)
          }
        }
      } catch (error) {
        console.error('[Viventiva Data] Error loading data:', error)
      } finally {
        setDataLoading(false)
      }
    })()

    userDataLoadRef.current.userId = currentUser.id
    userDataLoadRef.current.promise = loadPromise
    try {
      return await loadPromise
    } finally {
      if (userDataLoadRef.current.promise === loadPromise) {
        userDataLoadRef.current.promise = null
      }
    }
  }

  useEffect(() => {
    let authListener = null
    const setupAuth = async () => {
      const {
        data: { subscription },
      } = auth.onAuthStateChange(async (event, session) => {
        if (isDev) console.log('[Viventiva Auth] Event:', event, 'User:', session?.user?.id)

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(prev => (prev?.id === session.user.id ? prev : session.user))
            setAuthLoading(false)
            loadUserData(session.user)
          } else if (event === 'INITIAL_SESSION') {
            setUser(null)
            setAuthLoading(false)
            setDataLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAuthLoading(false)
          setDataLoading(false)
          setNeedsProfileSetup(false)
          localStorage.removeItem('viventiva_authenticated')
          localStorage.removeItem('viventiva_profile_complete')

          const { usePremiumStore } = await import('../stores/usePremiumStore')
          usePremiumStore.getState().clearSubscription()
          dataService.clearCache()
        }
      })
      authListener = subscription

      // Check for existing session (handles OAuth redirect case)
      // This is needed because the auth state change might have fired before our listener was set up
      try {
        const { data: { session } } = await auth.getSession()
        if (session?.user) {
          if (isDev) console.log('[Viventiva Auth] Found existing session:', session.user.id)
          setUser(prev => (prev?.id === session.user.id ? prev : session.user))
          setAuthLoading(false)
          loadUserData(session.user)
        } else {
          setAuthLoading(false)
        }
      } catch (error) {
        console.error('[Viventiva Auth] Error getting session:', error)
        setAuthLoading(false)
      }
    }
    setupAuth()
    return () => {
      if (authListener) authListener.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    setAuthLoading(true)
    try {
      const {
        data: { session },
      } = await auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setAuthLoading(false)
        loadUserData(session.user)
        // Redirect to main app after login
        if (setCurrentPage) setCurrentPage('main')
      }
    } catch (error) {
      console.error('[Viventiva Auth] Error in manual login check:', error)
      setAuthLoading(false)
    }
  }

  const handleProfileComplete = () => {
    setNeedsProfileSetup(false)
    localStorage.setItem('viventiva_profile_complete', 'true')
    // Redirect to main app after profile setup
    if (setCurrentPage) setCurrentPage('main')
  }

  return {
    user,
    authLoading,
    dataLoading,
    needsProfileSetup,
    isBackendAvailable,
    handleLogin,
    handleProfileComplete,
  }
}
