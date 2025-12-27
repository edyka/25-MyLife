import { useEffect, useRef } from 'react'

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

  // Hash sanitation and history management for OAuth flow
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hadAuthTokens = hasAuthTokensInHash(window.location.hash)

    if (hadAuthTokens) {
      try {
        // Clean the hash from URL
        window.history.replaceState(
          { viventiva: true, page: 'main' },
          document.title,
          window.location.pathname + window.location.search
        )
        // Push a new state so back button stays in app
        window.history.pushState(
          { viventiva: true, page: 'main' },
          document.title,
          window.location.pathname
        )
        historyInitialized.current = true
      } catch {
        /* ignore */
      }
    }
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = event => {
      // If user tries to go back and we don't have app state,
      // they're likely going to OAuth page - prevent it
      if (!event.state?.viventiva) {
        // Push state to prevent leaving the app
        window.history.pushState(
          { viventiva: true, page: currentPage },
          document.title,
          window.location.pathname
        )
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Initialize history state if not already done (for direct visits)
    if (!historyInitialized.current && !window.history.state?.viventiva) {
      window.history.replaceState(
        { viventiva: true, page: currentPage },
        document.title,
        window.location.pathname + window.location.search
      )
      historyInitialized.current = true
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentPage])

  // SEO and Analytics
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { trackPageView: track } = await import('../utils/analytics')
        track(getSafePathForTracking())
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
