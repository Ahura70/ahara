import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle, signInWithApple, signInAsGuest } from '../lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Get user-friendly error message from Firebase error
 */
function getErrorMessage(error: any, provider: string): string {
  if (!error) return `Failed to sign in with ${provider}. Please try again.`;

  const code = error.code || '';
  const message = error.message || '';

  if (code.includes('popup-blocked')) {
    return `${provider} sign-in popup was blocked. Please allow popups and try again.`;
  }
  if (code.includes('cancelled-popup-request')) {
    return `${provider} sign-in was cancelled. Please try again.`;
  }
  if (code.includes('unauthorized-domain')) {
    return 'This domain is not authorized for authentication. Please check Firebase configuration.';
  }
  if (code.includes('invalid-api-key')) {
    return 'Invalid Firebase configuration. Please check your environment variables.';
  }
  if (message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  return `Failed to sign in with ${provider}. Please try again.`;
}

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('google');

    try {
      await signInWithGoogle();
      // Popup succeeded — auth state listener in the store will handle navigation.
      // Reset loading so the UI is not stuck if navigation takes a moment.
      setLoading(false);
      setActiveProvider(null);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const errorMsg = getErrorMessage(err, 'Google');
      setError(errorMsg);
      setActiveProvider(null);
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('apple');

    try {
      await signInWithApple();
      // Popup succeeded — auth state listener in the store will handle navigation.
      setLoading(false);
      setActiveProvider(null);
    } catch (err: any) {
      console.error('Apple sign-in error:', err);
      const errorMsg = getErrorMessage(err, 'Apple');
      setError(errorMsg);
      setActiveProvider(null);
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    setActiveProvider('guest');

    try {
      await signInAsGuest();
      // Auth state listener will handle navigation automatically after sign-in.
      setLoading(false);
      setActiveProvider(null);
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      setError('Failed to continue as guest. Please try again.');
      setActiveProvider(null);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center font-display px-6 relative overflow-hidden"
    >
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.6)_0%,_transparent_40%),radial-gradient(circle_at_80%_70%,_rgba(255,255,255,0.4)_0%,_transparent_40%)] -z-10 pointer-events-none"></div>

      <header className="text-center mb-16 flex flex-col items-center">
        <h1 className="font-heading text-text-main text-[48px] leading-tight mb-2 tracking-tight">Āhāra</h1>
        <p className="font-body text-text-muted text-lg tracking-wide">Discover recipes from your ingredients</p>
      </header>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-body">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="group relative flex w-full h-[56px] items-center justify-center overflow-hidden rounded-full glass-panel text-text-main gap-3 px-6 font-body font-semibold text-[14px] uppercase tracking-[0.05em] hover:bg-white/70 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && activeProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{loading && activeProvider === 'google' ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        {/* Apple Sign-In */}
        <button
          onClick={handleAppleSignIn}
          disabled={loading}
          className="group relative flex w-full h-[56px] items-center justify-center overflow-hidden rounded-full glass-panel text-text-main gap-3 px-6 font-body font-semibold text-[14px] uppercase tracking-[0.05em] hover:bg-white/70 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && activeProvider === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          )}
          <span>{loading && activeProvider === 'apple' ? 'Signing in...' : 'Sign in with Apple'}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-text-muted/20"></div>
          <span className="text-text-muted text-xs font-body">or</span>
          <div className="flex-1 h-px bg-text-muted/20"></div>
        </div>

        {/* Guest Sign-In */}
        <button
          onClick={handleGuestSignIn}
          disabled={loading}
          className="group relative flex w-full h-[56px] items-center justify-center overflow-hidden rounded-full glass-panel text-text-main gap-3 px-6 font-body font-semibold text-[14px] uppercase tracking-[0.05em] hover:bg-white/70 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && activeProvider === 'guest' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </>
          )}
          <span>{loading && activeProvider === 'guest' ? 'Continuing...' : 'Continue as Guest'}</span>
        </button>

        {/* Info Text */}
        <p className="text-center text-text-muted text-xs font-body mt-2 opacity-80">
          Sign in to save your preferences and recipes. Guest mode doesn&apos;t save data across sessions.
        </p>
      </div>

      <footer className="mt-12 text-center">
        <p className="font-body text-text-muted text-xs opacity-80">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-text-main transition-colors">Terms</a>
          {' '}&{' '}
          <a href="#" className="underline hover:text-text-main transition-colors">Privacy</a>
        </p>
      </footer>
    </motion.div>
  );
}
