import { lazy, Suspense, useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import { useShallow } from 'zustand/shallow'

// Lazy load page components for code splitting
const SettingsPage = lazy(() => import('./components/SettingsPage'))
const MainApp = lazy(() => import('./components/MainApp'))
const HomePage = lazy(() => import('./components/HomePage'))
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard'))
const About = lazy(() => import('./components/About'))
const AppPolicy = lazy(() => import('./components/AppPolicy'))
const TermsOfService = lazy(() => import('./components/TermsOfService'))
import LoadingSpinner from './components/LoadingSpinner'
import BrowserCompatibility from './components/BrowserCompatibility'
import ConsentBanner from './components/ConsentBanner'

// Import optimized Zustand selectors
import { useUIStore } from './stores/useUIStore'
import HoverTooltip from './components/HoverTooltip'
import { WAITLIST_MODE } from './utils/constants'
import { useAppAuth } from './hooks/useAppAuth'
import { useAppSEO } from './hooks/useAppSEO'

const App = () => {
  // Use optimized Zustand selectors to prevent unnecessary re-renders
  const { darkMode, themePreset, currentPage, setCurrentPage } = useUIStore(
    useShallow(state => ({
      darkMode: state.darkMode,
      themePreset: state.themePreset,
      currentPage: state.currentPage,
      setCurrentPage: state.setCurrentPage,
    }))
  )

  const {
    user,
    authLoading,
    dataLoading,
    needsProfileSetup,
    isBackendAvailable,
    handleLogin,
    handleProfileComplete,
  } = useAppAuth(setCurrentPage)

  useAppSEO(currentPage, user)

  // Set theme data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePreset)
  }, [themePreset])

  // Set dark mode class on html for safe area background color
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleError = (error, errorInfo) => {
    console.error('App Error:', error, errorInfo)
  }

  // Render Logic
  if (currentPage === 'settings') {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
          <SettingsPage darkMode={darkMode} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  if (currentPage === 'about') {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <HoverTooltip />
        <Suspense fallback={<LoadingSpinner message="Loading about page..." />}>
          <About onBack={() => setCurrentPage('main')} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  if (currentPage === 'privacy') {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading privacy policy..." />}>
          <AppPolicy darkMode={darkMode} onBack={() => setCurrentPage('main')} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  if (currentPage === 'terms') {
    return (
      <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
        <Suspense fallback={<LoadingSpinner message="Loading terms of service..." />}>
          <TermsOfService darkMode={darkMode} onBack={() => setCurrentPage('main')} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary darkMode={darkMode} themePreset={themePreset} onError={handleError}>
      <HoverTooltip />
      <BrowserCompatibility darkMode={darkMode} />
      {/* Don't show cookie banner on landing/waitlist page */}
      {currentPage !== 'landing' && !WAITLIST_MODE && <ConsentBanner />}

      {/* Backend Offline Warning Banner */}
      {!isBackendAvailable && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[100] p-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="font-bold text-lg">System Offline</h3>
                <p className="text-white/90 text-sm">
                  The backend server is currently unreachable (Error 521). Login and data saving are
                  disabled.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Check Dashboard
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-700 text-white border border-red-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-800 transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${darkMode ? 'modern-bg-dark' : 'modern-bg'} min-h-screen transition-all duration-500 ${!isBackendAvailable ? 'pt-20' : ''}`}
        style={{ paddingTop: !isBackendAvailable ? undefined : 'env(safe-area-inset-top, 0px)' }}
      >
        {authLoading ? (
          <Suspense fallback={<LoadingSpinner message="Checking session..." />}>
            <LoadingSpinner message="Checking session..." />
          </Suspense>
        ) : !user ? (
          <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <HomePage darkMode={darkMode} onLogin={handleLogin} />
          </Suspense>
        ) : dataLoading ? (
          <Suspense fallback={<LoadingSpinner message="Loading your journey..." />}>
            <LoadingSpinner message="Loading your journey..." />
          </Suspense>
        ) : needsProfileSetup ? (
          <Suspense fallback={<LoadingSpinner message="Preparing setup..." />}>
            <OnboardingWizard darkMode={darkMode} onComplete={handleProfileComplete} />
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingSpinner message="Loading your journey..." />}>
            <MainApp />
          </Suspense>
        )}
      </div>

    </ErrorBoundary>
  )
}

export default App
