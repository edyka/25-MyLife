import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

/**
 * PWA Install Prompt - Shows a banner on mobile encouraging users to install the app
 * When installed, the app opens in standalone mode without browser chrome
 */
const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed or dismissed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed')
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed_time')

    // Show again after 7 days
    const shouldShowAgain =
      dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000

    if (isStandalone || (isDismissed && !shouldShowAgain)) {
      return
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // For iOS, show prompt after a delay (iOS doesn't support beforeinstallprompt)
    if (iOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds
      return () => clearTimeout(timer)
    }

    // For Android/Chrome, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome - use the native prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      // iOS - show instructions (can't programmatically install)
      alert(
        'To install:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"'
      )
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
    localStorage.setItem('pwa_prompt_dismissed_time', Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className={`pwa-install-prompt ${showPrompt ? 'visible' : ''}`}>
      <div className="pwa-install-prompt-content">
        <Smartphone className="w-8 h-8 text-white flex-shrink-0" />
        <div className="pwa-install-prompt-text">
          <div className="pwa-install-prompt-title">
            {isIOS ? 'Add to Home Screen' : 'Install Viventiva'}
          </div>
          <div className="pwa-install-prompt-subtitle">Open fullscreen without browser bars</div>
        </div>
        <button onClick={handleInstall} className="pwa-install-btn flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          Install
        </button>
        <button onClick={handleDismiss} className="pwa-install-close" aria-label="Dismiss">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
