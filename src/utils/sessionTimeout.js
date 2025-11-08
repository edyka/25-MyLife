/**
 * Session timeout utility
 * Automatically logs out users after a period of inactivity
 * 
 * Note: This is client-side session management. For production,
 * you should also implement server-side session expiration.
 */

class SessionTimeout {
  constructor() {
    this.timeoutId = null;
    this.warningTimeoutId = null;
    this.isWarningShown = false;
    this.callbacks = {
      onWarning: null,
      onTimeout: null,
    };
    this.inactivityTimeout = 30 * 60 * 1000; // 30 minutes default
    this.warningTime = 5 * 60 * 1000; // Show warning 5 minutes before timeout
  }

  /**
   * Initialize session timeout
   * @param {Object} options - Configuration options
   * @param {number} options.inactivityTimeout - Inactivity timeout in ms (default: 30 minutes)
   * @param {number} options.warningTime - Warning time before timeout in ms (default: 5 minutes)
   * @param {Function} options.onWarning - Callback when warning should be shown
   * @param {Function} options.onTimeout - Callback when session times out
   */
  init(options = {}) {
    const {
      inactivityTimeout = 30 * 60 * 1000,
      warningTime = 5 * 60 * 1000,
      onWarning = null,
      onTimeout = null,
    } = options;

    this.inactivityTimeout = inactivityTimeout;
    this.warningTime = warningTime;
    this.callbacks.onWarning = onWarning;
    this.callbacks.onTimeout = onTimeout;

    // Set up activity listeners
    this.setupActivityListeners();
    
    // Start the timeout
    this.reset();
  }

  /**
   * Set up activity listeners to detect user interaction
   */
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimeout = () => {
      this.reset();
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
  }

  /**
   * Reset the session timeout
   */
  reset() {
    // Clear existing timeouts
    this.clear();

    // Hide warning if shown
    this.isWarningShown = false;

    // Set warning timeout
    const warningDelay = this.inactivityTimeout - this.warningTime;
    if (warningDelay > 0) {
      this.warningTimeoutId = setTimeout(() => {
        this.showWarning();
      }, warningDelay);
    }

    // Set main timeout
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, this.inactivityTimeout);
  }

  /**
   * Show warning to user
   */
  showWarning() {
    if (this.isWarningShown) return;
    
    this.isWarningShown = true;
    
    if (this.callbacks.onWarning) {
      this.callbacks.onWarning({
        timeRemaining: this.warningTime,
        minutesRemaining: Math.ceil(this.warningTime / 60000),
      });
    } else {
      // Default warning - show toast notification
      const minutes = Math.ceil(this.warningTime / 60000);
      const message = `Your session will expire in ${minutes} minute(s) due to inactivity. Click anywhere to extend your session.`;
      
      // Try to show toast notification
      try {
        const { toast } = require('./toast');
        toast.warning(message, 10000); // Show for 10 seconds
      } catch (error) {
        console.warn('[SessionTimeout]', message);
      }
    }
  }

  /**
   * Handle session timeout
   */
  handleTimeout() {
    this.clear();
    
    if (this.callbacks.onTimeout) {
      this.callbacks.onTimeout();
    } else {
      // Default timeout action - logout
      console.warn('[SessionTimeout] Session expired due to inactivity');
      // This will be handled by the app's logout logic
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }

  /**
   * Clear all timeouts
   */
  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  /**
   * Destroy the session timeout manager
   */
  destroy() {
    this.clear();
    this.callbacks.onWarning = null;
    this.callbacks.onTimeout = null;
  }

  /**
   * Get remaining time until timeout
   */
  getRemainingTime() {
    // This is approximate since we don't track exact start time
    // For accurate timing, you'd need to store the reset timestamp
    return this.inactivityTimeout;
  }
}

// Create singleton instance
const sessionTimeout = new SessionTimeout();

/**
 * Initialize session timeout
 */
export const initSessionTimeout = (options) => {
  sessionTimeout.init(options);
};

/**
 * Reset session timeout (call on user activity)
 */
export const resetSessionTimeout = () => {
  sessionTimeout.reset();
};

/**
 * Clear session timeout
 */
export const clearSessionTimeout = () => {
  sessionTimeout.clear();
};

/**
 * Destroy session timeout manager
 */
export const destroySessionTimeout = () => {
  sessionTimeout.destroy();
};

export default sessionTimeout;

