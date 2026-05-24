import { useEffect, useRef } from 'react'
import { useUIStore } from '../stores/useUIStore'
import { trackPageView as trackPageViewAnalytics } from '../utils/analytics'

const hasAuthTokensInHash = (hash = '') => {
  const h = (hash || '').toLowerCase()
  return (
    h.includes('access_token=') ||
    h.includes('refresh_token=') ||
    h.includes('error=') ||
    h.includes('error_description=') ||
    h.includes('type=signup') ||
    h.includes('type=recovery') ||
    h.includes('type=magiclink')
  )
}

const getSafePathForTracking = () => {
  const { pathname, search, hash } = window.location
  if (hasAuthTokensInHash(hash)) return `${pathname}${search}`
  return `${pathname}${search}${hash}`
}

export const useAppSEO = (currentPage, user) => {
  const historyInitialized = useRef(false)
  const isNavigatingBack = useRef(false)
  const prevState = useRef({ page: currentPage, tab: 'home' })

  // Get tab state from store
  const currentTab = useUIStore(state => state.currentTab)
  const setCurrentTab = useUIStore(state => state.setCurrentTab)
  const setCurrentPage = useUIStore(state => state.setCurrentPage)

  // Hash sanitation and history management for OAuth flow
  // IMPORTANT: Delay cleaning hash to allow Supabase to read auth tokens first
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hadAuthTokens = hasAuthTokensInHash(window.location.hash)

    if (hadAuthTokens) {
      // Wait for Supabase to process the tokens before cleaning the URL
      const cleanupTimer = setTimeout(() => {
        try {
          // Clean the hash from URL
          window.history.replaceState(
            { viventiva: true, page: 'main', tab: 'home' },
            document.title,
            window.location.pathname + window.location.search
          )
          // Push a new state so back button stays in app
          window.history.pushState(
            { viventiva: true, page: 'main', tab: 'home' },
            document.title,
            window.location.pathname
          )
          historyInitialized.current = true
          prevState.current = { page: 'main', tab: 'home' }
        } catch {
          /* ignore */
        }
      }, 1000) // Give Supabase 1 second to process tokens

      return () => clearTimeout(cleanupTimer)
    }
  }, [])

  // Push history state when page or tab changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isNavigatingBack.current) {
      isNavigatingBack.current = false
      return
    }

    const newState = { page: currentPage, tab: currentTab }
    const prev = prevState.current

    // Only push if something actually changed
    if (prev.page !== currentPage || prev.tab !== currentTab) {
      window.history.pushState(
        { viventiva: true, ...newState },
        document.title,
        window.location.pathname
      )
      prevState.current = newState
    }
  }, [currentPage, currentTab])

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = event => {
      // If user tries to go back and we don't have app state,
      // they're likely going to OAuth page - prevent it
      if (!event.state?.viventiva) {
        // Push state to prevent leaving the app
        window.history.pushState(
          { viventiva: true, page: currentPage, tab: currentTab },
          document.title,
          window.location.pathname
        )
        return
      }

      // Navigate to the previous state
      isNavigatingBack.current = true
      const { page, tab } = event.state

      if (page && page !== currentPage) {
        setCurrentPage(page)
      }
      if (tab && tab !== currentTab) {
        setCurrentTab(tab)
      }

      prevState.current = { page: page || currentPage, tab: tab || currentTab }
    }

    window.addEventListener('popstate', handlePopState)

    // Initialize history state if not already done (for direct visits)
    if (!historyInitialized.current && !window.history.state?.viventiva) {
      window.history.replaceState(
        { viventiva: true, page: currentPage, tab: currentTab },
        document.title,
        window.location.pathname + window.location.search
      )
      historyInitialized.current = true
      prevState.current = { page: currentPage, tab: currentTab }
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentPage, currentTab, setCurrentPage, setCurrentTab])

  // SEO and Analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        trackPageViewAnalytics(getSafePathForTracking())
      } catch {
        /* ignore */
      }
    }

    const updateSEO = async () => {
      try {
        const { initSEO, generateOrganizationSchema, generateWebAppSchema, setStructuredData } =
          await import('../utils/seo')

        if (currentPage === 'main' && user) {
          initSEO({
            title: 'My Life Grid',
            description:
              'Visualize your life journey, track milestones, and set goals with your personal life grid.',
          })
        } else if (currentPage === 'about') {
          initSEO({
            title: 'About Viventiva',
            description:
              'Learn about Viventiva - a tool to visualize your life as a grid of weeks and live intentionally.',
          })
        } else if (currentPage === 'privacy') {
          initSEO({
            title: 'Privacy Policy',
            description: 'Viventiva Privacy Policy - How we collect, use, and protect your data.',
          })
        } else if (currentPage === 'terms') {
          initSEO({
            title: 'Terms of Service',
            description: 'Viventiva Terms of Service - Terms and conditions for using our service.',
          })
        } else {
          initSEO({
            title: 'Viventiva - Visualize Your Life',
            description:
              'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally. Each square represents one week of your life.',
          })
        }

        if (currentPage === 'main' && !user) {
          setStructuredData(generateOrganizationSchema())
          setStructuredData(generateWebAppSchema())
        }
      } catch (error) {
        console.error('[Viventiva] Error updating SEO:', error)
      }
    }

    trackPageView()
    updateSEO()
  }, [currentPage, user])
}
