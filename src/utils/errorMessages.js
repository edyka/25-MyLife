/**
 * User-friendly error messages
 * Provides specific, actionable error messages instead of generic ones
 */

export const getUserFriendlyError = error => {
  if (!error) return 'An unexpected error occurred. Please try again.'

  const errorMessage = error.message || error.toString()
  const errorCode = error.code || error.status

  // Network errors
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
    return 'Network error. Please check your internet connection and try again.'
  }

  // Brave Shields blocking
  if (errorCode === 406 || errorMessage.includes('406')) {
    return 'Brave Shields is blocking requests. Please disable Shields for this site and refresh.'
  }

  // Authentication errors
  if (errorCode === 401 || errorMessage.includes('unauthorized')) {
    return 'Your session has expired. Please log in again.'
  }

  if (errorCode === 403 || errorMessage.includes('forbidden')) {
    return "You don't have permission to perform this action."
  }

  // Supabase specific errors
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }

  if (errorMessage.includes('User already registered')) {
    return 'An account with this email already exists. Please log in instead.'
  }

  if (errorMessage.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account before logging in.'
  }

  // Row Level Security / permissions (common when policies are missing)
  if (
    errorMessage.toLowerCase().includes('row-level security') ||
    errorMessage.toLowerCase().includes('rls')
  ) {
    return 'Permission error saving your data. Please ensure your Supabase RLS policies are set correctly (run the provided SQL permission fix), then try again.'
  }

  if (errorMessage.toLowerCase().includes('permission denied')) {
    return 'Permission error. Your Supabase database permissions may be missing for authenticated users.'
  }

  if (errorMessage.includes('Password')) {
    if (errorMessage.includes('weak')) {
      return 'Password is too weak. Please use at least 6 characters.'
    }
    if (errorMessage.includes('mismatch')) {
      return 'Password confirmation does not match. Please try again.'
    }
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  // Database errors
  if (errorCode === 400 || errorMessage.includes('bad request')) {
    return 'Invalid request. Please check your input and try again.'
  }

  if (errorCode === 404 || errorMessage.includes('not found')) {
    return 'The requested resource was not found.'
  }

  if (errorCode === 500 || errorCode === 502 || errorCode === 503) {
    return 'Server error. Our team has been notified. Please try again in a few moments.'
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'Request timed out. Please check your connection and try again.'
  }

  // Generic fallback
  return errorMessage || 'An unexpected error occurred. Please try again.'
}

/**
 * Get error action suggestion
 */
export const getErrorAction = error => {
  const errorMessage = error?.message || error?.toString() || ''
  const errorCode = error?.code || error?.status

  if (errorCode === 401 || errorMessage.includes('unauthorized')) {
    return { action: 'login', label: 'Log In' }
  }

  if (errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
    return { action: 'retry', label: 'Retry' }
  }

  if (errorCode === 406) {
    return { action: 'brave-shields', label: 'Disable Brave Shields' }
  }

  return { action: 'retry', label: 'Try Again' }
}

export default {
  getUserFriendlyError,
  getErrorAction,
}
