import { motion, AnimatePresence } from "framer-motion";
import { X, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { auth } from "../lib/supabase";

const LoginModal = ({ isOpen, onClose, onLogin, initialMode = 'login' }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);
  const darkMode = useUIStore((state) => state.darkMode);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update isSignUp when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setShowEmailForm(false);
      setError("");
    }
  }, [isOpen, initialMode]);

  // Track component mounted state for async cleanup
  useEffect(() => {
    const mountedRef = { current: true };

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSocialLogin = async (provider) => {
    const mountedRef = { current: true };

    try {
      setLoading(true);
      setError("");

      // Check rate limiting for OAuth
      const { checkRateLimit } = await import('../utils/rateLimiter');
      // Use a generic identifier for OAuth (could be IP-based in production)
      const identifier = `oauth:${provider}`;
      const rateLimitCheck = checkRateLimit('oauth', identifier);
      
      if (!rateLimitCheck.allowed) {
        const minutesRemaining = Math.ceil((rateLimitCheck.resetAt - Date.now()) / 60000);
        setError(`Too many OAuth attempts. Please try again in ${minutesRemaining} minute(s).`);
        setLoading(false);
        return;
      }

      let result;
      if (provider === 'google') {
        result = await auth.signInWithGoogle();
      } else if (provider === 'facebook') {
        result = await auth.signInWithFacebook();
      } else if (provider === 'apple') {
        result = await auth.signInWithApple();
      }

      if (!mountedRef.current) return;

      if (result.error) {
        // Use user-friendly error messages
        try {
          const { getUserFriendlyError } = await import('../utils/errorMessages');
          setError(getUserFriendlyError(result.error));
        } catch {
          setError(result.error.message || 'An error occurred during OAuth login');
        }
        setLoading(false);
      } else {
        // OAuth will redirect, so we don't call onLogin() here
        // The redirect callback will handle it
        // Rate limit reset happens in App.jsx OAuth callback handler
      }
    } catch (err) {
      if (!mountedRef.current) return;
      try {
        const { getUserFriendlyError } = await import('../utils/errorMessages');
        setError(getUserFriendlyError(err));
      } catch {
        setError(err.message || "An error occurred during login");
      }
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const mountedRef = { current: true };

    try {
      setLoading(true);
      setError("");

      // Check rate limiting
      const { checkRateLimit, resetRateLimit } = await import('../utils/rateLimiter');
      const action = isSignUp ? 'signup' : 'login';
      const identifier = email.toLowerCase();
      
      const rateLimitCheck = checkRateLimit(action, identifier);
      
      if (!rateLimitCheck.allowed) {
        const minutesRemaining = Math.ceil((rateLimitCheck.resetAt - Date.now()) / 60000);
        setError(
          rateLimitCheck.reason === 'lockout'
            ? `Too many attempts. Please try again in ${minutesRemaining} minute(s).`
            : `Rate limit exceeded. Please try again in ${minutesRemaining} minute(s).`
        );
        setLoading(false);
        return;
      }

      let result;
      if (isSignUp) {
        result = await auth.signUpWithEmail(email, password);
      } else {
        result = await auth.signInWithEmail(email, password);
      }

      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        // Successfully authenticated - wait a moment for session to be established
        console.log('[Viventiva LoginModal] Email login successful, waiting for session...');
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!mountedRef.current) return;

        // Verify user exists before calling onLogin
        const { auth } = await import('../lib/supabase');
        const { user, error: userError } = await auth.getCurrentUser();

        if (!mountedRef.current) return;

        if (user && !userError) {
          console.log('[Viventiva LoginModal] User confirmed, calling onLogin');
          
          // Reset rate limit on successful login
          const { resetRateLimit } = await import('../utils/rateLimiter');
          resetRateLimit(action, identifier);
          
          // Track login event
          const { trackUserAction } = await import('../utils/analytics');
          trackUserAction(isSignUp ? 'user_signup' : 'user_login', {
            method: 'email',
          });
          onLogin();
        } else {
          console.error('[Viventiva LoginModal] User not found after login:', userError);
          setError('Login successful but session not established. Please try again.');
          setLoading(false);
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;
      try {
        const { getUserFriendlyError } = await import('../utils/errorMessages');
        setError(getUserFriendlyError(err));
      } catch {
        setError(err.message || "An error occurred during login");
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-3xl p-8 shadow-2xl ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-slate-200"
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-slate-700 text-slate-400"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              {showEmailForm ? (isSignUp ? "Create Account" : "Sign In") : "Create Account or Sign In"}
            </h2>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Choose how you want to authenticate
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <div className="space-y-3">
              {/* Google Login */}
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? "bg-white text-slate-900 hover:bg-slate-50"
                    : "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Facebook Login */}
              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              {/* Apple Login */}
              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? "bg-white text-black hover:bg-slate-50"
                    : "bg-black text-white hover:bg-slate-900"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              {/* Divider */}
              <div className="relative py-3">
                <div className={`absolute inset-0 flex items-center`}>
                  <div className={`w-full border-t ${darkMode ? "border-slate-600" : "border-slate-300"}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-3 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-white text-slate-600"}`}>
                    or
                  </span>
                </div>
              </div>

              {/* Email Login */}
              <button
                onClick={() => setShowEmailForm(true)}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg ${
                  darkMode
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                }`}
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg ${
                    darkMode
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg ${
                    darkMode
                      ? "bg-slate-700 text-white border-slate-600"
                      : "bg-white text-slate-900 border-slate-300"
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`w-full text-sm ${darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-700"}`}
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
              <button
                type="button"
                onClick={() => {setShowEmailForm(false); setIsSignUp(false); setError("");}}
                className={`w-full text-sm ${darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-700"}`}
              >
                ← Back to other options
              </button>
            </form>
          )}

          <div className={`mt-6 text-center text-xs ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
            <p>Your data stays 100% private on your device</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LoginModal;
