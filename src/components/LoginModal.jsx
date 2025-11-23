import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { auth } from "../lib/supabase";

const LoginModal = ({ isOpen, onClose, onLogin, initialMode = 'login', initialData = null }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);
  const darkMode = useUIStore((state) => state.darkMode);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState("");

  // Update isSignUp when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setShowEmailForm(false);
      setError("");
      setFirstName(initialData?.name || "");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoadingProvider(null);
    }
  }, [isOpen, initialMode, initialData]);

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
      setLoadingProvider(provider);
      setLoading(true);
      setError("");

      // Check rate limiting for OAuth
      const { checkRateLimit } = await import('../utils/rateLimiter');
      const identifier = `oauth:${provider}`;
      const rateLimitCheck = checkRateLimit('oauth', identifier);

      if (!rateLimitCheck.allowed) {
        const minutesRemaining = Math.ceil((rateLimitCheck.resetAt - Date.now()) / 60000);
        setError(`Too many OAuth attempts. Please try again in ${minutesRemaining} minute(s).`);
        setLoading(false);
        setLoadingProvider(null);
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
        try {
          const { getUserFriendlyError } = await import('../utils/errorMessages');
          setError(getUserFriendlyError(result.error));
        } catch {
          setError(result.error.message || 'An error occurred during OAuth login');
        }
        setLoading(false);
        setLoadingProvider(null);
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
      setLoadingProvider(null);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const mountedRef = { current: true };

    try {
      setLoading(true);
      setError("");

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
        result = await auth.signUpWithEmail(email, password, firstName, initialData);
      } else {
        result = await auth.signInWithEmail(email, password);
      }

      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        console.log('[Viventiva LoginModal] Email login successful, waiting for session...');
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!mountedRef.current) return;

        const { auth } = await import('../lib/supabase');
        const { user, error: userError } = await auth.getCurrentUser();

        if (!mountedRef.current) return;

        if (user && !userError) {
          console.log('[Viventiva LoginModal] User confirmed, calling onLogin');

          const { resetRateLimit } = await import('../utils/rateLimiter');
          resetRateLimit(action, identifier);

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl border ${darkMode
            ? "bg-slate-900/90 border-slate-700/50"
            : "bg-white/90 border-white/50"
            }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2.5 rounded-full transition-all z-50 ${darkMode
              ? "hover:bg-white/10 text-white/80 hover:text-white"
              : "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900"
              }`}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className={`w-6 h-6 text-${theme.primary.split('-')[1]}-500`} />
                <h2 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {showEmailForm
                    ? (isSignUp ? "Start Your Journey" : "Welcome Back")
                    : "Visualize My Life"}
                </h2>
              </div>
              <p className={`text-base ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {showEmailForm
                  ? (isSignUp ? "Create your account to start mapping your life" : "Continue where you left off")
                  : "Choose your preferred way to get started"
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2"
              >
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{error}</span>
              </motion.div>
            )}

            {!showEmailForm ? (
              <div className="space-y-3">
                {/* Google */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className={`w-full py-4 px-5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 ${darkMode
                    ? "bg-white text-slate-900 hover:bg-slate-50"
                    : "bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </motion.button>

                {/* Email */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEmailForm(true)}
                  className={`w-full py-4 px-5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md backdrop-blur-sm ${darkMode
                    ? "bg-slate-800/50 text-white hover:bg-slate-700/80 border border-slate-700/50"
                    : "bg-slate-100/50 text-slate-900 hover:bg-slate-200/80 border border-slate-200"
                    }`}
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-5">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isSignUp}
                      autoComplete="given-name"
                      className={`w-full px-4 py-3.5 rounded-xl backdrop-blur-sm ${darkMode
                        ? "bg-slate-800/50 text-white border-slate-700/50 focus:border-purple-500 focus:bg-slate-800/80"
                        : "bg-white/50 text-slate-900 border-slate-200 focus:border-purple-500 focus:bg-white/80"
                        } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                      placeholder="Your name"
                    />
                  </motion.div>
                )}

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`w-full px-4 py-3.5 rounded-xl backdrop-blur-sm ${darkMode
                      ? "bg-slate-800/50 text-white border-slate-700/50 focus:border-purple-500 focus:bg-slate-800/80"
                      : "bg-white/50 text-slate-900 border-slate-200 focus:border-purple-500 focus:bg-white/80"
                      } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className={`w-full px-4 py-3.5 pr-12 rounded-xl backdrop-blur-sm ${darkMode
                        ? "bg-slate-800/50 text-white border-slate-700/50 focus:border-purple-500 focus:bg-slate-800/80"
                        : "bg-white/50 text-slate-900 border-slate-200 focus:border-purple-500 focus:bg-white/80"
                        } border-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${darkMode
                        ? "hover:bg-slate-700 text-slate-400"
                        : "hover:bg-slate-100 text-slate-500"
                        }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className={`mt-2 text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className={`text-sm font-medium ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors`}
                  >
                    {isSignUp ? "Have an account?" : "Need an account?"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEmailForm(false); setIsSignUp(false); setError(""); }}
                    className={`text-sm font-medium ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-colors`}
                  >
                    ← Other options
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className={`mt-8 pt-6 border-t ${darkMode ? "border-slate-800" : "border-slate-200"} text-center`}>
              <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                By continuing, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>
              </p>
              <p className={`mt-2 text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                🔒 Your data is 100% private and secure
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default LoginModal;
