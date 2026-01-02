import { useState, useEffect } from 'react'
import { X, Download, Smartphone, ExternalLink } from 'lucide-react'

/**
 * PWA Install Prompt - Shows a banner on mobile encouraging users to install the app
 * When installed, the app opens in standalone mode without browser chrome
 */
const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSChrome, setIsIOSChrome] = useState(false)

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

    // Detect Chrome on iOS (CriOS) or other non-Safari browsers on iOS
    // Firefox on iOS uses "FxiOS", Edge uses "EdgiOS", Opera uses "OPiOS"
    const iOSNonSafari = iOS && /CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent)
    setIsIOSChrome(iOSNonSafari)

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
    } else if (isIOSChrome) {
      // Chrome/Firefox/Edge on iOS - need to open in Safari
      alert(
        'To install this app, please open viventiva.com in Safari.\n\nChrome and other browsers on iOS cannot install apps to the home screen.'
      )
    } else if (isIOS) {
      // Safari on iOS - show instructions (can't programmatically install)
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

  // Determine title and subtitle based on browser/platform
  const getPromptText = () => {
    if (isIOSChrome) {
      return {
        title: 'Open in Safari to Install',
        subtitle: 'Chrome cannot install apps on iOS',
        buttonText: 'How to Install',
        buttonIcon: <ExternalLink className="w-4 h-4" />,
      }
    }
    if (isIOS) {
      return {
        title: 'Add to Home Screen',
        subtitle: 'Open fullscreen without browser bars',
        buttonText: 'Install',
        buttonIcon: <Download className="w-4 h-4" />,
      }
    }
    return {
      title: 'Install Viventiva',
      subtitle: 'Open fullscreen without browser bars',
      buttonText: 'Install',
      buttonIcon: <Download className="w-4 h-4" />,
    }
  }

  const promptText = getPromptText()

  return (
    <div className={`pwa-install-prompt ${showPrompt ? 'visible' : ''}`}>
      <div className="pwa-install-prompt-content">
        <Smartphone className="w-8 h-8 text-white flex-shrink-0" />
        <div className="pwa-install-prompt-text">
          <div className="pwa-install-prompt-title">{promptText.title}</div>
          <div className="pwa-install-prompt-subtitle">{promptText.subtitle}</div>
        </div>
        <button onClick={handleInstall} className="pwa-install-btn flex items-center gap-1.5">
          {promptText.buttonIcon}
          {promptText.buttonText}
        </button>
        <button onClick={handleDismiss} className="pwa-install-close" aria-label="Dismiss">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
