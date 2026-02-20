/**
 * Client-side rate limiting utility
 * Prevents excessive API calls and protects against abuse
 *
 * Note: This is client-side rate limiting. For production, you should also
 * implement server-side rate limiting using Supabase Edge Functions or
 * Netlify Edge Functions.
 */

class RateLimiter {
  constructor() {
    this.attempts = new Map()
    this.lockouts = new Map()
  }

  /**
   * Check if an action is allowed based on rate limits
   * @param {string} key - Unique identifier for the rate limit (e.g., 'login', 'signup')
   * @param {Object} options - Rate limit options
   * @param {number} options.maxAttempts - Maximum attempts allowed
   * @param {number} options.windowMs - Time window in milliseconds
   * @param {number} options.lockoutMs - Lockout duration after max attempts exceeded
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
   */
  check(key, options = {}) {
    const {
      maxAttempts = 5,
      windowMs = 15 * 60 * 1000, // 15 minutes
      lockoutMs = 30 * 60 * 1000, // 30 minutes
    } = options

    const now = Date.now()

    // Check if currently locked out
    const lockout = this.lockouts.get(key)
    if (lockout && lockout > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: lockout,
        reason: 'lockout',
      }
    }

    // Clear expired lockout
    if (lockout && lockout <= now) {
      this.lockouts.delete(key)
    }

    // Get or create attempts record
    let attempts = this.attempts.get(key) || { count: 0, resetAt: now + windowMs }

    // Reset if window expired
    if (attempts.resetAt <= now) {
      attempts = { count: 0, resetAt: now + windowMs }
    }

    // Check if limit exceeded
    if (attempts.count >= maxAttempts) {
      // Start lockout period
      this.lockouts.set(key, now + lockoutMs)
      this.attempts.delete(key)

      return {
        allowed: false,
        remaining: 0,
        resetAt: now + lockoutMs,
        reason: 'limit_exceeded',
      }
    }

    // Increment attempt count
    attempts.count++
    this.attempts.set(key, attempts)

    return {
      allowed: true,
      remaining: maxAttempts - attempts.count,
      resetAt: attempts.resetAt,
    }
  }

  /**
   * Record a successful action (reset attempts)
   */
  reset(key) {
    this.attempts.delete(key)
    this.lockouts.delete(key)
  }

  /**
   * Get current status for a key
   */
  getStatus(key) {
    const lockout = this.lockouts.get(key)
    const attempts = this.attempts.get(key)

    if (lockout && lockout > Date.now()) {
      return {
        locked: true,
        resetAt: lockout,
        attempts: null,
      }
    }

    if (attempts) {
      return {
        locked: false,
        resetAt: attempts.resetAt,
        attempts: attempts.count,
      }
    }

    return {
      locked: false,
      resetAt: null,
      attempts: 0,
    }
  }

  /**
   * Clear all rate limit data (useful for testing or logout)
   */
  clear() {
    this.attempts.clear()
    this.lockouts.clear()
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter()

// Rate limit configurations for different actions
export const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour
  },
  oauth: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minutes
  },
  checkout: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes
  },
}

/**
 * Check if an action is rate limited
 * @param {string} action - Action type ('login', 'signup', etc.)
 * @param {string} identifier - Unique identifier (email, IP, etc.)
 * @returns {Object} Rate limit check result
 */
export const checkRateLimit = (action, identifier) => {
  const key = `${action}:${identifier}`
  const config = RATE_LIMITS[action] || RATE_LIMITS.login
  return rateLimiter.check(key, config)
}

/**
 * Reset rate limit for an action
 */
export const resetRateLimit = (action, identifier) => {
  const key = `${action}:${identifier}`
  rateLimiter.reset(key)
}

/**
 * Get rate limit status
 */
export const getRateLimitStatus = (action, identifier) => {
  const key = `${action}:${identifier}`
  return rateLimiter.getStatus(key)
}

/**
 * Clear all rate limits (useful on logout)
 */
export const clearAllRateLimits = () => {
  rateLimiter.clear()
}

export default rateLimiter
