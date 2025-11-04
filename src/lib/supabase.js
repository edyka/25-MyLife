import { createClient } from '@supabase/supabase-js';

// These will be set from environment variables
// You'll get these from https://supabase.com after creating a free project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions for authentication
export const auth = {
  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account' // Force Google to show account selector
        }
      }
    });
    return { data, error };
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
  signUpWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user - use getSession for reliable session restoration on refresh
  getCurrentUser: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { user: session?.user || null, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const database = {
  // Save user profile data
  saveUserProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        name: profileData.name,
        birth_day: profileData.birthDay,
        birth_month: profileData.birthMonth,
        birth_year: profileData.birthYear,
        life_expectancy: profileData.lifeExpectancy,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    return { data, error };
  },

  // Get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Save mood/milestone data
  saveMilestones: async (userId, milestones) => {
    const { data, error } = await supabase
      .from('user_milestones')
      .upsert({
        user_id: userId,
        milestones_data: milestones,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    return { data, error };
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

  // Save goals
  saveGoals: async (userId, goals) => {
    const { data, error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: userId,
        goals_data: goals,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    return { data, error };
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

  // Save selections (selectedWeeks, pinnedWeeks)
  saveSelections: async (userId, selections) => {
    const { data, error } = await supabase
      .from('user_selections')
      .upsert({
        user_id: userId,
        selections_data: selections,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    return { data, error };
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
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    const { error: milestonesError } = await supabase
      .from('user_milestones')
      .delete()
      .eq('user_id', userId);

    const { error: goalsError } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId);

    const { error: selectionsError } = await supabase
      .from('user_selections')
      .delete()
      .eq('user_id', userId);

    return {
      success: !profileError && !milestonesError && !goalsError && !selectionsError,
      errors: { profileError, milestonesError, goalsError, selectionsError }
    };
  },

  // Export all user data (GDPR compliance)
  exportAllUserData: async (userId) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: milestones } = await supabase
      .from('user_milestones')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: goals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: selections } = await supabase
      .from('user_selections')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      profile,
      milestones,
      goals,
      selections,
      exportDate: new Date().toISOString()
    };
  }
};
