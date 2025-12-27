import { createClient } from '@supabase/supabase-js';

/**
 * Error classification system for better error handling
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  SERVER: 'SERVER_ERROR',
  BROWSER_BLOCKING: 'BROWSER_BLOCKING',
  UNKNOWN: 'UNKNOWN_ERROR'
};

export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP status codes
  if (error.status === 401) return ERROR_TYPES.AUTH;
  if (error.status === 403) return ERROR_TYPES.PERMISSION;
  if (error.status === 404) return ERROR_TYPES.NOT_FOUND;
  if (error.status === 406) return ERROR_TYPES.BROWSER_BLOCKING;
  if (error.status === 429) return ERROR_TYPES.RATE_LIMIT;
  if (error.status >= 500) return ERROR_TYPES.SERVER;

  // Supabase error codes
  if (error.code === 'PGRST116') return ERROR_TYPES.NOT_FOUND;

  return ERROR_TYPES.UNKNOWN;
};

export const getUserFriendlyError = (error) => {
  const errorType = classifyError(error);

  const errorMessages = {
    [ERROR_TYPES.NETWORK]: 'Connection issue. Please check your internet and try again.',
    [ERROR_TYPES.BROWSER_BLOCKING]: 'Your browser is blocking this request. Please disable Brave Shields or similar privacy extensions.',
    [ERROR_TYPES.AUTH]: 'Authentication required. Please log in again.',
    [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]: 'The requested data was not found.',
    [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  return errorMessages[errorType] || errorMessages[ERROR_TYPES.UNKNOWN];
};

// These will be set from environment variables
// You'll get these from https://supabase.com after creating a free project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'viventiva-auth-token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'viventiva'
    }
  }
});

// Helper functions for authentication
export const auth = {
  // Sign in with Google - Following Supabase best practices
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account' // Show account selector and ensure refresh token
          },
          // Skip browser redirect for better UX (handled by Supabase)
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('[Supabase] Google OAuth error:', error);
        return { data: null, error };
      }

      // If data.url exists, Supabase will handle the redirect automatically
      // The redirect will go to Google, then back to our callback URL
      return { data, error: null };
    } catch (err) {
      console.error('[Supabase] Google OAuth exception:', err);
      return { data: null, error: err };
    }
  },

  // Sign in with Facebook
  signInWithFacebook: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  },

  // Sign in with Apple (requires Apple Developer account)
  signInWithApple: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  },

  // Sign in with Email
  signInWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign up with Email
  // NOTE: We don't save the profile here - it will be saved during onboarding
  // when the session is fully established. This avoids RLS timing issues.
  signUpWithEmail: async (email, password, firstName) => {
    const options = {
      emailRedirectTo: `${window.location.origin}/`
    };

    // Store name in user metadata - can be retrieved later during onboarding
    if (firstName) {
      options.data = {
        first_name: firstName,
        full_name: firstName
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });

    // Profile will be created during onboarding, not here
    // This is because auth.uid() isn't available immediately after signup

    return { data, error };
  },

  // Resend signup confirmation email (useful when email confirmation is enabled)
  resendSignupEmail: async (email) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user - use getSession for reliable session restoration on refresh
  getCurrentUser: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      // Check for Brave Shields blocking (406 errors)
      if (error && (error.status === 406 || error.message?.includes('406'))) {
        console.warn('[Viventiva] Brave Shields may be blocking Supabase requests (406 error)');
      }

      return { user: session?.user || null, error };
    } catch (error) {
      // Handle network errors that might indicate Brave Shields blocking
      if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
        console.warn('[Viventiva] Network error - Brave Shields may be blocking requests');
      }
      return { user: null, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Check if Supabase is reachable
  checkConnection: async () => {
    try {
      // Try to fetch the auth health endpoint
      // We use a simple fetch instead of the SDK to get the raw status
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey
        }
      });

      return {
        online: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        online: false,
        error
      };
    }
  }
};

// Database helper functions
export const database = {
  // Save user profile data
  saveUserProfile: async (userId, profileData) => {
    try {
      const updates = {
        user_id: userId,
        name: profileData.name || null,
        birth_day: profileData.birthDay || null,
        birth_month: profileData.birthMonth || null,
        birth_year: profileData.birthYear || null,
        life_expectancy: profileData.lifeExpectancy || null,
        updated_at: new Date().toISOString()
      };

      // Only include engagement_stats if provided
      if (profileData.engagementStats) {
        updates.engagement_stats = profileData.engagementStats;
      }

      console.log('[Viventiva] Saving user profile:', { userId, profileData: updates });

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updates, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('[Viventiva] Error saving user profile:', error);
        return { data: null, error };
      }

      console.log('[Viventiva] User profile saved successfully');
      return { data, error: null };
    } catch (err) {
      console.error('[Viventiva] saveUserProfile exception:', err);
      return { data: null, error: err };
    }
  },

  // Save engagement stats independently
  saveEngagementStats: async (userId, stats) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        engagement_stats: stats,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    return { data, error };
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Check for Brave Shields blocking (406 errors)
      if (error && error.status === 406) {
        console.error('[Viventiva] Brave Shields is blocking Supabase requests (406). Please disable Shields for localhost.');
      }

      return { data, error };
    } catch (error) {
      console.error('[Viventiva] Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  // Save mood/milestone data with retry logic
  saveMilestones: async (userId, milestones) => {
    const { retryWithBackoff } = await import('../utils/retry');

    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('user_milestones')
          .upsert({
            user_id: userId,
            milestones_data: milestones,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
        return { data, error: null };
      });

      return result;
    } catch (error) {
      console.error('[Viventiva] Failed to save milestones after retries:', error);
      // Queue for later retry
      const { syncQueue } = await import('../utils/retry');
      syncQueue.enqueue({
        type: 'milestones',
        fn: () => database.saveMilestones(userId, milestones),
        shouldRetry: (err) => err.status !== 400 && err.status !== 401, // Don't retry bad requests or auth errors
      });
      return { data: null, error };
    }
  },

  // Get milestones
  getMilestones: async (userId) => {
    const { data, error } = await supabase
      .from('user_milestones')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Save goals with retry logic
  saveGoals: async (userId, goals) => {
    const { retryWithBackoff } = await import('../utils/retry');

    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('user_goals')
          .upsert({
            user_id: userId,
            goals_data: goals,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
        return { data, error: null };
      });

      return result;
    } catch (error) {
      console.error('[Viventiva] Failed to save goals after retries:', error);
      const { syncQueue } = await import('../utils/retry');
      syncQueue.enqueue({
        type: 'goals',
        fn: () => database.saveGoals(userId, goals),
        shouldRetry: (err) => err.status !== 400 && err.status !== 401,
      });
      return { data: null, error };
    }
  },

  // Get goals
  getGoals: async (userId) => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Save selections (selectedWeeks, pinnedWeeks) with retry logic
  saveSelections: async (userId, selections) => {
    const { retryWithBackoff } = await import('../utils/retry');

    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('user_selections')
          .upsert({
            user_id: userId,
            selections_data: selections,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
        return { data, error: null };
      });

      return result;
    } catch (error) {
      console.error('[Viventiva] Failed to save selections after retries:', error);
      const { syncQueue } = await import('../utils/retry');
      syncQueue.enqueue({
        type: 'selections',
        fn: () => database.saveSelections(userId, selections),
        shouldRetry: (err) => err.status !== 400 && err.status !== 401,
      });
      return { data: null, error };
    }
  },

  // Get selections
  getSelections: async (userId) => {
    const { data, error } = await supabase
      .from('user_selections')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Delete all user data (GDPR compliance)
  deleteAllUserData: async (userId) => {
    // Execute all deletions in parallel using Promise.allSettled to ensure all are attempted
    const deletions = await Promise.allSettled([
      supabase.from('user_profiles').delete().eq('user_id', userId),
      supabase.from('user_milestones').delete().eq('user_id', userId),
      supabase.from('user_goals').delete().eq('user_id', userId),
      supabase.from('user_selections').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('user_id', userId)
    ]);

    const errors = deletions
      .map((result, index) => {
        const tables = ['profiles', 'milestones', 'goals', 'selections', 'settings'];
        if (result.status === 'rejected') {
          return { table: tables[index], error: result.reason };
        } else if (result.value?.error) {
          return { table: tables[index], error: result.value.error };
        }
        return null;
      })
      .filter(Boolean);

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : null,
      partial: errors.length > 0 && errors.length < deletions.length
    };
  },

  // Export all user data (GDPR compliance)
  exportAllUserData: async (userId) => {
    // Execute all queries in parallel for better performance
    const [profile, milestones, goals, selections, settings] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_milestones').select('*').eq('user_id', userId).single(),
      supabase.from('user_goals').select('*').eq('user_id', userId).single(),
      supabase.from('user_selections').select('*').eq('user_id', userId).single(),
      supabase.from('user_settings').select('*').eq('user_id', userId).single()
    ]);

    return {
      profile: profile.data,
      milestones: milestones.data,
      goals: goals.data,
      selections: selections.data,
      settings: settings.data,
      exportDate: new Date().toISOString()
    };
  },

  // Save user settings (dark mode, theme preset, etc.) with retry logic
  saveUserSettings: async (userId, settings) => {
    const { retryWithBackoff } = await import('../utils/retry');

    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            settings_data: settings,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
        return { data, error: null };
      });

      return result;
    } catch (error) {
      console.error('[Viventiva] Failed to save settings after retries:', error);
      const { syncQueue } = await import('../utils/retry');
      syncQueue.enqueue({
        type: 'settings',
        fn: () => database.saveUserSettings(userId, settings),
        shouldRetry: (err) => err.status !== 400 && err.status !== 401,
      });
      return { data: null, error };
    }
  },

  // Get user settings
  getUserSettings: async (userId) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Waitlist functions
  saveWaitlistSignup: async (email, name, interest) => {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        interest: interest || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  },

  getWaitlistCount: async () => {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting waitlist count:', error);
      return null;
    }

    return count;
  }
};
