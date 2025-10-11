import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // Just check if user is authenticated
        const { user, error } = await auth.getCurrentUser();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (user) {
          // User is authenticated, redirect to main app
          window.location.href = '/';
        } else {
          // No user, redirect to home
          navigate('/');
        }
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
